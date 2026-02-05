import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mkdtemp, readdir, stat, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

import { installCodexSkills } from "../lib/skills/install.js";
import { PLATFORMS } from "../lib/constants.js";

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

test("installCodexSkills installs into .codex/skills and .agents/skills", async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), "sigma-protocol-"));
  const spinner = { text: "" };
  const results = { codex: { installed: 0, skipped: 0 } };

  try {
    await installCodexSkills(tempDir, spinner, results);

    const codexSkillsDir = path.join(tempDir, PLATFORMS.codex.skillsDir);
    const legacySkillsDir = path.join(tempDir, PLATFORMS.codex.legacySkillsDir);

    const codexCount = await countDirectories(codexSkillsDir);
    const legacyCount = await countDirectories(legacySkillsDir);

    assert.ok(codexCount > 0, `Expected skills in ${codexSkillsDir}`);
    assert.ok(legacyCount > 0, `Expected skills in ${legacySkillsDir}`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("codex platform constants expose primary and legacy skills dirs", () => {
  assert.equal(PLATFORMS.codex.skillsDir, ".codex/skills");
  assert.equal(PLATFORMS.codex.legacySkillsDir, ".agents/skills");
});
