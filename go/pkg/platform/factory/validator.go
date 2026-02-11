package factory

import (
	"fmt"
	"regexp"
	"strings"
)

// Validator validates droid frontmatter against Factory Droid schema.
type Validator struct {
	nameRegex *regexp.Regexp
}

// NewValidator creates a new droid validator.
func NewValidator() *Validator {
	return &Validator{
		nameRegex: regexp.MustCompile(`^[a-z0-9-]+$`),
	}
}

// Validate checks a droid against Factory Droid schema.
//
// Validate checks:
// 1. Name is non-empty and matches regex ^[a-z0-9-]+$ (kebab-case)
// 2. Description is non-empty and < 200 characters
// 3. Model is valid Factory Droid model name
// 4. ReasoningEffort is valid enum value exactly: "low", "medium", or "high"
// 5. Tools list contains only valid Factory Droid tool names
// 6. No duplicate tools in tools list
// 7. Content is non-empty
func (v *Validator) Validate(droid *Droid) error {
	if droid == nil {
		return fmt.Errorf("droid is nil")
	}

	// Check 1: Name format (kebab-case)
	if droid.Frontmatter.Name == "" {
		return fmt.Errorf("field name: empty. Expected: non-empty kebab-case string")
	}
	if !v.nameRegex.MatchString(droid.Frontmatter.Name) {
		return fmt.Errorf("field name: invalid format. Expected: kebab-case (^[a-z0-9-]+$), Got: %s", droid.Frontmatter.Name)
	}

	// Check 2: Description length
	if droid.Frontmatter.Description == "" {
		return fmt.Errorf("field description: empty. Expected: non-empty string (< 200 chars)")
	}
	if len(droid.Frontmatter.Description) > 200 {
		return fmt.Errorf("field description: too long. Expected: < 200 characters, Got: %d", len(droid.Frontmatter.Description))
	}

	// Check 3: Model is valid
	validModels := map[string]bool{
		ModelOpus:   true,
		ModelSonnet: true,
		ModelHaiku:  true,
		"inherit":   true,
	}
	if !validModels[droid.Frontmatter.Model] {
		return fmt.Errorf("field model: invalid model. Expected: one of [%s, %s, %s, inherit], Got: %s",
			ModelOpus, ModelSonnet, ModelHaiku, droid.Frontmatter.Model)
	}

	// Check 4: ReasoningEffort is valid (case-sensitive)
	validEfforts := map[string]bool{
		EffortLow:    true,
		EffortMedium: true,
		EffortHigh:   true,
	}
	if !validEfforts[droid.Frontmatter.ReasoningEffort] {
		return fmt.Errorf("field reasoningEffort: invalid value. Expected: one of [low, medium, high] (case-sensitive), Got: %s",
			droid.Frontmatter.ReasoningEffort)
	}

	// Check 5 & 6: Tools are valid and no duplicates
	validTools := map[string]bool{
		ToolRead:     true,
		ToolWrite:    true,
		ToolEdit:     true,
		ToolBash:     true,
		ToolGlob:     true,
		ToolGrep:     true,
		ToolWebFetch: true,
	}

	seenTools := make(map[string]bool)
	for _, tool := range droid.Frontmatter.Tools {
		// Check if valid tool
		if !validTools[tool] {
			return fmt.Errorf("field tools: invalid tool. Expected: one of [Read, Write, Edit, Bash, Glob, Grep, WebFetch], Got: %s", tool)
		}

		// Check for duplicates
		if seenTools[tool] {
			return fmt.Errorf("field tools: duplicate tool. Got: %s appears multiple times", tool)
		}
		seenTools[tool] = true
	}

	// Check 7: Content is non-empty
	if strings.TrimSpace(droid.Content) == "" {
		return fmt.Errorf("field content: empty. Expected: non-empty markdown content")
	}

	return nil
}

// ValidateBatch validates multiple droids and collects all errors.
// Returns all errors (doesn't stop on first).
func (v *Validator) ValidateBatch(droids []*Droid) []error {
	var errors []error

	for _, droid := range droids {
		if err := v.Validate(droid); err != nil {
			errors = append(errors, fmt.Errorf("droid %s: %w", droid.Frontmatter.Name, err))
		}
	}

	return errors
}
