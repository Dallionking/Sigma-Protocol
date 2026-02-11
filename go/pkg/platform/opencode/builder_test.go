package opencode

import (
	"context"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// setupTestProject creates a mock .claude/ source directory for testing.
func setupTestProject(t *testing.T, dir string) {
	t.Helper()

	// Create .claude/skills/ with sample skill
	skillsDir := filepath.Join(dir, ".claude", "skills")
	require.NoError(t, os.MkdirAll(skillsDir, 0755))

	sampleSkill := `---
name: test-skill
description: A test skill for validation
version: 1.0.0
triggers:
  - test
  - example
---

# Test Skill

This is a test skill for unit testing.
`
	skillPath := filepath.Join(skillsDir, "test-skill.md")
	require.NoError(t, os.WriteFile(skillPath, []byte(sampleSkill), 0644))

	// Create .claude/commands/ with sample command
	commandsDir := filepath.Join(dir, ".claude", "commands")
	require.NoError(t, os.MkdirAll(commandsDir, 0755))

	sampleCommand := `---
name: test-command
description: A test command
---

# Test Command

This is a test command.
`
	commandPath := filepath.Join(commandsDir, "test-command.md")
	require.NoError(t, os.WriteFile(commandPath, []byte(sampleCommand), 0644))

	// Create .claude/agents/ with sample agent
	agentsDir := filepath.Join(dir, ".claude", "agents")
	require.NoError(t, os.MkdirAll(agentsDir, 0755))

	sampleAgent := `---
name: test-agent
description: A test agent
---

# Test Agent

This is a test agent.
`
	agentPath := filepath.Join(agentsDir, "test-agent.md")
	require.NoError(t, os.WriteFile(agentPath, []byte(sampleAgent), 0644))
}

func TestNewBuilder(t *testing.T) {
	builder := NewBuilder()
	assert.NotNil(t, builder)
	assert.Equal(t, "opencode", builder.Name())
	assert.NotNil(t, builder.metrics)
	assert.Equal(t, "opencode", builder.metrics.Platform)
}

func TestBuild(t *testing.T) {
	// Setup test project
	srcDir := t.TempDir()
	destDir := t.TempDir()
	setupTestProject(t, srcDir)

	// Create builder
	builder := NewBuilder()

	// Run build
	ctx := context.Background()
	err := builder.Build(ctx, srcDir, destDir)
	require.NoError(t, err)

	// Verify .opencode directory created
	openCodeDir := filepath.Join(destDir, ".opencode")
	assert.DirExists(t, openCodeDir)

	// Verify singular directories exist
	assert.DirExists(t, filepath.Join(openCodeDir, "skill"))
	assert.DirExists(t, filepath.Join(openCodeDir, "agent"))
	assert.DirExists(t, filepath.Join(openCodeDir, "commands"))

	// Verify config.yaml created
	configPath := filepath.Join(openCodeDir, "config.yaml")
	assert.FileExists(t, configPath)

	// Verify metrics updated
	metrics := builder.GetMetrics()
	assert.Greater(t, metrics.Skills, 0, "Should have processed at least 1 skill")
	assert.Greater(t, metrics.Commands, 0, "Should have processed at least 1 command")
	assert.Greater(t, metrics.Agents, 0, "Should have processed at least 1 agent")
	assert.Greater(t, metrics.TotalFiles, 0, "Should have generated files")
	assert.Greater(t, metrics.TotalBytes, int64(0), "Should have tracked file sizes")
}

func TestBuildMissingSource(t *testing.T) {
	srcDir := t.TempDir()
	destDir := t.TempDir()

	// Don't create .claude directory

	builder := NewBuilder()
	err := builder.Build(context.Background(), srcDir, destDir)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), ".claude directory not found")
}

func TestSkillStructure(t *testing.T) {
	srcDir := t.TempDir()
	destDir := t.TempDir()
	setupTestProject(t, srcDir)

	builder := NewBuilder()
	err := builder.Build(context.Background(), srcDir, destDir)
	require.NoError(t, err)

	// Verify folder structure for test-skill
	skillDir := filepath.Join(destDir, ".opencode", "skill", "test-skill")
	assert.DirExists(t, skillDir, "Skill should be in a folder")

	// Verify SKILL.md exists with correct capitalization
	skillFile := filepath.Join(skillDir, "SKILL.md")
	assert.FileExists(t, skillFile, "SKILL.md should exist")

	// Verify content preserved
	content, err := os.ReadFile(skillFile)
	require.NoError(t, err)
	assert.Contains(t, string(content), "name: test-skill", "Frontmatter should be preserved")
	assert.Contains(t, string(content), "# Test Skill", "Markdown content should be preserved")
}

