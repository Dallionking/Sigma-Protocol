package claude

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/dallionking/sigma-protocol/pkg/platform"
)

// validateSkillsDirectory validates that the skills directory exists and contains skills.
// Claude Code reads skills directly from .claude/skills/, so no copying is needed.
func validateSkillsDirectory(dir string, result *platform.ValidationResult) error {
	// Check directory exists
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "MISSING_SKILLS_DIR",
			Message: ".claude/skills directory not found",
			File:    dir,
		})
		return nil
	}

	// Count skills
	skills, err := filepath.Glob(filepath.Join(dir, "*.md"))
	if err != nil {
		return fmt.Errorf("failed to glob skill files: %w", err)
	}

	if len(skills) == 0 {
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "NO_SKILLS_FOUND",
			Message: "no skills found in .claude/skills/",
			File:    dir,
		})
		return nil
	}

	// Warn if skill count is unexpected (expected: 151)
	expectedSkillCount := 151
	if len(skills) != expectedSkillCount {
		result.Warnings = append(result.Warnings, platform.ValidationWarning{
			Code:       "SKILL_COUNT_MISMATCH",
			Message:    fmt.Sprintf("expected %d skills, found %d", expectedSkillCount, len(skills)),
			File:       dir,
			Suggestion: "verify that all skills are present",
		})
	}

	return nil
}
