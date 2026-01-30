#!/usr/bin/env python3
# Simple markdown-to-pdf converter using reportlab
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
import os

FILES = [
    os.path.join(os.path.dirname(__file__), '..', 'teacher_guide_microbit_1st_grade.md'),
    os.path.join(os.path.dirname(__file__), '..', 'student_worksheet_microbit_1st_grade.md'),
]

def md_to_pdf(md_path, pdf_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        text = f.read()
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(pdf_path, pagesize=A4)
    story = []
    # Split into paragraphs by blank lines
    for block in text.split('\n\n'):
        # Replace single newlines with <br/> for Paragraph
        html = block.replace('\n', '<br/>')
        story.append(Paragraph(html, styles['Normal']))
        story.append(Spacer(1, 8))
    doc.build(story)

def main():
    for md in FILES:
        md = os.path.abspath(md)
        if not os.path.exists(md):
            print('Not found:', md)
            continue
        pdf = os.path.splitext(md)[0] + '.pdf'
        print('Converting', md, '->', pdf)
        md_to_pdf(md, pdf)
    print('Done')

if __name__ == '__main__':
    main()
