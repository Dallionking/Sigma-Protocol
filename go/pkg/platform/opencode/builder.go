// Package opencode implements the OpenCode platform builder.
//
// OpenCode is an open-source alternative to Claude Code with:
// - Singular directory names (skill/, agent/ vs skills/, agents/)
// - Folder-based skill organization (skill/<name>/SKILL.md)
// - YAML configuration (config.yaml instead of settings.json)
// - Multi-provider model support
//
// This builder transforms .claude/ canonical format to OpenCode's structure.
package opencode

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"time"

	"github.com/dallionking/sigma-protocol/pkg/platform"
	"github.com/dallionking/sigma-protocol/pkg/skill"
	"gopkg.in/yaml.v3"
)

// Builder implements the PlatformBuilder interface for OpenCode.
type Builder struct {
	metrics *platform.PlatformMetrics
	files   []platform.FileEntry
}

// NewBuilder creates a new OpenCode platform builder.
func NewBuilder() *Builder {
	return &Builder{
		metrics: &platform.PlatformMetrics{
			Platform:    "opencode",
			GeneratedAt: time.Now(),
		},
		files: []platform.FileEntry{},
	}
}

// Name returns the platform name.
func (b *Builder) Name() string {
	return "opencode"
}

// Build generates the OpenCode platform configuration.
// src is the source directory containing .claude/ (the canonical source).
// dest is the destination directory where platform configs will be generated.
func (b *Builder) Build(ctx context.Context, src, dest string) error {
	// Reset metrics and files
	b.metrics = &platform.PlatformMetrics{
		Platform:    "opencode",
		GeneratedAt: time.Now(),
	}
	b.files = []platform.FileEntry{}

	// Verify source directory structure
	claudeDir := filepath.Join(src, ".claude")
	if _, err := os.Stat(claudeDir); os.IsNotExist(err) {
		return fmt.Errorf(".claude directory not found in source: %s", src)
	}

	// Create directory structure
	if err := b.createDirectories(dest); err != nil {
		return fmt.Errorf("failed to create directories: %w", err)
	}

	// Build skills
	if err := b.buildSkills(ctx, src, dest); err != nil {
		return fmt.Errorf("failed to build skills: %w", err)
	}

	// Build commands
	if err := b.buildCommands(ctx, src, dest); err != nil {
		return fmt.Errorf("failed to build commands: %w", err)
	}

	// Build agents
	if err := b.buildAgents(ctx, src, dest); err != nil {
		return fmt.Errorf("failed to build agents: %w", err)
	}

	// Generate config.yaml
	if err := b.generateConfig(dest); err != nil {
		return fmt.Errorf("failed to generate config: %w", err)
	}

	// Update total metrics
	b.metrics.TotalFiles = b.metrics.Skills + b.metrics.Commands + b.metrics.Agents + 1 // +1 for config.yaml

	return nil
}

// createDirectories creates the OpenCode directory structure with singular names.
func (b *Builder) createDirectories(dest string) error {
	cfg := platform.DefaultSecurityConfig()
	dirs := []string{
		filepath.Join(dest, ".opencode"),
		filepath.Join(dest, ".opencode", "skill"),    // Singular
		filepath.Join(dest, ".opencode", "agent"),    // Singular
		filepath.Join(dest, ".opencode", "commands"), // Plural (same as Claude Code)
	}

	for _, dir := range dirs {
		if err := os.MkdirAll(dir, cfg.DirMode); err != nil {
			return fmt.Errorf("failed to create directory %s: %w", dir, err)
		}
	}

	return nil
}

