package codex

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/dallionking/sigma-protocol/pkg/platform"
)

// AgentsGenerator generates or updates AGENTS.md file.
type AgentsGenerator struct {
	sourceDir  string
	targetPath string
}

// NewAgentsGenerator creates a new agents generator.
func NewAgentsGenerator(sourceDir, targetPath string) *AgentsGenerator {
	return &AgentsGenerator{
		sourceDir:  sourceDir,
		targetPath: targetPath,
	}
}

// Generate generates or updates AGENTS.md.
func (a *AgentsGenerator) Generate() error {
	// Check if AGENTS.md already exists
	info, err := os.Stat(a.targetPath)
	if err == nil {
		// File exists - check if it has user content (size > 100 bytes)
		if info.Size() > 100 {
			// Preserve existing content
			return nil
		}
	}

	// Generate new AGENTS.md from template
	template := `# Sigma Protocol - Project Instructions

## Overview

This project uses the Sigma Protocol 13-step methodology for AI-assisted development.

## Build & Test

` + "```bash" + `
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
` + "```" + `

## Architecture Overview

[Generated from ARCHITECTURE.md if present]

## Security Guidelines

- Never commit .env files
- Use environment variables for secrets
- Run security audit before deployment

## Git Workflow

- Create feature branches from main
- Use conventional commits
- Require PR reviews before merge

## Available Agents

[Generated from .claude/agents/*.md summaries]
`

	// Write template to file using secure write
	cfg := platform.DefaultSecurityConfig()
	baseDir := filepath.Dir(a.targetPath)
	if err := platform.SecureWriteFile(a.targetPath, baseDir, []byte(template), cfg); err != nil {
		return fmt.Errorf("failed to write AGENTS.md: %w", err)
	}

	return nil
}

// appendAgentSummaries appends agent summaries from .claude/agents/*.md.
// This is optional and not implemented in the basic version.
func (a *AgentsGenerator) appendAgentSummaries() error {
	// Check if source directory exists
	if _, err := os.Stat(a.sourceDir); os.IsNotExist(err) {
		// Source directory doesn't exist - skip
		return nil
	}

	// Validate target path
	cfg := platform.DefaultSecurityConfig()
	baseDir := filepath.Dir(a.targetPath)
	if err := platform.ValidatePath(a.targetPath, baseDir, cfg); err != nil {
		return fmt.Errorf("invalid target path: %w", err)
	}

	// Scan for agent files
	entries, err := os.ReadDir(a.sourceDir)
	if err != nil {
		return fmt.Errorf("failed to read agents directory: %w", err)
	}

	// Build agent summaries
	summaries := "\n## Available Agents\n\n"
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		agentName := entry.Name()
		summaries += fmt.Sprintf("- %s\n", agentName)
	}

	// Append to file with secure permissions
	f, err := os.OpenFile(a.targetPath, os.O_APPEND|os.O_WRONLY, cfg.FileMode)
	if err != nil {
		return fmt.Errorf("failed to open AGENTS.md for appending: %w", err)
	}
	defer f.Close()

	if _, err := f.WriteString(summaries); err != nil {
		return fmt.Errorf("failed to append agent summaries: %w", err)
	}

	return nil
}
