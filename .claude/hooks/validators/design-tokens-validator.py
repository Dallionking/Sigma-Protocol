#!/usr/bin/env python3
"""
Design Tokens Validator - Validates design token JSON files against SSS Protocol standards.

This validator runs as a PostToolUse hook for Step 6 (Design System) outputs.
Ensures design tokens follow consistent naming, valid color formats, and required structure.

Output Contract: Returns JSON that the agent can parse and act upon.

Usage:
  python3 design-tokens-validator.py <file_path>

Exit codes:
  0 - Validation passed
  1 - Validation failed (errors found)
  2 - Invalid usage or file not found
"""

import sys
import json
import re
from pathlib import Path
from typing import Any


# Color format regex patterns
HEX_COLOR = re.compile(r'^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$')
RGB_COLOR = re.compile(r'^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$')
RGBA_COLOR = re.compile(r'^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*[\d.]+\s*\)$')
HSL_COLOR = re.compile(r'^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\)$')
CSS_VAR = re.compile(r'^var\(--[\w-]+\)$')
OKLCH_COLOR = re.compile(r'^oklch\([^)]+\)$')

# Token naming conventions
VALID_TOKEN_NAME = re.compile(r'^[a-z][a-zA-Z0-9]*$|^[a-z][a-z0-9]*(-[a-z0-9]+)*$')


def is_valid_color(value: str) -> bool:
    """Check if a value is a valid color format."""
    if isinstance(value, str):
        value = value.strip()
        return bool(
            HEX_COLOR.match(value) or
            RGB_COLOR.match(value) or
            RGBA_COLOR.match(value) or
            HSL_COLOR.match(value) or
            CSS_VAR.match(value) or
            OKLCH_COLOR.match(value) or
            value in ['transparent', 'inherit', 'currentColor']
        )
    return False


def validate_token_name(name: str) -> tuple[bool, str]:
    """Validate token naming convention."""
    # Allow kebab-case or camelCase
    if VALID_TOKEN_NAME.match(name):
        return True, ""

    suggestions = []
    if '_' in name:
        suggestions.append("Use kebab-case (e.g., 'primary-color') instead of snake_case")
    if name[0].isupper():
        suggestions.append("Start with lowercase letter")
    if ' ' in name:
        suggestions.append("Remove spaces, use kebab-case")

    return False, "; ".join(suggestions) if suggestions else "Use kebab-case or camelCase naming"


