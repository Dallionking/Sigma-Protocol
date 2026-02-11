// Package skill provides parsing and loading functionality for Sigma Protocol skill files.
// Skill files are Markdown documents with YAML frontmatter containing metadata.
package skill

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"gopkg.in/yaml.v3"
)

// SkillMetadata represents the YAML frontmatter of a skill file.
type SkillMetadata struct {
	Name        string   `yaml:"name"`
	Description string   `yaml:"description"`
	Version     string   `yaml:"version,omitempty"`
	Globs       []string `yaml:"globs,omitempty"`
	Triggers    []string `yaml:"triggers,omitempty"`
	Agent       string   `yaml:"agent,omitempty"`
	Skills      []string `yaml:"skills,omitempty"`
	Tags        []string `yaml:"tags,omitempty"`
	Source      string   `yaml:"source,omitempty"`
	Sources     []string `yaml:"sources,omitempty"`
}

// Skill represents a parsed skill file with metadata and content.
type Skill struct {
	Metadata SkillMetadata
	Content  string // Markdown content after frontmatter
	FilePath string
}

// Parse reads a skill file and extracts YAML frontmatter and Markdown content.
// It returns a Skill object or an error if parsing fails.
//
// The skill file must start with a YAML frontmatter block delimited by "---":
//
//	---
//	name: example-skill
//	description: Example skill
//	---
//	# Skill Content
//
// Parse handles the following error cases:
//   - Missing frontmatter delimiters
//   - Invalid YAML syntax
//   - Empty or missing required fields
func Parse(path string) (*Skill, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("failed to open file %s: %w", path, err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)

	// Check for opening frontmatter delimiter
	if !scanner.Scan() {
		return nil, fmt.Errorf("file %s is empty", path)
	}

	firstLine := strings.TrimSpace(scanner.Text())
	if firstLine != "---" {
		return nil, fmt.Errorf("file %s missing frontmatter opening delimiter (expected '---')", path)
	}

	// Read frontmatter until closing delimiter
	var frontmatterLines []string
	lineNum := 1
	foundClosing := false

	for scanner.Scan() {
		lineNum++
		line := scanner.Text()

		if strings.TrimSpace(line) == "---" {
			foundClosing = true
			break
		}

		frontmatterLines = append(frontmatterLines, line)
	}

	if !foundClosing {
		return nil, fmt.Errorf("file %s missing frontmatter closing delimiter (expected '---')", path)
	}

	// Parse YAML frontmatter
	frontmatterYAML := strings.Join(frontmatterLines, "\n")
	var metadata SkillMetadata

	if err := yaml.Unmarshal([]byte(frontmatterYAML), &metadata); err != nil {
		return nil, fmt.Errorf("file %s has invalid YAML frontmatter at line %d: %w", path, lineNum, err)
	}

	// Validate required fields
	if metadata.Name == "" {
		return nil, fmt.Errorf("file %s missing required field 'name' in frontmatter", path)
	}
	if metadata.Description == "" {
		return nil, fmt.Errorf("file %s missing required field 'description' in frontmatter", path)
	}

	// Read remaining content (Markdown)
	var contentLines []string
	for scanner.Scan() {
		contentLines = append(contentLines, scanner.Text())
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading file %s: %w", path, err)
	}

	content := strings.Join(contentLines, "\n")

	return &Skill{
		Metadata: metadata,
		Content:  strings.TrimSpace(content),
		FilePath: path,
	}, nil
}
