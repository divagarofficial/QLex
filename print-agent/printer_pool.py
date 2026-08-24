import sys
import os
import subprocess
import time
import logging
from typing import List, Dict, Optional, Tuple
from config import SUMATRA_PATH, MOCK_PRINT, PRINTER_POOL

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s: %(message)s")
logger = logging.getLogger("PrinterPool")


class PrinterPoolManager:
    """
    Manages a pool of physical/network printers connected to the system.
    Dynamically balances print jobs by selecting the best available idle printer.
    """

    def __init__(self, configured_printers: List[str] = None):
        self.configured_printers = configured_printers or PRINTER_POOL
        self.is_windows = sys.platform.startswith("win")

    def get_installed_printers(self) -> List[str]:
        """Discover installed physical printers on the operating system automatically."""
        if MOCK_PRINT:
            return ["Mock Printer Alpha (B&W)", "Mock Printer Beta (Color)"]

        printers = []
        virtual_keywords = [
            "microsoft print to pdf", "onenote", "fax", "xps document writer", 
            "pdf24", "cutepdf", "adobe pdf", "foxit", "snagit", "pdf", "root", "send to"
        ]

        if self.is_windows:
            physical_detected = []
            try:
                import win32print
                flags = win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS
                installed = win32print.EnumPrinters(flags)
                for p in installed:
                    printer_name = p[2]
                    printers.append(printer_name)
                    
                    # Check port and printer metadata to identify physical hardware
                    try:
                        handle = win32print.OpenPrinter(printer_name)
                        try:
                            info = win32print.GetPrinter(handle, 2)
                            port = str(info.get("pPortName", "")).lower()
                            # Physical hardware ports: USB, WSD, Network IP, LPT, COM, DOT4, etc.
                            is_virtual_port = any(v in port for v in ["portprompt", "nul:", "mxdw:", "pdf", "file:", "onenote"])
                            is_virtual_name = any(v in printer_name.lower() for v in virtual_keywords)
                            if not is_virtual_port and not is_virtual_name:
                                physical_detected.append(printer_name)
                        finally:
                            win32print.ClosePrinter(handle)
                    except Exception:
                        pass
            except Exception as e:
                logger.warning(f"Failed to enumerate Windows printers via win32print: {e}")

            # Fallback via PowerShell if win32print did not return physical printers
            if not physical_detected:
                try:
                    res = subprocess.run(
                        ["powershell", "-Command", 
                         "Get-Printer | Where-Object { $_.PortName -notlike '*PORTPROMPT*' -and $_.PortName -notlike 'nul*' } | Select-Object -ExpandProperty Name"],
                        capture_output=True, text=True, timeout=5
                    )
                    if res.returncode == 0:
                        ps_printers = [line.strip() for line in res.stdout.splitlines() if line.strip()]
                        for p in ps_printers:
                            if not any(v in p.lower() for v in virtual_keywords):
                                physical_detected.append(p)
                except Exception as ps_err:
                    logger.error(f"PowerShell printer discovery failed: {ps_err}")

            if physical_detected:
                printers = physical_detected

        else:
            # Linux / macOS CUPS
            try:
                res = subprocess.run(["lpstat", "-a"], capture_output=True, text=True, timeout=5)
                if res.returncode == 0:
                    for line in res.stdout.splitlines():
                        parts = line.split()
                        if parts:
                            p_name = parts[0]
                            if not any(v in p_name.lower() for v in virtual_keywords):
                                printers.append(p_name)
            except Exception as e:
                logger.warning(f"Failed to enumerate CUPS printers: {e}")

        # If user explicitly configured PRINTER_POOL in .env, filter by it
        if self.configured_printers:
            filtered = [p for p in printers if any(cfg.lower() in p.lower() for cfg in self.configured_printers)]
            if filtered:
                return filtered

        # Strict physical filter: Never auto-select virtual document file-savers
        physical_only = [p for p in printers if not any(v in p.lower() for v in virtual_keywords)]
        if physical_only:
            return physical_only

        # If no physical printer is currently plugged in
        logger.warning("No physical paper printers currently detected on USB/Wi-Fi/Network. Please connect a physical printer.")
        return []

    def get_printer_queue_count(self, printer_name: str) -> int:
        """Query current pending print jobs for a specific printer."""
        if MOCK_PRINT or "Mock" in printer_name:
            return 0

        if self.is_windows:
            try:
                import win32print
                handle = win32print.OpenPrinter(printer_name)
                try:
                    jobs = win32print.EnumJobs(handle, 0, -1, 1)
                    return len(jobs)
                finally:
                    win32print.ClosePrinter(handle)
            except Exception:
                return 0
        else:
            try:
                res = subprocess.run(["lpstat", "-o", printer_name], capture_output=True, text=True, timeout=5)
                if res.returncode == 0:
                    return len(res.stdout.splitlines())
            except Exception:
                return 0

        return 0

    def select_available_printer(self, print_type: str = "bw", paper_size: str = "a4") -> Tuple[str, str]:
        """
        Selects the best available printer from the pool based on lowest queue count.
        Returns tuple of (printer_name, status_reason).
        """
        printers = self.get_installed_printers()
        if not printers:
            raise RuntimeError("No installed printers found on shop system.")

        # Evaluate queue length for each printer
        scored_printers = []
        for p in printers:
            queue_len = self.get_printer_queue_count(p)
            scored_printers.append((queue_len, p))

        # Sort by shortest queue
        scored_printers.sort(key=lambda x: x[0])
        best_queue, best_printer = scored_printers[0]

        logger.info(f"Selected Printer: '{best_printer}' (Active Queue Depth: {best_queue})")
        return best_printer, f"Assigned to {best_printer} (Queue length: {best_queue})"

    def ensure_sumatra_installed(self) -> bool:
        """Automatically fetch portable SumatraPDF.exe if not present in tools directory."""
        if os.path.exists(SUMATRA_PATH):
            return True

        tools_dir = os.path.dirname(SUMATRA_PATH)
        os.makedirs(tools_dir, exist_ok=True)
        url = "https://www.sumatrapdfreader.org/dl/rel/3.5.2/SumatraPDF-3.5.2-64.exe"
        logger.info(f"SumatraPDF not found at {SUMATRA_PATH}. Auto-downloading portable binary from '{url}'...")
        try:
            import urllib.request
            urllib.request.urlretrieve(url, SUMATRA_PATH)
            logger.info(f"Successfully downloaded SumatraPDF executable to {SUMATRA_PATH}")
            return True
        except Exception as err:
            logger.error(f"Failed to auto-download SumatraPDF executable: {err}")
            return False

    def print_document(
        self,
        pdf_path: str,
        printer_name: str,
        copies: int = 1,
        print_type: str = "bw",      # "bw" or "color"
        print_side: str = "single",  # "single" or "double"
        paper_size: str = "a4",
    ) -> bool:
        """
        Silently prints a PDF document using native system print utilities.
        """
        logger.info(
            f"Printing document: {os.path.basename(pdf_path)} -> Printer: '{printer_name}' "
            f"[Copies: {copies}, Type: {print_type}, Side: {print_side}, Size: {paper_size}]"
        )

        if MOCK_PRINT or "Mock" in printer_name:
            logger.info(f"[MOCK PRINT SUCCESS] Printed {os.path.basename(pdf_path)} on '{printer_name}'")
            time.sleep(1)  # Simulate printing time
            return True

        if self.is_windows:
            # Ensure SumatraPDF executable is available for silent PDF rendering
            self.ensure_sumatra_installed()

            # Approach A: Use SumatraPDF CLI if available for exact silent rendering
            if os.path.exists(SUMATRA_PATH):
                settings = []
                if print_type.lower() == "bw":
                    settings.append("monochrome")
                else:
                    settings.append("color")

                if print_side.lower() in ("double", "duplex"):
                    settings.append("duplex")
                else:
                    settings.append("simplex")

                if copies > 1:
                    settings.append(f"{copies}x")

                settings_str = ",".join(settings)
                cmd = [
                    str(SUMATRA_PATH),
                    "-print-to", printer_name,
                    "-print-settings", settings_str,
                    "-silent",
                    pdf_path
                ]
                logger.info(f"Executing SumatraPDF: {' '.join(cmd)}")
                res = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
                if res.returncode == 0:
                    return True
                else:
                    logger.warning(f"SumatraPDF exited with code {res.returncode}: {res.stderr}")

            # Approach B: Windows ShellExecute printto verb (Fallback)
            try:
                import win32api
                win32api.ShellExecute(0, "printto", pdf_path, f'"{printer_name}"', ".", 0)
                time.sleep(2)  # Give spooler time to enqueue
                return True
            except Exception as e:
                logger.error(f"Windows ShellExecute printto failed: {e}")
                return False

        else:
            # Linux / macOS CUPS lp command
            cmd = ["lp", "-d", printer_name, "-n", str(copies)]

            if print_type.lower() == "bw":
                cmd.extend(["-o", "ColorModel=KGray"])
            else:
                cmd.extend(["-o", "ColorModel=Color"])

            if print_side.lower() in ("double", "duplex"):
                cmd.extend(["-o", "sides=two-sided-long-edge"])
            else:
                cmd.extend(["-o", "sides=one-sided"])

            cmd.append(pdf_path)
            logger.info(f"Executing CUPS lp: {' '.join(cmd)}")
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            return res.returncode == 0
