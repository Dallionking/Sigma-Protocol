/**
 * Claude Code Generator Tests
 */

import { describe, it, expect } from "vitest";
import {
  createClaudeCodeSkillGenerator,
  createClaudeCodeCommandGenerator,
} from "../../src/generators/claude-code/index.js";
import type { SkillDefinition, CommandDefinition } from "../../src/generators/types.js";

describe("ClaudeCodeSkillGenerator", () => {
  const generator = createClaudeCodeSkillGenerator();

  const sampleSkill: SkillDefinition = {
    id: "test-skill",
    name: "Test Skill",
    description: "A test skill for unit testing",
    version: "1.0.0",
    triggers: ["test", "example"],
    content: "# Test Skill\n\nThis is the skill content.",
    category: "utility",
  };

  it("should generate correct output path", () => {
    const path = generator.getOutputPath(sampleSkill);

    expect(path).toBe(".claude/skills/test-skill.md");
  });

  it("should generate valid frontmatter", () => {
    const file = generator.generate(sampleSkill);

    expect(file.content).toContain("---");
    expect(file.content).toContain("name: test-skill");
    expect(file.content).toContain("description: A test skill for unit testing");
    expect(file.content).toContain("version:");
  });

  it("should include triggers in frontmatter", () => {
    const file = generator.generate(sampleSkill);

    expect(file.content).toContain("triggers:");
    expect(file.content).toContain("  - test");
    expect(file.content).toContain("  - example");
  });

  it("should include skill content after frontmatter", () => {
    const file = generator.generate(sampleSkill);

    expect(file.content).toContain("# Test Skill");
    expect(file.content).toContain("This is the skill content.");
  });

  it("should include allowed-tools if provided", () => {
    const skillWithTools: SkillDefinition = {
      ...sampleSkill,
      allowedTools: ["Read", "Write", "Bash"],
    };

    const file = generator.generate(skillWithTools);

    expect(file.content).toContain("allowed-tools:");
    expect(file.content).toContain("  - Read");
    expect(file.content).toContain("  - Write");
    expect(file.content).toContain("  - Bash");
  });

  it("should sanitize IDs with special characters", () => {
    const skillWithSpecialId: SkillDefinition = {
      ...sampleSkill,
      id: "Test Skill With Spaces",
    };

    const path = generator.getOutputPath(skillWithSpecialId);

    expect(path).toBe(".claude/skills/test-skill-with-spaces.md");
  });

  it("should generate multiple skills", () => {
    const skills: SkillDefinition[] = [
      sampleSkill,
      { ...sampleSkill, id: "skill-2", name: "Skill 2" },
    ];

    const files = generator.generateAll(skills);

    expect(files).toHaveLength(2);
    expect(files[0].path).toBe(".claude/skills/test-skill.md");
    expect(files[1].path).toBe(".claude/skills/skill-2.md");
  });
});

describe("ClaudeCodeCommandGenerator", () => {
  const generator = createClaudeCodeCommandGenerator();

  const sampleCommand: CommandDefinition = {
    name: "test-command",
    description: "A test command for unit testing",
    allowedTools: ["Read", "Write", "Bash"],
    content: "Run the test workflow with verification.",
    usage: "[input]",
  };

  it("should generate correct output path", () => {
    const path = generator.getOutputPath(sampleCommand);

    expect(path).toBe(".claude/commands/test-command.md");
  });

  it("should generate valid frontmatter", () => {
    const file = generator.generate(sampleCommand);

    expect(file.content).toContain("---");
    expect(file.content).toContain("description: A test command for unit testing");
  });

  it("should include allowed-tools in frontmatter", () => {
    const file = generator.generate(sampleCommand);

    expect(file.content).toContain("allowed-tools:");
    expect(file.content).toContain("  - Read");
    expect(file.content).toContain("  - Write");
    expect(file.content).toContain("  - Bash");
  });

  it("should include command heading", () => {
    const file = generator.generate(sampleCommand);

    expect(file.content).toContain("# /test-command");
  });

  it("should include usage section", () => {
    const file = generator.generate(sampleCommand);

    expect(file.content).toContain("**Usage:** `/test-command [input]`");
  });

  it("should format agent references", () => {
    const ref = generator.formatAgentRef("my-agent");

    expect(ref).toBe("@my-agent");
  });

  it("should include agent reference if provided", () => {
    const commandWithAgent: CommandDefinition = {
      ...sampleCommand,
      agentRef: "workflow-agent",
    };

    const file = generator.generate(commandWithAgent);

    expect(file.content).toContain("@workflow-agent");
  });
});
