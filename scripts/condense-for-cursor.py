#!/usr/bin/env python3
"""
Sigma Protocol - Condense Skills for Cursor Rules Format

Converts full Sigma Protocol skills to Cursor's condensed .mdc format:
- Removes verbose examples (keeps 1-2)
- Extracts core workflow and checkpoints
- Adds Cursor frontmatter (globs, keywords)
- Targets 500-800 lines (under 2000 tokens)

Usage:
    python3 condense-for-cursor.py --input skill.md --output skill.mdc
    python3 condense-for-cursor.py --all --input-dir .claude/skills --output-dir .cursor/rules
"""

import os
import sys
import re
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Skill type to glob mappings
SKILL_TYPE_GLOBS = {
    "frontend": ["**/*.tsx", "**/*.jsx", "**/*.vue", "**/*.css", "**/*.scss", "**/components/**/*"],
    "backend": ["**/*.ts", "**/*.js", "**/*.py", "**/api/**/*", "**/server/**/*"],
    "database": ["**/*.sql", "**/prisma/**/*", "**/drizzle/**/*", "**/migrations/**/*"],
    "testing": ["**/*.test.ts", "**/*.spec.ts", "**/*.test.tsx", "**/tests/**/*"],
    "devops": ["**/Dockerfile", "**/*.yaml", "**/*.yml", "**/docker-compose.*"],
    "documentation": ["**/*.md", "**/docs/**/*", "**/README*"],
    "config": ["**/*.json", "**/*.yaml", "**/*.yml", "**/.*rc*"],
    "mobile": ["**/*.tsx", "**/app/**/*", "**/expo/**/*", "**/screens/**/*"],
    "security": ["**/*.ts", "**/*.js", "**/auth/**/*", "**/security/**/*"],
    "performance": ["**/*.ts", "**/*.tsx", "**/components/**/*"],
    "design": ["**/*.tsx", "**/*.jsx", "**/*.css", "**/components/**/*", "tailwind.config.*"],
}

# Keyword extraction patterns
KEYWORD_PATTERNS = {
    "react": ["react", "component", "hook", "jsx", "tsx"],
    "nextjs": ["next", "app router", "server component", "api route"],
    "tailwind": ["tailwind", "css", "styling", "utility class"],
    "typescript": ["typescript", "type", "interface", "generic"],
    "testing": ["test", "spec", "jest", "vitest", "playwright"],
    "api": ["api", "rest", "graphql", "endpoint", "fetch"],
    "database": ["database", "sql", "prisma", "drizzle", "query"],
    "auth": ["auth", "authentication", "authorization", "jwt", "session"],
    "deployment": ["deploy", "ci/cd", "docker", "kubernetes", "vercel"],
    "performance": ["performance", "optimize", "cache", "lazy", "memo"],
}


def parse_frontmatter(content: str) -> Tuple[Dict, str]:
    """Extract YAML frontmatter from markdown content."""
    frontmatter = {}
    body = content

    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            import yaml
            try:
                frontmatter = yaml.safe_load(parts[1]) or {}
            except yaml.YAMLError:
                pass
            body = parts[2].strip()

    return frontmatter, body


def extract_keywords_from_content(content: str, skill_name: str) -> List[str]:
    """Extract relevant keywords from skill content."""
    keywords = set()
    content_lower = content.lower()

    # Check for keyword patterns
    for category, patterns in KEYWORD_PATTERNS.items():
        for pattern in patterns:
            if pattern in content_lower:
                keywords.add(category)
                break

    # Add skill name variations
    keywords.add(skill_name.replace("-", " "))
    keywords.add(skill_name.replace("-", ""))

    # Extract from triggers if present
    frontmatter, _ = parse_frontmatter(content)
    if "triggers" in frontmatter:
        triggers = frontmatter.get("triggers", [])
        if isinstance(triggers, list):
            keywords.update([t.lower() for t in triggers[:5]])

    return list(keywords)[:12]  # Limit to 12 keywords


def determine_skill_type(content: str, skill_name: str) -> str:
    """Determine the skill type based on content analysis."""
    content_lower = content.lower()

    type_scores = {}
    for skill_type, globs in SKILL_TYPE_GLOBS.items():
        score = 0
        for glob in globs:
            # Extract base terms from glob
            terms = glob.replace("**/*", "").replace("**/", "").replace("/**/*", "").replace("*", "").replace(".", "").strip("/")
            if terms and terms in content_lower:
                score += 1
        type_scores[skill_type] = score

    # Check name-based hints
    if "frontend" in skill_name or "ui" in skill_name or "design" in skill_name:
        type_scores["frontend"] = type_scores.get("frontend", 0) + 5
    elif "backend" in skill_name or "api" in skill_name:
        type_scores["backend"] = type_scores.get("backend", 0) + 5
    elif "test" in skill_name or "qa" in skill_name:
        type_scores["testing"] = type_scores.get("testing", 0) + 5
    elif "deploy" in skill_name or "devops" in skill_name:
        type_scores["devops"] = type_scores.get("devops", 0) + 5

    # Return highest scoring type, default to "config" if no clear match
    if type_scores:
        return max(type_scores, key=type_scores.get)
    return "config"


