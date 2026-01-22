#!/usr/bin/env python3
"""
BDD Validator - Validates Gherkin syntax in .feature files and PRD BDD sections.

This validator runs as a PostToolUse hook, ensuring BDD scenarios follow
proper Gherkin syntax with Given/When/Then structure.

Output Contract: Returns JSON that the agent can parse and act upon.

Usage:
  python3 bdd-validator.py <file_path>

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


# Gherkin keywords
GHERKIN_KEYWORDS = {
    'feature': ['Feature:', 'feature:'],
    'background': ['Background:', 'background:'],
    'scenario': ['Scenario:', 'scenario:', 'Scenario Outline:', 'scenario outline:'],
    'given': ['Given ', 'given '],
    'when': ['When ', 'when '],
    'then': ['Then ', 'then '],
    'and': ['And ', 'and '],
    'but': ['But ', 'but '],
    'examples': ['Examples:', 'examples:', 'Scenarios:'],
}


def validate_bdd(file_path: str) -> dict[str, Any]:
    """
    Validate a BDD/Gherkin file against syntax requirements.

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
            "agent_instruction": f"ERROR: File '{file_path}' does not exist."
        }
    except Exception as e:
        return {
            "status": "error",
            "file_path": file_path,
            "message": str(e),
            "errors": [],
            "agent_instruction": f"ERROR: Could not read '{file_path}': {e}"
        }

    # Determine if this is a .feature file or a PRD with BDD section
    is_feature_file = file_path.endswith('.feature')
    is_prd_file = file_path.endswith('.md')

    if is_prd_file:
        # Extract BDD section from PRD
        bdd_content, bdd_start_line = extract_bdd_section(content)
        if not bdd_content:
            # No BDD section found - might be a non-BDD markdown file
            return {
                "status": "skip",
                "file_path": file_path,
                "message": "No BDD section found in markdown file",
                "errors": [],
                "agent_instruction": ""
            }
        content = bdd_content
        lines = content.split('\n')
        line_offset = bdd_start_line
    else:
        line_offset = 0

    # === FEATURE FILE STRUCTURE ===
    if is_feature_file:
        # Must have Feature:
        has_feature = any(
            line.strip().startswith(kw)
            for line in lines
            for kw in GHERKIN_KEYWORDS['feature']
        )
        if not has_feature:
            errors.append({
                "line": 1,
                "severity": "error",
                "code": "MISSING_FEATURE",
                "message": "Feature file must start with 'Feature:'",
                "fix_suggestion": "Add 'Feature: <feature name>' at the beginning"
            })

    # === SCENARIO VALIDATION ===
    scenarios = find_scenarios(lines, line_offset)

    if not scenarios and is_feature_file:
        errors.append({
            "line": 1,
            "severity": "error",
            "code": "NO_SCENARIOS",
            "message": "No scenarios found in feature file",
            "fix_suggestion": "Add at least one 'Scenario:' block with Given/When/Then"
        })

    # Validate each scenario
    for scenario in scenarios:
        validate_scenario(scenario, errors, warnings)

    # === GIVEN/WHEN/THEN STRUCTURE ===
    has_given = any(
        line.strip().startswith(kw)
        for line in lines
        for kw in GHERKIN_KEYWORDS['given']
    )
    has_when = any(
        line.strip().startswith(kw)
        for line in lines
        for kw in GHERKIN_KEYWORDS['when']
    )
    has_then = any(
        line.strip().startswith(kw)
        for line in lines
        for kw in GHERKIN_KEYWORDS['then']
    )

    if not has_given:
        errors.append({
            "line": line_offset + 1,
            "severity": "error",
            "code": "MISSING_GIVEN",
            "message": "No 'Given' step found - preconditions are required",
            "fix_suggestion": "Add 'Given <precondition>' to set up the scenario context"
        })

    if not has_when:
        errors.append({
            "line": line_offset + 1,
            "severity": "error",
            "code": "MISSING_WHEN",
            "message": "No 'When' step found - action is required",
            "fix_suggestion": "Add 'When <action>' to describe the user action"
        })

    if not has_then:
        errors.append({
            "line": line_offset + 1,
            "severity": "error",
            "code": "MISSING_THEN",
            "message": "No 'Then' step found - expected outcome is required",
            "fix_suggestion": "Add 'Then <outcome>' to describe the expected result"
        })

    # === STEP QUALITY CHECKS ===
    validate_step_quality(lines, line_offset, errors, warnings)

    # === CHECK FOR COMMON ISSUES ===
    check_common_issues(lines, line_offset, errors, warnings)

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
            "scenario_count": len(scenarios),
            "has_given": has_given,
            "has_when": has_when,
            "has_then": has_then,
            "is_feature_file": is_feature_file,
        }
    }

    # Build agent instruction
    if errors:
        error_list = "\n".join([f"  - Line {e['line']}: {e['message']}" for e in errors[:5]])
        result["agent_instruction"] = f"""VALIDATION FAILED: {len(errors)} error(s) in {file_path}

Errors to fix:
{error_list}
{"..." if len(errors) > 5 else ""}

FIX these errors NOW, then the hook will re-validate automatically.

BDD Reminder:
- Given: Set up the precondition/context
- When: Describe the action taken
- Then: Assert the expected outcome"""
    else:
        result["agent_instruction"] = f"VALIDATION PASSED: {file_path} has valid BDD/Gherkin syntax."

    return result


