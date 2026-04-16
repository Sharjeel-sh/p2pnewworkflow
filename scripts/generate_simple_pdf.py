from pathlib import Path
from textwrap import wrap

INPUT_MD = Path('docs/STEP_BY_STEP_WORKFLOW_TESTING.md')
OUTPUT_PDF = Path('docs/STEP_BY_STEP_WORKFLOW_TESTING.pdf')

# Basic PDF settings
PAGE_WIDTH = 595
PAGE_HEIGHT = 842
LEFT = 50
RIGHT = 50
TOP = 60
BOTTOM = 60
FONT_SIZE = 11
LINE_HEIGHT = 15
MAX_CHARS = 90


def escape_pdf_text(text: str) -> str:
    return text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


def lines_from_markdown(md: str):
    out = []
    for raw in md.splitlines():
        if not raw.strip():
            out.append('')
            continue
        # Preserve headings/bullets; remove markdown emphasis marks for clean PDF text
        line = raw.replace('**', '').replace('`', '')
        if line.startswith('#'):
            line = line.lstrip('#').strip().upper()
        wrapped = wrap(line, width=MAX_CHARS, replace_whitespace=False, drop_whitespace=False)
        out.extend(wrapped if wrapped else [''])
    return out


def build_pages(lines):
    usable_height = PAGE_HEIGHT - TOP - BOTTOM
    lines_per_page = usable_height // LINE_HEIGHT
    pages = []
    for i in range(0, len(lines), lines_per_page):
        pages.append(lines[i:i + lines_per_page])
    return pages


def content_stream(page_lines):
    y = PAGE_HEIGHT - TOP
    parts = ['BT', f'/F1 {FONT_SIZE} Tf']
    for line in page_lines:
        safe = escape_pdf_text(line)
        parts.append(f'1 0 0 1 {LEFT} {y} Tm ({safe}) Tj')
        y -= LINE_HEIGHT
    parts.append('ET')
    return '\n'.join(parts).encode('latin-1', errors='replace')


def make_pdf(pages):
    objects = []

    # 1: Catalog
    objects.append('<< /Type /Catalog /Pages 2 0 R >>'.encode())

    # 2: Pages (placeholder kids)
    kids = ' '.join([f'{4 + i*2} 0 R' for i in range(len(pages))])
    objects.append(f'<< /Type /Pages /Kids [{kids}] /Count {len(pages)} >>'.encode())

    # 3: Font
    objects.append(b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')

    # Page/content pairs
    for i, page in enumerate(pages):
        page_obj_num = 4 + i * 2
        content_obj_num = page_obj_num + 1
        page_obj = (
            f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] '
            f'/Resources << /Font << /F1 3 0 R >> >> /Contents {content_obj_num} 0 R >>'
        ).encode()
        objects.append(page_obj)

        stream = content_stream(page)
        content_obj = b'<< /Length ' + str(len(stream)).encode() + b' >>\nstream\n' + stream + b'\nendstream'
        objects.append(content_obj)

    pdf = bytearray(b'%PDF-1.4\n')
    xref = [0]
    for i, obj in enumerate(objects, start=1):
        xref.append(len(pdf))
        pdf.extend(f'{i} 0 obj\n'.encode())
        pdf.extend(obj)
        pdf.extend(b'\nendobj\n')

    xref_pos = len(pdf)
    pdf.extend(f'xref\n0 {len(objects) + 1}\n'.encode())
    pdf.extend(b'0000000000 65535 f \n')
    for off in xref[1:]:
        pdf.extend(f'{off:010d} 00000 n \n'.encode())

    pdf.extend(
        (
            'trailer\n'
            f'<< /Size {len(objects) + 1} /Root 1 0 R >>\n'
            f'startxref\n{xref_pos}\n%%EOF\n'
        ).encode()
    )
    return pdf


def main():
    md = INPUT_MD.read_text(encoding='utf-8')
    lines = lines_from_markdown(md)
    pages = build_pages(lines)
    pdf_data = make_pdf(pages)
    OUTPUT_PDF.write_bytes(pdf_data)
    print(f'Generated {OUTPUT_PDF} ({len(pdf_data)} bytes, {len(pages)} pages)')


if __name__ == '__main__':
    main()
