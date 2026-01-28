#!/usr/bin/env python3
"""
Sigma Protocol - Transform Skills to Antigravity SKILL.md Format

Transforms Sigma Protocol skills to Antigravity's SKILL.md folder format:
- Creates skill folder with SKILL.md inside
- Generates/updates frontmatter with Antigravity metadata
- Adds tags and trigger keywords
- Preserves full content (no condensation)

Usage:
    python3 transform-for-antigravity.py --input skill.md --output skill-folder/SKILL.md
    python3 transform-for-antigravity.py --all --input-dir .claude/skills --output-dir platforms/antigravity/skills
"""

import os
import sys
import re
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime

# Tag extraction patterns
TAG_CATEGORIES = {
    # Technical domains
    "frontend": ["react", "vue", "angular", "svelte", "css", "tailwind", "ui", "component", "jsx", "tsx"],
    "backend": ["api", "server", "node", "express", "fastapi", "django", "graphql", "rest"],
    "database": ["sql", "postgres", "mysql", "mongodb", "prisma", "drizzle", "orm", "query"],
    "testing": ["test", "spec", "jest", "vitest", "playwright", "cypress", "coverage", "tdd", "bdd"],
    "devops": ["docker", "kubernetes", "ci/cd", "deploy", "infrastructure", "aws", "vercel"],
    "security": ["auth", "security", "encryption", "jwt", "oauth", "vulnerability", "audit"],
    "performance": ["performance", "optimize", "cache", "lazy", "memo", "bundle", "speed"],
    "mobile": ["react native", "expo", "ios", "android", "mobile", "native"],

    # Methodology
    "architecture": ["architecture", "design pattern", "system design", "microservice", "monolith"],
    "quality": ["quality", "review", "validation", "verification", "standards"],
    "documentation": ["documentation", "readme", "docs", "comment", "jsdoc"],
    "planning": ["planning", "roadmap", "estimation", "sprint", "agile"],

    # Agent/AI specific
    "agentic": ["agent", "subagent", "swarm", "orchestrat", "autonomous"],
    "research": ["research", "investigation", "analysis", "deep dive"],
    "automation": ["automation", "workflow", "pipeline", "batch"],

    # Business domains
    "marketing": ["marketing", "seo", "content", "copy", "landing page", "conversion"],
    "ux": ["ux", "user experience", "usability", "accessibility", "design"],
    "business": ["business", "strategy", "revenue", "pricing", "offer"],
}

