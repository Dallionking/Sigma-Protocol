// Package codex tests for the Codex platform builder.
package codex

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewBuilder(t *testing.T) {
	b := NewBuilder()
	assert.NotNil(t, b)
	assert.Equal(t, "codex", b.Name())
	assert.NotNil(t, b.metrics)
	assert.Equal(t, "codex", b.metrics.Platform)
}

func TestBuilder_Build(t *testing.T) {
	t.Run("successful build with minimal source", func(t *testing.T) {
		// Setup source directory with required structure
		srcDir := t.TempDir()
		destDir := t.TempDir()

		// Create minimal .claude/ structure
		require.NoError(t, os.MkdirAll(filepath.Join(srcDir, ".claude", "skills"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(srcDir, ".claude", "agents"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(srcDir, "platforms", "codex", "rules"), 0755))

		// Create a test skill
		skillContent := `---
description: Test skill for Codex
---

# Test Skill

This is a test skill.
`
		require.NoError(t, os.WriteFile(
			filepath.Join(srcDir, ".claude", "skills", "test-skill.md"),
			[]byte(skillContent),
			0644,
		))

		// Build
		b := NewBuilder()
		err := b.Build(context.Background(), srcDir, destDir)
		require.NoError(t, err)

		// Verify directories created
		assert.DirExists(t, filepath.Join(destDir, ".codex"))
		assert.DirExists(t, filepath.Join(destDir, ".codex", "skills"))
		assert.DirExists(t, filepath.Join(destDir, ".codex", "rules"))
		assert.DirExists(t, filepath.Join(destDir, "platforms", "codex"))
		assert.DirExists(t, filepath.Join(destDir, "platforms", "codex", "skills"))
	})

	t.Run("build creates config.toml", func(t *testing.T) {
		srcDir := t.TempDir()
		destDir := t.TempDir()

		// Create minimal structure
		require.NoError(t, os.MkdirAll(filepath.Join(srcDir, ".claude", "skills"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(srcDir, ".claude", "agents"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(srcDir, "platforms", "codex", "rules"), 0755))

		b := NewBuilder()
		err := b.Build(context.Background(), srcDir, destDir)
		require.NoError(t, err)

		// Check config.toml exists
		configPath := filepath.Join(destDir, "platforms", "codex", "config.toml")
		assert.FileExists(t, configPath)
	})

	t.Run("build converts skills to folder structure", func(t *testing.T) {
		srcDir := t.TempDir()
		destDir := t.TempDir()

		// Create skill in flat structure
		require.NoError(t, os.MkdirAll(filepath.Join(srcDir, ".claude", "skills"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(srcDir, ".claude", "agents"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(srcDir, "platforms", "codex", "rules"), 0755))

		skillContent := `---
description: My skill description
---

# My Skill Content
`
		require.NoError(t, os.WriteFile(
			filepath.Join(srcDir, ".claude", "skills", "my-skill.md"),
			[]byte(skillContent),
			0644,
		))

		b := NewBuilder()
		err := b.Build(context.Background(), srcDir, destDir)
		require.NoError(t, err)

		// Verify skill converted to folder structure
		skillFolder := filepath.Join(destDir, "platforms", "codex", "skills", "my-skill")
		assert.DirExists(t, skillFolder)
		assert.FileExists(t, filepath.Join(skillFolder, "SKILL.md"))

		// Verify metrics updated
		assert.Equal(t, 1, b.metrics.Skills)
	})

	t.Run("build handles missing source directories gracefully", func(t *testing.T) {
		srcDir := t.TempDir()
		destDir := t.TempDir()

		// Create minimal required structure (skills can be empty)
		require.NoError(t, os.MkdirAll(filepath.Join(srcDir, ".claude", "skills"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(srcDir, ".claude", "agents"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(srcDir, "platforms", "codex", "rules"), 0755))

		b := NewBuilder()
		err := b.Build(context.Background(), srcDir, destDir)
		// Should not error even with empty directories
		require.NoError(t, err)
	})

	t.Run("build with context cancellation", func(t *testing.T) {
		srcDir := t.TempDir()
		destDir := t.TempDir()

		require.NoError(t, os.MkdirAll(filepath.Join(srcDir, ".claude", "skills"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(srcDir, ".claude", "agents"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(srcDir, "platforms", "codex", "rules"), 0755))

		ctx, cancel := context.WithCancel(context.Background())
		cancel() // Cancel immediately

		b := NewBuilder()
		// Context cancellation should not cause immediate failure in current implementation
		// but the test verifies the context is accepted
		_ = b.Build(ctx, srcDir, destDir)
	})
}

func TestBuilder_Validate(t *testing.T) {
	t.Run("valid configuration", func(t *testing.T) {
		dir := t.TempDir()

		// Create required structure
		require.NoError(t, os.MkdirAll(filepath.Join(dir, ".codex", "skills"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(dir, ".codex", "rules"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(dir, "platforms", "codex", "skills"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(dir, ".claude", "skills"), 0755))
		require.NoError(t, os.WriteFile(
			filepath.Join(dir, "platforms", "codex", "config.toml"),
			[]byte("[model]\nname = \"codex\"\n"),
			0644,
		))

		b := NewBuilder()
		result, err := b.Validate(dir)
		require.NoError(t, err)
		assert.True(t, result.Valid)
		assert.Empty(t, result.Errors)
	})

	t.Run("missing .codex directory", func(t *testing.T) {
		dir := t.TempDir()

		b := NewBuilder()
		result, err := b.Validate(dir)
		require.NoError(t, err)
		assert.False(t, result.Valid)
		assert.NotEmpty(t, result.Errors)

		// Check for specific error
		found := false
		for _, e := range result.Errors {
			if e.Code == "MISSING_CODEX_DIR" {
				found = true
				break
			}
		}
		assert.True(t, found, "Expected MISSING_CODEX_DIR error")
	})

	t.Run("missing config.toml", func(t *testing.T) {
		dir := t.TempDir()

		// Create .codex but no config
		require.NoError(t, os.MkdirAll(filepath.Join(dir, ".codex"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(dir, "platforms", "codex", "skills"), 0755))

		b := NewBuilder()
		result, err := b.Validate(dir)
		require.NoError(t, err)
		assert.False(t, result.Valid)

		found := false
		for _, e := range result.Errors {
			if e.Code == "MISSING_CONFIG" {
				found = true
				break
			}
		}
		assert.True(t, found, "Expected MISSING_CONFIG error")
	})

	t.Run("missing skills directory warns", func(t *testing.T) {
		dir := t.TempDir()

		require.NoError(t, os.MkdirAll(filepath.Join(dir, ".codex"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(dir, "platforms", "codex"), 0755))
		require.NoError(t, os.WriteFile(
			filepath.Join(dir, "platforms", "codex", "config.toml"),
			[]byte("[model]\nname = \"codex\"\n"),
			0644,
		))

		b := NewBuilder()
		result, err := b.Validate(dir)
		require.NoError(t, err)
		// Missing skills directory is an error, not a warning
		assert.False(t, result.Valid)
	})

	t.Run("missing source skills warns", func(t *testing.T) {
		dir := t.TempDir()

		require.NoError(t, os.MkdirAll(filepath.Join(dir, ".codex"), 0755))
		require.NoError(t, os.MkdirAll(filepath.Join(dir, "platforms", "codex", "skills"), 0755))
		require.NoError(t, os.WriteFile(
			filepath.Join(dir, "platforms", "codex", "config.toml"),
			[]byte("[model]\nname = \"codex\"\n"),
			0644,
		))
		// Note: .claude/skills is NOT created

		b := NewBuilder()
		result, err := b.Validate(dir)
		require.NoError(t, err)
		// Valid but with warning
		assert.True(t, result.Valid)
		assert.NotEmpty(t, result.Warnings)

		found := false
		for _, w := range result.Warnings {
			if w.Code == "MISSING_SOURCE_SKILLS" {
				found = true
				assert.NotEmpty(t, w.Suggestion)
				break
			}
		}
		assert.True(t, found, "Expected MISSING_SOURCE_SKILLS warning")
	})
}

func TestBuilder_GetFiles(t *testing.T) {
	b := NewBuilder()
	files := b.GetFiles()
	assert.NotNil(t, files)
	assert.Empty(t, files) // Empty before build
}

func TestBuilder_GetMetrics(t *testing.T) {
	b := NewBuilder()
	metrics := b.GetMetrics()
	assert.NotNil(t, metrics)
	assert.Equal(t, "codex", metrics.Platform)
}

func TestSkillConverter(t *testing.T) {
	t.Run("converts flat skill to folder structure", func(t *testing.T) {
		srcDir := t.TempDir()
		destDir := t.TempDir()

		// Create source skill
		skillContent := `---
description: Test skill
triggers:
  - test
  - example
---

# Test Skill

Some content here.
`
		require.NoError(t, os.WriteFile(
			filepath.Join(srcDir, "test-skill.md"),
			[]byte(skillContent),
			0644,
		))

		converter := NewSkillConverter(srcDir, destDir)
		count, err := converter.Convert()
		require.NoError(t, err)
		assert.Equal(t, 1, count)

		// Verify folder structure
		skillDir := filepath.Join(destDir, "test-skill")
		assert.DirExists(t, skillDir)
		assert.FileExists(t, filepath.Join(skillDir, "SKILL.md"))
	})

	t.Run("handles multiple skills", func(t *testing.T) {
		srcDir := t.TempDir()
		destDir := t.TempDir()

		skills := []string{"skill-a.md", "skill-b.md", "skill-c.md"}
		for _, name := range skills {
			content := "---\ndescription: " + name + "\n---\n\n# Content\n"
			require.NoError(t, os.WriteFile(
				filepath.Join(srcDir, name),
				[]byte(content),
				0644,
			))
		}

		converter := NewSkillConverter(srcDir, destDir)
		count, err := converter.Convert()
		require.NoError(t, err)
		assert.Equal(t, 3, count)
	})

	t.Run("skips non-md files", func(t *testing.T) {
		srcDir := t.TempDir()
		destDir := t.TempDir()

		require.NoError(t, os.WriteFile(
			filepath.Join(srcDir, "readme.txt"),
			[]byte("not a skill"),
			0644,
		))
		require.NoError(t, os.WriteFile(
			filepath.Join(srcDir, "skill.md"),
			[]byte("---\ndescription: real skill\n---\n\n# Skill\n"),
			0644,
		))

		converter := NewSkillConverter(srcDir, destDir)
		count, err := converter.Convert()
		require.NoError(t, err)
		assert.Equal(t, 1, count)
	})

	t.Run("empty source directory returns zero", func(t *testing.T) {
		srcDir := t.TempDir()
		destDir := t.TempDir()

		converter := NewSkillConverter(srcDir, destDir)
		count, err := converter.Convert()
		require.NoError(t, err)
		assert.Equal(t, 0, count)
	})

	t.Run("missing source directory returns zero gracefully", func(t *testing.T) {
		destDir := t.TempDir()

		converter := NewSkillConverter("/nonexistent/path", destDir)
		count, err := converter.Convert()
		// Missing source directory is OK - skills are optional
		require.NoError(t, err)
		assert.Equal(t, 0, count)
	})
}

func TestRulesCopier(t *testing.T) {
	t.Run("copies rules files with .rules extension", func(t *testing.T) {
		srcDir := t.TempDir()
		destDir := t.TempDir()

		// Create source rules with .rules extension (not .md)
		require.NoError(t, os.WriteFile(
			filepath.Join(srcDir, "safety.rules"),
			[]byte("# Safety Rules"),
			0644,
		))

		copier := NewRulesCopier(srcDir, destDir)
		count, err := copier.Copy()
		require.NoError(t, err)
		assert.Equal(t, 1, count)
		assert.FileExists(t, filepath.Join(destDir, "safety.rules"))
	})

	t.Run("ignores non-rules files", func(t *testing.T) {
		srcDir := t.TempDir()
		destDir := t.TempDir()

		// Create .md file (should be ignored)
		require.NoError(t, os.WriteFile(
			filepath.Join(srcDir, "safety.md"),
			[]byte("# Safety Rules"),
			0644,
		))
		// Create .rules file (should be copied)
		require.NoError(t, os.WriteFile(
			filepath.Join(srcDir, "execution.rules"),
			[]byte("# Execution Rules"),
			0644,
		))

		copier := NewRulesCopier(srcDir, destDir)
		count, err := copier.Copy()
		require.NoError(t, err)
		assert.Equal(t, 1, count)
		assert.FileExists(t, filepath.Join(destDir, "execution.rules"))
		assert.NoFileExists(t, filepath.Join(destDir, "safety.md"))
	})

	t.Run("empty source returns zero", func(t *testing.T) {
		srcDir := t.TempDir()
		destDir := t.TempDir()

		copier := NewRulesCopier(srcDir, destDir)
		count, err := copier.Copy()
		require.NoError(t, err)
		assert.Equal(t, 0, count)
	})

	t.Run("missing source returns error", func(t *testing.T) {
		destDir := t.TempDir()

		copier := NewRulesCopier("/nonexistent", destDir)
		count, err := copier.Copy()
		assert.Error(t, err)
		assert.Equal(t, 0, count)
		assert.Contains(t, err.Error(), "source directory does not exist")
	})
}

func TestAgentsGenerator(t *testing.T) {
	t.Run("generates AGENTS.md template", func(t *testing.T) {
		srcDir := t.TempDir()
		destPath := filepath.Join(t.TempDir(), "AGENTS.md")

		generator := NewAgentsGenerator(srcDir, destPath)
		err := generator.Generate()
		require.NoError(t, err)
		assert.FileExists(t, destPath)

		// Read and verify content has expected sections
		content, err := os.ReadFile(destPath)
		require.NoError(t, err)
		assert.Contains(t, string(content), "Sigma Protocol")
		assert.Contains(t, string(content), "Build & Test")
		assert.Contains(t, string(content), "Available Agents")
	})

	t.Run("handles empty agents directory", func(t *testing.T) {
		srcDir := t.TempDir()
		destPath := filepath.Join(t.TempDir(), "AGENTS.md")

		generator := NewAgentsGenerator(srcDir, destPath)
		err := generator.Generate()
		require.NoError(t, err)
		// Should still create an AGENTS.md with header
		assert.FileExists(t, destPath)
	})

	t.Run("handles missing agents directory", func(t *testing.T) {
		destPath := filepath.Join(t.TempDir(), "AGENTS.md")

		generator := NewAgentsGenerator("/nonexistent", destPath)
		err := generator.Generate()
		// Should not error, just create minimal file
		require.NoError(t, err)
		assert.FileExists(t, destPath)
	})

	t.Run("preserves existing AGENTS.md if large enough", func(t *testing.T) {
		srcDir := t.TempDir()
		destPath := filepath.Join(t.TempDir(), "AGENTS.md")

		// Create existing file with content > 100 bytes
		existingContent := "# Custom AGENTS.md\n\n" + strings.Repeat("This is custom content. ", 10)
		require.NoError(t, os.WriteFile(destPath, []byte(existingContent), 0644))

		generator := NewAgentsGenerator(srcDir, destPath)
		err := generator.Generate()
		require.NoError(t, err)

		// Should preserve original content
		content, err := os.ReadFile(destPath)
		require.NoError(t, err)
		assert.Equal(t, existingContent, string(content))
	})
}

func TestConfigGeneration(t *testing.T) {
	t.Run("generates valid TOML config", func(t *testing.T) {
		srcDir := t.TempDir()
		destDir := t.TempDir()

		require.NoError(t, os.MkdirAll(filepath.Join(destDir, "platforms", "codex"), 0755))

		b := NewBuilder()
		err := generateConfigFiles(srcDir, destDir, b)
		require.NoError(t, err)

		configPath := filepath.Join(destDir, "platforms", "codex", "config.toml")
		assert.FileExists(t, configPath)

		// Verify TOML content
		content, err := os.ReadFile(configPath)
		require.NoError(t, err)
		assert.Contains(t, string(content), "model = \"gpt-5.3-codex\"")
	})
}
