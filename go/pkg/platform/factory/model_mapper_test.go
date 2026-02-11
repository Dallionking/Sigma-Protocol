package factory

import (
	"testing"

	"github.com/dallionking/sigma-protocol/pkg/skill"
	"github.com/stretchr/testify/assert"
)

func TestModelMapper(t *testing.T) {
	mapper := NewModelMapper()

	tests := []struct {
		name      string
		skill     *skill.Skill
		wantModel string
	}{
		{
			name: "architecture skill uses opus",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "system-design",
					Tags: []string{"ARCHITECTURE"},
				},
			},
			wantModel: ModelOpus,
		},
		{
			name: "planning skill uses opus",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "roadmap-planning",
					Tags: []string{"PLANNING"},
				},
			},
			wantModel: ModelOpus,
		},
		{
			name: "security skill uses opus",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "security-audit",
					Tags: []string{"SECURITY"},
				},
			},
			wantModel: ModelOpus,
		},
		{
			name: "review skill uses opus",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "code-review",
					Tags: []string{"REVIEW"},
				},
			},
			wantModel: ModelOpus,
		},
		{
			name: "quick skill uses haiku",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "format-code",
					Tags: []string{"QUICK"},
				},
			},
			wantModel: ModelHaiku,
		},
		{
			name: "formatting skill uses haiku",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "lint-fix",
					Tags: []string{"FORMATTING"},
				},
			},
			wantModel: ModelHaiku,
		},
		{
			name: "step skill uses sonnet",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "step-1-ideation",
					Tags: []string{},
				},
			},
			wantModel: ModelSonnet,
		},
		{
			name: "default skill uses sonnet",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "general-development",
					Tags: []string{},
				},
			},
			wantModel: ModelSonnet,
		},
		{
			name: "case insensitive tag matching - lowercase",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "system-arch",
					Tags: []string{"architecture"},
				},
			},
			wantModel: ModelOpus,
		},
		{
			name: "case insensitive tag matching - mixed",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "sec-review",
					Tags: []string{"Security"},
				},
			},
			wantModel: ModelOpus,
		},
		{
			name: "priority order - architecture beats step",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "step-2-architecture",
					Tags: []string{"ARCHITECTURE"},
				},
			},
			wantModel: ModelOpus,
		},
		{
			name: "multiple tags - first match wins",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name: "quick-security-check",
					Tags: []string{"SECURITY", "QUICK"},
				},
			},
			wantModel: ModelOpus, // Security is checked before QUICK
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := mapper.MapModel(tt.skill)
			assert.Equal(t, tt.wantModel, got)
		})
	}
}

func TestModelMapper_AddRule(t *testing.T) {
	mapper := NewModelMapper()

	// Add custom rule: skills with "experimental" tag use haiku
	mapper.AddRule(func(s *skill.Skill) bool {
		return hasTagCI(s, "EXPERIMENTAL")
	}, ModelHaiku)

	skill := &skill.Skill{
		Metadata: skill.SkillMetadata{
			Name: "experimental-feature",
			Tags: []string{"EXPERIMENTAL"},
		},
	}

	// Custom rule should match before architecture/security rules
	// But our custom rule is added AFTER default rules, so it won't match first
	// Let's test a skill that only has EXPERIMENTAL tag
	got := mapper.MapModel(skill)
	assert.Equal(t, ModelHaiku, got)
}

func TestHasTagCI(t *testing.T) {
	tests := []struct {
		name   string
		skill  *skill.Skill
		target string
		want   bool
	}{
		{
			name: "exact match uppercase",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Tags: []string{"SECURITY"},
				},
			},
			target: "SECURITY",
			want:   true,
		},
		{
			name: "case insensitive match",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Tags: []string{"security"},
				},
			},
			target: "SECURITY",
			want:   true,
		},
		{
			name: "mixed case match",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Tags: []string{"Security"},
				},
			},
			target: "SECURITY",
			want:   true,
		},
		{
			name: "no match",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Tags: []string{"OTHER"},
				},
			},
			target: "SECURITY",
			want:   false,
		},
		{
			name: "empty tags",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Tags: []string{},
				},
			},
			target: "SECURITY",
			want:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := hasTagCI(tt.skill, tt.target)
			assert.Equal(t, tt.want, got)
		})
	}
}
