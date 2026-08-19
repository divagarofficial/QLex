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
        """Discover installed printers on the operating system."""
        if MOCK_PRINT:
            return ["Mock Printer Alpha (B&W)", "Mock Printer Beta (Color)"]

        printers = []
        if self.is_windows:
            try:
                import win32print
                flags = win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS
                installed = win32print.EnumPrinters(flags)
                for p in installed:
                    # p is a tuple (flags, description, name, comment)
                    printers.append(p[2])
            except Exception as e:
                logger.warning(f"Failed to enumerate Windows printers via win32print: {e}")
                # Fallback via PowerShell
                try:
                    res = subprocess.run(
                        ["powershell", "-Command", "Get-Printer | Select-Object -ExpandProperty Name"],
                        capture_output=True, text=True, timeout=5
                    )
                    if res.returncode == 0:
                        printers = [line.strip() for line in res.stdout.splitlines() if line.strip()]
                except Exception as ps_err:
                    logger.error(f"PowerShell printer discovery failed: {ps_err}")
        else:
            # Linux / macOS CUPS
            try:
                res = subprocess.run(["lpstat", "-a"], capture_output=True, text=True, timeout=5)
                if res.returncode == 0:
                    for line in res.stdout.splitlines():
                        parts = line.split()
                        if parts:
                            printers.append(parts[0])
            except Exception as e:
                logger.warning(f"Failed to enumerate CUPS printers: {e}")

        if self.configured_printers:
            # Filter by explicit configured printer pool if provided
            filtered = [p for p in printers if any(cfg.lower() in p.lower() for cfg in self.configured_printers)]
            if filtered:
                return filtered

        return printers if printers else ["Default System Printer"]

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

            # Approach B: Windows ShellExecute printto verb
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
