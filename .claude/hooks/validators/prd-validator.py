#!/usr/bin/env python3
"""
PRD Validator - Validates PRD structure against SSS Protocol requirements.

This validator runs as a PostToolUse hook, enabling the "Closed Loop Prompt" pattern
where agents automatically fix validation failures in the same session.

Output Contract: Returns JSON that the agent can parse and act upon.

Usage:
  python3 prd-validator.py <file_path>

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


def validate_prd(file_path: str) -> dict[str, Any]:
    """
    Validate a PRD file against SSS Protocol requirements.

    Returns a structured result that can be consumed by the agent.
    """
    errors: list[dict[str, Any]] = []
    warnings: list[dict[str, Any]] = []

    try:
        content = Path(file_path).read_text(encoding='utf-8')
        lines = content.split('\n')
    except FileNotFoundError:
        return {
            "status": "error",
            "file_path": file_path,
            "message": f"File not found: {file_path}",
            "errors": [],
            "agent_instruction": f"ERROR: File '{file_path}' does not exist. Create the file first."
        }
    except Exception as e:
        return {
            "status": "error",
            "file_path": file_path,
            "message": str(e),
            "errors": [],
            "agent_instruction": f"ERROR: Could not read '{file_path}': {e}"
        }

    # === REQUIRED SECTIONS ===
    # SSS Protocol PRD required sections
    required_sections = [
        ("## Section 0: Metadata", "Metadata section with PRD ID, version, dates"),
        ("## Section 1:", "Problem Space section"),
        ("## Section 2:", "User Stories section"),
        ("## Section 3:", "Solution Overview section"),
        ("## BDD Scenarios", "BDD Scenarios for acceptance criteria"),
    ]

    for section, description in required_sections:
        if section not in content:
            line_num = find_best_insertion_point(content, section)
            errors.append({
                "line": line_num,
                "severity": "error",
                "code": "MISSING_SECTION",
                "message": f"Missing: {section}",
                "fix_suggestion": f"Add '{section}' section for {description}"
            })

    # === BDD SCENARIO VALIDATION ===
    # Check for Given/When/Then pattern
    has_bdd_section = "## BDD" in content or "## Scenarios" in content
    has_given = bool(re.search(r'^\s*(Given\s+|Scenario:)', content, re.MULTILINE))
    has_when = bool(re.search(r'^\s*When\s+', content, re.MULTILINE))
    has_then = bool(re.search(r'^\s*Then\s+', content, re.MULTILINE))

    if has_bdd_section and not (has_given and has_when and has_then):
        missing_keywords = []
        if not has_given:
            missing_keywords.append("Given")
        if not has_when:
            missing_keywords.append("When")
        if not has_then:
            missing_keywords.append("Then")

        errors.append({
            "line": find_line_number(content, "## BDD") or find_line_number(content, "## Scenario") or 0,
            "severity": "error",
            "code": "INCOMPLETE_BDD",
            "message": f"BDD section missing keywords: {', '.join(missing_keywords)}",
            "fix_suggestion": "Add complete Given/When/Then scenarios. Example:\n  Given a user is logged in\n  When they click the submit button\n  Then they should see a success message"
        })

    # === RED FLAGS (Automatic FAIL) ===
    red_flag_patterns = [
        (r'\bTODO\b', "TODO", "All TODOs must be resolved - PRDs must be complete"),
        (r'\bTBD\b', "TBD", "All TBDs must be resolved with actual content"),
        (r'\bFIXME\b', "FIXME", "All FIXMEs must be resolved before implementation"),
        (r'\[TBD\]', "[TBD] placeholder", "Replace [TBD] with actual content"),
        (r'<placeholder>', "<placeholder>", "Replace placeholders with actual content"),
        (r'XXX', "XXX marker", "XXX markers indicate incomplete content"),
    ]

    for pattern, name, description in red_flag_patterns:
        matches = list(re.finditer(pattern, content, re.IGNORECASE))
        for match in matches:
            line_num = content[:match.start()].count('\n') + 1
            errors.append({
                "line": line_num,
                "severity": "error",
                "code": "RED_FLAG",
                "message": f"Found '{name}' - {description}",
                "fix_suggestion": f"Resolve this {name} on line {line_num}"
            })

    # === FRONTMATTER VALIDATION ===
    if content.startswith('---'):
        frontmatter_match = re.match(r'^---\n([\s\S]*?)\n---', content)
        if frontmatter_match:
            frontmatter = frontmatter_match.group(1)
            required_fields = ['prd_id', 'title', 'version', 'status']
            for field in required_fields:
                if f'{field}:' not in frontmatter.lower():
                    warnings.append({
                        "line": 1,
                        "severity": "warning",
                        "code": "MISSING_FRONTMATTER_FIELD",
                        "message": f"Frontmatter missing recommended field: {field}",
                        "fix_suggestion": f"Add '{field}:' to the YAML frontmatter"
                    })
    else:
        warnings.append({
            "line": 1,
            "severity": "warning",
            "code": "NO_FRONTMATTER",
            "message": "PRD should have YAML frontmatter",
            "fix_suggestion": "Add frontmatter at the start:\n---\nprd_id: F1\ntitle: Feature Name\nversion: 1.0.0\nstatus: draft\n---"
        })

    # === ACCEPTANCE CRITERIA CHECK ===
    ac_patterns = [
        r'acceptance\s+criteria',
        r'## AC\s',
        r'### AC',
        r'\[\s*\]\s+',  # Checkbox pattern
        r'- \[ \]',  # Markdown checkbox
    ]
    has_acceptance_criteria = any(re.search(p, content, re.IGNORECASE) for p in ac_patterns)
    if not has_acceptance_criteria:
        warnings.append({
            "line": 0,
            "severity": "warning",
            "code": "NO_ACCEPTANCE_CRITERIA",
            "message": "No explicit acceptance criteria found",
            "fix_suggestion": "Add acceptance criteria section with checkboxes:\n## Acceptance Criteria\n- [ ] Criterion 1\n- [ ] Criterion 2"
        })

    # === WIREFRAME REFERENCE CHECK (if Step 5 was used) ===
    if 'wireframe' in content.lower() or 'prototype' in content.lower():
        # Check for actual wireframe file references
        wireframe_ref = re.search(r'docs/prds/flows/|\.wireframe|prototype.*\.md', content, re.IGNORECASE)
        if not wireframe_ref:
            warnings.append({
                "line": 0,
                "severity": "warning",
                "code": "MISSING_WIREFRAME_REF",
                "message": "Mentions wireframes but no file reference found",
                "fix_suggestion": "Add reference to wireframe file: See docs/prds/flows/[flow-name].md"
            })

    # === RALPH LOOP TASK TRACKING (Section 16) ===
    # Check for Section 16: Ralph Loop Tasks
    has_section_16 = bool(re.search(r'##\s*(SECTION\s*16|Ralph\s+Loop\s+Tasks)', content, re.IGNORECASE))
    task_ids = []
    task_checklist_count = 0
    has_ac_mapping_table = False

    if has_section_16:
        # Find task IDs in the format [A-Z]+-[0-9]+
        task_id_pattern = r'\b(DB|API|UI|TEST|VERIFY|CONFIG|HOOK|UTIL|TYPE)-\d{3}\b'
        task_ids = re.findall(task_id_pattern, content)

        # Count task checklist items
        task_checklist_pattern = r'^\s*-\s*\[\s*[xX ]?\s*\]\s*\*\*[A-Z]+-\d{3}'
        task_checklist_count = len(re.findall(task_checklist_pattern, content, re.MULTILINE))

        # Check for Acceptance Criteria Mapping table
        ac_mapping_pattern = r'\|\s*Task\s*ID\s*\|\s*Story\s*ID\s*\|\s*AC\s*Type'
        has_ac_mapping_table = bool(re.search(ac_mapping_pattern, content, re.IGNORECASE))

        # Validate task ID uniqueness
        unique_ids = set()
        duplicate_ids = []
        for task_id_prefix in task_ids:
            # Need to get full task ID with number
            full_ids = re.findall(rf'{task_id_prefix}-\d{{3}}', content)
            for full_id in full_ids:
                if full_id in unique_ids:
                    if full_id not in duplicate_ids:
                        duplicate_ids.append(full_id)
                else:
                    unique_ids.add(full_id)

        if duplicate_ids:
            for dup_id in duplicate_ids[:3]:  # Report first 3
                errors.append({
                    "line": 0,
                    "severity": "error",
                    "code": "DUPLICATE_TASK_ID",
                    "message": f"Duplicate task ID found: {dup_id}",
                    "fix_suggestion": f"Ensure each task has a unique ID. Renumber {dup_id}."
                })

        # Check for minimum task coverage
        if task_checklist_count < 3:
            warnings.append({
                "line": find_line_number(content, "SECTION 16") or find_line_number(content, "Ralph Loop Tasks") or 0,
                "severity": "warning",
                "code": "INSUFFICIENT_TASKS",
                "message": f"Section 16 has only {task_checklist_count} tasks (minimum 3 recommended)",
                "fix_suggestion": "Add more granular tasks with IDs like DB-001, API-001, UI-001, TEST-001"
            })

        # Check for AC mapping table
        if not has_ac_mapping_table:
            warnings.append({
                "line": find_line_number(content, "SECTION 16") or find_line_number(content, "Ralph Loop Tasks") or 0,
                "severity": "warning",
                "code": "MISSING_AC_MAPPING",
                "message": "Section 16 missing Acceptance Criteria Mapping table",
                "fix_suggestion": "Add AC mapping table:\n| Task ID | Story ID | AC Type | Verification Command |\n|---------|----------|---------|---------------------|"
            })
    else:
        # Check if this is a Step 11 PRD (implementation PRD)
        is_step_11_prd = bool(re.search(r'SECTION\s*(14|15)|implementation\s+order|file\s+manifest', content, re.IGNORECASE))
        if is_step_11_prd:
            warnings.append({
                "line": 0,
                "severity": "warning",
                "code": "MISSING_RALPH_TASKS",
                "message": "Step 11 PRD missing Section 16: Ralph Loop Tasks",
                "fix_suggestion": "Add Section 16 with task checklist for Ralph Loop compatibility. See step-11-prd-generation for template."
            })

    # === UI VALIDATION ACCEPTANCE CRITERIA CHECK ===
    # Check if PRD has ui-validation type ACs for components
    has_ui_components = bool(re.search(r'component|page\.tsx|form|button|modal|dialog', content, re.IGNORECASE))
    has_ui_validation_ac = bool(re.search(r'ui-validation|visual\s+check|render\s+test|agent.browser', content, re.IGNORECASE))

    if has_ui_components and not has_ui_validation_ac:
        warnings.append({
            "line": 0,
            "severity": "warning",
            "code": "MISSING_UI_VALIDATION",
            "message": "PRD describes UI components but has no ui-validation acceptance criteria",
            "fix_suggestion": "Add ui-validation AC type for Ralph Loop browser validation:\n  - Type: ui-validation\n  - Route: /[route]\n  - Checks: content-exists, interaction"
        })

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
            "has_bdd": has_bdd_section and has_given and has_when and has_then,
            "has_frontmatter": content.startswith('---'),
            "has_acceptance_criteria": has_acceptance_criteria,
            # Ralph Loop Integration
            "ralph_ready": has_section_16 and task_checklist_count >= 3 and has_ac_mapping_table,
            "has_section_16": has_section_16,
            "task_count": task_checklist_count,
            "has_ac_mapping_table": has_ac_mapping_table,
            "has_ui_validation_ac": has_ui_validation_ac if has_ui_components else None,
        }
    }

    # Build agent instruction
    if errors:
        error_list = "\n".join([f"  - Line {e['line']}: {e['message']}" for e in errors[:5]])
        result["agent_instruction"] = f"""VALIDATION FAILED: {len(errors)} error(s) in {file_path}

