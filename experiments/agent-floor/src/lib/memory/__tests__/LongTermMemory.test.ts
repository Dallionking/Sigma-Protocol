/**
 * Tests for LongTermMemory class
 *
 * Verifies all acceptance criteria:
 * - [AC1] read() loads from docs/AGENTS.md
 * - [AC2] write(section, content) appends
 * - [AC3] getSection(name) returns section content
 * - [AC4] search(keyword) finds relevant entries
 * - [AC5] Creates file if not exists
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { LongTermMemory, createLongTermMemory } from "../LongTermMemory";

const TEST_DIR = path.join(process.cwd(), "test-memory-temp");
const TEST_FILE = path.join(TEST_DIR, "docs", "AGENTS.md");

describe("LongTermMemory", () => {
  beforeEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(TEST_DIR, { recursive: true });
    } catch {
      // Directory might not exist
    }
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    // Clean up
    try {
      await fs.rm(TEST_DIR, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("[AC5] Creates file if not exists", () => {
    it("should create AGENTS.md with default template when file does not exist", async () => {
      const memory = new LongTermMemory({
        workspaceRoot: TEST_DIR,
        autoCreate: true,
      });

      // File should not exist initially
      const existsBefore = await memory.exists();
      expect(existsBefore).toBe(false);

      // Read should create the file
      await memory.read();

      // File should now exist
      const existsAfter = await memory.exists();
      expect(existsAfter).toBe(true);

      // Content should contain default sections
      const content = memory.getRawContent();
      expect(content).toContain("# AGENTS.md");
      expect(content).toContain("## Project Structure");
      expect(content).toContain("## Coding Patterns");
      expect(content).toContain("## Learnings");
    });

    it("should throw error when file does not exist and autoCreate is false", async () => {
      const memory = new LongTermMemory({
        workspaceRoot: TEST_DIR,
        autoCreate: false,
      });

      await expect(memory.read()).rejects.toThrow("Memory file not found");
    });
  });

  describe("[AC1] read() loads from docs/AGENTS.md", () => {
    it("should read existing AGENTS.md file", async () => {
      // Create test file
      const testContent = `# Test AGENTS.md

## Test Section

This is test content.

## Another Section

More content here.
`;
      await fs.mkdir(path.join(TEST_DIR, "docs"), { recursive: true });
      await fs.writeFile(TEST_FILE, testContent, "utf-8");

      const memory = new LongTermMemory({
        workspaceRoot: TEST_DIR,
      });

      const content = await memory.read();

      expect(content).toBe(testContent);
      expect(memory.isLoaded()).toBe(true);
    });

    it("should parse sections correctly", async () => {
      const testContent = `# Main Title

## Section One

Content for section one.

## Section Two

Content for section two.

### Subsection

Subsection content.
`;
      await fs.mkdir(path.join(TEST_DIR, "docs"), { recursive: true });
      await fs.writeFile(TEST_FILE, testContent, "utf-8");

      const memory = new LongTermMemory({ workspaceRoot: TEST_DIR });
      await memory.read();

      const sections = memory.getAllSections();
      expect(sections.length).toBe(4);
      expect(sections.map((s) => s.name)).toEqual([
        "Main Title",
        "Section One",
        "Section Two",
        "Subsection",
      ]);
    });
  });

  describe("[AC2] write(section, content) appends", () => {
    it("should append content to existing section", async () => {
      const testContent = `# AGENTS.md

## Learnings

- First learning
`;
      await fs.mkdir(path.join(TEST_DIR, "docs"), { recursive: true });
      await fs.writeFile(TEST_FILE, testContent, "utf-8");

      const memory = new LongTermMemory({ workspaceRoot: TEST_DIR });
      await memory.read();
      await memory.write("Learnings", "- Second learning");

      const updatedContent = await fs.readFile(TEST_FILE, "utf-8");
      expect(updatedContent).toContain("- First learning");
      expect(updatedContent).toContain("- Second learning");
    });

    it("should create new section if it does not exist", async () => {
      const testContent = `# AGENTS.md

## Existing Section

Existing content.
`;
      await fs.mkdir(path.join(TEST_DIR, "docs"), { recursive: true });
      await fs.writeFile(TEST_FILE, testContent, "utf-8");

      const memory = new LongTermMemory({ workspaceRoot: TEST_DIR });
      await memory.read();
      await memory.write("New Section", "New content here");

      const updatedContent = await fs.readFile(TEST_FILE, "utf-8");
      expect(updatedContent).toContain("## New Section");
      expect(updatedContent).toContain("New content here");
    });

    it("should support custom header level for new sections", async () => {
      const testContent = `# AGENTS.md
`;
      await fs.mkdir(path.join(TEST_DIR, "docs"), { recursive: true });
      await fs.writeFile(TEST_FILE, testContent, "utf-8");

      const memory = new LongTermMemory({ workspaceRoot: TEST_DIR });
      await memory.read();
      await memory.write("Subsection", "Subsection content", 3);

      const updatedContent = await fs.readFile(TEST_FILE, "utf-8");
      expect(updatedContent).toContain("### Subsection");
    });
  });

  describe("[AC3] getSection(name) returns section content", () => {
    it("should return section content by name", async () => {
      const testContent = `# AGENTS.md

## Coding Patterns

- Use TypeScript
- Follow conventions

## Known Issues

- Issue 1
- Issue 2
`;
      await fs.mkdir(path.join(TEST_DIR, "docs"), { recursive: true });
      await fs.writeFile(TEST_FILE, testContent, "utf-8");

      const memory = new LongTermMemory({ workspaceRoot: TEST_DIR });
      await memory.read();

      const patterns = memory.getSection("Coding Patterns");
      expect(patterns).toContain("Use TypeScript");
      expect(patterns).toContain("Follow conventions");

      const issues = memory.getSection("Known Issues");
      expect(issues).toContain("Issue 1");
      expect(issues).toContain("Issue 2");
    });

    it("should be case-insensitive", async () => {
      const testContent = `# AGENTS.md

## Coding Patterns

Pattern content
`;
      await fs.mkdir(path.join(TEST_DIR, "docs"), { recursive: true });
      await fs.writeFile(TEST_FILE, testContent, "utf-8");

      const memory = new LongTermMemory({ workspaceRoot: TEST_DIR });
      await memory.read();

      expect(memory.getSection("coding patterns")).toContain("Pattern content");
      expect(memory.getSection("CODING PATTERNS")).toContain("Pattern content");
    });

    it("should return null for non-existent section", async () => {
      const testContent = `# AGENTS.md

## Existing Section

Content
`;
      await fs.mkdir(path.join(TEST_DIR, "docs"), { recursive: true });
      await fs.writeFile(TEST_FILE, testContent, "utf-8");

      const memory = new LongTermMemory({ workspaceRoot: TEST_DIR });
      await memory.read();

      expect(memory.getSection("Non Existent")).toBeNull();
    });
  });

  describe("[AC4] search(keyword) finds relevant entries", () => {
    it("should find entries containing keyword", async () => {
      const testContent = `# AGENTS.md

## Coding Patterns

### EasyStar.js Pathfinding
- Import as: import * as EasyStar from "easystarjs"
- Grid uses tile coordinates

## Known Issues

### Pathfinding Bug
- Sometimes pathfinding fails on edges
`;
      await fs.mkdir(path.join(TEST_DIR, "docs"), { recursive: true });
      await fs.writeFile(TEST_FILE, testContent, "utf-8");

      const memory = new LongTermMemory({ workspaceRoot: TEST_DIR });
      await memory.read();

      const results = memory.search("pathfinding");

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.section === "EasyStar.js Pathfinding")).toBe(true);
      expect(results.some((r) => r.section === "Pathfinding Bug")).toBe(true);
    });

    it("should be case-insensitive", async () => {
      const testContent = `# AGENTS.md

## Section

TypeScript is great.
TYPESCRIPT IS LOUD.
typescript is quiet.
`;
      await fs.mkdir(path.join(TEST_DIR, "docs"), { recursive: true });
      await fs.writeFile(TEST_FILE, testContent, "utf-8");

      const memory = new LongTermMemory({ workspaceRoot: TEST_DIR });
      await memory.read();

      const results = memory.search("typescript");
      expect(results.length).toBe(3);
    });

    it("should include context lines", async () => {
      const testContent = `# AGENTS.md

## Section

Line 1
Line 2
TARGET LINE
Line 4
Line 5
`;
      await fs.mkdir(path.join(TEST_DIR, "docs"), { recursive: true });
      await fs.writeFile(TEST_FILE, testContent, "utf-8");

      const memory = new LongTermMemory({ workspaceRoot: TEST_DIR });
      await memory.read();

      const results = memory.search("TARGET", 2);
      expect(results.length).toBe(1);
      expect(results[0].context).toContain("Line 2");
      expect(results[0].context).toContain("TARGET LINE");
      expect(results[0].context).toContain("Line 4");
    });

    it("should return line numbers (1-indexed)", async () => {
      const testContent = `Line 1
Line 2
TARGET
Line 4
`;
      await fs.mkdir(path.join(TEST_DIR, "docs"), { recursive: true });
      await fs.writeFile(TEST_FILE, testContent, "utf-8");

      const memory = new LongTermMemory({ workspaceRoot: TEST_DIR });
      await memory.read();

      const results = memory.search("TARGET");
      expect(results[0].line).toBe(3); // 1-indexed
    });
  });

  describe("Factory function", () => {
    it("should create instance with createLongTermMemory", () => {
      const memory = createLongTermMemory({ workspaceRoot: TEST_DIR });
      expect(memory).toBeInstanceOf(LongTermMemory);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty file", async () => {
      await fs.mkdir(path.join(TEST_DIR, "docs"), { recursive: true });
      await fs.writeFile(TEST_FILE, "", "utf-8");

      const memory = new LongTermMemory({ workspaceRoot: TEST_DIR });
      await memory.read();

      expect(memory.getAllSections()).toEqual([]);
      expect(memory.search("anything")).toEqual([]);
    });

    it("should throw when accessing before read", () => {
      const memory = new LongTermMemory({ workspaceRoot: TEST_DIR });

      expect(() => memory.getSection("Test")).toThrow("Memory not loaded");
      expect(() => memory.search("test")).toThrow("Memory not loaded");
      expect(() => memory.getAllSections()).toThrow("Memory not loaded");
    });

    it("should reset loaded state", async () => {
      const testContent = `# Test`;
      await fs.mkdir(path.join(TEST_DIR, "docs"), { recursive: true });
      await fs.writeFile(TEST_FILE, testContent, "utf-8");

      const memory = new LongTermMemory({ workspaceRoot: TEST_DIR });
      await memory.read();
      expect(memory.isLoaded()).toBe(true);

      memory.reset();
      expect(memory.isLoaded()).toBe(false);
    });
  });
});
