from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font('Arial', 'B', 16)
pdf.cell(0, 10, 'API Endpoints Used in Frontend', ln=True, align='C')
pdf.ln(10)
pdf.set_font('Arial', '', 12)

with open('api_endpoints_frontend.txt', 'r', encoding='utf-8') as f:
    for line in f:
        pdf.cell(0, 8, line.strip(), ln=True)

pdf.output('api_endpoints_frontend.pdf')
print('PDF generated: api_endpoints_frontend.pdf')
