import fitz


def get_pdf_information(path: str):

    pdf = fitz.open(path)

    pages = pdf.page_count

    pdf.close()

    return {
        "pages": pages
    }