// buildSkills transforms flat .claude/skills/*.md files to OpenCode's folder structure.
func (b *Builder) buildSkills(ctx context.Context, src, dest string) error {
	skillsDir := filepath.Join(src, ".claude", "skills")

	// Load skills from canonical source
	result, err := skill.LoadDirectory(skillsDir)
	if err != nil {
		return fmt.Errorf("failed to load skills: %w", err)
	}

	// Report parse errors but continue with successful skills
	if len(result.Errors) > 0 {
		for _, parseErr := range result.Errors {
			fmt.Fprintf(os.Stderr, "Warning: %v\n", parseErr)
		}
	}

	cfg := platform.DefaultSecurityConfig()
	openCodeDir := filepath.Join(dest, ".opencode")

	// Process each skill
	for _, s := range result.Skills {
		// Check context cancellation
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		// Validate skill name to prevent path traversal
		if err := platform.ValidateFileName(s.Metadata.Name); err != nil {
			return fmt.Errorf("invalid skill name %s: %w", s.Metadata.Name, err)
		}

		// Create skill folder (skill/<name>/)
		// skill.Metadata.Name is already kebab-case from filename
		skillFolder := filepath.Join(dest, ".opencode", "skill", s.Metadata.Name)
		if err := os.MkdirAll(skillFolder, cfg.DirMode); err != nil {
			return fmt.Errorf("failed to create skill folder %s: %w", s.Metadata.Name, err)
		}

		// Write SKILL.md (all caps) with path validation
		skillPath := filepath.Join(skillFolder, "SKILL.md")
		if err := b.writeSkillFile(skillPath, s, openCodeDir, cfg); err != nil {
			return fmt.Errorf("failed to write skill %s: %w", s.Metadata.Name, err)
		}

		// Track file
		info, _ := os.Stat(skillPath)
		var size int64
		if info != nil {
			size = info.Size()
		}
		b.files = append(b.files, platform.FileEntry{
			Path:       filepath.Join(".opencode", "skill", s.Metadata.Name, "SKILL.md"),
			Type:       platform.FileTypeSkill,
			SourcePath: s.FilePath,
			Size:       size,
		})

		b.metrics.Skills++
		b.metrics.TotalBytes += size
	}

	return nil
}

// writeSkillFile reconstructs YAML frontmatter + markdown content exactly.
func (b *Builder) writeSkillFile(path string, s *skill.Skill, baseDir string, cfg *platform.SecurityConfig) error {
	var buf bytes.Buffer

	// Write YAML frontmatter
	buf.WriteString("---\n")

	// Marshal metadata to YAML
	yamlData, err := yaml.Marshal(&s.Metadata)
	if err != nil {
		return fmt.Errorf("failed to marshal skill metadata: %w", err)
	}
	buf.Write(yamlData)

	buf.WriteString("---\n\n")

	// Write markdown content
	buf.WriteString(s.Content)

	// Write with security validation
	return platform.SecureWriteFile(path, baseDir, buf.Bytes(), cfg)
}

// buildCommands copies .claude/commands/*.md files to .opencode/commands/.
func (b *Builder) buildCommands(ctx context.Context, src, dest string) error {
	commandsDir := filepath.Join(src, ".claude", "commands")
	destDir := filepath.Join(dest, ".opencode", "commands")

	// Check if commands directory exists
	if _, err := os.Stat(commandsDir); os.IsNotExist(err) {
		// Commands are optional
		return nil
	}

	cfg := platform.DefaultSecurityConfig()

	// Walk source commands directory
	err := filepath.Walk(commandsDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Check context cancellation
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		// Skip directories
		if info.IsDir() {
			return nil
		}

		// Only process .md files
		if filepath.Ext(path) != ".md" {
			return nil
		}

		// Copy file preserving filename with security validation
		filename := filepath.Base(path)
		destPath := filepath.Join(destDir, filename)

		if err := platform.SecureCopyFile(path, destPath, commandsDir, destDir, cfg); err != nil {
			return fmt.Errorf("failed to copy command %s: %w", filename, err)
		}

		// Track file
		b.files = append(b.files, platform.FileEntry{
			Path:       filepath.Join(".opencode", "commands", filename),
			Type:       platform.FileTypeCommand,
			SourcePath: path,
			Size:       info.Size(),
		})

		b.metrics.Commands++
		b.metrics.TotalBytes += info.Size()

		return nil
	})

	return err
}