def condense_section(section: str, max_lines: int = 30) -> str:
    """Condense a section to key points."""
    lines = section.strip().split("\n")

    # If already short, keep it
    if len(lines) <= max_lines:
        return section

    condensed_lines = []
    in_code_block = False
    code_block_count = 0
    skip_until_next_heading = False

    for line in lines:
        # Track code blocks
        if line.strip().startswith("```"):
            in_code_block = not in_code_block
            if in_code_block:
                code_block_count += 1
                # Only keep first 2 code blocks
                if code_block_count > 2:
                    skip_until_next_heading = True
                    continue
            else:
                if skip_until_next_heading:
                    continue

        # Skip content when in skip mode
        if skip_until_next_heading:
            if line.strip().startswith("#"):
                skip_until_next_heading = False
            else:
                continue

        # Keep important lines
        if (
            line.strip().startswith("#")  # Headings
            or line.strip().startswith("-")  # List items
            or line.strip().startswith("*")  # List items
            or line.strip().startswith("1.")  # Numbered lists
            or line.strip().startswith("```")  # Code blocks
            or in_code_block  # Code content
            or line.strip().startswith("|")  # Tables
            or line.strip().startswith("[")  # Checkboxes
            or not line.strip()  # Empty lines for spacing
        ):
            condensed_lines.append(line)

    return "\n".join(condensed_lines)


def remove_verbose_sections(content: str) -> str:
    """Remove overly verbose sections while keeping core content."""
    # Remove sections that are typically verbose
    verbose_patterns = [
        r"##+ Related Documentation.*?(?=\n##|\Z)",
        r"##+ Integration with.*?(?=\n##|\Z)",
        r"##+ MCP Integration.*?(?=\n##|\Z)",
        r"##+ Additional Resources.*?(?=\n##|\Z)",
        r"##+ Further Reading.*?(?=\n##|\Z)",
        r"##+ References.*?(?=\n##|\Z)",
    ]

    for pattern in verbose_patterns:
        content = re.sub(pattern, "", content, flags=re.DOTALL | re.IGNORECASE)

    return content


def extract_core_content(content: str, max_lines: int = 600) -> str:
    """Extract the core content, prioritizing workflow and key sections."""
    lines = content.strip().split("\n")

    # Priority sections to keep
    priority_keywords = [
        "when to invoke",
        "checklist",
        "workflow",
        "key",
        "core",
        "essential",
        "important",
        "guidelines",
        "rules",
        "anti-pattern",
        "avoid",
        "never",
        "always",
    ]

    # Find and prioritize important sections
    sections = []
    current_section = []
    current_heading = ""
    heading_priority = 0

    for line in lines:
        if line.strip().startswith("# ") and not current_section:
            # Main title - always keep
            current_section.append(line)
            current_heading = line.lower()
            heading_priority = 10
        elif line.strip().startswith("## "):
            # Save previous section
            if current_section:
                sections.append((heading_priority, "\n".join(current_section)))
            # Start new section
            current_section = [line]
            current_heading = line.lower()
            # Calculate priority
            heading_priority = 0
            for keyword in priority_keywords:
                if keyword in current_heading:
                    heading_priority += 2
        elif line.strip().startswith("### "):
            current_section.append(line)
        else:
            current_section.append(line)

    # Add final section
    if current_section:
        sections.append((heading_priority, "\n".join(current_section)))

    # Sort by priority (highest first) but maintain original order for equal priority
    sections_with_index = [(i, priority, content) for i, (priority, content) in enumerate(sections)]
    sections_with_index.sort(key=lambda x: (-x[1], x[0]))

    # Build result, respecting line limit
    result_lines = []
    for _, _, section_content in sections_with_index:
        section_lines = section_content.split("\n")
        if len(result_lines) + len(section_lines) <= max_lines:
            result_lines.extend(section_lines)
            result_lines.append("")  # Add spacing
        elif len(result_lines) < max_lines * 0.3:
            # If we haven't added much yet, add condensed version
            condensed = condense_section(section_content, max_lines=20)
            condensed_lines = condensed.split("\n")
            if len(result_lines) + len(condensed_lines) <= max_lines:
                result_lines.extend(condensed_lines)
                result_lines.append("")

    return "\n".join(result_lines).strip()