def extract_bdd_section(content: str) -> tuple[str, int]:
    """Extract BDD section from a PRD markdown file."""
    lines = content.split('\n')

    # Look for BDD section headers
    bdd_headers = ['## BDD', '## Scenarios', '## BDD Scenarios', '### BDD', '### Scenarios']

    start_line = -1
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        if any(line_stripped.startswith(h) for h in bdd_headers):
            start_line = i
            break

    if start_line == -1:
        return "", 0

    # Find the end of the BDD section (next ## heading or end of file)
    end_line = len(lines)
    for i in range(start_line + 1, len(lines)):
        if lines[i].strip().startswith('## ') and not any(
            lines[i].strip().startswith(h) for h in bdd_headers
        ):
            end_line = i
            break

    bdd_content = '\n'.join(lines[start_line:end_line])
    return bdd_content, start_line + 1  # +1 for 1-based line numbers


def find_scenarios(lines: list[str], line_offset: int) -> list[dict]:
    """Find all scenarios in the content."""
    scenarios = []
    current_scenario = None

    for i, line in enumerate(lines):
        line_stripped = line.strip()

        # Check for scenario start
        if any(line_stripped.startswith(kw) for kw in GHERKIN_KEYWORDS['scenario']):
            if current_scenario:
                scenarios.append(current_scenario)
            current_scenario = {
                "name": line_stripped,
                "line": i + line_offset + 1,
                "steps": [],
            }
        elif current_scenario:
            # Collect steps
            for step_type in ['given', 'when', 'then', 'and', 'but']:
                if any(line_stripped.startswith(kw) for kw in GHERKIN_KEYWORDS[step_type]):
                    current_scenario["steps"].append({
                        "type": step_type,
                        "text": line_stripped,
                        "line": i + line_offset + 1,
                    })
                    break

    if current_scenario:
        scenarios.append(current_scenario)

    return scenarios


def validate_scenario(scenario: dict, errors: list, warnings: list):
    """Validate a single scenario's structure."""
    steps = scenario["steps"]
    step_types = [s["type"] for s in steps]

    # Check step order: Given should come before When, When before Then
    if step_types:
        # Find first occurrence of each
        first_given = next((i for i, t in enumerate(step_types) if t == 'given'), -1)
        first_when = next((i for i, t in enumerate(step_types) if t == 'when'), -1)
        first_then = next((i for i, t in enumerate(step_types) if t == 'then'), -1)

        if first_given > -1 and first_when > -1 and first_given > first_when:
            errors.append({
                "line": scenario["line"],
                "severity": "error",
                "code": "WRONG_STEP_ORDER",
                "message": f"In '{scenario['name']}': Given must come before When",
                "fix_suggestion": "Reorder steps: Given → When → Then"
            })

        if first_when > -1 and first_then > -1 and first_when > first_then:
            errors.append({
                "line": scenario["line"],
                "severity": "error",
                "code": "WRONG_STEP_ORDER",
                "message": f"In '{scenario['name']}': When must come before Then",
                "fix_suggestion": "Reorder steps: Given → When → Then"
            })

    # Warn if scenario has no steps
    if not steps:
        warnings.append({
            "line": scenario["line"],
            "severity": "warning",
            "code": "EMPTY_SCENARIO",
            "message": f"Scenario '{scenario['name']}' has no steps",
            "fix_suggestion": "Add Given/When/Then steps to the scenario"
        })


