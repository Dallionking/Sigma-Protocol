// Package claude implements the Claude Code platform builder.
//
// Claude Code is the canonical source platform with the richest feature set:
// - Recursive skill reading from .claude/skills/
// - Agent teams with tool restrictions and memory scopes
// - Path-scoped rules
// - Hook system integration
// - MCP support
//
// This builder generates the complete .claude/ directory structure.
package claude

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/dallionking/sigma-protocol/pkg/hooks"
	"github.com/dallionking/sigma-protocol/pkg/platform"
)

// Builder implements the PlatformBuilder interface for Claude Code.
type Builder struct {
	metrics *platform.PlatformMetrics
}

// NewBuilder creates a new Claude Code platform builder.
func NewBuilder() *Builder {
	return &Builder{
		metrics: &platform.PlatformMetrics{
			Platform:    "claude",
			GeneratedAt: time.Now(),
		},
	}
}

// Name returns the platform name.
func (b *Builder) Name() string {
	return "claude"
}

// Build generates the Claude Code platform configuration.
// src is the source directory containing .claude/ (the canonical source).
// dest is the destination directory where platform configs will be generated.
func (b *Builder) Build(ctx context.Context, src, dest string) error {
	// Reset metrics
	b.metrics = &platform.PlatformMetrics{
		Platform:    "claude",
		GeneratedAt: time.Now(),
	}

	// Verify source directory structure
	claudeDir := filepath.Join(src, ".claude")
	if _, err := os.Stat(claudeDir); os.IsNotExist(err) {
		return fmt.Errorf(".claude directory not found in source: %s", src)
	}

	// Create destination .claude directory
	destClaudeDir := filepath.Join(dest, ".claude")
	if err := os.MkdirAll(destClaudeDir, 0755); err != nil {
		return fmt.Errorf("failed to create .claude directory: %w", err)
	}

	// 1. Verify skills directory exists
	if err := b.verifySkills(src); err != nil {
		return fmt.Errorf("skills verification failed: %w", err)
	}

	// 2. Copy commands
	if err := b.copyCommands(src, dest); err != nil {
		return fmt.Errorf("failed to copy commands: %w", err)
	}

	// 3. Copy agents
	if err := b.copyAgents(src, dest); err != nil {
		return fmt.Errorf("failed to copy agents: %w", err)
	}

	// 4. Copy rules
	if err := b.copyRules(src, dest); err != nil {
		return fmt.Errorf("failed to copy rules: %w", err)
	}

	// 5. Discover and integrate hooks
	hookRegistry, err := hooks.DiscoverHooks(src)
	if err != nil {
		return fmt.Errorf("failed to discover hooks: %w", err)
	}
	b.metrics.Hooks = len(hookRegistry.Hooks)

	// 6. Generate settings.json
	if err := b.generateSettings(dest, hookRegistry); err != nil {
		return fmt.Errorf("failed to generate settings.json: %w", err)
	}

	// Update total metrics
	b.metrics.TotalFiles = b.metrics.Skills + b.metrics.Commands + b.metrics.Agents + b.metrics.Rules + 1 // +1 for settings.json

	return nil
}

// Validate checks if the generated configuration is valid.
func (b *Builder) Validate(dir string) (*platform.ValidationResult, error) {
	result := &platform.ValidationResult{
		Valid:     true,
		Timestamp: time.Now(),
	}

	claudeDir := filepath.Join(dir, ".claude")

	// Check .claude directory exists
	if _, err := os.Stat(claudeDir); os.IsNotExist(err) {
		result.Valid = false
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "MISSING_CLAUDE_DIR",
			Message: ".claude directory not found",
			File:    claudeDir,
		})
		return result, nil
	}

	// Validate settings.json
	settingsPath := filepath.Join(claudeDir, "settings.json")
	if err := validateSettingsJSON(settingsPath, result); err != nil {
		return result, err
	}

	// Validate commands
	commandsDir := filepath.Join(claudeDir, "commands")
	if err := validateCommands(commandsDir, result); err != nil {
		return result, err
	}

	// Validate agents
	agentsDir := filepath.Join(claudeDir, "agents")
	if err := validateAgents(agentsDir, result); err != nil {
		return result, err
	}

	// Validate skills directory
	skillsDir := filepath.Join(claudeDir, "skills")
	if err := validateSkillsDirectory(skillsDir, result); err != nil {
		return result, err
	}

	// Validate rules
	rulesDir := filepath.Join(claudeDir, "rules")
	if err := validateRules(rulesDir, result); err != nil {
		return result, err
	}

	// Set Valid to false if there are any errors
	if len(result.Errors) > 0 {
		result.Valid = false
	}

	return result, nil
}

// GetFiles returns a list of all files that would be generated.
func (b *Builder) GetFiles() []platform.FileEntry {
	// This would typically be populated during Build()
	// For now, return a basic structure
	return []platform.FileEntry{
		{
			Path: ".claude/settings.json",
			Type: platform.FileTypeConfig,
		},
	}
}

// GetMetrics returns metrics about the generated configuration.
func (b *Builder) GetMetrics() *platform.PlatformMetrics {
	return b.metrics
}

// verifySkills verifies that the skills directory exists and contains skills.
func (b *Builder) verifySkills(src string) error {
	skillsDir := filepath.Join(src, ".claude/skills")

	// Check directory exists
	if _, err := os.Stat(skillsDir); os.IsNotExist(err) {
		return fmt.Errorf(".claude/skills directory not found")
	}

	// Count skills
	skills, err := filepath.Glob(filepath.Join(skillsDir, "*.md"))
	if err != nil {
		return err
	}

	if len(skills) == 0 {
		return fmt.Errorf("no skills found in .claude/skills/")
	}

	b.metrics.Skills = len(skills)
	return nil
}

func init() {
	// Register the Claude Code builder with the global registry
	platform.DefaultRegistry.Register(NewBuilder())
}