// buildAgents copies .claude/agents/*.md files to .opencode/agent/ (singular directory).
func (b *Builder) buildAgents(ctx context.Context, src, dest string) error {
	agentsDir := filepath.Join(src, ".claude", "agents")
	destDir := filepath.Join(dest, ".opencode", "agent") // Singular

	// Check if agents directory exists
	if _, err := os.Stat(agentsDir); os.IsNotExist(err) {
		// Agents are optional
		return nil
	}

	cfg := platform.DefaultSecurityConfig()

	// Walk source agents directory
	err := filepath.Walk(agentsDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Check context cancellation
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		// Skip directories
		if info.IsDir() {
			return nil
		}

		// Only process .md files
		if filepath.Ext(path) != ".md" {
			return nil
		}

		// Copy file preserving filename with security validation
		filename := filepath.Base(path)
		destPath := filepath.Join(destDir, filename)

		if err := platform.SecureCopyFile(path, destPath, agentsDir, destDir, cfg); err != nil {
			return fmt.Errorf("failed to copy agent %s: %w", filename, err)
		}

		// Track file
		b.files = append(b.files, platform.FileEntry{
			Path:       filepath.Join(".opencode", "agent", filename),
			Type:       platform.FileTypeAgent,
			SourcePath: path,
			Size:       info.Size(),
		})

		b.metrics.Agents++
		b.metrics.TotalBytes += info.Size()

		return nil
	})

	return err
}

// OpenCodeConfig represents the .opencode/config.yaml structure.
type OpenCodeConfig struct {
	Model    string          `yaml:"model"`
	Skills   SkillsConfig    `yaml:"skills"`
	Agents   AgentsConfig    `yaml:"agents,omitempty"`
	Commands CommandsConfig  `yaml:"commands,omitempty"`
	Features FeaturesConfig  `yaml:"features,omitempty"`
}

// SkillsConfig configures skill loading.
type SkillsConfig struct {
	Enabled bool   `yaml:"enabled"`
	Path    string `yaml:"path"`
}

// AgentsConfig configures agent loading.
type AgentsConfig struct {
	Enabled bool   `yaml:"enabled"`
	Path    string `yaml:"path"`
}

// CommandsConfig configures command loading.
type CommandsConfig struct {
	Enabled bool   `yaml:"enabled"`
	Path    string `yaml:"path"`
}

// FeaturesConfig defines feature flags.
type FeaturesConfig struct {
	Plugins         bool `yaml:"plugins,omitempty"`
	CompactionHooks bool `yaml:"compaction_hooks,omitempty"`
}

// generateConfig creates .opencode/config.yaml with default settings.
func (b *Builder) generateConfig(dest string) error {
	config := OpenCodeConfig{
		Model: "claude-sonnet-4-20250514", // Default model
		Skills: SkillsConfig{
			Enabled: true,
			Path:    ".opencode/skill/",
		},
		Agents: AgentsConfig{
			Enabled: true,
			Path:    ".opencode/agent/",
		},
		Commands: CommandsConfig{
			Enabled: true,
			Path:    ".opencode/commands/",
		},
		Features: FeaturesConfig{
			Plugins:         true,
			CompactionHooks: true,
		},
	}

	// Marshal to YAML
	data, err := yaml.Marshal(&config)
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	// Write to .opencode/config.yaml with security validation
	cfg := platform.DefaultSecurityConfig()
	openCodeDir := filepath.Join(dest, ".opencode")
	configPath := filepath.Join(openCodeDir, "config.yaml")
	if err := platform.SecureWriteFile(configPath, openCodeDir, data, cfg); err != nil {
		return fmt.Errorf("failed to write config: %w", err)
	}

	// Track file
	info, _ := os.Stat(configPath)
	var size int64
	if info != nil {
		size = info.Size()
	}
	b.files = append(b.files, platform.FileEntry{
		Path:       ".opencode/config.yaml",
		Type:       platform.FileTypeConfig,
		SourcePath: "",
		Size:       size,
	})
	b.metrics.TotalBytes += size

	return nil
}

// Validate checks if the generated configuration is valid.
func (b *Builder) Validate(dir string) (*platform.ValidationResult, error) {
	result := &platform.ValidationResult{
		Valid:     true,
		Timestamp: time.Now(),
	}

	openCodeDir := filepath.Join(dir, ".opencode")

	// Check .opencode directory exists
	if _, err := os.Stat(openCodeDir); os.IsNotExist(err) {
		result.Valid = false
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "MISSING_OPENCODE_DIR",
			Message: ".opencode directory not found",
			File:    openCodeDir,
		})
		return result, nil
	}

	// Validate directory structure
	if err := b.validateDirectoryStructure(dir, result); err != nil {
		return result, err
	}

	// Validate skill structure
	if err := b.validateSkillStructure(dir, result); err != nil {
		return result, err
	}

	// Validate config file
	if err := b.validateConfigFile(dir, result); err != nil {
		return result, err
	}

	// Set Valid to false if there are any errors
	if len(result.Errors) > 0 {
		result.Valid = false
	}

	return result, nil
}