def validate_design_tokens(file_path: str) -> dict[str, Any]:
    """
    Validate a design tokens JSON file against SSS Protocol standards.

    Returns a structured result that can be consumed by the agent.
    """
    errors: list[dict[str, Any]] = []
    warnings: list[dict[str, Any]] = []

    try:
        content = Path(file_path).read_text(encoding='utf-8')
        tokens = json.loads(content)
    except FileNotFoundError:
        return {
            "status": "error",
            "file_path": file_path,
            "message": f"File not found: {file_path}",
            "errors": [],
            "agent_instruction": f"ERROR: File '{file_path}' does not exist."
        }
    except json.JSONDecodeError as e:
        return {
            "status": "fail",
            "file_path": file_path,
            "message": f"Invalid JSON: {e}",
            "errors": [{
                "line": e.lineno if hasattr(e, 'lineno') else 0,
                "severity": "error",
                "code": "INVALID_JSON",
                "message": f"JSON parse error: {e.msg}",
                "fix_suggestion": f"Fix JSON syntax at position {e.pos}"
            }],
            "agent_instruction": f"VALIDATION FAILED: Invalid JSON in {file_path}. Fix syntax error: {e.msg}"
        }
    except Exception as e:
        return {
            "status": "error",
            "file_path": file_path,
            "message": str(e),
            "errors": [],
            "agent_instruction": f"ERROR: Could not read '{file_path}': {e}"
        }

    # === REQUIRED TOP-LEVEL CATEGORIES ===
    recommended_categories = ['colors', 'typography', 'spacing', 'breakpoints']
    present_categories = list(tokens.keys()) if isinstance(tokens, dict) else []

    for category in recommended_categories:
        if category not in present_categories:
            warnings.append({
                "line": 0,
                "severity": "warning",
                "code": "MISSING_CATEGORY",
                "message": f"Missing recommended category: '{category}'",
                "fix_suggestion": f"Add '{category}' section to design tokens"
            })

    # === VALIDATE COLORS ===
    if 'colors' in tokens and isinstance(tokens['colors'], dict):
        validate_color_tokens(tokens['colors'], '', errors, warnings)

    # === VALIDATE TYPOGRAPHY ===
    if 'typography' in tokens and isinstance(tokens['typography'], dict):
        validate_typography_tokens(tokens['typography'], errors, warnings)

    # === VALIDATE SPACING ===
    if 'spacing' in tokens and isinstance(tokens['spacing'], dict):
        validate_spacing_tokens(tokens['spacing'], errors, warnings)

    # === VALIDATE TOKEN NAMES ===
    validate_all_token_names(tokens, '', errors, warnings)

    # === CHECK FOR DESIGN SYSTEM CONSISTENCY ===
    check_consistency(tokens, errors, warnings)

    # === BUILD RESULT ===
    status = "pass" if len(errors) == 0 else "fail"

    result = {
        "status": status,
        "file_path": file_path,
        "errors": errors,
        "warnings": warnings,
        "summary": {
            "total_errors": len(errors),
            "total_warnings": len(warnings),
            "categories_found": present_categories,
            "has_colors": 'colors' in present_categories,
            "has_typography": 'typography' in present_categories,
            "has_spacing": 'spacing' in present_categories,
        }
    }

    # Build agent instruction
    if errors:
        error_list = "\n".join([f"  - {e['message']}" for e in errors[:5]])
        result["agent_instruction"] = f"""VALIDATION FAILED: {len(errors)} error(s) in {file_path}

Errors to fix:
{error_list}
{"..." if len(errors) > 5 else ""}

FIX these errors NOW, then the hook will re-validate automatically."""
    else:
        result["agent_instruction"] = f"VALIDATION PASSED: {file_path} meets design token standards."

    return result


def validate_color_tokens(colors: dict, path: str, errors: list, warnings: list):
    """Recursively validate color tokens."""
    for key, value in colors.items():
        current_path = f"{path}.{key}" if path else key

        if isinstance(value, dict):
            # Nested color group
            validate_color_tokens(value, current_path, errors, warnings)
        elif isinstance(value, str):
            # Should be a valid color value
            if not is_valid_color(value):
                errors.append({
                    "line": 0,
                    "severity": "error",
                    "code": "INVALID_COLOR",
                    "message": f"Invalid color format for '{current_path}': {value}",
                    "fix_suggestion": "Use hex (#RRGGBB), rgb(), rgba(), hsl(), oklch(), or CSS variable"
                })
        elif isinstance(value, (int, float)):
            # Might be opacity or other numeric - warn
            warnings.append({
                "line": 0,
                "severity": "warning",
                "code": "NUMERIC_COLOR",
                "message": f"Numeric value in colors for '{current_path}': {value}",
                "fix_suggestion": "Use string color format instead of number"
            })


def validate_typography_tokens(typography: dict, errors: list, warnings: list):
    """Validate typography token structure."""
    recommended_keys = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight']

    for key in recommended_keys:
        if key not in typography:
            warnings.append({
                "line": 0,
                "severity": "warning",
                "code": "MISSING_TYPOGRAPHY",
                "message": f"Typography missing '{key}'",
                "fix_suggestion": f"Add '{key}' to typography tokens"
            })

    # Validate font sizes are reasonable
    if 'fontSize' in typography:
        for name, value in typography['fontSize'].items():
            if isinstance(value, (int, float)):
                if value < 8 or value > 200:
                    warnings.append({
                        "line": 0,
                        "severity": "warning",
                        "code": "UNUSUAL_FONT_SIZE",
                        "message": f"Unusual font size '{name}': {value}",
                        "fix_suggestion": "Font sizes typically range from 8-72px"
                    })


