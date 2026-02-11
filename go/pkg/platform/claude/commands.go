package claude

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/dallionking/sigma-protocol/pkg/platform"
	"gopkg.in/yaml.v3"
)

// CommandMetadata represents the YAML frontmatter of a command file.
type CommandMetadata struct {
	Description  string   `yaml:"description"`
	AllowedTools []string `yaml:"allowed-tools,omitempty"`
	Category     string   `yaml:"category,omitempty"`
	Hidden       bool     `yaml:"hidden,omitempty"`
}

// Command represents a command file with its metadata.
type Command struct {
	Name     string
	Metadata CommandMetadata
	Content  string
	FilePath string
}

// copyCommands copies command files from source to destination.
func (b *Builder) copyCommands(src, dest string) error {
	srcCommandsDir := filepath.Join(src, ".claude/commands")
	destCommandsDir := filepath.Join(dest, ".claude/commands")

	// Check if source commands directory exists
	if _, err := os.Stat(srcCommandsDir); os.IsNotExist(err) {
		// Commands are optional, just skip
		return nil
	}

	// Discover commands
	commands, err := discoverCommands(srcCommandsDir)
	if err != nil {
		return fmt.Errorf("failed to discover commands: %w", err)
	}

	// Validate each command
	for _, cmd := range commands {
		if err := cmd.Validate(); err != nil {
			return fmt.Errorf("command %s validation failed: %w", cmd.Name, err)
		}
	}

	// Only copy if source and dest are different
	if srcCommandsDir != destCommandsDir {
		// Create destination directory
		cfg := platform.DefaultSecurityConfig()
		if err := os.MkdirAll(destCommandsDir, cfg.DirMode); err != nil {
			return fmt.Errorf("failed to create commands directory: %w", err)
		}

		// Copy each command securely
		for _, cmd := range commands {
			destPath := filepath.Join(destCommandsDir, cmd.Name)
			if err := platform.SecureCopyFile(cmd.FilePath, destPath, srcCommandsDir, destCommandsDir, cfg); err != nil {
				return fmt.Errorf("failed to copy command %s: %w", cmd.Name, err)
			}
		}
	}

	b.metrics.Commands = len(commands)
	return nil
}

// discoverCommands discovers all command files in the source directory.
func discoverCommands(sourceDir string) ([]*Command, error) {
	var commands []*Command

	// Find all .md files
	files, err := filepath.Glob(filepath.Join(sourceDir, "*.md"))
	if err != nil {
		return nil, fmt.Errorf("failed to glob command files: %w", err)
	}

	for _, file := range files {
		cmd, err := parseCommand(file)
		if err != nil {
			return nil, fmt.Errorf("failed to parse command %s: %w", file, err)
		}
		commands = append(commands, cmd)
	}

	return commands, nil
}

// parseCommand parses a command file and extracts its metadata.
func parseCommand(path string) (*Command, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	cmd := &Command{
		Name:     filepath.Base(path),
		FilePath: path,
		Content:  string(content),
	}

	// Extract frontmatter
	if strings.HasPrefix(string(content), "---") {
		parts := strings.SplitN(string(content), "---", 3)
		if len(parts) >= 3 {
			// Parse YAML frontmatter
			if err := yaml.Unmarshal([]byte(parts[1]), &cmd.Metadata); err != nil {
				return nil, fmt.Errorf("failed to parse frontmatter: %w", err)
			}
		}
	}

	return cmd, nil
}

// Validate validates the command metadata.
func (c *Command) Validate() error {
	if c.Metadata.Description == "" {
		return fmt.Errorf("description is required")
	}
	return nil
}

// validateCommands validates all command files in the directory.
func validateCommands(dir string, result *platform.ValidationResult) error {
	// Check if commands directory exists
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		// Commands are optional
		result.Warnings = append(result.Warnings, platform.ValidationWarning{
			Code:    "MISSING_COMMANDS_DIR",
			Message: "commands directory not found (optional)",
			File:    dir,
		})
		return nil
	}

	// Find all command files
	files, err := filepath.Glob(filepath.Join(dir, "*.md"))
	if err != nil {
		return fmt.Errorf("failed to glob command files: %w", err)
	}

	// Validate each command
	for _, file := range files {
		cmd, err := parseCommand(file)
		if err != nil {
			result.Errors = append(result.Errors, platform.ValidationError{
				Code:    "INVALID_COMMAND",
				Message: fmt.Sprintf("failed to parse command: %v", err),
				File:    file,
			})
			continue
		}

		if err := cmd.Validate(); err != nil {
			result.Errors = append(result.Errors, platform.ValidationError{
				Code:    "INVALID_COMMAND_METADATA",
				Message: err.Error(),
				File:    file,
			})
		}
	}

	return nil
}

