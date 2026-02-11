package factory

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestFactoryDroidBuild(t *testing.T) {
	// Setup
	tmpDir := t.TempDir()
	skillsDir := filepath.Join(tmpDir, ".claude", "skills")
	require.NoError(t, os.MkdirAll(skillsDir, 0755))

	// Create test skill files
	createTestSkill(t, skillsDir, "test-skill-1.md", "test-skill-1", "Test skill 1", []string{"ARCHITECTURE"})
	createTestSkill(t, skillsDir, "test-skill-2.md", "test-skill-2", "Test skill 2", []string{"QUICK"})

	// Execute build
	builder := NewBuilder()
	err := builder.Build(context.Background(), tmpDir, tmpDir)
	require.NoError(t, err)

	// Verify .factory/.droid.yaml exists
	configPath := filepath.Join(tmpDir, ".factory", ".droid.yaml")
	assert.FileExists(t, configPath)

	// Verify README.md exists
	readmePath := filepath.Join(tmpDir, "platforms", "factory-droid", "README.md")
	assert.FileExists(t, readmePath)

	// Verify droid files exist
	droid1Path := filepath.Join(tmpDir, "platforms", "factory-droid", "droids", "test-skill-1.md")
	assert.FileExists(t, droid1Path)

	droid2Path := filepath.Join(tmpDir, "platforms", "factory-droid", "droids", "test-skill-2.md")
	assert.FileExists(t, droid2Path)

	// Verify metrics
	metrics := builder.GetMetrics()
	assert.Equal(t, "factory", metrics.Platform)
	assert.Equal(t, 2, metrics.Skills)
	assert.Equal(t, 4, metrics.TotalFiles) // .droid.yaml + README + 2 droids

	// Verify file entries
	files := builder.GetFiles()
	assert.Len(t, files, 4)
}

func TestFactoryDroidBuild_ValidatesDroidContent(t *testing.T) {
	// Setup
	tmpDir := t.TempDir()
	skillsDir := filepath.Join(tmpDir, ".claude", "skills")
	require.NoError(t, os.MkdirAll(skillsDir, 0755))

	// Create test skill
	createTestSkill(t, skillsDir, "architecture-skill.md", "architecture-skill", "System architecture design", []string{"ARCHITECTURE"})

	// Execute build
	builder := NewBuilder()
	err := builder.Build(context.Background(), tmpDir, tmpDir)
	require.NoError(t, err)

	// Read generated droid and verify content
	droidPath := filepath.Join(tmpDir, "platforms", "factory-droid", "droids", "architecture-skill.md")
	content, err := os.ReadFile(droidPath)
	require.NoError(t, err)

	contentStr := string(content)

	// Verify YAML frontmatter
	assert.Contains(t, contentStr, "---")
	assert.Contains(t, contentStr, "name: architecture-skill")
	assert.Contains(t, contentStr, "description: System architecture design")
	assert.Contains(t, contentStr, "model: claude-opus-4-5-20251101") // ARCHITECTURE tag -> opus
	assert.Contains(t, contentStr, "reasoningEffort: high")            // ARCHITECTURE tag -> high
	assert.Contains(t, contentStr, "tools:")
	assert.Contains(t, contentStr, "- Read")
	assert.Contains(t, contentStr, "- Bash")
}

func TestFactoryDroidBuild_MissingSkillsDir(t *testing.T) {
	tmpDir := t.TempDir()

	builder := NewBuilder()
	err := builder.Build(context.Background(), tmpDir, tmpDir)
	assert.Error(t, err)
	// Error can be either "failed to load skills" or "no skills found"
	errMsg := err.Error()
	assert.True(t,
		strings.Contains(errMsg, "failed to load skills") || strings.Contains(errMsg, "no skills found"),
		"Expected error about missing/no skills, got: %s", errMsg)
}

