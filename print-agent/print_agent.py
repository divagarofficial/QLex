import os
import sys
import time
import logging
import json
import subprocess
import shutil
from pathlib import Path
from typing import Dict, Any

from config import (
    BACKEND_URL,
    POLL_INTERVAL_SECONDS,
    API_SECRET_KEY,
    SHOP_NAME,
    TEMP_DIR,
    MOCK_PRINT,
)
from printer_pool import PrinterPoolManager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] (QLex-PrintAgent) %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(Path(__file__).parent / "print_agent.log", encoding="utf-8")
    ]
)
logger = logging.getLogger("PrintAgentDaemon")


class QLexPrintAgentDaemon:

    def __init__(self):
        self.backend_url = BACKEND_URL.rstrip("/")
        self.headers = {
            "X-Print-Agent-Key": API_SECRET_KEY,
            "X-Shop-Name": SHOP_NAME,
        }
        self.printer_pool = PrinterPoolManager()
        logger.info(f"Initialized QLex Print Agent Daemon for Shop: '{SHOP_NAME}'")
        logger.info(f"Connecting to Backend: {self.backend_url}")
        logger.info(f"Mock Print Mode: {MOCK_PRINT}")


    def _curl(self, method: str, url: str, json_payload=None, stream_to=None, timeout=30):
        """Perform an HTTP request through Windows curl.exe.

        The shop PC allows curl.exe to make outbound HTTPS connections even
        though Python's socket API is restricted. This keeps QLex networking
        working without changing Windows firewall/Winsock settings.
        """
        curl = shutil.which("curl.exe") or shutil.which("curl")
        if not curl:
            raise RuntimeError("curl.exe was not found in PATH")

        cmd = [
            curl,
            "-4",
            "--silent",
            "--show-error",
            "--fail-with-body",
            "--max-time", str(timeout),
            "-X", method.upper(),
            url,
        ]

        for key, value in self.headers.items():
            cmd.extend(["-H", f"{key}: {value}"])

        if json_payload is not None:
            cmd.extend(["-H", "Content-Type: application/json"])
            cmd.extend(["--data", json.dumps(json_payload)])

        if stream_to is not None:
            cmd.extend(["-o", str(stream_to)])

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout + 5,
        )

        if result.returncode != 0:
            body = result.stderr.strip() or result.stdout.strip()
            raise RuntimeError(f"curl failed (exit {result.returncode}): {body}")

        return result.stdout

    def _curl_json(self, method: str, url: str, json_payload=None, timeout=30):
        """HTTP request through curl.exe, returning decoded JSON."""
        body = self._curl(
            method=method,
            url=url,
            json_payload=json_payload,
            timeout=timeout,
        )

        if not body.strip():
            return {}

        return json.loads(body)

    def send_heartbeat(self):
        """Send periodic telemetry heartbeat including printer ink levels to backend."""
        url = f"{self.backend_url}/shop/print-agent/heartbeat"
        try:
            ink_levels = self.printer_pool.get_printer_ink_levels()
            payload = {
                "shop_name": SHOP_NAME,
                "printers": ink_levels,
            }
            self._curl_json("POST", url, json_payload=payload, timeout=10)
            logger.debug(f"Heartbeat synced for '{SHOP_NAME}' with {len(ink_levels)} printer telemetry records.")
        except Exception as e:
            logger.debug(f"Heartbeat sync error: {e}")

    def fetch_pending_jobs(self):
        """Poll QLex backend for pending PAID orders waiting to be printed."""
        url = f"{self.backend_url}/shop/print-agent/pending-jobs"
        try:
            data = self._curl_json("GET", url, timeout=30)
            return data if isinstance(data, list) else []
        except subprocess.TimeoutExpired:
            logger.debug("Cloud Run polling request timed out during cold start, retrying...")
            return []
        except Exception as e:
            logger.error(f"Network error polling backend '{url}': {e}")
            return []

    def update_job_status(self, order_id: str, status: str, error_message: str = None, assigned_printer: str = None):
        """Report job execution state (PRINTING, COMPLETED, FAILED) back to QLex backend."""
        url = f"{self.backend_url}/shop/print-agent/jobs/{order_id}/status"
        payload = {
            "status": status,
            "error_message": error_message,
            "assigned_printer": assigned_printer,
        }
        try:
            result = self._curl_json("POST", url, json_payload=payload, timeout=30)
            logger.info(f"Backend status update for order '{order_id}': {result.get('message')}")
            return result
        except Exception as e:
            logger.error(f"Network error posting job status for order '{order_id}': {e}")
            return None

    def download_document(self, doc: Dict[str, Any]) -> str:
        """Download document PDF from QLex backend to local temp directory."""
        doc_url = doc.get("url", "")
        if not doc_url.startswith("http"):
            doc_url = f"{self.backend_url}{doc_url}"

        filename = f"{doc['id']}_{doc.get('stored_filename', 'doc.pdf')}"
        target_path = TEMP_DIR / filename

        logger.info(f"Downloading document: {doc.get('original_filename')} from '{doc_url}'")
        self._curl(
            method="GET",
            url=doc_url,
            stream_to=target_path,
            timeout=30,
        )

        logger.info(f"Saved document to temp cache: {target_path}")
        return str(target_path)

    def process_order(self, job: Dict[str, Any]):
        """Process a single print order."""
        order_id = job["order_id"]
        token = job.get("token", "P-?")
        student_name = job.get("student_name", "Student")
        register_number = job.get("register_number", "N/A")
        documents = job.get("documents", [])

        # Select target printer from pool before starting
        first_doc = documents[0] if documents else {}
        printer_name, _ = self.printer_pool.select_available_printer(
            print_type=first_doc.get("print_type", "bw"),
            paper_size=first_doc.get("paper_size", "a4")
        )

        logger.info(
            f"=== [START PRINT JOB] Token: {token} | Student: {student_name} (Reg No: {register_number}) "
            f"| Printer: '{printer_name}' | Order ID: {order_id} ==="
        )

        # 1. Update backend state to PRINTING with assigned printer
        self.update_job_status(order_id, "PRINTING", assigned_printer=printer_name)

        downloaded_files = []
        try:
            # 2. Download all documents for this order
            for doc in documents:
                local_pdf_path = self.download_document(doc)
                downloaded_files.append((local_pdf_path, doc))

            # 3. Print each document using assigned printer from the pool
            for local_pdf_path, doc in downloaded_files:
                success = self.printer_pool.print_document(
                    pdf_path=local_pdf_path,
                    printer_name=printer_name,
                    copies=doc.get("copies", 1),
                    print_type=doc.get("print_type", "bw"),
                    print_side=doc.get("print_side", "single"),
                    paper_size=doc.get("paper_size", "a4"),
                    custom_pages=doc.get("custom_pages")
                )

                if not success:
                    raise RuntimeError(f"Failed to print document '{doc.get('original_filename')}' on '{printer_name}'")

            # 4. Mark job as COMPLETED on backend -> transitions order to READY_FOR_PICKUP & dispatches WhatsApp notification
            self.update_job_status(order_id, "COMPLETED", assigned_printer=printer_name)
            logger.info(f"=== [COMPLETED PRINT JOB] Token: {token} | Printed on '{printer_name}' | Marked READY_FOR_PICKUP ===")

        except Exception as err:
            logger.error(f"Error executing print job for Token {token}: {err}", exc_info=True)
            self.update_job_status(order_id, "FAILED", error_message=str(err))

        finally:
            # Clean up local temporary PDF files
            for local_path, _ in downloaded_files:
                try:
                    if os.path.exists(local_path):
                        os.remove(local_path)
                        logger.info(f"Cleaned up temp file: {os.path.basename(local_path)}")
                except Exception as cleanup_err:
                    logger.warning(f"Failed to delete temp file '{local_path}': {cleanup_err}")

    def run(self):
        """Main event polling loop."""
        logger.info(f"Print Agent is running and monitoring queue... (Poll interval: {POLL_INTERVAL_SECONDS}s)")
        installed = self.printer_pool.get_installed_printers()
        logger.info(f"Active Printer Pool ({len(installed)} printers): {installed}")

        while True:
            try:
                self.send_heartbeat()
                pending_jobs = self.fetch_pending_jobs()
                if pending_jobs:
                    logger.info(f"Found {len(pending_jobs)} pending print job(s) in QLex queue.")
                    for job in pending_jobs:
                        self.process_order(job)
            except KeyboardInterrupt:
                logger.info("Print Agent daemon stopped by user.")
                break
            except Exception as loop_err:
                logger.error(f"Unexpected loop exception: {loop_err}")

            time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    daemon = QLexPrintAgentDaemon()
    daemon.run()