def validate_step_quality(lines: list[str], line_offset: int, errors: list, warnings: list):
    """Check step quality and best practices."""
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        line_num = i + line_offset + 1

        # Check for vague steps
        vague_patterns = [
            (r'^(Given|When|Then)\s+(I|the user)\s+(do|does|did)\s+something', "Vague step - be specific"),
            (r'^(Given|When|Then)\s+(it|that)\s+works', "Vague assertion - specify what 'works' means"),
            (r'^(Given|When|Then)\s+(something|anything|stuff)', "Vague language - use specific terms"),
        ]

        for pattern, message in vague_patterns:
            if re.match(pattern, line_stripped, re.IGNORECASE):
                warnings.append({
                    "line": line_num,
                    "severity": "warning",
                    "code": "VAGUE_STEP",
                    "message": message,
                    "fix_suggestion": "Use specific, testable language"
                })
                break

        # Check for implementation details in steps (anti-pattern)
        impl_patterns = [
            (r'\bclick\s+on\s+button\b', "Use user intent, not UI actions: 'When I submit the form'"),
            (r'\bSQL\b', "Don't expose implementation details in BDD steps"),
            (r'\bAPI\s+endpoint\b', "Focus on user behavior, not technical details"),
            (r'\bHTTP\s+\d{3}\b', "Focus on user outcomes, not HTTP codes"),
        ]

        for pattern, message in impl_patterns:
            if re.search(pattern, line_stripped, re.IGNORECASE):
                warnings.append({
                    "line": line_num,
                    "severity": "warning",
                    "code": "IMPLEMENTATION_DETAIL",
                    "message": message,
                    "fix_suggestion": "Rephrase in terms of user intent and outcomes"
                })


def check_common_issues(lines: list[str], line_offset: int, errors: list, warnings: list):
    """Check for common BDD issues."""
    content = '\n'.join(lines)

    # Check for And/But at the start (should follow Given/When/Then)
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        if any(line_stripped.startswith(kw) for kw in GHERKIN_KEYWORDS['and'] + GHERKIN_KEYWORDS['but']):
            # Check if previous non-empty line has Given/When/Then/And/But
            prev_step = None
            for j in range(i - 1, -1, -1):
                prev = lines[j].strip()
                if prev:
                    prev_step = prev
                    break

            if prev_step and not any(
                prev_step.startswith(kw)
                for kw_list in [GHERKIN_KEYWORDS['given'], GHERKIN_KEYWORDS['when'],
                               GHERKIN_KEYWORDS['then'], GHERKIN_KEYWORDS['and'],
                               GHERKIN_KEYWORDS['but']]
                for kw in kw_list
            ):
                warnings.append({
                    "line": i + line_offset + 1,
                    "severity": "warning",
                    "code": "ORPHAN_AND_BUT",
                    "message": "And/But step should follow a Given/When/Then step",
                    "fix_suggestion": "Ensure And/But continues a previous step"
                })

    # Check for duplicate scenarios
    scenario_names = []
    for line in lines:
        for kw in GHERKIN_KEYWORDS['scenario']:
            if line.strip().startswith(kw):
                name = line.strip()
                if name in scenario_names:
                    warnings.append({
                        "line": 0,
                        "severity": "warning",
                        "code": "DUPLICATE_SCENARIO",
                        "message": f"Duplicate scenario name: '{name}'",
                        "fix_suggestion": "Give each scenario a unique, descriptive name"
                    })
                scenario_names.append(name)
                break


def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "status": "error",
            "message": "Usage: bdd-validator.py <file_path>",
            "agent_instruction": "ERROR: No file path provided to validator"
        }))
        sys.exit(2)

    file_path = sys.argv[1]

    # Only validate .feature files and .md files (PRDs with BDD sections)
    if not (file_path.endswith('.feature') or file_path.endswith('.md')):
        print(json.dumps({
            "status": "skip",
            "file_path": file_path,
            "message": "Not a .feature or .md file, skipping validation",
            "agent_instruction": ""
        }))
        sys.exit(0)

    # For .md files, only validate if it's in a prds directory
    if file_path.endswith('.md') and 'prd' not in file_path.lower():
        print(json.dumps({
            "status": "skip",
            "file_path": file_path,
            "message": "Markdown file not in PRD path, skipping BDD validation",
            "agent_instruction": ""
        }))
        sys.exit(0)

    # Validate
    result = validate_bdd(file_path)

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
