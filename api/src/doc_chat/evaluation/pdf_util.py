import os

from pypdf import PdfReader
from weasyprint import HTML


def write_pdf(
      text: str,
      output_path: str,
      title: str = None,
      font_size: str = "13pt",
      line_height: float = 1.5,
      margin: str = "30px"
) -> None:
    html_template = f"""
    <html>
    <head>
      <style>
        body {{
          font-family: Helvetica, sans-serif;
          font-size: {font_size};
          line-height: {line_height};
          margin: {margin};
        }}
        p {{
          margin-bottom: 1em;
        }}
      </style>
    </head>
    <body>
      {f"<h1>{title}</h1>" if title is not None else ""}
      <p>{text}</p>
    </body>
    </html>
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    HTML(string=html_template).write_pdf(output_path)


def read_pdf_info(file_path: str):
    reader = PdfReader(file_path)
    num_pages = len(reader.pages)
    word_count = 0

    for page in reader.pages:
        text = page.extract_text()
        if text:
            word_count += len(text.split())

    return {
        "num_pages": num_pages,
        "word_count": word_count
    }