Errors to fix:
{error_list}
{"..." if len(errors) > 5 else ""}

FIX these errors NOW, then the hook will re-validate automatically."""
    else:
        result["agent_instruction"] = f"VALIDATION PASSED: {file_path} meets SSS Protocol requirements."

    return result


def find_line_number(content: str, search_text: str) -> int | None:
    """Find the line number containing the search text."""
    lines = content.split('\n')
    for i, line in enumerate(lines, 1):
        if search_text in line:
            return i
    return None


def find_best_insertion_point(content: str, section_name: str) -> int:
    """Find the best line number to insert a missing section."""
    # Simple heuristic: suggest adding after the last ## heading
    lines = content.split('\n')
    last_heading = 0
    for i, line in enumerate(lines, 1):
        if line.startswith('## '):
            last_heading = i
    return last_heading + 1 if last_heading > 0 else len(lines)


def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "status": "error",
            "message": "Usage: prd-validator.py <file_path>",
            "agent_instruction": "ERROR: No file path provided to validator"
        }))
        sys.exit(2)

    file_path = sys.argv[1]

    # Only validate PRD files
    if not file_path.endswith('.md'):
        print(json.dumps({
            "status": "skip",
            "file_path": file_path,
            "message": "Not a markdown file, skipping validation",
            "agent_instruction": ""
        }))
        sys.exit(0)

    # Validate
    result = validate_prd(file_path)

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
