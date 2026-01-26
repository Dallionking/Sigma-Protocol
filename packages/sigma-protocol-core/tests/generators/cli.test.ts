/**
 * CLI Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { main } from "../../src/generators/cli/generate.js";
import { mkdir, rm, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("CLI", () => {
  let testDir: string;

  beforeEach(async () => {
    // Create a temporary directory for test output
    testDir = join(tmpdir(), `sigma-generate-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it("should run with --help without error", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`Process exited with code ${code}`);
    });

    try {
      await main(["--help"]);
    } catch (error) {
      // Expected exit
      expect((error as Error).message).toContain("code 0");
    }

    expect(consoleSpy).toHaveBeenCalled();
    const output = consoleSpy.mock.calls.flat().join("\n");
    expect(output).toContain("Sigma Generate");
    expect(output).toContain("--platform");
    expect(output).toContain("--output");

    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("should run dry-run without writing files", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await main([
      `--output=${testDir}`,
      "--platform=claude-code",
      "--dry-run",
      "--verbose",
    ]);

    // Check no files were actually written
    const files = await readdir(testDir);
    expect(files).toHaveLength(0);

    const output = consoleSpy.mock.calls.flat().join("\n");
    expect(output).toContain("Dry Run: true");
    expect(output.toLowerCase()).toContain("dry run");

    consoleSpy.mockRestore();
  });

  it("should generate files for a single platform", async () => {
    await main([
      `--output=${testDir}`,
      "--platform=claude-code",
    ]);

    // Check .claude directory was created
    const claudeDir = join(testDir, ".claude");
    const exists = await readdir(claudeDir).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    // Check skills directory exists
    const skillsDir = join(claudeDir, "skills");
    const skillsExists = await readdir(skillsDir).then(() => true).catch(() => false);
    expect(skillsExists).toBe(true);
  });

  it("should generate files for all platforms", async () => {
    await main([
      `--output=${testDir}`,
      "--platform=all",
    ]);

    // Check all platform directories were created
    const claudeDir = join(testDir, ".claude");
    const opencodeDir = join(testDir, ".opencode");
    const factoryDir = join(testDir, ".factory");

    const claudeExists = await readdir(claudeDir).then(() => true).catch(() => false);
    const opencodeExists = await readdir(opencodeDir).then(() => true).catch(() => false);
    const factoryExists = await readdir(factoryDir).then(() => true).catch(() => false);

    expect(claudeExists).toBe(true);
    expect(opencodeExists).toBe(true);
    expect(factoryExists).toBe(true);
  });

  it("should generate valid skill content", async () => {
    await main([
      `--output=${testDir}`,
      "--platform=claude-code",
    ]);

    // Read generated skill file
    const skillPath = join(testDir, ".claude/skills/example-skill.md");
    const content = await readFile(skillPath, "utf-8");

    // Verify frontmatter structure
    expect(content).toMatch(/^---/);
    expect(content).toContain("name: example-skill");
    expect(content).toContain("description:");
    // Frontmatter ends with ---
    expect(content).toMatch(/---\n/);
  });

  it("should generate valid command content", async () => {
    await main([
      `--output=${testDir}`,
      "--platform=claude-code",
    ]);

    // Read generated command file
    const commandPath = join(testDir, ".claude/commands/example-command.md");
    const content = await readFile(commandPath, "utf-8");

    // Verify frontmatter and content structure
    expect(content).toMatch(/^---/);
    expect(content).toContain("description:");
    expect(content).toContain("# /example-command");
    expect(content).toContain("**Usage:**");
  });

  it("should respect --overwrite flag", async () => {
    // First generation
    await main([
      `--output=${testDir}`,
      "--platform=claude-code",
    ]);

    const skillPath = join(testDir, ".claude/skills/example-skill.md");
    const firstContent = await readFile(skillPath, "utf-8");

    // Second generation without overwrite should skip
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await main([
      `--output=${testDir}`,
      "--platform=claude-code",
      "--verbose",
    ]);

    const output = consoleSpy.mock.calls.flat().join("\n");
    expect(output).toContain("Skipped:");

    // Third generation with overwrite should succeed
    await main([
      `--output=${testDir}`,
      "--platform=claude-code",
      "--overwrite",
    ]);

    const thirdContent = await readFile(skillPath, "utf-8");
    expect(thirdContent).toBe(firstContent); // Same content

    consoleSpy.mockRestore();
  });

  it("should parse multiple platforms", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await main([
      `--output=${testDir}`,
      "--platform=claude-code,opencode",
      "--verbose",
    ]);

    const output = consoleSpy.mock.calls.flat().join("\n");
    expect(output).toContain("claude-code");
    expect(output).toContain("opencode");

    consoleSpy.mockRestore();
  });
});