func TestCommandsCopy(t *testing.T) {
	srcDir := t.TempDir()
	destDir := t.TempDir()
	setupTestProject(t, srcDir)

	builder := NewBuilder()
	err := builder.Build(context.Background(), srcDir, destDir)
	require.NoError(t, err)

	// Verify command copied
	commandFile := filepath.Join(destDir, ".opencode", "commands", "test-command.md")
	assert.FileExists(t, commandFile)

	// Verify content preserved
	content, err := os.ReadFile(commandFile)
	require.NoError(t, err)
	assert.Contains(t, string(content), "# Test Command")
}

func TestAgentsCopy(t *testing.T) {
	srcDir := t.TempDir()
	destDir := t.TempDir()
	setupTestProject(t, srcDir)

	builder := NewBuilder()
	err := builder.Build(context.Background(), srcDir, destDir)
	require.NoError(t, err)

	// Verify agent copied to singular directory
	agentFile := filepath.Join(destDir, ".opencode", "agent", "test-agent.md")
	assert.FileExists(t, agentFile, "Agent should be in 'agent/' not 'agents/'")

	// Verify content preserved
	content, err := os.ReadFile(agentFile)
	require.NoError(t, err)
	assert.Contains(t, string(content), "# Test Agent")
}

func TestConfigGeneration(t *testing.T) {
	srcDir := t.TempDir()
	destDir := t.TempDir()
	setupTestProject(t, srcDir)

	builder := NewBuilder()
	err := builder.Build(context.Background(), srcDir, destDir)
	require.NoError(t, err)

	// Verify config.yaml exists
	configPath := filepath.Join(destDir, ".opencode", "config.yaml")
	require.FileExists(t, configPath)

	// Read and parse config
	content, err := os.ReadFile(configPath)
	require.NoError(t, err)

	configStr := string(content)
	assert.Contains(t, configStr, "model: claude-sonnet-4-20250514")
	assert.Contains(t, configStr, "skills:")
	assert.Contains(t, configStr, "enabled: true")
	assert.Contains(t, configStr, "path: .opencode/skill/")
	assert.Contains(t, configStr, "agents:")
	assert.Contains(t, configStr, "path: .opencode/agent/")
}

func TestValidationSuccess(t *testing.T) {
	srcDir := t.TempDir()
	destDir := t.TempDir()
	setupTestProject(t, srcDir)

	builder := NewBuilder()
	err := builder.Build(context.Background(), srcDir, destDir)
	require.NoError(t, err)

	// Validate should succeed after successful build
	result, err := builder.Validate(destDir)
	require.NoError(t, err)
	assert.True(t, result.Valid, "Validation should pass after successful build")
	assert.Empty(t, result.Errors, "Should have no validation errors")
}

func TestValidationMissingDirectory(t *testing.T) {
	destDir := t.TempDir()
	// Don't create any directories

	builder := NewBuilder()
	result, err := builder.Validate(destDir)
	require.NoError(t, err)
	assert.False(t, result.Valid)
	assert.NotEmpty(t, result.Errors)

	// Check for specific error
	hasError := false
	for _, verr := range result.Errors {
		if verr.Code == "MISSING_OPENCODE_DIR" {
			hasError = true
			break
		}
	}
	assert.True(t, hasError, "Should have MISSING_OPENCODE_DIR error")
}

func TestValidationMissingSKILLMD(t *testing.T) {
	destDir := t.TempDir()

	// Create directory structure but missing SKILL.md
	openCodeDir := filepath.Join(destDir, ".opencode")
	skillDir := filepath.Join(openCodeDir, "skill", "test-skill")
	require.NoError(t, os.MkdirAll(skillDir, 0755))
	require.NoError(t, os.MkdirAll(filepath.Join(openCodeDir, "agent"), 0755))
	require.NoError(t, os.MkdirAll(filepath.Join(openCodeDir, "commands"), 0755))

	// Create valid config.yaml
	config := `model: claude-sonnet-4-20250514
skills:
  enabled: true
  path: .opencode/skill/
`
	configPath := filepath.Join(openCodeDir, "config.yaml")
	require.NoError(t, os.WriteFile(configPath, []byte(config), 0644))

	builder := NewBuilder()
	result, err := builder.Validate(destDir)
	require.NoError(t, err)
	assert.False(t, result.Valid)

	// Check for MISSING_SKILL_FILE error
	hasError := false
	for _, verr := range result.Errors {
		if verr.Code == "MISSING_SKILL_FILE" {
			hasError = true
			assert.Contains(t, verr.Message, "missing SKILL.md")
			break
		}
	}
	assert.True(t, hasError, "Should have MISSING_SKILL_FILE error")
}

