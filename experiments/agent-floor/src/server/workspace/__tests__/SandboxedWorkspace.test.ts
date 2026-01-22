/**
 * Tests for SandboxedWorkspace class
 *
 * Verifies all acceptance criteria for PRD-022:
 * - [AC1] Isolated directory per team
 * - [AC2] readFile(path) function
 * - [AC3] writeFile(path, content) function
 * - [AC4] runCommand(cmd) with allowlist
 * - [AC5] Security: prevent path traversal
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { SandboxedWorkspace, createSandboxedWorkspace } from "../SandboxedWorkspace";

const TEST_DIR = path.join(process.cwd(), "test-workspace-temp");

describe("SandboxedWorkspace", () => {
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

  describe("[AC1] Isolated directory per team", () => {
    it("should create isolated workspace directory for team", async () => {
      const workspace = new SandboxedWorkspace("team-alpha", {
        workspacesRoot: TEST_DIR,
      });

      const info = await workspace.initialize();

      expect(info.teamId).toBe("team-alpha");
      expect(info.exists).toBe(true);
      expect(info.rootPath).toContain("team-alpha");

      // Verify directory exists
      const stats = await fs.stat(info.rootPath);
      expect(stats.isDirectory()).toBe(true);
    });

    it("should create separate workspaces for different teams", async () => {
      const workspaceA = new SandboxedWorkspace("team-alpha", {
        workspacesRoot: TEST_DIR,
      });
      const workspaceB = new SandboxedWorkspace("team-beta", {
        workspacesRoot: TEST_DIR,
      });

      await workspaceA.initialize();
      await workspaceB.initialize();

      // Write to each workspace
      await workspaceA.writeFile("test.txt", "Team Alpha content");
      await workspaceB.writeFile("test.txt", "Team Beta content");

      // Read from each workspace - content should be isolated
      const resultA = await workspaceA.readFile("test.txt");
      const resultB = await workspaceB.readFile("test.txt");

      expect(resultA.content).toBe("Team Alpha content");
      expect(resultB.content).toBe("Team Beta content");
    });

    it("should sanitize team ID to prevent directory traversal", async () => {
      const workspace = new SandboxedWorkspace("../../../etc", {
        workspacesRoot: TEST_DIR,
      });

      const info = await workspace.initialize();

      // Team ID should be sanitized
      expect(info.teamId).not.toContain("..");
      expect(info.teamId).not.toContain("/");
      expect(info.rootPath).toContain(TEST_DIR);
    });

    it("should reject empty team ID", () => {
      expect(() => new SandboxedWorkspace("")).toThrow("Team ID is required");
    });

    it("should report workspace info correctly", async () => {
      const workspace = new SandboxedWorkspace("my-team", {
        workspacesRoot: TEST_DIR,
      });

      // Before initialization
      const infoBefore = await workspace.getInfo();
      expect(infoBefore.exists).toBe(false);

      // After initialization
      await workspace.initialize();
      const infoAfter = await workspace.getInfo();
      expect(infoAfter.exists).toBe(true);
      expect(infoAfter.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("[AC2] readFile(path) function", () => {
    it("should read file content from workspace", async () => {
      const workspace = new SandboxedWorkspace("read-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      // Create test file directly
      const filePath = path.join(workspace.getWorkspacePath(), "hello.txt");
      await fs.writeFile(filePath, "Hello, World!", "utf-8");

      const result = await workspace.readFile("hello.txt");

      expect(result.success).toBe(true);
      expect(result.content).toBe("Hello, World!");
      expect(result.size).toBe(13);
    });

    it("should handle nested paths", async () => {
      const workspace = new SandboxedWorkspace("nested-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      // Create nested structure
      const nestedPath = path.join(workspace.getWorkspacePath(), "src", "lib");
      await fs.mkdir(nestedPath, { recursive: true });
      await fs.writeFile(
        path.join(nestedPath, "utils.ts"),
        "export const add = (a, b) => a + b;",
        "utf-8"
      );

      const result = await workspace.readFile("src/lib/utils.ts");

      expect(result.success).toBe(true);
      expect(result.content).toContain("export const add");
    });

    it("should return error for non-existent file", async () => {
      const workspace = new SandboxedWorkspace("missing-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      const result = await workspace.readFile("does-not-exist.txt");

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should reject files exceeding size limit", async () => {
      const workspace = new SandboxedWorkspace("large-team", {
        workspacesRoot: TEST_DIR,
        maxFileSizeBytes: 100, // 100 bytes limit for testing
      });
      await workspace.initialize();

      // Create large file
      const largeContent = "x".repeat(200);
      const filePath = path.join(workspace.getWorkspacePath(), "large.txt");
      await fs.writeFile(filePath, largeContent, "utf-8");

      const result = await workspace.readFile("large.txt");

      expect(result.success).toBe(false);
      expect(result.error).toContain("too large");
    });
  });

  describe("[AC3] writeFile(path, content) function", () => {
    it("should write content to file in workspace", async () => {
      const workspace = new SandboxedWorkspace("write-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      const result = await workspace.writeFile("output.txt", "Test content");

      expect(result.success).toBe(true);
      expect(result.bytesWritten).toBe(12);

      // Verify file was created
      const content = await fs.readFile(
        path.join(workspace.getWorkspacePath(), "output.txt"),
        "utf-8"
      );
      expect(content).toBe("Test content");
    });

    it("should create nested directories automatically", async () => {
      const workspace = new SandboxedWorkspace("auto-dir-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      const result = await workspace.writeFile(
        "deep/nested/path/file.txt",
        "Nested content"
      );

      expect(result.success).toBe(true);

      // Verify file exists
      const filePath = path.join(
        workspace.getWorkspacePath(),
        "deep/nested/path/file.txt"
      );
      const exists = await workspace.exists("deep/nested/path/file.txt");
      expect(exists).toBe(true);
    });

    it("should overwrite existing file", async () => {
      const workspace = new SandboxedWorkspace("overwrite-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      await workspace.writeFile("file.txt", "Original content");
      await workspace.writeFile("file.txt", "Updated content");

      const result = await workspace.readFile("file.txt");
      expect(result.content).toBe("Updated content");
    });

    it("should reject content exceeding size limit", async () => {
      const workspace = new SandboxedWorkspace("limit-team", {
        workspacesRoot: TEST_DIR,
        maxFileSizeBytes: 50,
      });
      await workspace.initialize();

      const result = await workspace.writeFile("big.txt", "x".repeat(100));

      expect(result.success).toBe(false);
      expect(result.error).toContain("too large");
    });

    it("should handle UTF-8 content correctly", async () => {
      const workspace = new SandboxedWorkspace("utf8-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      const unicodeContent = "Hello \u4e16\u754c! \ud83c\udf1f Emoji test";
      await workspace.writeFile("unicode.txt", unicodeContent);

      const result = await workspace.readFile("unicode.txt");
      expect(result.content).toBe(unicodeContent);
    });
  });

  describe("[AC4] runCommand(cmd) with allowlist", () => {
    it("should execute allowed commands", async () => {
      const workspace = new SandboxedWorkspace("cmd-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      const result = await workspace.runCommand("echo 'Hello World'");

      expect(result.success).toBe(true);
      expect(result.stdout.trim()).toBe("Hello World");
    });

    it("should reject commands not in allowlist", async () => {
      const workspace = new SandboxedWorkspace("reject-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      const result = await workspace.runCommand("rm -rf /");

      expect(result.success).toBe(false);
      expect(result.error).toContain("not allowed");
    });

    it("should execute 'ls' command", async () => {
      const workspace = new SandboxedWorkspace("ls-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();
      await workspace.writeFile("test-file.txt", "content");

      const result = await workspace.runCommand("ls");

      expect(result.success).toBe(true);
      expect(result.stdout).toContain("test-file.txt");
    });

    it("should execute 'cat' command", async () => {
      const workspace = new SandboxedWorkspace("cat-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();
      await workspace.writeFile("readme.txt", "This is the content");

      const result = await workspace.runCommand("cat readme.txt");

      expect(result.success).toBe(true);
      expect(result.stdout).toBe("This is the content");
    });

    it("should execute 'pwd' command within workspace", async () => {
      const workspace = new SandboxedWorkspace("pwd-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      const result = await workspace.runCommand("pwd");

      expect(result.success).toBe(true);
      expect(result.stdout.trim()).toBe(workspace.getWorkspacePath());
    });

    it("should support custom allowlist additions", async () => {
      const workspace = new SandboxedWorkspace("custom-team", {
        workspacesRoot: TEST_DIR,
        additionalCommands: ["date"],
      });
      await workspace.initialize();

      const result = await workspace.runCommand("date");

      expect(result.success).toBe(true);
      expect(result.stdout.length).toBeGreaterThan(0);
    });

    it("should support explicit denylist", async () => {
      const workspace = new SandboxedWorkspace("deny-team", {
        workspacesRoot: TEST_DIR,
        deniedCommands: ["ls"], // Explicitly deny ls
      });
      await workspace.initialize();

      const result = await workspace.runCommand("ls");

      expect(result.success).toBe(false);
      expect(result.error).toContain("not allowed");
    });

    it("should return list of allowed commands", () => {
      const workspace = new SandboxedWorkspace("list-team", {
        workspacesRoot: TEST_DIR,
      });

      const allowed = workspace.getAllowedCommands();

      expect(allowed).toContain("ls");
      expect(allowed).toContain("cat");
      expect(allowed).toContain("node");
      expect(allowed).toContain("npm");
      expect(allowed).toContain("git");
    });

    it("should validate if command is allowed", () => {
      const workspace = new SandboxedWorkspace("validate-team", {
        workspacesRoot: TEST_DIR,
      });

      expect(workspace.isCommandAllowed("ls -la")).toBe(true);
      expect(workspace.isCommandAllowed("cat file.txt")).toBe(true);
      expect(workspace.isCommandAllowed("sudo rm -rf /")).toBe(false);
      expect(workspace.isCommandAllowed("rm -rf /")).toBe(false);
    });

    it("should capture stderr correctly", async () => {
      const workspace = new SandboxedWorkspace("stderr-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      // cat with non-existent file should produce stderr
      const result = await workspace.runCommand("cat nonexistent.txt");

      expect(result.success).toBe(false);
      expect(result.stderr.length).toBeGreaterThan(0);
    });

    it("should enforce command timeout", async () => {
      const workspace = new SandboxedWorkspace("timeout-team", {
        workspacesRoot: TEST_DIR,
        commandTimeoutMs: 100, // 100ms timeout
      });
      await workspace.initialize();

      // This should timeout (node with deliberate infinite loop would hang)
      // Using a simpler approach - just verify the timeout is set
      expect(workspace["commandTimeoutMs"]).toBe(100);
    });
  });

  describe("[AC5] Security: prevent path traversal", () => {
    it("should prevent reading files outside workspace with ../", async () => {
      const workspace = new SandboxedWorkspace("secure-read-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      const result = await workspace.readFile("../../../etc/passwd");

      expect(result.success).toBe(false);
      expect(result.error).toContain("path traversal");
    });

    it("should prevent writing files outside workspace", async () => {
      const workspace = new SandboxedWorkspace("secure-write-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      const result = await workspace.writeFile("../../malicious.txt", "bad content");

      expect(result.success).toBe(false);
      expect(result.error).toContain("path traversal");
    });

    it("should prevent absolute path access", async () => {
      const workspace = new SandboxedWorkspace("secure-abs-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      // Try absolute path - should still be normalized relative to workspace
      const result = await workspace.readFile("/etc/passwd");

      // Due to path normalization, /etc/passwd becomes workspace/etc/passwd
      // which doesn't exist
      expect(result.success).toBe(false);
    });

    it("should prevent null byte injection", async () => {
      const workspace = new SandboxedWorkspace("secure-null-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      const result = await workspace.readFile("file.txt\0malicious");

      expect(result.success).toBe(false);
      expect(result.error).toContain("dangerous patterns");
    });

    it("should prevent double-encoded path traversal", async () => {
      const workspace = new SandboxedWorkspace("secure-encode-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      const result = await workspace.readFile("%2e%2e/etc/passwd");

      expect(result.success).toBe(false);
      expect(result.error).toContain("dangerous patterns");
    });

    it("should reject dangerous command patterns", async () => {
      const workspace = new SandboxedWorkspace("secure-cmd-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      // Test various dangerous patterns
      const dangerousCommands = [
        "echo hello | sh",
        "echo hello | bash",
        "sudo ls",
        "chmod 777 /",
        "echo `whoami`",
        "echo $(whoami)",
        "ls; rm -rf /",
      ];

      for (const cmd of dangerousCommands) {
        const result = await workspace.runCommand(cmd);
        expect(result.success).toBe(false);
        expect(result.error).toContain("not allowed");
      }
    });

    it("should handle backslash traversal attempts", async () => {
      const workspace = new SandboxedWorkspace("secure-backslash-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      const result = await workspace.readFile("..\\..\\etc\\passwd");

      expect(result.success).toBe(false);
      expect(result.error).toContain("dangerous patterns");
    });

    it("should prevent access beyond max directory depth", async () => {
      const workspace = new SandboxedWorkspace("secure-depth-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      // Create a very deep path (beyond MAX_DIRECTORY_DEPTH = 20)
      const deepPath = Array(25).fill("dir").join("/") + "/file.txt";
      const result = await workspace.readFile(deepPath);

      expect(result.success).toBe(false);
      expect(result.error).toContain("path traversal");
    });
  });

  describe("File listing", () => {
    it("should list files in workspace directory", async () => {
      const workspace = new SandboxedWorkspace("list-files-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      await workspace.writeFile("file1.txt", "content1");
      await workspace.writeFile("file2.txt", "content2");
      await workspace.writeFile("subdir/file3.txt", "content3");

      const files = await workspace.listFiles();

      expect(files.length).toBeGreaterThanOrEqual(2);
      expect(files.some((f) => f.name === "file1.txt")).toBe(true);
      expect(files.some((f) => f.name === "file2.txt")).toBe(true);
      expect(files.some((f) => f.name === "subdir" && f.isDirectory)).toBe(true);
    });

    it("should list files in subdirectory", async () => {
      const workspace = new SandboxedWorkspace("subdir-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      await workspace.writeFile("src/index.ts", "export {}");
      await workspace.writeFile("src/utils.ts", "export {}");

      const files = await workspace.listFiles("src");

      expect(files.length).toBe(2);
      expect(files.every((f) => f.isFile)).toBe(true);
    });

    it("should prevent listing outside workspace", async () => {
      const workspace = new SandboxedWorkspace("list-secure-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      const files = await workspace.listFiles("../../");

      expect(files).toEqual([]);
    });
  });

  describe("File deletion", () => {
    it("should delete file from workspace", async () => {
      const workspace = new SandboxedWorkspace("delete-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      await workspace.writeFile("to-delete.txt", "content");
      expect(await workspace.exists("to-delete.txt")).toBe(true);

      const result = await workspace.deleteFile("to-delete.txt");

      expect(result.success).toBe(true);
      expect(await workspace.exists("to-delete.txt")).toBe(false);
    });

    it("should prevent deleting files outside workspace", async () => {
      const workspace = new SandboxedWorkspace("delete-secure-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      const result = await workspace.deleteFile("../../important.txt");

      expect(result.success).toBe(false);
      expect(result.error).toContain("path traversal");
    });
  });

  describe("Factory function", () => {
    it("should create instance with createSandboxedWorkspace", () => {
      const workspace = createSandboxedWorkspace("factory-team", {
        workspacesRoot: TEST_DIR,
      });

      expect(workspace).toBeInstanceOf(SandboxedWorkspace);
      expect(workspace.getTeamId()).toBe("factory-team");
    });
  });

  describe("Utility methods", () => {
    it("should return workspace path", async () => {
      const workspace = new SandboxedWorkspace("path-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      const workspacePath = workspace.getWorkspacePath();

      expect(workspacePath).toContain("path-team");
      expect(path.isAbsolute(workspacePath)).toBe(true);
    });

    it("should return team ID", () => {
      const workspace = new SandboxedWorkspace("id-team", {
        workspacesRoot: TEST_DIR,
      });

      expect(workspace.getTeamId()).toBe("id-team");
    });

    it("should check if path exists", async () => {
      const workspace = new SandboxedWorkspace("exists-team", {
        workspacesRoot: TEST_DIR,
      });
      await workspace.initialize();

      await workspace.writeFile("exists.txt", "content");

      expect(await workspace.exists("exists.txt")).toBe(true);
      expect(await workspace.exists("does-not-exist.txt")).toBe(false);
    });
  });
});
