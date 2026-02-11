package claude

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/dallionking/sigma-protocol/pkg/platform"
	"gopkg.in/yaml.v3"
)

// RuleMetadata represents the YAML frontmatter of a rule file.
type RuleMetadata struct {
	Paths []string `yaml:"paths,omitempty"`
}

// Rule represents a rule file with its metadata.
type Rule struct {
	Name     string
	Metadata RuleMetadata
	Content  string
	FilePath string
}

// copyRules copies rule files from source to destination.
func (b *Builder) copyRules(src, dest string) error {
	srcRulesDir := filepath.Join(src, ".claude/rules")
	destRulesDir := filepath.Join(dest, ".claude/rules")

	// Check if source rules directory exists
	if _, err := os.Stat(srcRulesDir); os.IsNotExist(err) {
		// Rules are optional, just skip
		return nil
	}

	// Discover rules
	rules, err := discoverRules(srcRulesDir)
	if err != nil {
		return fmt.Errorf("failed to discover rules: %w", err)
	}

	// Validate each rule
	for _, rule := range rules {
		if err := rule.Validate(); err != nil {
			return fmt.Errorf("rule %s validation failed: %w", rule.Name, err)
		}
	}

	// Only copy if source and dest are different
	if srcRulesDir != destRulesDir {
		// Create destination directory
		cfg := platform.DefaultSecurityConfig()
		if err := os.MkdirAll(destRulesDir, cfg.DirMode); err != nil {
			return fmt.Errorf("failed to create rules directory: %w", err)
		}

		// Copy each rule securely
		for _, rule := range rules {
			destPath := filepath.Join(destRulesDir, rule.Name)
			if err := platform.SecureCopyFile(rule.FilePath, destPath, srcRulesDir, destRulesDir, cfg); err != nil {
				return fmt.Errorf("failed to copy rule %s: %w", rule.Name, err)
			}
		}
	}

	b.metrics.Rules = len(rules)
	return nil
}

// discoverRules discovers all rule files in the source directory.
func discoverRules(sourceDir string) ([]*Rule, error) {
	var rules []*Rule

	// Find all .md files
	files, err := filepath.Glob(filepath.Join(sourceDir, "*.md"))
	if err != nil {
		return nil, fmt.Errorf("failed to glob rule files: %w", err)
	}

	for _, file := range files {
		rule, err := parseRule(file)
		if err != nil {
			return nil, fmt.Errorf("failed to parse rule %s: %w", file, err)
		}
		rules = append(rules, rule)
	}

	return rules, nil
}

// parseRule parses a rule file and extracts its metadata.
func parseRule(path string) (*Rule, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	rule := &Rule{
		Name:     filepath.Base(path),
		FilePath: path,
		Content:  string(content),
	}

	// Extract frontmatter (optional for rules)
	if strings.HasPrefix(string(content), "---") {
		parts := strings.SplitN(string(content), "---", 3)
		if len(parts) >= 3 {
			// Parse YAML frontmatter
			if err := yaml.Unmarshal([]byte(parts[1]), &rule.Metadata); err != nil {
				return nil, fmt.Errorf("failed to parse frontmatter: %w", err)
			}
		}
	}

	return rule, nil
}

// Validate validates the rule metadata.
func (r *Rule) Validate() error {
	// Rules don't have required fields, but we can validate path patterns if present
	for _, path := range r.Metadata.Paths {
		if path == "" {
			return fmt.Errorf("path pattern cannot be empty")
		}
	}
	return nil
}

// validateRules validates all rule files in the directory.
func validateRules(dir string, result *platform.ValidationResult) error {
	// Check if rules directory exists
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		// Rules are optional
		result.Warnings = append(result.Warnings, platform.ValidationWarning{
			Code:    "MISSING_RULES_DIR",
			Message: "rules directory not found (optional)",
			File:    dir,
		})
		return nil
	}

	// Find all rule files
	files, err := filepath.Glob(filepath.Join(dir, "*.md"))
	if err != nil {
		return fmt.Errorf("failed to glob rule files: %w", err)
	}

	// Validate each rule
	for _, file := range files {
		rule, err := parseRule(file)
		if err != nil {
			result.Errors = append(result.Errors, platform.ValidationError{
				Code:    "INVALID_RULE",
				Message: fmt.Sprintf("failed to parse rule: %v", err),
				File:    file,
			})
			continue
		}

		if err := rule.Validate(); err != nil {
			result.Errors = append(result.Errors, platform.ValidationError{
				Code:    "INVALID_RULE_METADATA",
				Message: err.Error(),
				File:    file,
			})
		}
	}

	return nil
}
