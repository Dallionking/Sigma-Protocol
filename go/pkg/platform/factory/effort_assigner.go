package factory

import (
	"strings"

	"github.com/dallionking/sigma-protocol/pkg/skill"
)

// EffortAssigner determines the appropriate reasoningEffort value
// (low/medium/high) for each droid based on skill complexity and domain.
type EffortAssigner struct {
	rules []EffortRule
}

// EffortRule represents a mapping rule from skill properties to reasoningEffort.
type EffortRule struct {
	Matcher func(*skill.Skill) bool
	Effort  string
}

// Factory Droid reasoningEffort values
const (
	EffortLow    = "low"    // Quick responses, simple tasks (< 100 reasoning tokens)
	EffortMedium = "medium" // Balanced reasoning (100-500 tokens, default)
	EffortHigh   = "high"   // Deep analysis, complex architecture (500+ tokens)
)

// NewEffortAssigner creates a new effort assigner with default rules.
//
// Default effort rules (priority order):
// 1. If skill has tag "ARCHITECTURE" or "PLANNING" → high
// 2. If skill has tag "SECURITY" or "REVIEW" → high
// 3. If skill has tag "RESEARCH" or "ANALYSIS" → high
// 4. If skill has tag "QUICK" or "FORMATTING" → low
// 5. If skill has tag "SIMPLE" or "UTILITY" → low
// 6. If skill name contains "step-" (workflow steps) → medium
// 7. Default → medium
func NewEffortAssigner() *EffortAssigner {
	a := &EffortAssigner{
		rules: []EffortRule{},
	}

	// Rule 1: ARCHITECTURE or PLANNING → high
	a.AddRule(func(s *skill.Skill) bool {
		return hasTagCI(s, "ARCHITECTURE") || hasTagCI(s, "PLANNING")
	}, EffortHigh)

	// Rule 2: SECURITY or REVIEW → high
	a.AddRule(func(s *skill.Skill) bool {
		return hasTagCI(s, "SECURITY") || hasTagCI(s, "REVIEW")
	}, EffortHigh)

	// Rule 3: RESEARCH or ANALYSIS → high
	a.AddRule(func(s *skill.Skill) bool {
		return hasTagCI(s, "RESEARCH") || hasTagCI(s, "ANALYSIS")
	}, EffortHigh)

	// Rule 4: QUICK or FORMATTING → low
	a.AddRule(func(s *skill.Skill) bool {
		return hasTagCI(s, "QUICK") || hasTagCI(s, "FORMATTING")
	}, EffortLow)

	// Rule 5: SIMPLE or UTILITY → low
	a.AddRule(func(s *skill.Skill) bool {
		return hasTagCI(s, "SIMPLE") || hasTagCI(s, "UTILITY")
	}, EffortLow)

	// Rule 6: step-* → medium
	a.AddRule(func(s *skill.Skill) bool {
		return strings.Contains(s.Metadata.Name, "step-")
	}, EffortMedium)

	return a
}

// AssignEffort returns the appropriate reasoningEffort for a skill.
// Evaluates rules in priority order and returns the first match,
// or medium as default.
func (a *EffortAssigner) AssignEffort(s *skill.Skill) string {
	for _, rule := range a.rules {
		if rule.Matcher(s) {
			return rule.Effort
		}
	}
	return EffortMedium // Default
}

// AddRule adds a custom effort assignment rule.
// Rules are evaluated in the order they are added.
func (a *EffortAssigner) AddRule(matcher func(*skill.Skill) bool, effort string) {
	a.rules = append(a.rules, EffortRule{
		Matcher: matcher,
		Effort:  effort,
	})
}
