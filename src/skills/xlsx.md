---
name: xlsx
description: "Comprehensive spreadsheet creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization. Use when working with spreadsheets (.xlsx, .xlsm, .csv, .tsv)."
version: "1.0.0"
source: "@anthropics/skills"
triggers:
  - spreadsheet-creation
  - data-analysis
  - csv-processing
  - excel-manipulation
  - financial-modeling
---

# XLSX Skill

Comprehensive spreadsheet creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization.

## When to Invoke

Invoke this skill when:

- Creating new spreadsheets with formulas and formatting
- Reading or analyzing spreadsheet data
- Modifying existing spreadsheets while preserving formulas
- Performing data analysis and visualization
- Recalculating formulas
- Processing CSV/TSV files

---

## Spreadsheet Creation

### Basic Structure

```javascript
// Using SheetJS (xlsx library)
import * as XLSX from "xlsx";

// Create workbook
const wb = XLSX.utils.book_new();

// Create worksheet from data
const data = [
  ["Name", "Department", "Salary", "Start Date"],
  ["John Doe", "Engineering", 95000, new Date("2023-01-15")],
  ["Jane Smith", "Marketing", 85000, new Date("2022-06-01")],
  ["Bob Johnson", "Sales", 75000, new Date("2024-03-20")],
];

const ws = XLSX.utils.aoa_to_sheet(data);

// Add to workbook
XLSX.utils.book_append_sheet(wb, ws, "Employees");

// Write file
XLSX.writeFile(wb, "employees.xlsx");
```

### With Formulas

```javascript
const data = [
  ["Product", "Quantity", "Price", "Total"],
  ["Widget A", 10, 25.99, { f: "B2*C2" }],
  ["Widget B", 5, 49.99, { f: "B3*C3" }],
  ["Widget C", 20, 12.5, { f: "B4*C4" }],
  ["", "", "Grand Total:", { f: "SUM(D2:D4)" }],
];

const ws = XLSX.utils.aoa_to_sheet(data);
```

### Column Formatting

```javascript
// Set column widths
ws["!cols"] = [
  { wch: 15 }, // Column A width
  { wch: 10 }, // Column B width
  { wch: 12 }, // Column C width
  { wch: 15 }, // Column D width
];

// Set row heights
ws["!rows"] = [
  { hpt: 20 }, // Row 1 height (header)
];
```

---

## Data Analysis Patterns

### Reading and Parsing

```javascript
// Read file
const wb = XLSX.readFile("data.xlsx");

// Get first sheet
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(ws);

// With headers
const dataWithHeaders = XLSX.utils.sheet_to_json(ws, { header: 1 });

// Specific range
const rangeData = XLSX.utils.sheet_to_json(ws, { range: "A1:D10" });
```

### Common Analysis Operations

```javascript
// Filter data
const highSalary = data.filter((row) => row.Salary > 80000);

// Group by department
const byDepartment = data.reduce((acc, row) => {
  const dept = row.Department;
  if (!acc[dept]) acc[dept] = [];
  acc[dept].push(row);
  return acc;
}, {});

// Calculate statistics
const salaries = data.map((row) => row.Salary);
const stats = {
  count: salaries.length,
  sum: salaries.reduce((a, b) => a + b, 0),
  avg: salaries.reduce((a, b) => a + b, 0) / salaries.length,
  min: Math.min(...salaries),
  max: Math.max(...salaries),
};

// Pivot table simulation
const pivot = data.reduce((acc, row) => {
  const key = `${row.Department}-${row.Year}`;
  if (!acc[key]) acc[key] = { count: 0, total: 0 };
  acc[key].count++;
  acc[key].total += row.Sales;
  return acc;
}, {});
```

---

## Common Formulas Reference

### Mathematical

| Formula          | Purpose         | Example            |
| ---------------- | --------------- | ------------------ |
| `SUM(range)`     | Sum values      | `=SUM(A1:A10)`     |
| `AVERAGE(range)` | Average         | `=AVERAGE(B1:B10)` |
| `COUNT(range)`   | Count numbers   | `=COUNT(C1:C10)`   |
| `COUNTA(range)`  | Count non-empty | `=COUNTA(D1:D10)`  |
| `MIN/MAX(range)` | Min/Max value   | `=MAX(E1:E10)`     |

### Lookup

| Formula       | Purpose           | Example                              |
| ------------- | ----------------- | ------------------------------------ |
| `VLOOKUP`     | Vertical lookup   | `=VLOOKUP(A1,Sheet2!A:B,2,FALSE)`    |
| `HLOOKUP`     | Horizontal lookup | `=HLOOKUP(A1,1:2,2,FALSE)`           |
| `INDEX/MATCH` | Flexible lookup   | `=INDEX(B:B,MATCH(A1,A:A,0))`        |
| `XLOOKUP`     | Modern lookup     | `=XLOOKUP(A1,Sheet2!A:A,Sheet2!B:B)` |

