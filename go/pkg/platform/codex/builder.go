// Package codex implements the PlatformBuilder for OpenAI Codex (GPT-5.3-Codex).
//
// It generates .codex/ directory structure with config.toml, skills/, and execution
// policy rules, converting from Claude Code's flat skill format to Codex's folder-based
// structure.
package codex

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/dallionking/sigma-protocol/pkg/platform"
)

// Builder implements platform.PlatformBuilder for Codex.
type Builder struct {
	// metrics tracks build statistics
	metrics *platform.PlatformMetrics

	// files tracks all files to be generated
	files []platform.FileEntry
}

// NewBuilder creates a new Codex platform builder.
func NewBuilder() *Builder {
	return &Builder{
		metrics: &platform.PlatformMetrics{
			Platform: "codex",
		},
		files: make([]platform.FileEntry, 0),
	}
}

// Name returns the platform name.
func (b *Builder) Name() string {
	return "codex"
}

// Build generates the Codex platform configuration.
// src is the source directory containing .claude/ (canonical source).
// dest is the destination directory where platform configs will be generated.
func (b *Builder) Build(ctx context.Context, src, dest string) error {
	// Reset metrics and files for this build
	b.metrics = &platform.PlatformMetrics{Platform: "codex"}
	b.files = make([]platform.FileEntry, 0)

	// Get security config for consistent permissions
	cfg := platform.DefaultSecurityConfig()

	// 1. Create .codex/ directory if missing
	codexDir := filepath.Join(dest, ".codex")
	if err := os.MkdirAll(codexDir, cfg.DirMode); err != nil {
		return fmt.Errorf("failed to create .codex directory: %w", err)
	}

	// Create subdirectories
	if err := os.MkdirAll(filepath.Join(codexDir, "skills"), cfg.DirMode); err != nil {
		return fmt.Errorf("failed to create .codex/skills directory: %w", err)
	}
	if err := os.MkdirAll(filepath.Join(codexDir, "rules"), cfg.DirMode); err != nil {
		return fmt.Errorf("failed to create .codex/rules directory: %w", err)
	}

	// Create platforms/codex directory
	platformsCodexDir := filepath.Join(dest, "platforms", "codex")
	if err := os.MkdirAll(platformsCodexDir, cfg.DirMode); err != nil {
		return fmt.Errorf("failed to create platforms/codex directory: %w", err)
	}
	if err := os.MkdirAll(filepath.Join(platformsCodexDir, "skills"), cfg.DirMode); err != nil {
		return fmt.Errorf("failed to create platforms/codex/skills directory: %w", err)
	}

	// 2. Generate config.toml
	if err := b.generateConfig(ctx, src, dest); err != nil {
		return fmt.Errorf("failed to generate config: %w", err)
	}

	// 3. Convert skills from .claude/skills/*.md to .codex/skills/<name>/SKILL.md
	if err := b.convertSkills(ctx, src, dest); err != nil {
		return fmt.Errorf("failed to convert skills: %w", err)
	}

	// 4. Copy execution policy rules
	if err := b.copyRules(ctx, src, dest); err != nil {
		return fmt.Errorf("failed to copy rules: %w", err)
	}

	// 5. Generate or update AGENTS.md
	if err := b.generateAgents(ctx, src, dest); err != nil {
		return fmt.Errorf("failed to generate AGENTS.md: %w", err)
	}

	return nil
}

// Validate checks if the generated configuration is valid.
func (b *Builder) Validate(dir string) (*platform.ValidationResult, error) {
	result := &platform.ValidationResult{
		Valid:    true,
		Errors:   make([]platform.ValidationError, 0),
		Warnings: make([]platform.ValidationWarning, 0),
	}

	// Check .codex/ directory exists
	codexDir := filepath.Join(dir, ".codex")
	if _, err := os.Stat(codexDir); os.IsNotExist(err) {
		result.Valid = false
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "MISSING_CODEX_DIR",
			Message: ".codex directory does not exist",
			File:    codexDir,
		})
		return result, nil
	}

	// Check platforms/codex/config.toml exists
	configPath := filepath.Join(dir, "platforms", "codex", "config.toml")
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		result.Valid = false
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "MISSING_CONFIG",
			Message: "platforms/codex/config.toml does not exist",
			File:    configPath,
		})
	}

	// Check skills directory exists
	skillsDir := filepath.Join(dir, "platforms", "codex", "skills")
	if _, err := os.Stat(skillsDir); os.IsNotExist(err) {
		result.Valid = false
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "MISSING_SKILLS_DIR",
			Message: "platforms/codex/skills directory does not exist",
			File:    skillsDir,
		})
	}

	// Verify skill source directory exists
	claudeSkillsDir := filepath.Join(dir, ".claude", "skills")
	if _, err := os.Stat(claudeSkillsDir); os.IsNotExist(err) {
		result.Warnings = append(result.Warnings, platform.ValidationWarning{
			Code:       "MISSING_SOURCE_SKILLS",
			Message:    ".claude/skills directory does not exist",
			File:       claudeSkillsDir,
			Suggestion: "Create .claude/skills directory and add skill files",
		})
	}

	return result, nil
}

// GetFiles returns a list of all files that would be generated.
func (b *Builder) GetFiles() []platform.FileEntry {
	return b.files
}

// GetMetrics returns metrics about the generated configuration.
func (b *Builder) GetMetrics() *platform.PlatformMetrics {
	return b.metrics
}

// generateConfig generates config.toml files.
func (b *Builder) generateConfig(ctx context.Context, src, dest string) error {
	// Implemented in config.go
	return generateConfigFiles(src, dest, b)
}

// convertSkills converts skills from flat to folder format.
func (b *Builder) convertSkills(ctx context.Context, src, dest string) error {
	// Implemented in skills.go
	converter := NewSkillConverter(
		filepath.Join(src, ".claude", "skills"),
		filepath.Join(dest, "platforms", "codex", "skills"),
	)
	count, err := converter.Convert()
	if err != nil {
		return err
	}
	b.metrics.Skills = count
	return nil
}

// copyRules copies execution policy rules.
func (b *Builder) copyRules(ctx context.Context, src, dest string) error {
	// Implemented in rules.go
	copier := NewRulesCopier(
		filepath.Join(src, "platforms", "codex", "rules"),
		filepath.Join(dest, ".codex", "rules"),
	)
	count, err := copier.Copy()
	if err != nil {
		return err
	}
	b.metrics.Rules = count
	return nil
}

// generateAgents generates or updates AGENTS.md.
func (b *Builder) generateAgents(ctx context.Context, src, dest string) error {
	// Implemented in agents.go
	generator := NewAgentsGenerator(
		filepath.Join(src, ".claude", "agents"),
		filepath.Join(dest, "AGENTS.md"),
	)
	return generator.Generate()
}
