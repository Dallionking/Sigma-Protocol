package skill

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestParse(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		want    *Skill
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid skill with all fields",
			input: `---
name: test-skill
description: Test description
version: 1.0.0
globs: ["*.go", "*.md"]
triggers: ["test", "example"]
agent: sigma-backend-engineer
skills: [go-best-practices, tdd-skill-creation]
tags: [TEST, EXAMPLE]
source: test-source
sources: ["source1", "source2"]
---
# Test Content

This is the skill content.`,
			want: &Skill{
				Metadata: SkillMetadata{
					Name:        "test-skill",
					Description: "Test description",
					Version:     "1.0.0",
					Globs:       []string{"*.go", "*.md"},
					Triggers:    []string{"test", "example"},
					Agent:       "sigma-backend-engineer",
					Skills:      []string{"go-best-practices", "tdd-skill-creation"},
					Tags:        []string{"TEST", "EXAMPLE"},
					Source:      "test-source",
					Sources:     []string{"source1", "source2"},
				},
				Content: "# Test Content\n\nThis is the skill content.",
			},
			wantErr: false,
		},
		{
			name: "valid skill with minimal metadata",
			input: `---
name: minimal-skill
description: Minimal description
---
# Minimal Content`,
			want: &Skill{
				Metadata: SkillMetadata{
					Name:        "minimal-skill",
					Description: "Minimal description",
				},
				Content: "# Minimal Content",
			},
			wantErr: false,
		},
		{
			name: "missing frontmatter opening",
			input: `name: test-skill
description: Test description
---
# Content`,
			want:    nil,
			wantErr: true,
			errMsg:  "missing frontmatter opening delimiter",
		},
		{
			name: "missing frontmatter closing",
			input: `---
name: test-skill
description: Test description
# Missing closing delimiter
# Content`,
			want:    nil,
			wantErr: true,
			errMsg:  "missing frontmatter closing delimiter",
		},
		{
			name: "invalid YAML syntax",
			input: `---
name: test-skill
description: [unclosed bracket
---
# Content`,
			want:    nil,
			wantErr: true,
			errMsg:  "invalid YAML frontmatter",
		},
		{
			name: "missing required name field",
			input: `---
description: Test description
---
# Content`,
			want:    nil,
			wantErr: true,
			errMsg:  "missing required field 'name'",
		},
		{
			name: "missing required description field",
			input: `---
name: test-skill
---
# Content`,
			want:    nil,
			wantErr: true,
			errMsg:  "missing required field 'description'",
		},
		{
			name: "empty content after frontmatter",
			input: `---
name: test-skill
description: Test description
---`,
			want: &Skill{
				Metadata: SkillMetadata{
					Name:        "test-skill",
					Description: "Test description",
				},
				Content: "",
			},
			wantErr: false,
		},
		{
			name: "empty content with whitespace",
			input: `---
name: test-skill
description: Test description
---


`,
			want: &Skill{
				Metadata: SkillMetadata{
					Name:        "test-skill",
					Description: "Test description",
				},
				Content: "",
			},
			wantErr: false,
		},
		{
			name: "multi-line description",
			input: `---
name: test-skill
description: |
  This is a multi-line
  description that spans
  multiple lines.
---
# Content`,
			want: &Skill{
				Metadata: SkillMetadata{
					Name:        "test-skill",
					Description: "This is a multi-line\ndescription that spans\nmultiple lines.",
				},
				Content: "# Content",
			},
			wantErr: false,
		},
		{
			name: "special characters in metadata",
			input: `---
name: "skill-with-quotes"
description: "Description with \"quotes\" and 'apostrophes'"
triggers: ["test: colon", "test [brackets]", "test (parens)"]
---
# Content`,
			want: &Skill{
				Metadata: SkillMetadata{
					Name:        "skill-with-quotes",
					Description: "Description with \"quotes\" and 'apostrophes'",
					Triggers:    []string{"test: colon", "test [brackets]", "test (parens)"},
				},
				Content: "# Content",
			},
			wantErr: false,
		},
		{
			name: "empty arrays",
			input: `---
name: test-skill
description: Test description
globs: []
triggers: []
skills: []
tags: []
---
# Content`,
			want: &Skill{
				Metadata: SkillMetadata{
					Name:        "test-skill",
					Description: "Test description",
					Globs:       []string{},
					Triggers:    []string{},
					Skills:      []string{},
					Tags:        []string{},
				},
				Content: "# Content",
			},
			wantErr: false,
		},
		{
			name: "whitespace variations in frontmatter",
			input: `---
  name:   test-skill
  description:   Test description
  tags:
    - TAG1
    - TAG2
---
# Content`,
			want: &Skill{
				Metadata: SkillMetadata{
					Name:        "test-skill",
					Description: "Test description",
					Tags:        []string{"TAG1", "TAG2"},
				},
				Content: "# Content",
			},
			wantErr: false,
		},
		{
			name:    "empty file",
			input:   "",
			want:    nil,
			wantErr: true,
			errMsg:  "is empty",
		},
		{
			name: "only frontmatter no content",
			input: `---
name: test-skill
description: Test description
---`,
			want: &Skill{
				Metadata: SkillMetadata{
					Name:        "test-skill",
					Description: "Test description",
				},
				Content: "",
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create temp file with test input
			tmpDir := t.TempDir()
			tmpFile := filepath.Join(tmpDir, "test.skill")

			if err := os.WriteFile(tmpFile, []byte(tt.input), 0644); err != nil {
				t.Fatalf("Failed to create test file: %v", err)
			}

			// Parse the file
			got, err := Parse(tmpFile)

			// Check error expectation
			if (err != nil) != tt.wantErr {
				t.Errorf("Parse() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			// Check error message contains expected keywords
			if tt.wantErr && tt.errMsg != "" {
				if err == nil || !strings.Contains(err.Error(), tt.errMsg) {
					t.Errorf("Parse() error message = %v, want it to contain %q", err, tt.errMsg)
				}
				return
			}

			// Compare result if no error expected
			if !tt.wantErr {
				if got == nil {
					t.Fatal("Parse() returned nil, want non-nil Skill")
				}

				// Compare metadata fields
				if got.Metadata.Name != tt.want.Metadata.Name {
					t.Errorf("Parse() Name = %v, want %v", got.Metadata.Name, tt.want.Metadata.Name)
				}
				if got.Metadata.Description != tt.want.Metadata.Description {
					t.Errorf("Parse() Description = %v, want %v", got.Metadata.Description, tt.want.Metadata.Description)
				}
				if got.Metadata.Version != tt.want.Metadata.Version {
					t.Errorf("Parse() Version = %v, want %v", got.Metadata.Version, tt.want.Metadata.Version)
				}
				if got.Metadata.Agent != tt.want.Metadata.Agent {
					t.Errorf("Parse() Agent = %v, want %v", got.Metadata.Agent, tt.want.Metadata.Agent)
				}
				if got.Metadata.Source != tt.want.Metadata.Source {
					t.Errorf("Parse() Source = %v, want %v", got.Metadata.Source, tt.want.Metadata.Source)
				}

				// Compare slices
				if !stringSliceEqual(got.Metadata.Globs, tt.want.Metadata.Globs) {
					t.Errorf("Parse() Globs = %v, want %v", got.Metadata.Globs, tt.want.Metadata.Globs)
				}
				if !stringSliceEqual(got.Metadata.Triggers, tt.want.Metadata.Triggers) {
					t.Errorf("Parse() Triggers = %v, want %v", got.Metadata.Triggers, tt.want.Metadata.Triggers)
				}
				if !stringSliceEqual(got.Metadata.Skills, tt.want.Metadata.Skills) {
					t.Errorf("Parse() Skills = %v, want %v", got.Metadata.Skills, tt.want.Metadata.Skills)
				}
				if !stringSliceEqual(got.Metadata.Tags, tt.want.Metadata.Tags) {
					t.Errorf("Parse() Tags = %v, want %v", got.Metadata.Tags, tt.want.Metadata.Tags)
				}
				if !stringSliceEqual(got.Metadata.Sources, tt.want.Metadata.Sources) {
					t.Errorf("Parse() Sources = %v, want %v", got.Metadata.Sources, tt.want.Metadata.Sources)
				}

				// Compare content
				if got.Content != tt.want.Content {
					t.Errorf("Parse() Content = %q, want %q", got.Content, tt.want.Content)
				}

				// Check FilePath is set
				if got.FilePath != tmpFile {
					t.Errorf("Parse() FilePath = %v, want %v", got.FilePath, tmpFile)
				}
			}
		})
	}
}

