// Package factory provides the Factory Droid platform builder implementation.
// Factory Droid is an AI-powered code review and automation platform with 7M token
// session support, model routing (reasoningEffort), and GitHub workflow integration.
package factory

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/dallionking/sigma-protocol/pkg/platform"
	"github.com/dallionking/sigma-protocol/pkg/skill"
)

// Builder implements the PlatformBuilder interface for Factory Droid.
// It transforms Sigma Protocol skills into Factory Droid "droid" files
// (Markdown with YAML frontmatter) and generates the .factory/ configuration directory.
type Builder struct {
	transformer *Transformer
	validator   *Validator
	writer      *Writer
	metrics     *platform.PlatformMetrics
	files       []platform.FileEntry
}

// NewBuilder creates a new Factory Droid platform builder.
func NewBuilder() *Builder {
	return &Builder{
		transformer: NewTransformer(),
		validator:   NewValidator(),
		writer:      nil, // initialized in Build with output directory
		metrics: &platform.PlatformMetrics{
			Platform:    "factory",
			GeneratedAt: time.Now(),
		},
		files: []platform.FileEntry{},
	}
}

// Build generates the Factory Droid platform configuration from source to destination.
// src is the source directory containing .claude/ (the canonical source).
// dest is the destination directory where platform configs will be generated.
//
// Build workflow:
// 1. Load all skills from src/.claude/skills/
// 2. Transform each skill to droid format (Transformer)
// 3. Validate droid YAML against schema (Validator)
// 4. Generate .factory/ directory with .droid.yaml
// 5. Generate platforms/factory-droid/droids/ with all droid files
// 6. Generate platforms/factory-droid/README.md
// 7. Collect build metrics (skills processed, files written, errors)
// 8. Return error if any critical failures
func (b *Builder) Build(ctx context.Context, src, dest string) error {
	// Reset metrics and files for new build
	b.metrics = &platform.PlatformMetrics{
		Platform:    "factory",
		GeneratedAt: time.Now(),
	}
	b.files = []platform.FileEntry{}

	// Step 1: Load all skills from src/.claude/skills/
	skillsDir := filepath.Join(src, ".claude", "skills")
	result, err := skill.LoadDirectoryParallel(skillsDir, 8)
	if err != nil {
		return fmt.Errorf("failed to load skills from %s: %w", skillsDir, err)
	}

	// Log parse errors but continue
	if len(result.Errors) > 0 {
		fmt.Fprintf(os.Stderr, "Warning: %d skills failed to parse\n", len(result.Errors))
		for _, err := range result.Errors {
			fmt.Fprintf(os.Stderr, "  - %v\n", err)
		}
	}

	if len(result.Skills) == 0 {
		return fmt.Errorf("no skills found in %s", skillsDir)
	}

	b.metrics.Skills = len(result.Skills)

	// Step 2: Transform skills to droids
	droids, transformErrors := b.transformer.TransformBatch(result.Skills)
	if len(transformErrors) > 0 {
		fmt.Fprintf(os.Stderr, "Warning: %d skills failed to transform\n", len(transformErrors))
		for _, err := range transformErrors {
			fmt.Fprintf(os.Stderr, "  - %v\n", err)
		}
	}

	if len(droids) == 0 {
		return fmt.Errorf("no droids generated from %d skills", len(result.Skills))
	}

	// Step 3: Validate all droids
	validationErrors := b.validator.ValidateBatch(droids)
	if len(validationErrors) > 0 {
		fmt.Fprintf(os.Stderr, "Warning: %d droids failed validation\n", len(validationErrors))
		for _, err := range validationErrors {
			fmt.Fprintf(os.Stderr, "  - %v\n", err)
		}
	}

	// Step 4: Generate .factory/ directory with .droid.yaml
	factoryDir := filepath.Join(dest, ".factory")
	if err := os.MkdirAll(factoryDir, 0755); err != nil {
		return fmt.Errorf("failed to create .factory directory: %w", err)
	}

	configGen := NewConfigGenerator()
	config, err := configGen.Generate()
	if err != nil {
		return fmt.Errorf("failed to generate config: %w", err)
	}

	configPath := filepath.Join(factoryDir, ".droid.yaml")
	if err := configGen.Write(configPath, config); err != nil {
		return fmt.Errorf("failed to write config: %w", err)
	}

	b.files = append(b.files, platform.FileEntry{
		Path:       ".factory/.droid.yaml",
		Type:       platform.FileTypeConfig,
		SourcePath: "",
		Size:       0, // Will be calculated after write
	})

	// Step 5: Generate platforms/factory-droid/droids/ with all droid files
	droidsDir := filepath.Join(dest, "platforms", "factory-droid", "droids")
	if err := os.MkdirAll(droidsDir, 0755); err != nil {
		return fmt.Errorf("failed to create droids directory: %w", err)
	}

	b.writer = NewWriter(droidsDir)
	writeResult, err := b.writer.WriteBatch(droids)
	if err != nil {
		return fmt.Errorf("failed to write droids: %w", err)
	}

	if len(writeResult.Errors) > 0 {
		fmt.Fprintf(os.Stderr, "Warning: %d droids failed to write\n", len(writeResult.Errors))
		for _, err := range writeResult.Errors {
			fmt.Fprintf(os.Stderr, "  - %v\n", err)
		}
	}

	// Add droid files to file list
	for _, droid := range droids {
		filename := fmt.Sprintf("%s.md", droid.Frontmatter.Name)
		b.files = append(b.files, platform.FileEntry{
			Path:       filepath.Join("platforms", "factory-droid", "droids", filename),
			Type:       platform.FileTypeSkill,
			SourcePath: "", // Would need to track from skill
			Size:       0,  // Will be calculated after write
		})
	}

	// Step 6: Generate platforms/factory-droid/README.md
	readmeGen := NewReadmeGenerator("1.0.0", len(droids))
	readmeContent, err := readmeGen.Generate()
	if err != nil {
		return fmt.Errorf("failed to generate README: %w", err)
	}

	readmePath := filepath.Join(dest, "platforms", "factory-droid", "README.md")
	if err := os.WriteFile(readmePath, []byte(readmeContent), 0644); err != nil {
		return fmt.Errorf("failed to write README: %w", err)
	}

	b.files = append(b.files, platform.FileEntry{
		Path:       "platforms/factory-droid/README.md",
		Type:       platform.FileTypeOther,
		SourcePath: "",
		Size:       int64(len(readmeContent)),
	})

	// Step 7: Collect build metrics
	b.metrics.TotalFiles = len(b.files)
	b.metrics.TotalBytes = 0
	for _, f := range b.files {
		b.metrics.TotalBytes += f.Size
	}

	fmt.Printf("Factory Droid build complete:\n")
	fmt.Printf("  - Skills processed: %d\n", b.metrics.Skills)
	fmt.Printf("  - Droids generated: %d\n", len(droids))
	fmt.Printf("  - Files written: %d (skipped: %d)\n", writeResult.FilesWritten, writeResult.FilesSkipped)
	fmt.Printf("  - Total files: %d\n", b.metrics.TotalFiles)

	return nil
}

