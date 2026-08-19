# 🖨️ QLex Shop Print Agent

Automated silent direct-printing daemon for **QLex Print Hub**. Runs locally on shop computers connected to one or more printers. Automatically polls paid student orders, allocates jobs across available printers, silent-prints documents, and updates status to `READY_FOR_PICKUP` (triggering instant WhatsApp notifications).

---

## ⚡ Quick Start

### 1. Requirements
- **Python 3.10+**
- Installed OS Printers (USB, Ethernet, or Wi-Fi)

### 2. Installation
```bash
# Navigate to print-agent directory
cd print-agent

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` as needed:
- `QLEX_BACKEND_URL`: URL of your QLex backend server (e.g., `http://localhost:8000` or production URL).
- `MOCK_PRINT`: Set to `true` if you want to test order workflows without physical paper printing.
- `PRINTER_POOL`: Optional comma-separated printer names.

### 4. Running the Agent
```bash
python print_agent.py
```

---

## ⚙️ How Multi-Printer Pooling Works

1. **Auto-Discovery:** The daemon automatically discovers all system printers installed on Windows (GDI/win32print) or Linux/macOS (CUPS).
2. **Queue Balancing:** Before printing each order, the daemon queries queue depth across all printers in the pool and routes the order to the **least-busy idle printer**.
3. **Silent Printing:** Translates student print options (`copies`, `paper_size`, `print_type`, `print_side`) into silent print settings.
4. **Auto Notification:** Once printing completes, QLex automatically sets order state to `READY_FOR_PICKUP` and sends a WhatsApp pickup notification with token number to the student.
