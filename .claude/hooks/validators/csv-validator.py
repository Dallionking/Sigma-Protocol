#!/usr/bin/env python3
"""
CSV Validator - Validates CSV file structure and data quality.

This validator runs as a PostToolUse hook, enabling the "Closed Loop Prompt" pattern
where agents automatically fix validation failures in the same session.

Output Contract: Returns JSON that the agent can parse and act upon.

Usage:
  python3 csv-validator.py <file_path>

Exit codes:
  0 - Validation passed
  1 - Validation failed (errors found)
  2 - Invalid usage or file not found
"""

import sys
import json
import csv
from pathlib import Path
from typing import Any


def validate_csv(file_path: str) -> dict[str, Any]:
    """
    Validate a CSV file for structure and data quality.

    Returns a structured result that can be consumed by the agent.
    """
    errors: list[dict[str, Any]] = []
    warnings: list[dict[str, Any]] = []

    try:
        content = Path(file_path).read_text(encoding='utf-8')
        lines = content.strip().split('\n')
    except FileNotFoundError:
        return {
            "status": "error",
            "file_path": file_path,
            "message": f"File not found: {file_path}",
            "errors": [],
            "agent_instruction": f"ERROR: File '{file_path}' does not exist. Create the file first."
        }
    except UnicodeDecodeError:
        return {
            "status": "error",
            "file_path": file_path,
            "message": "File encoding error - expected UTF-8",
            "errors": [],
            "agent_instruction": f"ERROR: '{file_path}' has encoding issues. Ensure UTF-8 encoding."
        }
    except Exception as e:
        return {
            "status": "error",
            "file_path": file_path,
            "message": str(e),
            "errors": [],
            "agent_instruction": f"ERROR: Could not read '{file_path}': {e}"
        }

    if not lines:
        return {
            "status": "fail",
            "file_path": file_path,
            "errors": [{"line": 1, "message": "CSV file is empty"}],
            "agent_instruction": "VALIDATION FAILED: CSV file is empty. Add header row and data."
        }

    # === HEADER VALIDATION ===
    try:
        # Detect delimiter
        delimiter = detect_delimiter(lines[0])
        reader = csv.reader([lines[0]], delimiter=delimiter)
        headers = next(reader)
    except Exception as e:
        errors.append({
            "line": 1,
            "severity": "error",
            "code": "PARSE_ERROR",
            "message": f"Failed to parse header row: {e}",
            "fix_suggestion": "Ensure the header row is valid CSV format"
        })
        return build_result(file_path, errors, warnings)

    # Check for empty headers
    for i, header in enumerate(headers):
        if not header.strip():
            errors.append({
                "line": 1,
                "column": i + 1,
                "severity": "error",
                "code": "EMPTY_HEADER",
                "message": f"Empty header at column {i + 1}",
                "fix_suggestion": f"Add a meaningful header name for column {i + 1}"
            })

    # Check for duplicate headers
    seen_headers = {}
    for i, header in enumerate(headers):
        normalized = header.strip().lower()
        if normalized in seen_headers:
            errors.append({
                "line": 1,
                "column": i + 1,
                "severity": "error",
                "code": "DUPLICATE_HEADER",
                "message": f"Duplicate header '{header}' (first at column {seen_headers[normalized]})",
                "fix_suggestion": f"Rename column {i + 1} to a unique name"
            })
        else:
            seen_headers[normalized] = i + 1

    # === ROW VALIDATION ===
    expected_columns = len(headers)

    for line_num, line in enumerate(lines[1:], start=2):
        if not line.strip():
            warnings.append({
                "line": line_num,
                "severity": "warning",
                "code": "EMPTY_ROW",
                "message": "Empty row",
                "fix_suggestion": "Remove empty row or add data"
            })
            continue

        try:
            reader = csv.reader([line], delimiter=delimiter)
            row = next(reader)
            actual_columns = len(row)

            if actual_columns != expected_columns:
                errors.append({
                    "line": line_num,
                    "severity": "error",
                    "code": "COLUMN_MISMATCH",
                    "message": f"Expected {expected_columns} columns, found {actual_columns}",
                    "fix_suggestion": f"Ensure row has exactly {expected_columns} values"
                })
        except Exception as e:
            errors.append({
                "line": line_num,
                "severity": "error",
                "code": "PARSE_ERROR",
                "message": f"Failed to parse row: {e}",
                "fix_suggestion": "Fix CSV formatting (check quotes, delimiters)"
            })

    # === DATA QUALITY CHECKS ===
    # Check for common issues
    if len(lines) == 1:
        warnings.append({
            "line": 1,
            "severity": "warning",
            "code": "NO_DATA",
            "message": "CSV has headers but no data rows",
            "fix_suggestion": "Add data rows after the header"
        })

    return build_result(file_path, errors, warnings)


def detect_delimiter(line: str) -> str:
    """Detect the most likely delimiter in a CSV line."""
    delimiters = [',', '\t', ';', '|']
    counts = {d: line.count(d) for d in delimiters}

    # Return delimiter with highest count, default to comma
    best = max(counts, key=counts.get)
    return best if counts[best] > 0 else ','


def build_result(file_path: str, errors: list, warnings: list) -> dict[str, Any]:
    """Build the final validation result."""
    if errors:
        status = "fail"
        error_summary = "; ".join([e["message"] for e in errors[:3]])
        if len(errors) > 3:
            error_summary += f" (+{len(errors) - 3} more)"

        agent_instruction = (
            f"VALIDATION FAILED: Fix {len(errors)} error(s) in CSV file NOW before proceeding.\n"
            f"Errors: {error_summary}\n"
            "After fixing, the validator will re-run automatically on your next edit."
        )
    elif warnings:
        status = "pass"
        warning_summary = "; ".join([w["message"] for w in warnings[:3]])
        agent_instruction = (
            f"VALIDATION PASSED with {len(warnings)} warning(s): {warning_summary}\n"
            "Consider addressing warnings for better data quality."
        )
    else:
        status = "pass"
        agent_instruction = "VALIDATION PASSED: CSV structure is valid."

    return {
        "status": status,
        "file_path": file_path,
        "errors": errors,
        "warnings": warnings,
        "error_count": len(errors),
        "warning_count": len(warnings),
        "agent_instruction": agent_instruction
    }


def main():
    if len(sys.argv) != 2:
        result = {
            "status": "error",
            "message": "Usage: python3 csv-validator.py <file_path>",
            "errors": [],
            "agent_instruction": "ERROR: Invalid validator usage. Provide exactly one file path argument."
        }
        print(json.dumps(result, indent=2))
        sys.exit(2)

    file_path = sys.argv[1]

    # Only validate CSV files
    if not file_path.lower().endswith(('.csv', '.tsv')):
        result = {
            "status": "pass",
            "file_path": file_path,
            "message": "Not a CSV file, skipping validation",
            "errors": [],
            "agent_instruction": "SKIPPED: Not a CSV/TSV file."
        }
        print(json.dumps(result, indent=2))
        sys.exit(0)

    result = validate_csv(file_path)
    print(json.dumps(result, indent=2))

    # Exit code based on status
    if result["status"] == "fail":
        sys.exit(1)
    elif result["status"] == "error":
        sys.exit(2)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