// Validate checks if the generated configuration is valid.
// Returns a ValidationResult with any errors or warnings found.
//
// Validate workflow:
// 1. Check that source skills directory exists
// 2. Verify at least 1 skill file exists
// 3. Validate output directories are writable
func (b *Builder) Validate(dir string) (*platform.ValidationResult, error) {
	result := &platform.ValidationResult{
		Valid:     true,
		Errors:    []platform.ValidationError{},
		Warnings:  []platform.ValidationWarning{},
		Timestamp: time.Now(),
	}

	// Check skills directory exists
	skillsDir := filepath.Join(dir, ".claude", "skills")
	if _, err := os.Stat(skillsDir); os.IsNotExist(err) {
		result.Valid = false
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "SKILLS_DIR_NOT_FOUND",
			Message: fmt.Sprintf("Skills directory not found: %s", skillsDir),
			File:    skillsDir,
		})
		return result, nil
	}

	// Verify at least 1 skill file exists
	skillResult, err := skill.LoadDirectory(skillsDir)
	if err != nil {
		result.Valid = false
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "SKILLS_LOAD_FAILED",
			Message: fmt.Sprintf("Failed to load skills: %v", err),
			File:    skillsDir,
		})
		return result, nil
	}

	if len(skillResult.Skills) == 0 {
		result.Valid = false
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "NO_SKILLS_FOUND",
			Message: fmt.Sprintf("No skill files found in %s", skillsDir),
			File:    skillsDir,
		})
		return result, nil
	}

	// Check output directories are writable
	testDirs := []string{
		filepath.Join(dir, ".factory"),
		filepath.Join(dir, "platforms", "factory-droid"),
	}

	for _, testDir := range testDirs {
		if err := os.MkdirAll(testDir, 0755); err != nil {
			result.Valid = false
			result.Errors = append(result.Errors, platform.ValidationError{
				Code:    "OUTPUT_DIR_NOT_WRITABLE",
				Message: fmt.Sprintf("Cannot create output directory: %s", testDir),
				File:    testDir,
			})
		}
	}

	return result, nil
}

// GetFiles returns a list of all files that would be generated.
// Useful for dry-run and preview operations.
//
// GetFiles workflow:
// 1. Return list of files that will be generated
// 2. Include .factory/.droid.yaml
// 3. Include all droid files (derived from skill names)
// 4. Include README.md
func (b *Builder) GetFiles() []platform.FileEntry {
	return b.files
}

// GetMetrics returns metrics about the generated configuration.
// Includes counts of skills, agents, commands, etc.
func (b *Builder) GetMetrics() *platform.PlatformMetrics {
	return b.metrics
}

// Name returns the platform name ("factory").
func (b *Builder) Name() string {
	return "factory"
}