// TestParseRealSkillFile tests parsing against an actual skill file
func TestParseRealSkillFile(t *testing.T) {
	// This test will be skipped if the skills directory doesn't exist
	skillsDir := filepath.Join("..", "..", ".claude", "skills")
	testFile := filepath.Join(skillsDir, "agentic-coding.md")

	if _, err := os.Stat(testFile); os.IsNotExist(err) {
		t.Skipf("Skipping real file test - skill file not found: %s", testFile)
	}

	skill, err := Parse(testFile)
	if err != nil {
		t.Fatalf("Parse() failed on real skill file: %v", err)
	}

	// Verify basic fields
	if skill.Metadata.Name == "" {
		t.Error("Parse() real skill file has empty name")
	}
	if skill.Metadata.Description == "" {
		t.Error("Parse() real skill file has empty description")
	}
	if skill.Content == "" {
		t.Error("Parse() real skill file has empty content")
	}
	if skill.FilePath != testFile {
		t.Errorf("Parse() FilePath = %v, want %v", skill.FilePath, testFile)
	}
}

// TestParseNonExistentFile tests error handling for missing files
func TestParseNonExistentFile(t *testing.T) {
	_, err := Parse("/nonexistent/file.skill")
	if err == nil {
		t.Error("Parse() expected error for non-existent file, got nil")
	}
	if !strings.Contains(err.Error(), "failed to open file") {
		t.Errorf("Parse() error = %v, want it to contain 'failed to open file'", err)
	}
}

// stringSliceEqual compares two string slices for equality
func stringSliceEqual(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}