func TestValidationFlatFileInSkillDir(t *testing.T) {
	destDir := t.TempDir()

	// Create directory structure with flat file (invalid)
	openCodeDir := filepath.Join(destDir, ".opencode")
	skillDir := filepath.Join(openCodeDir, "skill")
	require.NoError(t, os.MkdirAll(skillDir, 0755))
	require.NoError(t, os.MkdirAll(filepath.Join(openCodeDir, "agent"), 0755))
	require.NoError(t, os.MkdirAll(filepath.Join(openCodeDir, "commands"), 0755))

	// Create flat file directly in skill/ (should be in a folder)
	flatFile := filepath.Join(skillDir, "flat-skill.md")
	require.NoError(t, os.WriteFile(flatFile, []byte("invalid"), 0644))

	// Create valid config.yaml
	config := `model: claude-sonnet-4-20250514
skills:
  enabled: true
  path: .opencode/skill/
`
	configPath := filepath.Join(openCodeDir, "config.yaml")
	require.NoError(t, os.WriteFile(configPath, []byte(config), 0644))

	builder := NewBuilder()
	result, err := builder.Validate(destDir)
	require.NoError(t, err)
	assert.False(t, result.Valid)

	// Check for INVALID_SKILL_STRUCTURE error
	hasError := false
	for _, verr := range result.Errors {
		if verr.Code == "INVALID_SKILL_STRUCTURE" {
			hasError = true
			assert.Contains(t, verr.Message, "expected folder, found file")
			break
		}
	}
	assert.True(t, hasError, "Should have INVALID_SKILL_STRUCTURE error")
}

func TestValidationInvalidConfigYAML(t *testing.T) {
	destDir := t.TempDir()

	// Create directory structure
	openCodeDir := filepath.Join(destDir, ".opencode")
	require.NoError(t, os.MkdirAll(filepath.Join(openCodeDir, "skill"), 0755))
	require.NoError(t, os.MkdirAll(filepath.Join(openCodeDir, "agent"), 0755))
	require.NoError(t, os.MkdirAll(filepath.Join(openCodeDir, "commands"), 0755))

	// Create invalid config.yaml
	invalidConfig := `this is not: [valid: yaml`
	configPath := filepath.Join(openCodeDir, "config.yaml")
	require.NoError(t, os.WriteFile(configPath, []byte(invalidConfig), 0644))

	builder := NewBuilder()
	result, err := builder.Validate(destDir)
	require.NoError(t, err)
	assert.False(t, result.Valid)

	// Check for INVALID_CONFIG_YAML error
	hasError := false
	for _, verr := range result.Errors {
		if verr.Code == "INVALID_CONFIG_YAML" {
			hasError = true
			break
		}
	}
	assert.True(t, hasError, "Should have INVALID_CONFIG_YAML error")
}

func TestValidationMissingModelField(t *testing.T) {
	destDir := t.TempDir()

	// Create directory structure
	openCodeDir := filepath.Join(destDir, ".opencode")
	require.NoError(t, os.MkdirAll(filepath.Join(openCodeDir, "skill"), 0755))
	require.NoError(t, os.MkdirAll(filepath.Join(openCodeDir, "agent"), 0755))
	require.NoError(t, os.MkdirAll(filepath.Join(openCodeDir, "commands"), 0755))

	// Create config without model field
	config := `skills:
  enabled: true
  path: .opencode/skill/
`
	configPath := filepath.Join(openCodeDir, "config.yaml")
	require.NoError(t, os.WriteFile(configPath, []byte(config), 0644))

	builder := NewBuilder()
	result, err := builder.Validate(destDir)
	require.NoError(t, err)
	assert.False(t, result.Valid)

	// Check for MISSING_CONFIG_FIELD error
	hasError := false
	for _, verr := range result.Errors {
		if verr.Code == "MISSING_CONFIG_FIELD" {
			hasError = true
			assert.Contains(t, verr.Message, "model field is required")
			break
		}
	}
	assert.True(t, hasError, "Should have MISSING_CONFIG_FIELD error")
}

