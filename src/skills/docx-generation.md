---
name: docx-generation
description: "Create, edit, and analyze Word documents (.docx) programmatically. Generate professional documents, reports, and proposals."
version: "1.0.0"
triggers:
  - document
  - word
  - docx
  - report
  - proposal
---

# DOCX Generation Skill

Create, edit, and analyze Microsoft Word documents (.docx) programmatically. Generate professional documents, reports, proposals, and more.

## When to Invoke

Invoke this skill when:
- Creating business documents (proposals, reports, contracts)
- Generating documentation exports
- Converting markdown to Word format
- Editing existing Word documents
- Extracting content from Word files

---

## 📦 Dependencies

### Node.js

```bash
npm install docx
# or
npm install officegen
```

### Python

```bash
pip install python-docx
```

---

## 🛠 Core Operations

### Create Document (Node.js with `docx`)

```typescript
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import * as fs from 'fs';

// Create a professional document
const doc = new Document({
  creator: "Sigma Protocol",
  title: "Project Proposal",
  description: "Auto-generated proposal document",
  sections: [{
    properties: {},
    children: [
      // Title
      new Paragraph({
        text: "Project Proposal",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      
      // Subtitle
      new Paragraph({
        children: [
          new TextRun({
            text: "Prepared for: Client Name",
            italics: true,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),
      
      // Section heading
      new Paragraph({
        text: "Executive Summary",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      
      // Body text
      new Paragraph({
        children: [
          new TextRun({
            text: "This proposal outlines our approach to delivering ",
          }),
          new TextRun({
            text: "exceptional results",
            bold: true,
          }),
          new TextRun({
            text: " for your organization.",
          }),
        ],
        spacing: { after: 200 },
      }),
      
      // Bulleted list
      new Paragraph({
        text: "Key deliverables:",
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "Complete system implementation",
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "User training and documentation",
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "90-day support period",
        bullet: { level: 0 },
      }),
    ],
  }],
});

// Generate and save
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync("proposal.docx", buffer);
```

### Create Tables

```typescript
import { Table, TableRow, TableCell, WidthType, BorderStyle, Paragraph } from 'docx';

const table = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    // Header row
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Item", bold: true })],
          shading: { fill: "4472C4" },
        }),
        new TableCell({
          children: [new Paragraph({ text: "Quantity", bold: true })],
          shading: { fill: "4472C4" },
        }),
        new TableCell({
          children: [new Paragraph({ text: "Price", bold: true })],
          shading: { fill: "4472C4" },
        }),
      ],
    }),
    // Data rows
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Implementation")] }),
        new TableCell({ children: [new Paragraph("1")] }),
        new TableCell({ children: [new Paragraph("$10,000")] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Training")] }),
        new TableCell({ children: [new Paragraph("5")] }),
        new TableCell({ children: [new Paragraph("$2,500")] }),
      ],
    }),
  ],
});
```

### Add Images

```typescript
import { ImageRun, Paragraph } from 'docx';
import * as fs from 'fs';

const imageBuffer = fs.readFileSync('logo.png');

const imageParagraph = new Paragraph({
  children: [
    new ImageRun({
      data: imageBuffer,
      transformation: {
        width: 200,
        height: 100,
      },
    }),
  ],
  alignment: AlignmentType.CENTER,
});
```

### Create Headers & Footers

```typescript
import { Header, Footer, Paragraph, TextRun, PageNumber } from 'docx';

const doc = new Document({
  sections: [{
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            children: [
              new TextRun("Company Name"),
              new TextRun({ text: " | ", italics: true }),
              new TextRun("Confidential"),
            ],
          }),
        ],
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            children: [
              new TextRun("Page "),
              new TextRun({
                children: [PageNumber.CURRENT],
              }),
              new TextRun(" of "),
              new TextRun({
                children: [PageNumber.TOTAL_PAGES],
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      }),
    },
    children: [/* document content */],
  }],
});
```

---

## 🐍 Python Implementation

### Create Document (python-docx)

```python
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE

# Create document
doc = Document()

# Add title
title = doc.add_heading('Project Proposal', 0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER

# Add styled paragraph
para = doc.add_paragraph()
run = para.add_run('This is ')
run = para.add_run('important')
run.bold = True
run = para.add_run(' information.')

# Add bullet list
doc.add_paragraph('First item', style='List Bullet')
doc.add_paragraph('Second item', style='List Bullet')
doc.add_paragraph('Third item', style='List Bullet')

# Add table
table = doc.add_table(rows=3, cols=3)
table.style = 'Table Grid'

# Fill header
header_cells = table.rows[0].cells
header_cells[0].text = 'Item'
header_cells[1].text = 'Quantity'
header_cells[2].text = 'Price'

# Add image
doc.add_picture('logo.png', width=Inches(2))

# Save
doc.save('proposal.docx')
```

### Read Document

```python
from docx import Document

doc = Document('existing.docx')

# Extract all text
full_text = []
for para in doc.paragraphs:
    full_text.append(para.text)

# Extract tables
for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            print(cell.text)

# Get document properties
core_props = doc.core_properties
print(f"Title: {core_props.title}")
print(f"Author: {core_props.author}")
```

---

## 📝 Document Templates

### Report Template

