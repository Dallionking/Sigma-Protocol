---
name: pdf-manipulation
description: "Create, extract, merge, split, and manipulate PDF documents. Generate professional PDFs from templates or data."
version: "1.0.0"
triggers:
  - pdf
  - document
  - export
  - report
---

# PDF Manipulation Skill

Create, extract, merge, split, and manipulate PDF documents programmatically. Generate professional PDFs from data, templates, or existing files.

## When to Invoke

Invoke this skill when:
- Creating PDF reports, invoices, or documents
- Extracting text or data from PDFs
- Merging multiple PDFs into one
- Splitting PDFs into separate files
- Adding watermarks or annotations
- Converting HTML/Markdown to PDF

---

## 📦 Dependencies

### Node.js Options

```bash
# PDF generation
npm install pdf-lib         # Low-level PDF manipulation
npm install pdfkit          # PDF creation with drawing API
npm install puppeteer       # HTML to PDF (headless Chrome)
npm install @react-pdf/renderer  # React components to PDF

# PDF extraction
npm install pdf-parse       # Text extraction
```

### Python Options

```bash
pip install pypdf           # PDF manipulation (merge, split, rotate)
pip install reportlab       # PDF generation
pip install pdfplumber      # Text extraction with layout
pip install weasyprint      # HTML/CSS to PDF
```

---

## 📄 PDF Creation

### Using pdf-lib (Node.js)

```typescript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';

async function createPDF() {
  // Create a new PDF
  const pdfDoc = await PDFDocument.create();
  
  // Add a page
  const page = pdfDoc.addPage([612, 792]); // Letter size
  
  // Get fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Draw title
  page.drawText('Invoice #12345', {
    x: 50,
    y: 750,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // Draw date
  page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: 720,
    size: 12,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  // Draw a line
  page.drawLine({
    start: { x: 50, y: 700 },
    end: { x: 562, y: 700 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  
  // Draw table header
  const tableY = 670;
  page.drawText('Item', { x: 50, y: tableY, size: 12, font: helveticaBold });
  page.drawText('Qty', { x: 300, y: tableY, size: 12, font: helveticaBold });
  page.drawText('Price', { x: 400, y: tableY, size: 12, font: helveticaBold });
  page.drawText('Total', { x: 500, y: tableY, size: 12, font: helveticaBold });
  
  // Draw table rows
  const items = [
    { item: 'Consulting', qty: 10, price: 150 },
    { item: 'Development', qty: 40, price: 125 },
    { item: 'Design', qty: 8, price: 100 },
  ];
  
  let y = tableY - 25;
  for (const row of items) {
    page.drawText(row.item, { x: 50, y, size: 11, font: helvetica });
    page.drawText(String(row.qty), { x: 300, y, size: 11, font: helvetica });
    page.drawText(`$${row.price}`, { x: 400, y, size: 11, font: helvetica });
    page.drawText(`$${row.qty * row.price}`, { x: 500, y, size: 11, font: helvetica });
    y -= 20;
  }
  
  // Save
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('invoice.pdf', pdfBytes);
}
```

### Using PDFKit (Node.js)

```typescript
import PDFDocument from 'pdfkit';
import * as fs from 'fs';

function createPDFWithKit() {
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream('report.pdf');
  doc.pipe(stream);
  
  // Title
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('Project Report', { align: 'center' });
  
  doc.moveDown();
  
  // Subtitle
  doc
    .fontSize(12)
    .font('Helvetica')
    .fillColor('#666666')
    .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  
  doc.moveDown(2);
  
  // Section
  doc
    .fillColor('#000000')
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('Executive Summary');
  
  doc.moveDown(0.5);
  
  doc
    .fontSize(11)
    .font('Helvetica')
    .text('This report provides an overview of project progress and key metrics.', {
      align: 'justify',
    });
  
  doc.moveDown();
  
  // Bullet list
  const bullets = ['On-time delivery', 'Under budget', 'High quality'];
  bullets.forEach(item => {
    doc.text(`• ${item}`, { indent: 20 });
  });
  
  doc.moveDown(2);
  
  // Table
  const tableTop = doc.y;
  const headers = ['Metric', 'Target', 'Actual', 'Status'];
  const colWidths = [150, 100, 100, 100];
  
  // Draw header
  let x = 50;
  doc.font('Helvetica-Bold').fontSize(10);
  headers.forEach((header, i) => {
    doc.text(header, x, tableTop, { width: colWidths[i] });
    x += colWidths[i];
  });
  
  // Draw rows
  const rows = [
    ['Sprint Velocity', '40', '45', '✓'],
    ['Bug Count', '<10', '7', '✓'],
    ['Test Coverage', '80%', '85%', '✓'],
  ];
  
  let y = tableTop + 20;
  doc.font('Helvetica').fontSize(10);
  rows.forEach(row => {
    x = 50;
    row.forEach((cell, i) => {
      doc.text(cell, x, y, { width: colWidths[i] });
      x += colWidths[i];
    });
    y += 20;
  });
  
  // Add page number footer
  doc.on('pageAdded', () => {
    doc
      .fontSize(8)
      .text(`Page ${doc.bufferedPageRange().count}`, 50, 750, { align: 'center' });
  });
  
  doc.end();
}
```

