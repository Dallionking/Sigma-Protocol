package factory

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidator_Validate(t *testing.T) {
	validator := NewValidator()

	tests := []struct {
		name    string
		droid   *Droid
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid droid",
			droid: &Droid{
				Frontmatter: DroidFrontmatter{
					Name:            "test-droid",
					Description:     "Test droid description",
					Model:           ModelSonnet,
					ReasoningEffort: EffortMedium,
					Tools:           []string{ToolRead, ToolBash},
				},
				Content: "# Test Droid\n\nContent here",
			},
			wantErr: false,
		},
		{
			name:    "nil droid",
			droid:   nil,
			wantErr: true,
			errMsg:  "droid is nil",
		},
		{
			name: "empty name",
			droid: &Droid{
				Frontmatter: DroidFrontmatter{
					Name:            "",
					Description:     "Test",
					Model:           ModelSonnet,
					ReasoningEffort: EffortMedium,
					Tools:           []string{ToolRead},
				},
				Content: "Content",
			},
			wantErr: true,
			errMsg:  "field name: empty",
		},
		{
			name: "invalid name format",
			droid: &Droid{
				Frontmatter: DroidFrontmatter{
					Name:            "Invalid_Name",
					Description:     "Test",
					Model:           ModelSonnet,
					ReasoningEffort: EffortMedium,
					Tools:           []string{ToolRead},
				},
				Content: "Content",
			},
			wantErr: true,
			errMsg:  "field name: invalid format",
		},
		{
			name: "empty description",
			droid: &Droid{
				Frontmatter: DroidFrontmatter{
					Name:            "test-droid",
					Description:     "",
					Model:           ModelSonnet,
					ReasoningEffort: EffortMedium,
					Tools:           []string{ToolRead},
				},
				Content: "Content",
			},
			wantErr: true,
			errMsg:  "field description: empty",
		},
		{
			name: "description too long",
			droid: &Droid{
				Frontmatter: DroidFrontmatter{
					Name:            "test-droid",
					Description:     string(make([]byte, 201)), // 201 characters
					Model:           ModelSonnet,
					ReasoningEffort: EffortMedium,
					Tools:           []string{ToolRead},
				},
				Content: "Content",
			},
			wantErr: true,
			errMsg:  "field description: too long",
		},
		{
			name: "invalid model",
			droid: &Droid{
				Frontmatter: DroidFrontmatter{
					Name:            "test-droid",
					Description:     "Test",
					Model:           "invalid-model",
					ReasoningEffort: EffortMedium,
					Tools:           []string{ToolRead},
				},
				Content: "Content",
			},
			wantErr: true,
			errMsg:  "field model: invalid model",
		},
		{
			name: "invalid reasoningEffort",
			droid: &Droid{
				Frontmatter: DroidFrontmatter{
					Name:            "test-droid",
					Description:     "Test",
					Model:           ModelSonnet,
					ReasoningEffort: "invalid",
					Tools:           []string{ToolRead},
				},
				Content: "Content",
			},
			wantErr: true,
			errMsg:  "field reasoningEffort: invalid value",
		},
		{
			name: "case sensitive reasoningEffort",
			droid: &Droid{
				Frontmatter: DroidFrontmatter{
					Name:            "test-droid",
					Description:     "Test",
					Model:           ModelSonnet,
					ReasoningEffort: "Medium", // Should be "medium"
					Tools:           []string{ToolRead},
				},
				Content: "Content",
			},
			wantErr: true,
			errMsg:  "field reasoningEffort: invalid value",
		},
		{
			name: "invalid tool",
			droid: &Droid{
				Frontmatter: DroidFrontmatter{
					Name:            "test-droid",
					Description:     "Test",
					Model:           ModelSonnet,
					ReasoningEffort: EffortMedium,
					Tools:           []string{ToolRead, "InvalidTool"},
				},
				Content: "Content",
			},
			wantErr: true,
			errMsg:  "field tools: invalid tool",
		},
		{
			name: "duplicate tools",
			droid: &Droid{
				Frontmatter: DroidFrontmatter{
					Name:            "test-droid",
					Description:     "Test",
					Model:           ModelSonnet,
					ReasoningEffort: EffortMedium,
					Tools:           []string{ToolRead, ToolBash, ToolRead},
				},
				Content: "Content",
			},
			wantErr: true,
			errMsg:  "field tools: duplicate tool",
		},
		{
			name: "empty content",
			droid: &Droid{
				Frontmatter: DroidFrontmatter{
					Name:            "test-droid",
					Description:     "Test",
					Model:           ModelSonnet,
					ReasoningEffort: EffortMedium,
					Tools:           []string{ToolRead},
				},
				Content: "",
			},
			wantErr: true,
			errMsg:  "field content: empty",
		},
		{
			name: "whitespace only content",
			droid: &Droid{
				Frontmatter: DroidFrontmatter{
					Name:            "test-droid",
					Description:     "Test",
					Model:           ModelSonnet,
					ReasoningEffort: EffortMedium,
					Tools:           []string{ToolRead},
				},
				Content: "   \n\t  ",
			},
			wantErr: true,
			errMsg:  "field content: empty",
		},
		{
			name: "model inherit is valid",
			droid: &Droid{
				Frontmatter: DroidFrontmatter{
					Name:            "test-droid",
					Description:     "Test",
					Model:           "inherit",
					ReasoningEffort: EffortMedium,
					Tools:           []string{ToolRead},
				},
				Content: "Content",
			},
			wantErr: false,
		},
		{
			name: "all models are valid",
			droid: &Droid{
				Frontmatter: DroidFrontmatter{
					Name:            "test-droid",
					Description:     "Test",
					Model:           ModelOpus,
					ReasoningEffort: EffortHigh,
					Tools:           []string{ToolRead, ToolWrite, ToolEdit, ToolBash, ToolGlob, ToolGrep, ToolWebFetch},
				},
				Content: "Content",
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.Validate(tt.droid)

			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestValidator_ValidateBatch(t *testing.T) {
	validator := NewValidator()

	droids := []*Droid{
		{
			Frontmatter: DroidFrontmatter{
				Name:            "valid-droid-1",
				Description:     "Valid droid 1",
				Model:           ModelSonnet,
				ReasoningEffort: EffortMedium,
				Tools:           []string{ToolRead},
			},
			Content: "Content 1",
		},
		{
			Frontmatter: DroidFrontmatter{
				Name:            "Invalid_Name",
				Description:     "Invalid name format",
				Model:           ModelSonnet,
				ReasoningEffort: EffortMedium,
				Tools:           []string{ToolRead},
			},
			Content: "Content 2",
		},
		{
			Frontmatter: DroidFrontmatter{
				Name:            "valid-droid-2",
				Description:     "Valid droid 2",
				Model:           ModelHaiku,
				ReasoningEffort: EffortLow,
				Tools:           []string{ToolRead, ToolBash},
			},
			Content: "Content 3",
		},
		{
			Frontmatter: DroidFrontmatter{
				Name:            "invalid-model",
				Description:     "Invalid model",
				Model:           "bad-model",
				ReasoningEffort: EffortMedium,
				Tools:           []string{ToolRead},
			},
			Content: "Content 4",
		},
	}

	errors := validator.ValidateBatch(droids)

	// Should have 2 errors (Invalid_Name and bad-model)
	assert.Len(t, errors, 2)

	// Check error messages
	assert.Contains(t, errors[0].Error(), "Invalid_Name")
	assert.Contains(t, errors[1].Error(), "invalid-model")
}
