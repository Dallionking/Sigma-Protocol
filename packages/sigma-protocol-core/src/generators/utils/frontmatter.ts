/**
 * YAML Frontmatter Utilities
 *
 * Handles serialization of skill/command definitions to YAML frontmatter
 * without external dependencies.
 *
 * @module generators/utils/frontmatter
 */

/**
 * Serialize a value to YAML string representation
 */
function serializeValue(value: unknown, indent: number = 0): string {
  const indentStr = "  ".repeat(indent);

  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value === "boolean") {
    return value.toString();
  }

  if (typeof value === "number") {
    return value.toString();
  }

  if (typeof value === "string") {
    // Check if string needs quoting
    if (
      value === "" ||
      value.includes(":") ||
      value.includes("#") ||
      value.includes("'") ||
      value.includes('"') ||
      value.includes("\n") ||
      value.startsWith(" ") ||
      value.endsWith(" ") ||
      value.startsWith("-") ||
      value.startsWith("@") ||
      value.startsWith("*") ||
      /^[0-9]/.test(value) ||
      ["true", "false", "null", "yes", "no", "on", "off"].includes(
        value.toLowerCase()
      )
    ) {
      // Use double quotes and escape internal quotes
      return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }
    // All array items go on separate lines with dash prefix
    return value
      .map((item) => {
        const serialized = serializeValue(item, indent + 1);
        // For simple values, put on same line as dash
        if (typeof item !== "object" || item === null) {
          return `\n${indentStr}  - ${serialized}`;
        }
        // For complex values, indent further
        return `\n${indentStr}  - ${serialized}`;
      })
      .join("");
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return "{}";
    }
    return entries
      .map(([k, v]) => {
        const serialized = serializeValue(v, indent + 1);
        if (Array.isArray(v)) {
          return `${indentStr}${k}:${serialized}`;
        }
        if (typeof v === "object" && v !== null) {
          return `${indentStr}${k}:\n${serialized}`;
        }
        return `${indentStr}${k}: ${serialized}`;
      })
      .join("\n");
  }

  return String(value);
}

/**
 * Convert an object to YAML frontmatter string
 */
export function toYamlFrontmatter(data: Record<string, unknown>): string {
  const lines: string[] = ["---"];

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - ${serializeValue(item)}`);
        }
      }
    } else if (typeof value === "object" && value !== null) {
      lines.push(`${key}:`);
      const nested = serializeValue(value, 1);
      lines.push(nested);
    } else {
      lines.push(`${key}: ${serializeValue(value)}`);
    }
  }

  lines.push("---");
  return lines.join("\n");
}

/**
 * Parse YAML frontmatter from a markdown string
 * Returns the frontmatter data and the content after it
 */
export function parseYamlFrontmatter(
  content: string
): { frontmatter: Record<string, unknown>; content: string } | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return null;
  }

  const [, yamlContent, markdownContent] = match;
  const frontmatter: Record<string, unknown> = {};
  let currentKey: string | null = null;
  let currentArray: string[] | null = null;

  const lines = yamlContent.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    // Check for array item
    if (trimmed.startsWith("- ") && currentKey) {
      if (!currentArray) {
        currentArray = [];
        frontmatter[currentKey] = currentArray;
      }
      let value = trimmed.slice(2).trim();
      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      currentArray.push(value);
      continue;
    }

    // Check for key-value pair
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      currentArray = null;
      currentKey = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      if (value === "" || value === "[]") {
        // Empty value or empty array, might have nested content or array items
        frontmatter[currentKey] = value === "[]" ? [] : "";
        continue;
      }

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Parse booleans
      if (value === "true") {
        frontmatter[currentKey] = true;
      } else if (value === "false") {
        frontmatter[currentKey] = false;
      } else if (value === "null") {
        frontmatter[currentKey] = null;
      } else if (/^-?\d+$/.test(value)) {
        frontmatter[currentKey] = parseInt(value, 10);
      } else if (/^-?\d+\.\d+$/.test(value)) {
        frontmatter[currentKey] = parseFloat(value);
      } else {
        frontmatter[currentKey] = value;
      }
    }
  }

  return { frontmatter, content: markdownContent.trim() };
}

/**
 * Extract just the content portion (after frontmatter) from a markdown file
 */
export function extractContent(markdown: string): string {
  const parsed = parseYamlFrontmatter(markdown);
  return parsed ? parsed.content : markdown;
}