func TestFactoryDroidBuild_NoSkillFiles(t *testing.T) {
	tmpDir := t.TempDir()
	skillsDir := filepath.Join(tmpDir, ".claude", "skills")
	require.NoError(t, os.MkdirAll(skillsDir, 0755))

	builder := NewBuilder()
	err := builder.Build(context.Background(), tmpDir, tmpDir)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "no skills found")
}

func TestFactoryDroidValidate(t *testing.T) {
	tmpDir := t.TempDir()
	skillsDir := filepath.Join(tmpDir, ".claude", "skills")
	require.NoError(t, os.MkdirAll(skillsDir, 0755))

	// Create test skill
	createTestSkill(t, skillsDir, "test-skill.md", "test-skill", "Test skill", []string{})

	builder := NewBuilder()
	result, err := builder.Validate(tmpDir)
	require.NoError(t, err)
	assert.True(t, result.Valid)
	assert.Empty(t, result.Errors)
}

func TestFactoryDroidValidate_MissingSkillsDir(t *testing.T) {
	tmpDir := t.TempDir()

	builder := NewBuilder()
	result, err := builder.Validate(tmpDir)
	require.NoError(t, err)
	assert.False(t, result.Valid)
	assert.Len(t, result.Errors, 1)
	assert.Equal(t, "SKILLS_DIR_NOT_FOUND", result.Errors[0].Code)
}

func TestFactoryDroidValidate_NoSkillFiles(t *testing.T) {
	tmpDir := t.TempDir()
	skillsDir := filepath.Join(tmpDir, ".claude", "skills")
	require.NoError(t, os.MkdirAll(skillsDir, 0755))

	builder := NewBuilder()
	result, err := builder.Validate(tmpDir)
	require.NoError(t, err)
	assert.False(t, result.Valid)
	assert.Len(t, result.Errors, 1)
	assert.Equal(t, "NO_SKILLS_FOUND", result.Errors[0].Code)
}

func TestFactoryDroidGetFiles(t *testing.T) {
	tmpDir := t.TempDir()
	skillsDir := filepath.Join(tmpDir, ".claude", "skills")
	require.NoError(t, os.MkdirAll(skillsDir, 0755))

	createTestSkill(t, skillsDir, "skill1.md", "skill1", "Skill 1", []string{})

	builder := NewBuilder()
	err := builder.Build(context.Background(), tmpDir, tmpDir)
	require.NoError(t, err)

	files := builder.GetFiles()
	assert.Len(t, files, 3) // .droid.yaml + README + 1 droid

	// Verify file types
	var hasConfig, hasReadme, hasDroid bool
	for _, f := range files {
		switch f.Type {
		case "config":
			hasConfig = true
		case "skill":
			hasDroid = true
		case "other":
			hasReadme = true
		}
	}

	assert.True(t, hasConfig, "Should have config file")
	assert.True(t, hasReadme, "Should have README file")
	assert.True(t, hasDroid, "Should have droid file")
}

func TestFactoryDroidGetMetrics(t *testing.T) {
	builder := NewBuilder()
	metrics := builder.GetMetrics()

	assert.Equal(t, "factory", metrics.Platform)
	assert.NotNil(t, metrics.GeneratedAt)
}

func TestFactoryDroidName(t *testing.T) {
	builder := NewBuilder()
	assert.Equal(t, "factory", builder.Name())
}

// Helper function to create test skill files
func createTestSkill(t *testing.T, dir, filename, name, description string, tags []string) {
	t.Helper()

	tagsYAML := ""
	if len(tags) > 0 {
		tagsYAML = "tags:\n"
		for _, tag := range tags {
			tagsYAML += "  - " + tag + "\n"
		}
	}

	content := `---
name: ` + name + `
description: ` + description + `
` + tagsYAML + `---

# ` + name + `

This is test skill content.

## Overview

Test skill for integration testing.
`

	path := filepath.Join(dir, filename)
	err := os.WriteFile(path, []byte(content), 0644)
	require.NoError(t, err)
}
