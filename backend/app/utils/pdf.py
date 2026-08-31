import os


def get_pdf_information(path: str):
    try:
        if path.lower().endswith(".pdf"):
            try:
                import fitz
                pdf = fitz.open(path)
                pages = pdf.page_count
                pdf.close()
                return {"pages": max(1, pages)}
            except ImportError:
                from pypdf import PdfReader
                reader = PdfReader(path)
                pages = len(reader.pages)
                return {"pages": max(1, pages)}
    except Exception:
        pass

    try:
        file_size = os.path.getsize(path) if os.path.exists(path) else 0
        pages = max(1, file_size // 50000) if file_size > 0 else 1
        return {"pages": pages}
    except Exception:
        return {"pages": 1}


def parse_page_selection(custom_pages: str | None, total_pages: int) -> list[int]:
    """
    Parses a custom pages specification string into a sorted list of unique 1-indexed page numbers.
    Supports presets: "ALL", "ODD", "EVEN", or ranges like "1-5, 8, 11-15", or single page "3".
    """
    if total_pages <= 0:
        return []

    if not custom_pages or custom_pages.strip().upper() == "ALL":
        return list(range(1, total_pages + 1))

    mode = custom_pages.strip().upper()
    if mode == "ODD":
        return [p for p in range(1, total_pages + 1) if p % 2 != 0]
    if mode == "EVEN":
        return [p for p in range(1, total_pages + 1) if p % 2 == 0]

    pages_set = set()
    parts = custom_pages.split(",")
    for part in parts:
        trimmed = part.strip()
        if not trimmed:
            continue
        if "-" in trimmed:
            try:
                subparts = trimmed.split("-")
                start = int(subparts[0].strip())
                end = int(subparts[1].strip())
                if start <= end:
                    for p in range(start, end + 1):
                        if 1 <= p <= total_pages:
                            pages_set.add(p)
            except Exception:
                pass
        else:
            try:
                val = int(trimmed)
                if 1 <= val <= total_pages:
                    pages_set.add(val)
            except Exception:
                pass

    if not pages_set:
        return list(range(1, total_pages + 1))

    return sorted(list(pages_set))


def get_printable_page_count(custom_pages: str | None, total_pages: int) -> int:
    """
    Returns total printable page count after evaluating custom_pages range against total_pages.
    """
    pages = parse_page_selection(custom_pages, total_pages)
    return max(1, len(pages))


def extract_pdf_pages(input_pdf_path: str, output_pdf_path: str, pages_to_keep: list[int]) -> bool:
    """
    Slices input_pdf_path to keep only pages in pages_to_keep (1-indexed) and saves to output_pdf_path.
    """
    try:
        try:
            import fitz
            doc = fitz.open(input_pdf_path)
            new_doc = fitz.open()
            total_in_doc = doc.page_count

            zero_indices = [p - 1 for p in pages_to_keep if 1 <= p <= total_in_doc]
            if not zero_indices:
                zero_indices = list(range(total_in_doc))

            for page_idx in zero_indices:
                new_doc.insert_pdf(doc, from_page=page_idx, to_page=page_idx)

            new_doc.save(output_pdf_path)
            new_doc.close()
            doc.close()
            return True
        except ImportError:
            from pypdf import PdfReader, PdfWriter
            reader = PdfReader(input_pdf_path)
            writer = PdfWriter()
            total_in_doc = len(reader.pages)

            zero_indices = [p - 1 for p in pages_to_keep if 1 <= p <= total_in_doc]
            if not zero_indices:
                zero_indices = list(range(total_in_doc))

            for page_idx in zero_indices:
                writer.add_page(reader.pages[page_idx])

            with open(output_pdf_path, "wb") as f:
                writer.write(f)
            return True
    except Exception as e:
        print(f"[PDF Extract Error] Failed to slice PDF: {e}")
        return False