def generate_cursor_frontmatter(
    skill_name: str,
    original_frontmatter: Dict,
    content: str
) -> str:
    """Generate Cursor-specific frontmatter."""
    # Extract description
    description = original_frontmatter.get("description", "")
    if not description:
        # Try to extract from first paragraph
        lines = content.split("\n")
        for line in lines:
            if line.strip() and not line.startswith("#"):
                description = line.strip()[:150]
                break

    if description:
        description = f"Sigma {skill_name.replace('-', ' ').title()} - {description}"
    else:
        description = f"Sigma {skill_name.replace('-', ' ').title()} skill"

    # Determine globs
    skill_type = determine_skill_type(content, skill_name)
    globs = SKILL_TYPE_GLOBS.get(skill_type, ["**/*"])

    # Extract keywords
    keywords = extract_keywords_from_content(content, skill_name)

    # Build frontmatter
    frontmatter = f'''---
description: "{description}"
globs: {globs}
keywords: {keywords}
---'''

    return frontmatter


def condense_skill(content: str, skill_name: str) -> str:
    """Condense a skill for Cursor format."""
    # Parse original frontmatter
    original_frontmatter, body = parse_frontmatter(content)

    # Remove verbose sections
    body = remove_verbose_sections(body)

    # Extract core content
    core_content = extract_core_content(body, max_lines=600)

    # Generate new frontmatter
    cursor_frontmatter = generate_cursor_frontmatter(skill_name, original_frontmatter, content)

    # Combine
    result = f"{cursor_frontmatter}\n\n{core_content}"

    return result


def process_single_skill(input_path: str, output_path: str, verbose: bool = False) -> bool:
    """Process a single skill file."""
    try:
        input_file = Path(input_path)
        output_file = Path(output_path)

        if not input_file.exists():
            print(f"Error: Input file not found: {input_path}", file=sys.stderr)
            return False

        # Read content
        content = input_file.read_text(encoding="utf-8")

        # Extract skill name
        skill_name = input_file.stem

        # Condense
        condensed = condense_skill(content, skill_name)

        # Ensure output directory exists
        output_file.parent.mkdir(parents=True, exist_ok=True)

        # Write output
        output_file.write_text(condensed, encoding="utf-8")

        if verbose:
            original_lines = len(content.split("\n"))
            condensed_lines = len(condensed.split("\n"))
            print(f"  {skill_name}: {original_lines} -> {condensed_lines} lines ({100*condensed_lines//original_lines}%)")

        return True

    except Exception as e:
        print(f"Error processing {input_path}: {e}", file=sys.stderr)
        return False


def process_all_skills(input_dir: str, output_dir: str, verbose: bool = False) -> Tuple[int, int]:
    """Process all skills in a directory."""
    input_path = Path(input_dir)
    output_path = Path(output_dir)

    if not input_path.exists():
        print(f"Error: Input directory not found: {input_dir}", file=sys.stderr)
        return 0, 0

    success_count = 0
    error_count = 0

    for skill_file in sorted(input_path.glob("*.md")):
        skill_name = skill_file.stem
        output_file = output_path / f"sigma-{skill_name}.mdc"

        if process_single_skill(str(skill_file), str(output_file), verbose):
            success_count += 1
        else:
            error_count += 1

    return success_count, error_count


def main():
    parser = argparse.ArgumentParser(
        description="Condense Sigma Protocol skills for Cursor rules format",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert a single skill
  python3 condense-for-cursor.py --input skill.md --output skill.mdc

  # Convert all skills in a directory
  python3 condense-for-cursor.py --all --input-dir .claude/skills --output-dir .cursor/rules

  # Verbose output
  python3 condense-for-cursor.py --all --input-dir .claude/skills --output-dir .cursor/rules -v
        """
    )

    parser.add_argument("--input", "-i", help="Input skill file path")
    parser.add_argument("--output", "-o", help="Output .mdc file path")
    parser.add_argument("--all", action="store_true", help="Process all skills in input directory")
    parser.add_argument("--input-dir", help="Input directory containing skills (for --all)")
    parser.add_argument("--output-dir", help="Output directory for .mdc files (for --all)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show detailed output")

    args = parser.parse_args()

    # Validate arguments
    if args.all:
        if not args.input_dir or not args.output_dir:
            parser.error("--all requires both --input-dir and --output-dir")

        print(f"Processing all skills from: {args.input_dir}")
        print(f"Output directory: {args.output_dir}")
        print()

        success, errors = process_all_skills(args.input_dir, args.output_dir, args.verbose)

        print()
        print(f"Complete: {success} succeeded, {errors} failed")

        sys.exit(0 if errors == 0 else 1)

    else:
        if not args.input or not args.output:
            parser.error("Either --all or both --input and --output are required")

        if process_single_skill(args.input, args.output, args.verbose):
            print(f"Created: {args.output}")
            sys.exit(0)
        else:
            sys.exit(1)


if __name__ == "__main__":
    main()
