import os
import sys
import time
import logging
import requests
from pathlib import Path
from typing import Dict, Any

from config import (
    BACKEND_URL,
    POLL_INTERVAL_SECONDS,
    API_SECRET_KEY,
    TEMP_DIR,
    MOCK_PRINT,
)
from printer_pool import PrinterPoolManager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] (QLex-PrintAgent) %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("PrintAgentDaemon")


class QLexPrintAgentDaemon:

    def __init__(self):
        self.backend_url = BACKEND_URL.rstrip("/")
        self.headers = {"X-Print-Agent-Key": API_SECRET_KEY}
        self.printer_pool = PrinterPoolManager()
        logger.info(f"Initialized QLex Print Agent Daemon")
        logger.info(f"Connecting to Backend: {self.backend_url}")
        logger.info(f"Mock Print Mode: {MOCK_PRINT}")

    def fetch_pending_jobs(self):
        """Poll QLex backend for pending PAID orders waiting to be printed."""
        url = f"{self.backend_url}/shop/print-agent/pending-jobs"
        try:
            resp = requests.get(url, headers=self.headers, timeout=30)
            if resp.status_code == 200:
                return resp.json()
            else:
                logger.warning(f"Failed to fetch pending jobs. HTTP {resp.status_code}: {resp.text}")
                return []
        except requests.exceptions.Timeout:
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
            resp = requests.post(url, json=payload, headers=self.headers, timeout=30)
            if resp.status_code == 200:
                result = resp.json()
                logger.info(f"Backend status update for order '{order_id}': {result.get('message')}")
                return result
            else:
                logger.error(f"Failed to update job status on backend. HTTP {resp.status_code}: {resp.text}")
                return None
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
        resp = requests.get(doc_url, headers=self.headers, stream=True, timeout=30)
        resp.raise_for_status()

        with open(target_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        logger.info(f"Saved document to temp cache: {target_path}")
        return str(target_path)

    def process_order(self, job: Dict[str, Any]):
        """Process a single print order."""
        order_id = job["order_id"]
        token = job.get("token", "P-?")
        student_name = job.get("student_name", "Student")
        documents = job.get("documents", [])

        logger.info(f"=== [START PRINT JOB] Token: {token} | Order ID: {order_id} | Student: {student_name} ===")

        # 1. Update backend state to PRINTING
        self.update_job_status(order_id, "PRINTING")

        downloaded_files = []
        try:
            # 2. Download all documents for this order
            for doc in documents:
                local_pdf_path = self.download_document(doc)
                downloaded_files.append((local_pdf_path, doc))

            # 3. Print each document using an available printer from the pool
            for local_pdf_path, doc in downloaded_files:
                printer_name, reason = self.printer_pool.select_available_printer(
                    print_type=doc.get("print_type", "bw"),
                    paper_size=doc.get("paper_size", "a4")
                )

                success = self.printer_pool.print_document(
                    pdf_path=local_pdf_path,
                    printer_name=printer_name,
                    copies=doc.get("copies", 1),
                    print_type=doc.get("print_type", "bw"),
                    print_side=doc.get("print_side", "single"),
                    paper_size=doc.get("paper_size", "a4")
                )

                if not success:
                    raise RuntimeError(f"Failed to print document '{doc.get('original_filename')}' on '{printer_name}'")

            # 4. Mark job as COMPLETED on backend -> transitions order to READY_FOR_PICKUP & dispatches WhatsApp notification
            self.update_job_status(order_id, "COMPLETED", assigned_printer=printer_name)
            logger.info(f"=== [COMPLETED PRINT JOB] Token: {token} | Marked READY_FOR_PICKUP ===")

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