### HTML to PDF (Puppeteer)

```typescript
import puppeteer from 'puppeteer';

async function htmlToPDF(html: string, outputPath: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: {
      top: '1in',
      right: '1in',
      bottom: '1in',
      left: '1in',
    },
    printBackground: true,
  });
  
  await browser.close();
}

// Usage
const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    h1 { color: #333; }
    .highlight { background: #fff3cd; padding: 10px; }
  </style>
</head>
<body>
  <h1>Report Title</h1>
  <div class="highlight">
    <p>Important information highlighted.</p>
  </div>
</body>
</html>
`;

await htmlToPDF(html, 'report.pdf');
```

---

## 🐍 Python Implementation

### Create PDF (ReportLab)

```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

def create_simple_pdf():
    c = canvas.Canvas("output.pdf", pagesize=letter)
    width, height = letter
    
    # Title
    c.setFont("Helvetica-Bold", 24)
    c.drawString(72, height - 72, "Report Title")
    
    # Body text
    c.setFont("Helvetica", 12)
    c.drawString(72, height - 120, "This is the body of the report.")
    
    # Line
    c.setStrokeColor(colors.gray)
    c.line(72, height - 140, width - 72, height - 140)
    
    c.save()

def create_table_pdf():
    doc = SimpleDocTemplate("table.pdf", pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    elements.append(Paragraph("Sales Report", styles['Heading1']))
    
    # Table data
    data = [
        ['Product', 'Q1', 'Q2', 'Q3', 'Q4'],
        ['Widget A', '$10,000', '$12,000', '$11,000', '$15,000'],
        ['Widget B', '$8,000', '$9,000', '$10,000', '$12,000'],
        ['Widget C', '$5,000', '$6,000', '$7,000', '$8,000'],
    ]
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    elements.append(table)
    doc.build(elements)
```

### HTML to PDF (WeasyPrint)

```python
from weasyprint import HTML, CSS

html_content = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; margin: 2cm; }
        h1 { color: #2c3e50; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background: #3498db; color: white; }
    </style>
</head>
<body>
    <h1>Monthly Report</h1>
    <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Revenue</td><td>$125,000</td></tr>
        <tr><td>Users</td><td>5,432</td></tr>
    </table>
</body>
</html>
"""

HTML(string=html_content).write_pdf('report.pdf')
```

---

## 📑 PDF Manipulation

### Merge PDFs (pdf-lib)

```typescript
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';

async function mergePDFs(pdfPaths: string[], outputPath: string) {
  const mergedPdf = await PDFDocument.create();
  
  for (const pdfPath of pdfPaths) {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }
  
  const mergedBytes = await mergedPdf.save();
  fs.writeFileSync(outputPath, mergedBytes);
}

// Usage
await mergePDFs(['doc1.pdf', 'doc2.pdf', 'doc3.pdf'], 'merged.pdf');
```

### Split PDF

```typescript
async function splitPDF(pdfPath: string, outputDir: string) {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const numPages = pdfDoc.getPageCount();
  
  for (let i = 0; i < numPages; i++) {
    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(pdfDoc, [i]);
    newPdf.addPage(page);
    
    const newPdfBytes = await newPdf.save();
    fs.writeFileSync(`${outputDir}/page-${i + 1}.pdf`, newPdfBytes);
  }
}
```

### Extract Text (pdf-parse)

```typescript
import pdf from 'pdf-parse';
import * as fs from 'fs';

async function extractText(pdfPath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  return data.text;
}

// Get metadata
async function getMetadata(pdfPath: string) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  
  return {
    pages: data.numpages,
    info: data.info,
    metadata: data.metadata,
  };
}
```

### Add Watermark

```typescript
async function addWatermark(pdfPath: string, watermarkText: string) {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const pages = pdfDoc.getPages();
  
  for (const page of pages) {
    const { width, height } = page.getSize();
    
    page.drawText(watermarkText, {
      x: width / 2 - 100,
      y: height / 2,
      size: 50,
      font: helvetica,
      color: rgb(0.8, 0.8, 0.8),
      opacity: 0.3,
      rotate: degrees(45),
    });
  }
  
  const watermarkedBytes = await pdfDoc.save();
  fs.writeFileSync('watermarked.pdf', watermarkedBytes);
}
```

### Python Merge/Split (pypdf)

```python
from pypdf import PdfReader, PdfWriter

# Merge
def merge_pdfs(pdf_paths, output_path):
    writer = PdfWriter()
    
    for pdf_path in pdf_paths:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            writer.add_page(page)
    
    with open(output_path, 'wb') as f:
        writer.write(f)

# Split
def split_pdf(pdf_path, output_dir):
    reader = PdfReader(pdf_path)
    
    for i, page in enumerate(reader.pages):
        writer = PdfWriter()
        writer.add_page(page)
        
        with open(f'{output_dir}/page_{i+1}.pdf', 'wb') as f:
            writer.write(f)

# Extract text
def extract_text(pdf_path):
    reader = PdfReader(pdf_path)
    text = ''
    for page in reader.pages:
        text += page.extract_text()
    return text
```

---

## 🖼 Advanced Features

### Add Images to PDF

```typescript
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';

async function addImage(pdfPath: string, imagePath: string) {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  const imageBytes = fs.readFileSync(imagePath);
  const image = imagePath.endsWith('.png')
    ? await pdfDoc.embedPng(imageBytes)
    : await pdfDoc.embedJpg(imageBytes);
  
  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();
  
  page.drawImage(image, {
    x: 50,
    y: height - 200,
    width: 150,
    height: 100,
  });
  
  const modifiedBytes = await pdfDoc.save();
  fs.writeFileSync('with-image.pdf', modifiedBytes);
}
```

### Form Filling

```typescript
async function fillForm(pdfPath: string, fieldValues: Record<string, string>) {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  const form = pdfDoc.getForm();
  
  for (const [fieldName, value] of Object.entries(fieldValues)) {
    const field = form.getTextField(fieldName);
    if (field) {
      field.setText(value);
    }
  }
  
  // Flatten form (make it non-editable)
  form.flatten();
  
  const filledBytes = await pdfDoc.save();
  fs.writeFileSync('filled.pdf', filledBytes);
}

// Usage
await fillForm('form.pdf', {
  'name': 'John Doe',
  'email': 'john@example.com',
  'date': new Date().toLocaleDateString(),
});
```

---

## 📁 Output Locations

PDFs should be saved to:

```
docs/
├── exports/
│   ├── pdfs/           # Generated PDFs
│   ├── reports/        # Report PDFs
│   └── invoices/       # Invoice PDFs
├── templates/          # PDF templates
└── assets/             # Images for PDFs
```

---

## 🔗 Integration with Sigma Protocol

### Export PRDs
Export PRDs to PDF for stakeholder distribution.

### @docx-generation
Use alongside DOCX skill for multi-format exports.

### Reports & Analytics
Generate PDF reports from analytics data.

---

## ⚠️ Best Practices

1. **Use Templates** — Create reusable layouts
2. **Optimize Images** — Compress before embedding
3. **Handle Large Files** — Stream for big PDFs
4. **Test Output** — Verify in multiple PDF readers
5. **Accessibility** — Add document structure tags when possible

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Fonts not rendering | Embed fonts or use StandardFonts |
| Large file size | Compress images, use PDF/A |
| Text extraction fails | PDF may be image-based, use OCR |
| Pages blank | Check coordinate system (0,0 is bottom-left) |
| Merge fails | Ensure PDFs aren't password protected |

---

*This skill enables comprehensive PDF manipulation for document automation, report generation, and file processing workflows.*