```typescript
function createReport(data: ReportData): Document {
  return new Document({
    sections: [{
      children: [
        // Cover page
        new Paragraph({
          text: data.title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          pageBreakBefore: false,
        }),
        new Paragraph({
          text: data.subtitle,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `Date: ${new Date().toLocaleDateString()}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 1000 },
        }),
        
        // Table of contents placeholder
        new Paragraph({
          text: "Table of Contents",
          heading: HeadingLevel.HEADING_1,
          pageBreakBefore: true,
        }),
        
        // Executive Summary
        new Paragraph({
          text: "Executive Summary",
          heading: HeadingLevel.HEADING_1,
          pageBreakBefore: true,
        }),
        new Paragraph({ text: data.summary }),
        
        // Sections
        ...data.sections.flatMap(section => [
          new Paragraph({
            text: section.title,
            heading: HeadingLevel.HEADING_1,
            pageBreakBefore: true,
          }),
          ...section.content.map(p => new Paragraph({ text: p })),
        ]),
        
        // Conclusion
        new Paragraph({
          text: "Conclusion",
          heading: HeadingLevel.HEADING_1,
          pageBreakBefore: true,
        }),
        new Paragraph({ text: data.conclusion }),
      ],
    }],
  });
}
```

### Invoice Template

```typescript
function createInvoice(invoice: InvoiceData): Document {
  return new Document({
    sections: [{
      children: [
        // Header with logo
        new Paragraph({
          children: [
            new ImageRun({ data: invoice.logo, transformation: { width: 150, height: 50 } }),
          ],
        }),
        
        // Invoice number
        new Paragraph({
          text: `Invoice #${invoice.number}`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.RIGHT,
        }),
        new Paragraph({
          text: `Date: ${invoice.date}`,
          alignment: AlignmentType.RIGHT,
        }),
        
        // Bill to
        new Paragraph({
          text: "Bill To:",
          bold: true,
          spacing: { before: 400 },
        }),
        new Paragraph({ text: invoice.client.name }),
        new Paragraph({ text: invoice.client.address }),
        
        // Line items table
        createLineItemsTable(invoice.items),
        
        // Total
        new Paragraph({
          children: [
            new TextRun({ text: "Total: ", bold: true }),
            new TextRun({ text: `$${invoice.total.toFixed(2)}`, bold: true, size: 28 }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 400 },
        }),
      ],
    }],
  });
}
```

---

## 🎨 Styling

### Custom Styles

```typescript
import { Document, StyleLevel, convertInchesToTwip } from 'docx';

const doc = new Document({
  styles: {
    paragraphStyles: [
      {
        id: "customHeading",
        name: "Custom Heading",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: {
          size: 28,
          bold: true,
          color: "2E74B5",
          font: "Calibri Light",
        },
        paragraph: {
          spacing: { before: 240, after: 120 },
        },
      },
      {
        id: "pullQuote",
        name: "Pull Quote",
        run: {
          italics: true,
          size: 24,
          color: "666666",
        },
        paragraph: {
          indent: {
            left: convertInchesToTwip(0.5),
            right: convertInchesToTwip(0.5),
          },
          border: {
            left: { style: BorderStyle.SINGLE, size: 12, color: "4472C4" },
          },
        },
      },
    ],
  },
  sections: [/* content */],
});
```

---

## 🔄 Markdown to DOCX Conversion

```typescript
import { marked } from 'marked';
import { Document, Paragraph, TextRun, HeadingLevel } from 'docx';

function markdownToDocx(markdown: string): Document {
  const tokens = marked.lexer(markdown);
  const children: Paragraph[] = [];
  
  for (const token of tokens) {
    switch (token.type) {
      case 'heading':
        children.push(new Paragraph({
          text: token.text,
          heading: getHeadingLevel(token.depth),
        }));
        break;
      case 'paragraph':
        children.push(new Paragraph({
          children: parseInlineTokens(token.tokens || []),
        }));
        break;
      case 'list':
        token.items.forEach(item => {
          children.push(new Paragraph({
            text: item.text,
            bullet: { level: 0 },
          }));
        });
        break;
      case 'code':
        children.push(new Paragraph({
          children: [new TextRun({
            text: token.text,
            font: "Consolas",
            size: 20,
          })],
          shading: { fill: "F5F5F5" },
        }));
        break;
    }
  }
  
  return new Document({ sections: [{ children }] });
}
```

---

## 📁 Output Locations

Documents should be saved to:

```
docs/
├── exports/          # Generated documents
│   ├── proposals/
│   ├── reports/
│   └── invoices/
├── templates/        # Reusable templates
└── assets/           # Images, logos for documents
```

---

## 🔗 Integration with Sigma Protocol

### Step 11 PRD Export
Export PRDs to Word format for stakeholder review.

### @step-14-documentation (if exists)
Generate user manuals and guides in Word format.

### @implement-prd
When PRD requires document generation as a feature.

---

## ⚠️ Best Practices

1. **Use Templates** — Don't recreate styles for every document
2. **Handle Errors** — File operations can fail
3. **Memory** — Large documents with images can be memory-intensive
4. **Compatibility** — Test output in multiple Word versions
5. **Accessibility** — Use proper heading hierarchy, alt text for images

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Corrupted .docx | Ensure buffer is written correctly |
| Missing fonts | Use web-safe fonts or embed |
| Table overflow | Set explicit column widths |
| Image not showing | Check path, use absolute paths |

---

*This skill enables programmatic document generation for business automation, report generation, and documentation workflows.*


