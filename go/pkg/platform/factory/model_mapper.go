package factory

import (
	"strings"

	"github.com/dallionking/sigma-protocol/pkg/skill"
)

// ModelMapper determines which Claude model to use for each droid based on
// skill complexity, tags, and domain.
type ModelMapper struct {
	rules []ModelRule
}

// ModelRule represents a mapping rule from skill properties to Claude model.
type ModelRule struct {
	Matcher func(*skill.Skill) bool
	Model   string
}

// Factory Droid model names
const (
	ModelOpus   = "claude-opus-4-5-20251101"
	ModelSonnet = "claude-sonnet-4-5-20241022"
	ModelHaiku  = "claude-haiku-3-5-20250114"
)

// NewModelMapper creates a new model mapper with default rules.
//
// Default model rules (priority order):
// 1. If skill has tag "ARCHITECTURE" or "PLANNING" (case-insensitive) → opus
// 2. If skill has tag "SECURITY" or "REVIEW" (case-insensitive) → opus
// 3. If skill has tag "QUICK" or "FORMATTING" (case-insensitive) → haiku
// 4. If skill name contains "step-" (case-sensitive substring match) → sonnet
// 5. Default (no rules match) → sonnet
func NewModelMapper() *ModelMapper {
	m := &ModelMapper{
		rules: []ModelRule{},
	}

	// Rule 1: ARCHITECTURE or PLANNING → opus
	m.AddRule(func(s *skill.Skill) bool {
		return hasTagCI(s, "ARCHITECTURE") || hasTagCI(s, "PLANNING")
	}, ModelOpus)

	// Rule 2: SECURITY or REVIEW → opus
	m.AddRule(func(s *skill.Skill) bool {
		return hasTagCI(s, "SECURITY") || hasTagCI(s, "REVIEW")
	}, ModelOpus)

	// Rule 3: QUICK or FORMATTING → haiku
	m.AddRule(func(s *skill.Skill) bool {
		return hasTagCI(s, "QUICK") || hasTagCI(s, "FORMATTING")
	}, ModelHaiku)

	// Rule 4: step-* → sonnet
	m.AddRule(func(s *skill.Skill) bool {
		return strings.Contains(s.Metadata.Name, "step-")
	}, ModelSonnet)

	return m
}

// MapModel returns the appropriate Claude model for a skill.
// Evaluates rules in priority order and returns the first match,
// or sonnet as default.
func (m *ModelMapper) MapModel(s *skill.Skill) string {
	for _, rule := range m.rules {
		if rule.Matcher(s) {
			return rule.Model
		}
	}
	return ModelSonnet // Default
}

// AddRule adds a custom mapping rule.
// Rules are evaluated in the order they are added.
func (m *ModelMapper) AddRule(matcher func(*skill.Skill) bool, model string) {
	m.rules = append(m.rules, ModelRule{
		Matcher: matcher,
		Model:   model,
	})
}

// hasTagCI checks if a skill has a tag (case-insensitive).
func hasTagCI(s *skill.Skill, target string) bool {
	targetUpper := strings.ToUpper(target)
	for _, tag := range s.Metadata.Tags {
		if strings.ToUpper(tag) == targetUpper {
			return true
		}
	}
	return false
}
