// Package platform provides builders for generating AI coding platform configurations.
//
// Each platform (Claude Code, Codex, Factory Droid, OpenCode) implements the
// PlatformBuilder interface to generate its specific directory structure and
// configuration files.
package platform

import (
	"context"
	"time"
)

// PlatformBuilder defines the interface for generating platform-specific configurations.
// All platform builders (claude, codex, factory, opencode) implement this interface.
type PlatformBuilder interface {
	// Build generates the platform configuration from source to destination.
	// src is the source directory containing .claude/ (the canonical source).
	// dest is the destination directory where platform configs will be generated.
	Build(ctx context.Context, src, dest string) error

	// Validate checks if the generated configuration is valid.
	// Returns a ValidationResult with any errors or warnings found.
	Validate(dir string) (*ValidationResult, error)

	// GetFiles returns a list of all files that would be generated.
	// Useful for dry-run and preview operations.
	GetFiles() []FileEntry

	// GetMetrics returns metrics about the generated configuration.
	// Includes counts of skills, agents, commands, etc.
	GetMetrics() *PlatformMetrics

	// Name returns the platform name (e.g., "claude", "codex", "factory", "opencode").
	Name() string
}

// FileEntry represents a file to be generated.
type FileEntry struct {
	// Path is the relative path from the platform root (e.g., ".claude/skills/foo.md").
	Path string

	// Type indicates the file type for processing.
	Type FileType

	// SourcePath is the original source file path (if copied/transformed).
	SourcePath string

	// Size is the file size in bytes (0 if not yet generated).
	Size int64
}

// FileType indicates how a file should be processed.
type FileType string

const (
	// FileTypeConfig is a configuration file (settings.json, config.toml, etc.).
	FileTypeConfig FileType = "config"

	// FileTypeSkill is a skill definition file.
	FileTypeSkill FileType = "skill"

	// FileTypeAgent is an agent definition file.
	FileTypeAgent FileType = "agent"

	// FileTypeCommand is a command definition file.
	FileTypeCommand FileType = "command"

	// FileTypeRule is a rule/guideline file.
	FileTypeRule FileType = "rule"

	// FileTypeHook is a hook script file.
	FileTypeHook FileType = "hook"

	// FileTypeOther is any other file type.
	FileTypeOther FileType = "other"
)

// ValidationResult contains the results of validating a platform configuration.
type ValidationResult struct {
	// Valid is true if the configuration passed all validations.
	Valid bool

	// Errors contains any validation errors that should block usage.
	Errors []ValidationError

	// Warnings contains non-blocking issues that should be addressed.
	Warnings []ValidationWarning

	// Timestamp is when the validation was performed.
	Timestamp time.Time
}

// ValidationError represents a critical validation failure.
type ValidationError struct {
	// Code is a machine-readable error code.
	Code string

	// Message is a human-readable error description.
	Message string

	// File is the file where the error was found (if applicable).
	File string

	// Line is the line number where the error was found (if applicable).
	Line int
}

// ValidationWarning represents a non-critical issue.
type ValidationWarning struct {
	// Code is a machine-readable warning code.
	Code string

	// Message is a human-readable warning description.
	Message string

	// File is the file where the warning was found (if applicable).
	File string

	// Suggestion is a recommended fix for the warning.
	Suggestion string
}

// PlatformMetrics contains counts and statistics about a platform configuration.
type PlatformMetrics struct {
	// Platform is the platform name.
	Platform string

	// Skills is the number of skill files.
	Skills int

	// Agents is the number of agent files.
	Agents int

	// Commands is the number of command files.
	Commands int

	// Rules is the number of rule files.
	Rules int

	// Hooks is the number of hook files.
	Hooks int

	// TotalFiles is the total number of files.
	TotalFiles int

	// TotalBytes is the total size of all files.
	TotalBytes int64

	// GeneratedAt is when the metrics were calculated.
	GeneratedAt time.Time
}

// BuildOptions contains options for the Build operation.
type BuildOptions struct {
	// DryRun if true, don't write files, just return what would be written.
	DryRun bool

	// Force if true, overwrite existing files without prompting.
	Force bool

	// Verbose if true, log detailed progress information.
	Verbose bool

	// SkillFilter if set, only include skills matching this pattern.
	SkillFilter string

	// ExcludeHooks if true, don't generate hook files.
	ExcludeHooks bool
}

// Registry maintains a list of available platform builders.
type Registry struct {
	builders map[string]PlatformBuilder
}

// NewRegistry creates a new empty platform registry.
func NewRegistry() *Registry {
	return &Registry{
		builders: make(map[string]PlatformBuilder),
	}
}

// Register adds a platform builder to the registry.
func (r *Registry) Register(builder PlatformBuilder) {
	r.builders[builder.Name()] = builder
}

// Get retrieves a platform builder by name.
// Returns nil if the platform is not registered.
func (r *Registry) Get(name string) PlatformBuilder {
	return r.builders[name]
}

// List returns all registered platform names.
func (r *Registry) List() []string {
	names := make([]string, 0, len(r.builders))
	for name := range r.builders {
		names = append(names, name)
	}
	return names
}

// DefaultRegistry is the global registry of platform builders.
var DefaultRegistry = NewRegistry()
