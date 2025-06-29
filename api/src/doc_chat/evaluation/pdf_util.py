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
    total_word_count = 0
    total_char_count = 0

    for page in reader.pages:
        text = page.extract_text()
        if text:
            words = text.split()
            word_count = len(words)
            char_count = len(text)
            total_word_count += word_count
            total_char_count += char_count

    avg_words_per_page = total_word_count / num_pages if num_pages > 0 else 0
    avg_chars_per_page = total_char_count / num_pages if num_pages > 0 else 0

    return {
        "num_pages": num_pages,
        "total_word_count": total_word_count,
        "avg_words_per_page": avg_words_per_page,
        "total_char_count": total_char_count,
        "avg_chars_per_page": avg_chars_per_page
    }
