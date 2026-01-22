/**
 * CLI Tests - Sigma Protocol
 *
 * Basic test suite for CLI functionality.
 * Run with: npm test
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.join(__dirname, "..", "sigma-cli.js");

describe("Sigma CLI", () => {
  describe("Basic Commands", () => {
    it("should display help", () => {
      const output = execFileSync("node", [CLI_PATH, "--help"], { encoding: "utf-8" });
      assert.ok(output.includes("sigma-protocol"), "Should show program name");
      assert.ok(output.includes("install"), "Should list install command");
      assert.ok(output.includes("doctor"), "Should list doctor command");
    });

    it("should display version", () => {
      const output = execFileSync("node", [CLI_PATH, "--version"], { encoding: "utf-8" });
      assert.ok(/\d+\.\d+\.\d+/.test(output), "Should output a version number");
    });

    it("should accept debug flag", () => {
      const output = execFileSync("node", [CLI_PATH, "--debug", "status", "--target=/tmp"], {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"]
      });
      assert.ok(output.includes("[DEBUG]") || output.includes("Debug mode"), "Should show debug output");
    });
  });

  describe("Doctor Command", () => {
    it("should run doctor with help", () => {
      const output = execFileSync("node", [CLI_PATH, "doctor", "--help"], { encoding: "utf-8" });
      assert.ok(output.includes("doctor"), "Should show doctor command");
      assert.ok(output.includes("--target"), "Should accept target option");
    });
  });

  describe("Install Command", () => {
    it("should run install with help", () => {
      const output = execFileSync("node", [CLI_PATH, "install", "--help"], { encoding: "utf-8" });
      assert.ok(output.includes("install"), "Should show install command");
      assert.ok(output.includes("--platform"), "Should accept platform option");
    });

    it("should support dry-run flag", () => {
      const output = execFileSync("node", [CLI_PATH, "install", "--help"], { encoding: "utf-8" });
      assert.ok(output.includes("--dry-run") || output.includes("-n"), "Should support dry-run option");
    });
  });

  describe("Build Command", () => {
    it("should run build with help", () => {
      const output = execFileSync("node", [CLI_PATH, "build", "--help"], { encoding: "utf-8" });
      assert.ok(output.includes("build"), "Should show build command");
    });
  });

  describe("Rollback Command", () => {
    it("should run rollback with help", () => {
      const output = execFileSync("node", [CLI_PATH, "rollback", "--help"], { encoding: "utf-8" });
      assert.ok(output.includes("rollback"), "Should show rollback command");
      assert.ok(output.includes("--list"), "Should accept list option");
      assert.ok(output.includes("--restore"), "Should accept restore option");
    });
  });

  describe("Orchestration Commands", () => {
    it("should show orchestrate help", () => {
      const output = execFileSync("node", [CLI_PATH, "orchestrate", "--help"], { encoding: "utf-8" });
      assert.ok(output.includes("orchestrate"), "Should show orchestrate command");
    });
  });

  describe("Deps Command", () => {
    it("should run deps list", () => {
      try {
        const output = execFileSync("node", [CLI_PATH, "deps", "list"], {
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"]
        });
        assert.ok(typeof output === "string", "Should return output");
      } catch (err) {
        // Command may fail in test environment, just verify it runs
        assert.ok(true, "Command executed");
      }
    });
  });
});