### Conditional

| Formula   | Purpose             | Example                     |
| --------- | ------------------- | --------------------------- |
| `IF`      | Conditional         | `=IF(A1>100,"High","Low")`  |
| `IFS`     | Multiple conditions | `=IFS(A1>90,"A",A1>80,"B")` |
| `SUMIF`   | Conditional sum     | `=SUMIF(A:A,"Sales",B:B)`   |
| `COUNTIF` | Conditional count   | `=COUNTIF(A:A,">100")`      |

### Text

| Formula           | Purpose        | Example              |
| ----------------- | -------------- | -------------------- |
| `CONCATENATE`/`&` | Join text      | `=A1&" "&B1`         |
| `LEFT/RIGHT/MID`  | Extract text   | `=LEFT(A1,3)`        |
| `TRIM`            | Remove spaces  | `=TRIM(A1)`          |
| `TEXT`            | Format as text | `=TEXT(A1,"$#,##0")` |

### Date

| Formula   | Purpose         | Example               |
| --------- | --------------- | --------------------- |
| `TODAY()` | Current date    | `=TODAY()`            |
| `DATEDIF` | Date difference | `=DATEDIF(A1,B1,"D")` |
| `EOMONTH` | End of month    | `=EOMONTH(A1,0)`      |
| `WORKDAY` | Add workdays    | `=WORKDAY(A1,10)`     |

---

## CSV/TSV Processing

### Reading CSV

```javascript
// Parse CSV string
const csvData = `Name,Age,City
John,30,NYC
Jane,25,LA`;

const wb = XLSX.read(csvData, { type: "string" });
const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
```

### Writing CSV

```javascript
// Convert to CSV
const csvOutput = XLSX.utils.sheet_to_csv(ws);

// With custom delimiter (TSV)
const tsvOutput = XLSX.utils.sheet_to_csv(ws, { FS: "\t" });

// Write to file
fs.writeFileSync("output.csv", csvOutput);
```

### Large File Handling

```javascript
// Stream processing for large files
import { createReadStream } from "fs";
import { parse } from "csv-parse";

const records = [];
createReadStream("large-file.csv")
  .pipe(parse({ columns: true }))
  .on("data", (record) => {
    // Process each record
    records.push(processRecord(record));
  })
  .on("end", () => {
    console.log(`Processed ${records.length} records`);
  });
```

---

## Data Validation

### Common Validations

```javascript
function validateSpreadsheetData(data, schema) {
  const errors = [];

  data.forEach((row, index) => {
    // Required fields
    schema.required.forEach((field) => {
      if (!row[field]) {
        errors.push(`Row ${index + 1}: Missing required field '${field}'`);
      }
    });

    // Type validation
    Object.entries(schema.types).forEach(([field, type]) => {
      if (row[field] && typeof row[field] !== type) {
        errors.push(`Row ${index + 1}: '${field}' should be ${type}`);
      }
    });

    // Range validation
    Object.entries(schema.ranges).forEach(([field, { min, max }]) => {
      const value = row[field];
      if (value < min || value > max) {
        errors.push(
          `Row ${index + 1}: '${field}' out of range (${min}-${max})`,
        );
      }
    });
  });

  return errors;
}

// Usage
const schema = {
  required: ["Name", "Email"],
  types: { Age: "number", Name: "string" },
  ranges: { Age: { min: 0, max: 120 } },
};
```

---

## Best Practices

### Performance

- Use streaming for large files (>100MB)
- Batch writes instead of cell-by-cell
- Pre-allocate arrays for large datasets
- Use worker threads for CPU-intensive operations

### Data Integrity

- Validate data before writing
- Preserve original formulas when editing
- Handle dates consistently (Excel date serial vs ISO)
- Use named ranges for maintainability

### Formatting

- Use consistent number formats
- Apply styles at sheet/column level, not cell-by-cell
- Include headers with filtering enabled
- Freeze panes for large datasets

---

## Integration with Sigma Protocol

### Data Analysis Tasks

Use this skill when PRDs require data processing or reporting features.

### Financial Modeling

Apply spreadsheet skills for business model calculations.

### Export Features

Generate spreadsheet exports from application data.

### Data Migration

Process and transform data between systems.

---

_Remember: Spreadsheets are powerful tools for data manipulation. Use formulas wisely, validate inputs, and consider performance for large datasets._