# Trigger keyword extraction
TRIGGER_KEYWORDS = {
    "frontend": ["build ui", "create component", "style", "layout", "frontend"],
    "backend": ["build api", "server", "endpoint", "backend"],
    "testing": ["write test", "test coverage", "qa", "testing"],
    "debugging": ["debug", "fix bug", "troubleshoot", "error"],
    "deployment": ["deploy", "ship", "release", "publish"],
    "documentation": ["document", "readme", "explain"],
    "planning": ["plan", "design", "architect", "brainstorm"],
    "research": ["research", "investigate", "analyze", "explore"],
    "review": ["review", "audit", "check", "validate"],
    "optimization": ["optimize", "improve", "speed up", "performance"],
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


def extract_tags(content: str, skill_name: str, existing_tags: List[str] = None) -> List[str]:
    """Extract relevant tags from skill content."""
    tags = set()

    # Start with existing tags if any
    if existing_tags:
        tags.update([t.lower() for t in existing_tags])

    content_lower = content.lower()

    # Check for tag category patterns
    for category, keywords in TAG_CATEGORIES.items():
        for keyword in keywords:
            if keyword in content_lower:
                tags.add(category)
                break

    # Add from skill name
    name_parts = skill_name.replace("-", " ").split()
    for part in name_parts:
        if len(part) > 2:
            tags.add(part)

    # Clean and limit tags
    tags = [t for t in tags if len(t) > 1]
    return sorted(tags)[:10]


def extract_triggers(content: str, skill_name: str, existing_triggers: List[str] = None) -> List[str]:
    """Extract trigger keywords for the skill."""
    triggers = set()

    # Start with existing triggers if any
    if existing_triggers:
        triggers.update([t.lower() for t in existing_triggers])

    content_lower = content.lower()

    # Check for trigger patterns
    for category, keywords in TRIGGER_KEYWORDS.items():
        for keyword in keywords:
            if keyword in content_lower:
                triggers.add(keyword)

    # Extract "when to invoke" section triggers
    when_to_invoke_match = re.search(
        r"(?:when to invoke|when to use|invocation|triggers?).*?(?=\n##|\n---|\Z)",
        content_lower,
        re.DOTALL | re.IGNORECASE
    )
    if when_to_invoke_match:
        section = when_to_invoke_match.group()
        # Find list items
        list_items = re.findall(r"[-*]\s*(.+?)(?:\n|$)", section)
        for item in list_items[:5]:
            # Clean up the trigger
            trigger = item.strip().lower()
            trigger = re.sub(r"[^\w\s]", "", trigger)
            if len(trigger) > 3 and len(trigger) < 50:
                triggers.add(trigger[:40])

    # Add skill name as trigger
    triggers.add(skill_name.replace("-", " "))

    # Clean and limit
    triggers = [t for t in triggers if len(t) > 2]
    return sorted(triggers)[:10]


def extract_description(content: str, original_description: str = None) -> str:
    """Extract or clean description."""
    if original_description:
        # Clean up existing description
        desc = original_description.strip('"').strip("'")
        return desc[:200]

    # Try to extract from content
    frontmatter, body = parse_frontmatter(content)

    # Look for first meaningful paragraph
    paragraphs = body.split("\n\n")
    for para in paragraphs:
        para = para.strip()
        if para and not para.startswith("#") and not para.startswith("-") and len(para) > 20:
            # Clean it up
            para = re.sub(r"\*\*|\*|_", "", para)  # Remove markdown formatting
            para = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", para)  # Remove links
            return para[:200]

    return "Sigma Protocol skill"


def get_version(original_version: str = None) -> str:
    """Get or generate version string."""
    if original_version:
        return str(original_version)
    return "1.0.0"


def transform_to_antigravity(content: str, skill_name: str) -> str:
    """Transform a skill to Antigravity SKILL.md format."""
    # Parse original frontmatter
    original_frontmatter, body = parse_frontmatter(content)

    # Extract metadata
    description = extract_description(content, original_frontmatter.get("description"))
    version = get_version(original_frontmatter.get("version"))
    tags = extract_tags(content, skill_name, original_frontmatter.get("tags"))
    triggers = extract_triggers(content, skill_name, original_frontmatter.get("triggers"))

    # Build Antigravity frontmatter
    frontmatter_lines = [
        "---",
        f"name: {skill_name}",
        f"description: {description}",
        f"version: {version}",
        "author: sigma-protocol",
        f"tags: [{', '.join(tags)}]",
        f"triggers: [{', '.join(triggers)}]",
        "---",
    ]

    frontmatter = "\n".join(frontmatter_lines)

    # Combine with body (preserving full content)
    result = f"{frontmatter}\n\n{body}"

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

        # Transform
        transformed = transform_to_antigravity(content, skill_name)

        # Ensure output directory exists
        output_file.parent.mkdir(parents=True, exist_ok=True)

        # Write output
        output_file.write_text(transformed, encoding="utf-8")

        if verbose:
            print(f"  {skill_name}: Transformed -> {output_file}")

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
        skill_folder = output_path / skill_name
        output_file = skill_folder / "SKILL.md"

        if process_single_skill(str(skill_file), str(output_file), verbose):
            success_count += 1
        else:
            error_count += 1

    return success_count, error_count


def main():
    parser = argparse.ArgumentParser(
        description="Transform Sigma Protocol skills to Antigravity SKILL.md format",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Transform a single skill
  python3 transform-for-antigravity.py --input skill.md --output skill-folder/SKILL.md

  # Transform all skills in a directory
  python3 transform-for-antigravity.py --all --input-dir .claude/skills --output-dir platforms/antigravity/skills

  # Verbose output
  python3 transform-for-antigravity.py --all --input-dir .claude/skills --output-dir platforms/antigravity/skills -v
        """
    )

    parser.add_argument("--input", "-i", help="Input skill file path")
    parser.add_argument("--output", "-o", help="Output SKILL.md file path")
    parser.add_argument("--all", action="store_true", help="Process all skills in input directory")
    parser.add_argument("--input-dir", help="Input directory containing skills (for --all)")
    parser.add_argument("--output-dir", help="Output directory for skill folders (for --all)")
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
