package codex

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/dallionking/sigma-protocol/pkg/platform"
)

// SkillConverter converts skills from Claude Code flat format to Codex folder format.
type SkillConverter struct {
	sourceDir string
	targetDir string
}

// SkillValidationResult represents the validation result for a single skill.
type SkillValidationResult struct {
	SkillName string
	Valid     bool
	Errors    []string
}

// NewSkillConverter creates a new skill converter.
func NewSkillConverter(sourceDir, targetDir string) *SkillConverter {
	return &SkillConverter{
		sourceDir: sourceDir,
		targetDir: targetDir,
	}
}

// Convert converts all skills from source to target.
// Returns the count of skills converted and any errors.
func (s *SkillConverter) Convert() (int, error) {
	// Get security config for consistent permissions
	cfg := platform.DefaultSecurityConfig()

	// Create target directory with secure permissions
	if err := os.MkdirAll(s.targetDir, cfg.DirMode); err != nil {
		return 0, fmt.Errorf("failed to create target directory: %w", err)
	}

	// Check source directory exists
	if _, err := os.Stat(s.sourceDir); os.IsNotExist(err) {
		// Source directory doesn't exist - this is OK, just no skills to convert
		return 0, nil
	}

	// Scan source directory for .md files
	entries, err := os.ReadDir(s.sourceDir)
	if err != nil {
		return 0, fmt.Errorf("failed to read source directory: %w", err)
	}

	count := 0
	var errors []error

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".md") {
			continue
		}

		sourcePath := filepath.Join(s.sourceDir, entry.Name())
		if err := s.convertSkill(sourcePath, cfg); err != nil {
			errors = append(errors, fmt.Errorf("failed to convert %s: %w", entry.Name(), err))
			continue
		}
		count++
	}

	if len(errors) > 0 {
		return count, fmt.Errorf("encountered %d errors during conversion: %v", len(errors), errors)
	}

	return count, nil
}

// convertSkill converts a single skill file.
func (s *SkillConverter) convertSkill(sourcePath string, cfg *platform.SecurityConfig) error {
	// Extract skill name from filename (remove .md extension)
	filename := filepath.Base(sourcePath)
	skillName := strings.TrimSuffix(filename, ".md")
	skillName = normalizeSkillName(skillName)

	// Validate skill name to prevent path traversal
	if err := platform.ValidateFileName(skillName); err != nil {
		return fmt.Errorf("invalid skill name %s: %w", skillName, err)
	}

	// Validate source path is within source directory
	if err := platform.ValidatePath(sourcePath, s.sourceDir, cfg); err != nil {
		return fmt.Errorf("invalid source path: %w", err)
	}

	// Check file size before reading
	info, err := os.Stat(sourcePath)
	if err != nil {
		return fmt.Errorf("failed to stat source file: %w", err)
	}
	if info.Size() > cfg.MaxFileSize {
		return fmt.Errorf("file exceeds maximum size (%d > %d)", info.Size(), cfg.MaxFileSize)
	}

	// Read source file
	content, err := os.ReadFile(sourcePath)
	if err != nil {
		return fmt.Errorf("failed to read source file: %w", err)
	}

	// Create target directory with secure permissions
	targetSkillDir := filepath.Join(s.targetDir, skillName)
	if err := os.MkdirAll(targetSkillDir, cfg.DirMode); err != nil {
		return fmt.Errorf("failed to create skill directory: %w", err)
	}

	// Write SKILL.md using secure write
	targetPath := filepath.Join(targetSkillDir, "SKILL.md")
	if err := platform.SecureWriteFile(targetPath, s.targetDir, content, cfg); err != nil {
		return fmt.Errorf("failed to write SKILL.md: %w", err)
	}

	return nil
}

// normalizeSkillName converts skill name to kebab-case.
func normalizeSkillName(name string) string {
	// Already in kebab-case format from filename
	// Just ensure lowercase and valid characters
	name = strings.ToLower(name)
	// Replace any invalid characters with hyphens
	name = strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			return r
		}
		return '-'
	}, name)
	return name
}

// Validate validates all converted skills.
func (s *SkillConverter) Validate() ([]SkillValidationResult, error) {
	// Scan target directory for skill folders
	entries, err := os.ReadDir(s.targetDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read target directory: %w", err)
	}

	results := make([]SkillValidationResult, 0)

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		skillPath := filepath.Join(s.targetDir, entry.Name())
		result := validateSkillFolder(skillPath)
		results = append(results, result)
	}

	return results, nil
}

// validateSkillFolder validates a single skill folder.
func validateSkillFolder(skillPath string) SkillValidationResult {
	skillName := filepath.Base(skillPath)
	result := SkillValidationResult{
		SkillName: skillName,
		Valid:     true,
		Errors:    make([]string, 0),
	}

	// Check folder name is valid (kebab-case)
	if !isValidSkillName(skillName) {
		result.Valid = false
		result.Errors = append(result.Errors, "invalid skill name format (must be kebab-case)")
	}

	// Check SKILL.md exists
	skillMdPath := filepath.Join(skillPath, "SKILL.md")
	info, err := os.Stat(skillMdPath)
	if err != nil {
		result.Valid = false
		result.Errors = append(result.Errors, "SKILL.md does not exist")
		return result
	}

	// Check SKILL.md is readable
	if !info.Mode().IsRegular() {
		result.Valid = false
		result.Errors = append(result.Errors, "SKILL.md is not a regular file")
		return result
	}

	// Check file permissions
	if info.Mode().Perm() != 0644 {
		result.Valid = false
		result.Errors = append(result.Errors, fmt.Sprintf("incorrect permissions (expected 0644, got %o)", info.Mode().Perm()))
	}

	// Read and validate frontmatter
	content, err := os.ReadFile(skillMdPath)
	if err != nil {
		result.Valid = false
		result.Errors = append(result.Errors, "SKILL.md is not readable")
		return result
	}

	// Check for YAML frontmatter (starts with ---)
	contentStr := string(content)
	if !strings.HasPrefix(contentStr, "---\n") && !strings.HasPrefix(contentStr, "---\r\n") {
		result.Valid = false
		result.Errors = append(result.Errors, "SKILL.md missing YAML frontmatter")
	}

	return result
}

// isValidSkillName checks if a skill name is valid (kebab-case).
func isValidSkillName(name string) bool {
	if name == "" {
		return false
	}
	for _, r := range name {
		if !((r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-') {
			return false
		}
	}
	return true
}

// GetFiles returns the list of files that would be generated.
func (s *SkillConverter) GetFiles() []platform.FileEntry {
	files := make([]platform.FileEntry, 0)

	entries, err := os.ReadDir(s.sourceDir)
	if err != nil {
		return files
	}

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".md") {
			continue
		}

		skillName := strings.TrimSuffix(entry.Name(), ".md")
		skillName = normalizeSkillName(skillName)
		targetPath := filepath.Join(s.targetDir, skillName, "SKILL.md")

		files = append(files, platform.FileEntry{
			Path:       targetPath,
			Type:       platform.FileTypeSkill,
			SourcePath: filepath.Join(s.sourceDir, entry.Name()),
		})
	}

	return files
}