// validateDirectoryStructure checks required directories exist.
func (b *Builder) validateDirectoryStructure(dir string, result *platform.ValidationResult) error {
	requiredDirs := []string{
		filepath.Join(dir, ".opencode", "skill"),
		filepath.Join(dir, ".opencode", "agent"),
		filepath.Join(dir, ".opencode", "commands"),
	}

	for _, reqDir := range requiredDirs {
		if _, err := os.Stat(reqDir); os.IsNotExist(err) {
			result.Valid = false
			result.Errors = append(result.Errors, platform.ValidationError{
				Code:    "MISSING_DIRECTORY",
				Message: fmt.Sprintf("missing required directory: %s", filepath.Base(reqDir)),
				File:    reqDir,
			})
		}
	}

	return nil
}

// validateSkillStructure checks skill folder organization.
func (b *Builder) validateSkillStructure(dir string, result *platform.ValidationResult) error {
	skillsDir := filepath.Join(dir, ".opencode", "skill")

	// Check if skills directory exists
	if _, err := os.Stat(skillsDir); os.IsNotExist(err) {
		return nil // Already caught by validateDirectoryStructure
	}

	// Read directory entries
	entries, err := os.ReadDir(skillsDir)
	if err != nil {
		return fmt.Errorf("failed to read skills directory %s: %w", skillsDir, err)
	}

	kebabPattern := regexp.MustCompile(`^[a-z0-9-]+$`)

	for _, entry := range entries {
		// Each entry should be a folder
		if !entry.IsDir() {
			result.Valid = false
			result.Errors = append(result.Errors, platform.ValidationError{
				Code:    "INVALID_SKILL_STRUCTURE",
				Message: fmt.Sprintf("validation error: expected folder, found file: %s (all skills must be in folders)", entry.Name()),
				File:    filepath.Join(skillsDir, entry.Name()),
			})
			continue
		}

		// Verify folder name is kebab-case
		if !kebabPattern.MatchString(entry.Name()) {
			result.Valid = false
			result.Errors = append(result.Errors, platform.ValidationError{
				Code:    "INVALID_FOLDER_NAME",
				Message: fmt.Sprintf("validation error: skill folder name must be kebab-case: %s", entry.Name()),
				File:    filepath.Join(skillsDir, entry.Name()),
			})
		}

		// Verify SKILL.md exists
		skillFile := filepath.Join(skillsDir, entry.Name(), "SKILL.md")
		if _, err := os.Stat(skillFile); os.IsNotExist(err) {
			result.Valid = false
			result.Errors = append(result.Errors, platform.ValidationError{
				Code:    "MISSING_SKILL_FILE",
				Message: fmt.Sprintf("validation error: missing SKILL.md in folder: %s (expected file: %s)", entry.Name(), skillFile),
				File:    filepath.Join(skillsDir, entry.Name()),
			})
		}
	}

	return nil
}

// validateConfigFile checks config.yaml exists and is valid.
func (b *Builder) validateConfigFile(dir string, result *platform.ValidationResult) error {
	configPath := filepath.Join(dir, ".opencode", "config.yaml")

	// Check file exists
	data, err := os.ReadFile(configPath)
	if err != nil {
		result.Valid = false
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "MISSING_CONFIG",
			Message: "config file not found",
			File:    configPath,
		})
		return nil
	}

	// Parse YAML
	var config OpenCodeConfig
	if err := yaml.Unmarshal(data, &config); err != nil {
		result.Valid = false
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "INVALID_CONFIG_YAML",
			Message: fmt.Sprintf("invalid YAML in config file: %v", err),
			File:    configPath,
		})
		return nil
	}

	// Validate required fields
	if config.Model == "" {
		result.Valid = false
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "MISSING_CONFIG_FIELD",
			Message: "config.yaml: model field is required",
			File:    configPath,
		})
	}

	return nil
}

// GetFiles returns a list of all files that would be generated.
func (b *Builder) GetFiles() []platform.FileEntry {
	return b.files
}

// GetMetrics returns metrics about the generated configuration.
func (b *Builder) GetMetrics() *platform.PlatformMetrics {
	return b.metrics
}


func init() {
	// Register the OpenCode builder with the global registry
	platform.DefaultRegistry.Register(NewBuilder())
}