func TestGetFiles(t *testing.T) {
	srcDir := t.TempDir()
	destDir := t.TempDir()
	setupTestProject(t, srcDir)

	builder := NewBuilder()
	err := builder.Build(context.Background(), srcDir, destDir)
	require.NoError(t, err)

	// Get files list
	files := builder.GetFiles()
	assert.NotEmpty(t, files, "Should have file entries")

	// Check for expected file types
	hasSkill := false
	hasCommand := false
	hasAgent := false
	hasConfig := false

	for _, f := range files {
		switch f.Type {
		case "skill":
			hasSkill = true
		case "command":
			hasCommand = true
		case "agent":
			hasAgent = true
		case "config":
			hasConfig = true
		}
	}

	assert.True(t, hasSkill, "Should have skill file entries")
	assert.True(t, hasCommand, "Should have command file entries")
	assert.True(t, hasAgent, "Should have agent file entries")
	assert.True(t, hasConfig, "Should have config file entry")
}

func TestGetMetrics(t *testing.T) {
	srcDir := t.TempDir()
	destDir := t.TempDir()
	setupTestProject(t, srcDir)

	builder := NewBuilder()
	err := builder.Build(context.Background(), srcDir, destDir)
	require.NoError(t, err)

	metrics := builder.GetMetrics()
	assert.NotNil(t, metrics)
	assert.Equal(t, "opencode", metrics.Platform)
	assert.Equal(t, 1, metrics.Skills, "Should have processed 1 skill")
	assert.Equal(t, 1, metrics.Commands, "Should have processed 1 command")
	assert.Equal(t, 1, metrics.Agents, "Should have processed 1 agent")
	assert.Greater(t, metrics.TotalFiles, 0)
	assert.Greater(t, metrics.TotalBytes, int64(0))
}

func TestContextCancellation(t *testing.T) {
	srcDir := t.TempDir()
	destDir := t.TempDir()
	setupTestProject(t, srcDir)

	builder := NewBuilder()

	// Create cancelled context
	ctx, cancel := context.WithCancel(context.Background())
	cancel() // Cancel immediately

	err := builder.Build(ctx, srcDir, destDir)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "context canceled", "Error should indicate context cancellation")
}

func TestOptionalDirectories(t *testing.T) {
	srcDir := t.TempDir()
	destDir := t.TempDir()

	// Create minimal .claude/skills/ only (no commands or agents)
	skillsDir := filepath.Join(srcDir, ".claude", "skills")
	require.NoError(t, os.MkdirAll(skillsDir, 0755))

	sampleSkill := `---
name: minimal-skill
description: Minimal test skill
---

# Minimal Skill
`
	skillPath := filepath.Join(skillsDir, "minimal-skill.md")
	require.NoError(t, os.WriteFile(skillPath, []byte(sampleSkill), 0644))

	builder := NewBuilder()
	err := builder.Build(context.Background(), srcDir, destDir)
	require.NoError(t, err)

	// Should succeed even without commands/agents
	metrics := builder.GetMetrics()
	assert.Equal(t, 1, metrics.Skills)
	assert.Equal(t, 0, metrics.Commands, "Commands should be 0 when directory doesn't exist")
	assert.Equal(t, 0, metrics.Agents, "Agents should be 0 when directory doesn't exist")
}

func TestKebabCaseValidation(t *testing.T) {
	destDir := t.TempDir()

	// Create directory structure with invalid folder name
	openCodeDir := filepath.Join(destDir, ".opencode")
	skillDir := filepath.Join(openCodeDir, "skill")
	require.NoError(t, os.MkdirAll(skillDir, 0755))
	require.NoError(t, os.MkdirAll(filepath.Join(openCodeDir, "agent"), 0755))
	require.NoError(t, os.MkdirAll(filepath.Join(openCodeDir, "commands"), 0755))

	// Create skill folder with invalid name (uppercase not allowed)
	invalidFolder := filepath.Join(skillDir, "InvalidName")
	require.NoError(t, os.MkdirAll(invalidFolder, 0755))
	skillFile := filepath.Join(invalidFolder, "SKILL.md")
	require.NoError(t, os.WriteFile(skillFile, []byte("test"), 0644))

	// Create valid config
	config := `model: claude-sonnet-4-20250514
skills:
  enabled: true
  path: .opencode/skill/
`
	configPath := filepath.Join(openCodeDir, "config.yaml")
	require.NoError(t, os.WriteFile(configPath, []byte(config), 0644))

	builder := NewBuilder()
	result, err := builder.Validate(destDir)
	require.NoError(t, err)
	assert.False(t, result.Valid)

	// Check for INVALID_FOLDER_NAME error
	hasError := false
	for _, verr := range result.Errors {
		if verr.Code == "INVALID_FOLDER_NAME" {
			hasError = true
			assert.Contains(t, verr.Message, "kebab-case")
			break
		}
	}
	assert.True(t, hasError, "Should have INVALID_FOLDER_NAME error")
}
