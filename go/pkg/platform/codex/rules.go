package codex

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/dallionking/sigma-protocol/pkg/platform"
)

// RulesCopier copies execution policy rules from source to target.
type RulesCopier struct {
	sourceDir string
	targetDir string
}

// RuleValidationResult represents the validation result for a single rule file.
type RuleValidationResult struct {
	FileName string
	Valid    bool
	Errors   []string
}

// NewRulesCopier creates a new rules copier.
func NewRulesCopier(sourceDir, targetDir string) *RulesCopier {
	return &RulesCopier{
		sourceDir: sourceDir,
		targetDir: targetDir,
	}
}

// Copy copies all .rules files from source to target.
// Returns the count of files copied and any errors.
func (r *RulesCopier) Copy() (int, error) {
	// Create target directory
	if err := os.MkdirAll(r.targetDir, 0755); err != nil {
		return 0, fmt.Errorf("failed to create target directory: %w", err)
	}

	// Check source directory exists
	if _, err := os.Stat(r.sourceDir); os.IsNotExist(err) {
		return 0, fmt.Errorf("source directory does not exist: %s", r.sourceDir)
	}

	// Scan source directory for .rules files
	entries, err := os.ReadDir(r.sourceDir)
	if err != nil {
		return 0, fmt.Errorf("failed to read source directory: %w", err)
	}

	count := 0
	var errors []error

	cfg := platform.DefaultSecurityConfig()

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".rules") {
			continue
		}

		sourcePath := filepath.Join(r.sourceDir, entry.Name())
		targetPath := filepath.Join(r.targetDir, entry.Name())

		if err := platform.SecureCopyFile(sourcePath, targetPath, r.sourceDir, r.targetDir, cfg); err != nil {
			errors = append(errors, fmt.Errorf("failed to copy %s: %w", entry.Name(), err))
			continue
		}
		count++
	}

	if len(errors) > 0 {
		return count, fmt.Errorf("encountered %d errors during copy: %v", len(errors), errors)
	}

	return count, nil
}


// Validate validates all copied rules files.
func (r *RulesCopier) Validate() ([]RuleValidationResult, error) {
	// Scan target directory for .rules files
	entries, err := os.ReadDir(r.targetDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read target directory: %w", err)
	}

	results := make([]RuleValidationResult, 0)

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".rules") {
			continue
		}

		rulePath := filepath.Join(r.targetDir, entry.Name())
		result := validateRuleFile(rulePath)
		results = append(results, result)
	}

	return results, nil
}

// validateRuleFile validates a single rule file.
func validateRuleFile(rulePath string) RuleValidationResult {
	fileName := filepath.Base(rulePath)
	result := RuleValidationResult{
		FileName: fileName,
		Valid:    true,
		Errors:   make([]string, 0),
	}

	// Check file exists
	info, err := os.Stat(rulePath)
	if err != nil {
		result.Valid = false
		result.Errors = append(result.Errors, "file does not exist")
		return result
	}

	// Check file is readable
	if !info.Mode().IsRegular() {
		result.Valid = false
		result.Errors = append(result.Errors, "not a regular file")
		return result
	}

	// Check file extension
	if !strings.HasSuffix(fileName, ".rules") {
		result.Valid = false
		result.Errors = append(result.Errors, "invalid file extension (expected .rules)")
	}

	// Check file is not empty
	if info.Size() == 0 {
		result.Valid = false
		result.Errors = append(result.Errors, "file is empty")
	}

	return result
}
