/**
 * OpenCode Generator Tests
 */

import { describe, it, expect } from "vitest";
import {
  createOpenCodeSkillGenerator,
  createOpenCodeCommandGenerator,
} from "../../src/generators/opencode/index.js";
import type { SkillDefinition, CommandDefinition } from "../../src/generators/types.js";

describe("OpenCodeSkillGenerator", () => {
  const generator = createOpenCodeSkillGenerator();

  const sampleSkill: SkillDefinition = {
    id: "opencode-skill",
    name: "OpenCode Skill",
    description: "A skill for OpenCode platform",
    version: "1.0.0",
    triggers: ["opencode", "test"],
    allowedTools: ["Read", "Write"],
    content: "# OpenCode Skill\n\nSkill content here.",
  };

  it("should generate correct output path", () => {
    const path = generator.getOutputPath(sampleSkill);

    expect(path).toBe(".opencode/skills/opencode-skill.md");
  });

  it("should use allowed-tools field name", () => {
    const file = generator.generate(sampleSkill);

    // OpenCode uses hyphenated field name
    expect(file.content).toContain("allowed-tools:");
    expect(file.content).toContain("  - Read");
    expect(file.content).toContain("  - Write");
  });

  it("should include all standard fields", () => {
    const file = generator.generate(sampleSkill);

    expect(file.content).toContain("name: opencode-skill");
    expect(file.content).toContain("description: A skill for OpenCode platform");
    expect(file.content).toMatch(/version:/);
    expect(file.content).toContain("triggers:");
  });
});

describe("OpenCodeCommandGenerator", () => {
  const generator = createOpenCodeCommandGenerator();

  const sampleCommand: CommandDefinition = {
    name: "opencode-command",
    description: "A command for OpenCode platform",
    allowedTools: ["Read", "Write", "Bash"],
    content: "Run the OpenCode workflow.",
    usage: "[args]",
    agentRef: "sigma-agent",
  };

  it("should generate correct output path", () => {
    const path = generator.getOutputPath(sampleCommand);

    expect(path).toBe(".opencode/commands/opencode-command.md");
  });

  it("should generate thin wrapper format", () => {
    const file = generator.generate(sampleCommand);

    // Thin wrapper should include brief description
    expect(file.content).toContain("# /opencode-command");
    expect(file.content).toContain("Invoke the **opencode-command** agent from Sigma Protocol.");
    expect(file.content).toContain("HITL (Human-in-the-Loop)");
    expect(file.content).toContain("MCP research integration");
    expect(file.content).toContain("Quality verification gates");
  });

  it("should include usage section", () => {
    const file = generator.generate(sampleCommand);

    expect(file.content).toContain("**Usage:** `/opencode-command [args]`");
  });

  it("should include agent reference", () => {
    const file = generator.generate(sampleCommand);

    expect(file.content).toContain("@sigma-agent");
  });

  it("should format agent references correctly", () => {
    const ref = generator.formatAgentRef("my-agent");

    expect(ref).toBe("@my-agent");
  });

  it("should use allowed-tools field name", () => {
    const file = generator.generate(sampleCommand);

    expect(file.content).toContain("allowed-tools:");
  });

  it("should use default core tools if none specified", () => {
    const commandNoTools: CommandDefinition = {
      name: "no-tools-command",
      description: "Command without tools",
      allowedTools: [],
      content: "Content",
    };

    const file = generator.generate(commandNoTools);

    // Should have default core tools
    expect(file.content).toContain("allowed-tools:");
    expect(file.content).toContain("  - Read");
    expect(file.content).toContain("  - Write");
    expect(file.content).toContain("  - Edit");
    expect(file.content).toContain("  - Bash");
  });
});
