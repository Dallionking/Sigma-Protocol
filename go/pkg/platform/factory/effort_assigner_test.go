package factory

import (
	"testing"

	"github.com/dallionking/sigma-protocol/pkg/skill"
	"github.com/stretchr/testify/assert"
)

func TestEffortAssigner(t *testing.T) {
	assigner := NewEffortAssigner()

	tests := []struct {
		name       string
		skill      *skill.Skill
		wantEffort string
	}{
		{
			name: "architecture skill uses high effort",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "system-design",
					Tags: []string{"ARCHITECTURE"},
				},
			},
			wantEffort: EffortHigh,
		},
		{
			name: "planning skill uses high effort",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "sprint-planning",
					Tags: []string{"PLANNING"},
				},
			},
			wantEffort: EffortHigh,
		},
		{
			name: "security skill uses high effort",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "security-audit",
					Tags: []string{"SECURITY"},
				},
			},
			wantEffort: EffortHigh,
		},
		{
			name: "review skill uses high effort",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "code-review",
					Tags: []string{"REVIEW"},
				},
			},
			wantEffort: EffortHigh,
		},
		{
			name: "research skill uses high effort",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "market-research",
					Tags: []string{"RESEARCH"},
				},
			},
			wantEffort: EffortHigh,
		},
		{
			name: "analysis skill uses high effort",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "performance-analysis",
					Tags: []string{"ANALYSIS"},
				},
			},
			wantEffort: EffortHigh,
		},
		{
			name: "quick skill uses low effort",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "quick-fix",
					Tags: []string{"QUICK"},
				},
			},
			wantEffort: EffortLow,
		},
		{
			name: "formatting skill uses low effort",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "format-code",
					Tags: []string{"FORMATTING"},
				},
			},
			wantEffort: EffortLow,
		},
		{
			name: "simple skill uses low effort",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "simple-task",
					Tags: []string{"SIMPLE"},
				},
			},
			wantEffort: EffortLow,
		},
		{
			name: "utility skill uses low effort",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "helper-util",
					Tags: []string{"UTILITY"},
				},
			},
			wantEffort: EffortLow,
		},
		{
			name: "step skill uses medium effort",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "step-1-ideation",
					Tags: []string{},
				},
			},
			wantEffort: EffortMedium,
		},
		{
			name: "default skill uses medium effort",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "general-dev",
					Tags: []string{},
				},
			},
			wantEffort: EffortMedium,
		},
		{
			name: "case insensitive tag matching",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "arch-review",
					Tags: []string{"architecture"},
				},
			},
			wantEffort: EffortHigh,
		},
		{
			name: "priority order - security beats quick",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "quick-security-scan",
					Tags: []string{"SECURITY", "QUICK"},
				},
			},
			wantEffort: EffortHigh, // Security is checked before QUICK
		},
		{
			name: "priority order - architecture beats step",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "step-2-architecture",
					Tags: []string{"ARCHITECTURE"},
				},
			},
			wantEffort: EffortHigh,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := assigner.AssignEffort(tt.skill)
			assert.Equal(t, tt.wantEffort, got)
		})
	}
}

func TestEffortAssigner_AddRule(t *testing.T) {
	assigner := NewEffortAssigner()

	// Add custom rule: skills with "experimental" tag use low effort
	assigner.AddRule(func(s *skill.Skill) bool {
		return hasTagCI(s, "EXPERIMENTAL")
	}, EffortLow)

	skill := &skill.Skill{
		Metadata: skill.SkillMetadata{
			Name: "experimental-feature",
			Tags: []string{"EXPERIMENTAL"},
		},
	}

	got := assigner.AssignEffort(skill)
	assert.Equal(t, EffortLow, got)
}

func TestEffortAssigner_AlignmentWithModelMapper(t *testing.T) {
	// Test that high-effort skills use opus, and low-effort skills use haiku
	// This ensures model and effort assignments are aligned

	assigner := NewEffortAssigner()
	mapper := NewModelMapper()

	// High effort skills should use opus
	highEffortSkill := &skill.Skill{
		Metadata: skill.SkillMetadata{
			Name: "architecture-design",
			Tags: []string{"ARCHITECTURE"},
		},
	}

	effort := assigner.AssignEffort(highEffortSkill)
	model := mapper.MapModel(highEffortSkill)

	assert.Equal(t, EffortHigh, effort)
	assert.Equal(t, ModelOpus, model)

	// Low effort skills should use haiku
	lowEffortSkill := &skill.Skill{
		Metadata: skill.SkillMetadata{
			Name: "quick-format",
			Tags: []string{"QUICK"},
		},
	}

	effort = assigner.AssignEffort(lowEffortSkill)
	model = mapper.MapModel(lowEffortSkill)

	assert.Equal(t, EffortLow, effort)
	assert.Equal(t, ModelHaiku, model)
}