def validate_spacing_tokens(spacing: dict, errors: list, warnings: list):
    """Validate spacing token values."""
    for key, value in spacing.items():
        if isinstance(value, str):
            # Should end with a unit
            if not re.match(r'^-?[\d.]+\s*(px|rem|em|%|vh|vw)$', value):
                errors.append({
                    "line": 0,
                    "severity": "error",
                    "code": "INVALID_SPACING",
                    "message": f"Invalid spacing format for '{key}': {value}",
                    "fix_suggestion": "Use format like '8px', '0.5rem', '1em'"
                })
        elif isinstance(value, (int, float)):
            # Numeric values are OK but should be documented
            if value < 0:
                warnings.append({
                    "line": 0,
                    "severity": "warning",
                    "code": "NEGATIVE_SPACING",
                    "message": f"Negative spacing value for '{key}': {value}",
                    "fix_suggestion": "Negative spacing is unusual - verify intentional"
                })


def validate_all_token_names(obj: Any, path: str, errors: list, warnings: list):
    """Recursively validate all token names follow conventions."""
    if isinstance(obj, dict):
        for key, value in obj.items():
            current_path = f"{path}.{key}" if path else key
            valid, suggestion = validate_token_name(key)

            if not valid:
                warnings.append({
                    "line": 0,
                    "severity": "warning",
                    "code": "INVALID_TOKEN_NAME",
                    "message": f"Token name '{key}' doesn't follow naming convention",
                    "fix_suggestion": suggestion
                })

            validate_all_token_names(value, current_path, errors, warnings)


def check_consistency(tokens: dict, errors: list, warnings: list):
    """Check for consistency issues across the design system."""
    # Check for duplicate color values
    if 'colors' in tokens:
        color_values: dict[str, list[str]] = {}
        collect_color_values(tokens['colors'], '', color_values)

        for value, names in color_values.items():
            if len(names) > 1 and value not in ['transparent', 'inherit', 'currentColor']:
                warnings.append({
                    "line": 0,
                    "severity": "warning",
                    "code": "DUPLICATE_COLOR",
                    "message": f"Duplicate color value '{value}' used by: {', '.join(names)}",
                    "fix_suggestion": "Consider creating a shared semantic token"
                })


def collect_color_values(obj: dict, path: str, collector: dict[str, list[str]]):
    """Recursively collect color values for duplicate detection."""
    for key, value in obj.items():
        current_path = f"{path}.{key}" if path else key
        if isinstance(value, dict):
            collect_color_values(value, current_path, collector)
        elif isinstance(value, str) and is_valid_color(value):
            value_lower = value.lower()
            if value_lower not in collector:
                collector[value_lower] = []
            collector[value_lower].append(current_path)


def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "status": "error",
            "message": "Usage: design-tokens-validator.py <file_path>",
            "agent_instruction": "ERROR: No file path provided to validator"
        }))
        sys.exit(2)

    file_path = sys.argv[1]

    # Only validate JSON files that look like design tokens
    if not file_path.endswith('.json'):
        print(json.dumps({
            "status": "skip",
            "file_path": file_path,
            "message": "Not a JSON file, skipping validation",
            "agent_instruction": ""
        }))
        sys.exit(0)

    # Check if it's likely a design tokens file
    path_lower = file_path.lower()
    is_design_file = any(term in path_lower for term in [
        'token', 'design', 'theme', 'color', 'style', 'palette'
    ])

    if not is_design_file:
        print(json.dumps({
            "status": "skip",
            "file_path": file_path,
            "message": "Doesn't appear to be a design tokens file, skipping",
            "agent_instruction": ""
        }))
        sys.exit(0)

    # Validate
    result = validate_design_tokens(file_path)

    # Output result as JSON
    print(json.dumps(result, indent=2))

    # Exit code based on result
    if result["status"] == "fail":
        sys.exit(1)
    elif result["status"] == "error":
        sys.exit(2)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
