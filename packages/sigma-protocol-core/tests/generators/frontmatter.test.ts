/**
 * Frontmatter Utilities Tests
 */

import { describe, it, expect } from "vitest";
import {
  toYamlFrontmatter,
  parseYamlFrontmatter,
  extractContent,
} from "../../src/generators/utils/frontmatter.js";

describe("toYamlFrontmatter", () => {
  it("should generate basic frontmatter", () => {
    const data = {
      name: "test-skill",
      description: "A test skill",
    };

    const result = toYamlFrontmatter(data);

    expect(result).toContain("---");
    expect(result).toContain("name: test-skill");
    expect(result).toContain("description: A test skill");
  });

  it("should handle arrays", () => {
    const data = {
      triggers: ["trigger1", "trigger2"],
    };

    const result = toYamlFrontmatter(data);

    expect(result).toContain("triggers:");
    expect(result).toContain("  - trigger1");
    expect(result).toContain("  - trigger2");
  });

  it("should handle empty arrays", () => {
    const data = {
      triggers: [],
    };

    const result = toYamlFrontmatter(data);

    expect(result).toContain("triggers: []");
  });

  it("should skip undefined values", () => {
    const data = {
      name: "test",
      description: undefined,
    };

    const result = toYamlFrontmatter(data);

    expect(result).toContain("name: test");
    expect(result).not.toContain("description");
  });

  it("should quote strings with special characters", () => {
    const data = {
      description: "Contains: colon and #hash",
    };

    const result = toYamlFrontmatter(data);

    expect(result).toMatch(/description:\s*"Contains: colon and #hash"/);
  });

  it("should handle boolean values", () => {
    const data = {
      enabled: true,
      disabled: false,
    };

    const result = toYamlFrontmatter(data);

    expect(result).toContain("enabled: true");
    expect(result).toContain("disabled: false");
  });

  it("should handle numeric values", () => {
    const data = {
      version: 1,
      priority: 100,
    };

    const result = toYamlFrontmatter(data);

    expect(result).toContain("version: 1");
    expect(result).toContain("priority: 100");
  });
});

describe("parseYamlFrontmatter", () => {
  it("should parse basic frontmatter", () => {
    const content = `---
name: test-skill
description: "A test skill"
---

# Content here`;

    const result = parseYamlFrontmatter(content);

    expect(result).not.toBeNull();
    expect(result?.frontmatter.name).toBe("test-skill");
    expect(result?.frontmatter.description).toBe("A test skill");
    expect(result?.content).toBe("# Content here");
  });

  it("should parse arrays", () => {
    const content = `---
triggers:
  - trigger1
  - trigger2
---

Content`;

    const result = parseYamlFrontmatter(content);

    expect(result?.frontmatter.triggers).toEqual(["trigger1", "trigger2"]);
  });

  it("should return null for content without frontmatter", () => {
    const content = "# Just content";

    const result = parseYamlFrontmatter(content);

    expect(result).toBeNull();
  });

  it("should parse boolean values", () => {
    const content = `---
enabled: true
disabled: false
---

Content`;

    const result = parseYamlFrontmatter(content);

    expect(result?.frontmatter.enabled).toBe(true);
    expect(result?.frontmatter.disabled).toBe(false);
  });
});

describe("extractContent", () => {
  it("should extract content after frontmatter", () => {
    const markdown = `---
name: test
---

# Content

More content here.`;

    const result = extractContent(markdown);

    expect(result).toBe("# Content\n\nMore content here.");
  });

  it("should return original content if no frontmatter", () => {
    const markdown = "# Just content";

    const result = extractContent(markdown);

    expect(result).toBe("# Just content");
  });
});
