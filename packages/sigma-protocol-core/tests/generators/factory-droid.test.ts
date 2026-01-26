/**
 * Factory Droid Generator Tests
 */

import { describe, it, expect } from "vitest";
import {
  createFactoryDroidSkillGenerator,
  createFactoryDroidCommandGenerator,
} from "../../src/generators/factory-droid/index.js";
import type { SkillDefinition, CommandDefinition } from "../../src/generators/types.js";

describe("FactoryDroidSkillGenerator", () => {
  const generator = createFactoryDroidSkillGenerator();

  const sampleSkill: SkillDefinition = {
    id: "factory-skill",
    name: "Factory Skill",
    description: "A skill for Factory Droid platform",
    version: "1.0.0",
    triggers: ["factory", "droid"],
    content: "# Factory Skill\n\nSkill content here.",
    stepAssociation: "step-1",
  };

  it("should generate folder-based output path", () => {
    const path = generator.getOutputPath(sampleSkill);

    // Factory Droid uses folder structure
    expect(path).toBe(".factory/skills/factory-skill/SKILL.md");
  });

  it("should include platform field in frontmatter", () => {
    const file = generator.generate(sampleSkill);

    expect(file.content).toContain("platform: factory-droid");
  });

  it("should include capabilities from stepAssociation", () => {
    const file = generator.generate(sampleSkill);

    expect(file.content).toContain("capabilities:");
    expect(file.content).toContain("  - step-1");
  });

  it("should include platform notice in body", () => {
    const file = generator.generate(sampleSkill);

    expect(file.content).toContain("*Generated for Factory Droid platform*");
  });

  it("should include all standard fields", () => {
    const file = generator.generate(sampleSkill);

    expect(file.content).toContain("name: factory-skill");
    expect(file.content).toContain("description: A skill for Factory Droid platform");
    expect(file.content).toMatch(/version:/);
    expect(file.content).toContain("triggers:");
  });

  it("should generate multiple skills with folder paths", () => {
    const skills: SkillDefinition[] = [
      sampleSkill,
      { ...sampleSkill, id: "skill-two" },
    ];

    const files = generator.generateAll(skills);

    expect(files).toHaveLength(2);
    expect(files[0].path).toBe(".factory/skills/factory-skill/SKILL.md");
    expect(files[1].path).toBe(".factory/skills/skill-two/SKILL.md");
  });
});

describe("FactoryDroidCommandGenerator", () => {
  const generator = createFactoryDroidCommandGenerator();

  const sampleCommand: CommandDefinition = {
    name: "factory-command",
    description: "A command for Factory Droid platform",
    allowedTools: ["Read", "Write", "Bash"],
    content: "Run the Factory Droid workflow.",
    usage: "[input]",
  };

  it("should generate correct output path", () => {
    const path = generator.getOutputPath(sampleCommand);

    // Commands use flat structure
    expect(path).toBe(".factory/commands/factory-command.md");
  });

  it("should include platform field in frontmatter", () => {
    const file = generator.generate(sampleCommand);

    expect(file.content).toContain("platform: factory-droid");
  });

  it("should include allowed-tools in frontmatter", () => {
    const file = generator.generate(sampleCommand);

    expect(file.content).toContain("allowed-tools:");
    expect(file.content).toContain("  - Read");
    expect(file.content).toContain("  - Write");
    expect(file.content).toContain("  - Bash");
  });

  it("should include command heading and content", () => {
    const file = generator.generate(sampleCommand);

    expect(file.content).toContain("# /factory-command");
    expect(file.content).toContain("Run the Factory Droid workflow.");
  });

  it("should include usage section", () => {
    const file = generator.generate(sampleCommand);

    expect(file.content).toContain("**Usage:** `/factory-command [input]`");
  });

  it("should format agent references", () => {
    const ref = generator.formatAgentRef("factory-agent");

    expect(ref).toBe("@factory-agent");
  });
});
