package factory

import (
	"testing"

	"github.com/dallionking/sigma-protocol/pkg/skill"
	"github.com/stretchr/testify/assert"
)

func TestSelectTools(t *testing.T) {
	selector := NewToolSelector()

	tests := []struct {
		name      string
		skill     *skill.Skill
		wantTools []string
	}{
		{
			name: "step skill with no special requirements",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name:        "step-1-ideation",
					Description: "Product ideation workflow",
				},
				Content: "Basic workflow content",
			},
			wantTools: []string{ToolRead, ToolBash},
		},
		{
			name: "audit skill that searches code",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name:        "security-audit",
					Description: "Search codebase for vulnerabilities",
					Globs:       []string{"*.go", "*.tsx"},
				},
				Content: "Find security issues",
			},
			wantTools: []string{ToolRead, ToolBash, ToolGlob, ToolGrep},
		},
		{
			name: "generator skill that creates files",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name:        "new-feature",
					Description: "Create new feature files",
				},
				Content: "Write new code",
			},
			wantTools: []string{ToolRead, ToolWrite, ToolBash},
		},
		{
			name: "dev skill that edits files",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name:        "refactor-code",
					Description: "Modify existing code structure",
				},
				Content: "Edit files to improve structure",
			},
			wantTools: []string{ToolRead, ToolEdit, ToolBash},
		},
		{
			name: "research skill with web fetch",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name:        "deep-research",
					Description: "Fetch web content and analyze",
				},
				Content: "Use web search to gather information",
			},
			wantTools: []string{ToolRead, ToolBash, ToolGrep, ToolWebFetch},
		},
		{
			name: "security skill with all tools",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name:        "security-review",
					Description: "Search and modify files for security",
					Globs:       []string{"*.go"},
				},
				Content: "Find vulnerabilities, edit code, create reports, fetch CVE data",
			},
			wantTools: []string{ToolRead, ToolWrite, ToolEdit, ToolBash, ToolGlob, ToolGrep, ToolWebFetch},
		},
		{
			name: "formatting skill (minimal tools)",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name:        "format-code",
					Description: "Format code style",
				},
				Content: "Apply formatting rules",
			},
			wantTools: []string{ToolRead, ToolBash},
		},
		{
			name: "glob field triggers Glob tool",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name:        "list-components",
					Description: "List React components",
					Globs:       []string{"*.tsx", "*.jsx"},
				},
				Content: "List all components",
			},
			wantTools: []string{ToolRead, ToolBash, ToolGlob},
		},
		{
			name: "multiple keywords trigger multiple tools",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name:        "migrate-api",
					Description: "Search APIs and create migration files",
				},
				Content: "Find all API calls, write migration scripts, edit configurations",
			},
			wantTools: []string{ToolRead, ToolWrite, ToolEdit, ToolBash, ToolGrep},
		},
		{
			name: "case insensitive keyword matching",
			skill: &skill.Skill{
				Metadata: skill.SkillMetadata{
					Name:        "UPDATE-docs",
					Description: "WRITE documentation and EDIT existing files",
				},
				Content: "SEARCH for outdated docs and CREATE new ones",
			},
			wantTools: []string{ToolRead, ToolWrite, ToolEdit, ToolBash, ToolGrep},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := selector.SelectTools(tt.skill)
			assert.ElementsMatch(t, tt.wantTools, got, "Tool selection mismatch")
		})
	}
}

func TestSelectTools_AlwaysIncludesBase(t *testing.T) {
	selector := NewToolSelector()

	skill := &skill.Skill{
		Metadata: skill.SkillMetadata{
			Name:        "minimal-skill",
			Description: "Minimal skill",
		},
		Content: "No special keywords",
	}

	tools := selector.SelectTools(skill)

	assert.Contains(t, tools, ToolRead, "Read should always be included")
	assert.Contains(t, tools, ToolBash, "Bash should always be included")
}

func TestSelectTools_Deduplication(t *testing.T) {
	selector := NewToolSelector()

	skill := &skill.Skill{
		Metadata: skill.SkillMetadata{
			Name:        "write-docs",
			Description: "Write documentation",
		},
		Content: "Write files and create new documentation",
	}

	tools := selector.SelectTools(skill)

	// Should only have Write once even though both "write" and "create" match
	writeCount := 0
	for _, tool := range tools {
		if tool == ToolWrite {
			writeCount++
		}
	}

	assert.Equal(t, 1, writeCount, "Write tool should appear only once")
}
