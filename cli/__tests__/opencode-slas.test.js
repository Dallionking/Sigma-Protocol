import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mkdtemp, readdir, stat, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

import { installOpenCodeSkills } from "../lib/skills/install.js";
import { installSLASScaffold } from "../lib/slas/index.js";

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function countDirectories(dirPath) {
  let entries;
  try {
    entries = await readdir(dirPath);
  } catch {
    return 0;
  }

  let count = 0;
  for (const entry of entries) {
    if (entry.startsWith(".")) continue;
    const fullPath = path.join(dirPath, entry);
    try {
      const stats = await stat(fullPath);
      if (stats.isDirectory()) count += 1;
    } catch {
      // Ignore entries that vanish during test
    }
  }
  return count;
}

test("installOpenCodeSkills installs skills into .opencode/skill", async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), "sigma-protocol-"));
  const spinner = { text: "" };
  const results = { opencode: { installed: 0, skipped: 0 } };

  try {
    await installOpenCodeSkills(tempDir, spinner, results);

    const skillsDir = path.join(tempDir, ".opencode", "skill");
    const agentsDir = path.join(tempDir, ".opencode", "agent");

    assert.ok(await pathExists(skillsDir), `Expected skills dir at ${skillsDir}`);
    assert.ok(await pathExists(agentsDir), `Expected agents dir at ${agentsDir}`);

    const skillsCount = await countDirectories(skillsDir);
    assert.ok(skillsCount > 0, `Expected skills in ${skillsDir}`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("installSLASScaffold creates session directories and seed files", async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), "sigma-protocol-"));

  try {
    const result = await installSLASScaffold(tempDir);
    assert.equal(result.success, true);

    const logsDir = path.join(tempDir, "docs", "sessions", "logs");
    const prefsDir = path.join(tempDir, "docs", "sessions", "preferences");
    const patternsDir = path.join(tempDir, "docs", "sessions", "patterns");

    assert.ok(await pathExists(logsDir), `Expected ${logsDir}`);
    assert.ok(await pathExists(prefsDir), `Expected ${prefsDir}`);
    assert.ok(await pathExists(patternsDir), `Expected ${patternsDir}`);

    const prefsFile = path.join(prefsDir, "developer-profile.yaml");
    const patternsFile = path.join(patternsDir, "detected-patterns.json");

    assert.ok(await pathExists(prefsFile), `Expected ${prefsFile}`);
    assert.ok(await pathExists(patternsFile), `Expected ${patternsFile}`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
