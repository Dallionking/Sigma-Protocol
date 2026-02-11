package factory

import (
	"fmt"
	"strings"
	"sync"

	"github.com/dallionking/sigma-protocol/pkg/skill"
	"gopkg.in/yaml.v3"
)

// DroidFrontmatter represents the YAML frontmatter for a Factory Droid droid file.
type DroidFrontmatter struct {
	Name            string   `yaml:"name"`
	Description     string   `yaml:"description"`
	Model           string   `yaml:"model"`
	ReasoningEffort string   `yaml:"reasoningEffort"`
	Tools           []string `yaml:"tools"`
}

// Droid represents a complete Factory Droid droid file with frontmatter and content.
type Droid struct {
	Frontmatter DroidFrontmatter
	Content     string
}

// Transformer converts Skill structs to Factory Droid droid format.
type Transformer struct {
	modelMapper    *ModelMapper
	toolSelector   *ToolSelector
	effortAssigner *EffortAssigner
}

// NewTransformer creates a new droid transformer with default mappings.
func NewTransformer() *Transformer {
	return &Transformer{
		modelMapper:    NewModelMapper(),
		toolSelector:   NewToolSelector(),
		effortAssigner: NewEffortAssigner(),
	}
}

// Transform converts a single Skill to a Droid.
//
// Transform workflow:
// 1. Extract name and description from skill metadata
// 2. Map skill complexity to model (ModelMapper)
// 3. Assign reasoningEffort based on skill tags/complexity (EffortAssigner)
// 4. Select appropriate tools from skill globs/requirements (ToolSelector)
// 5. Build DroidFrontmatter struct
// 6. Marshal frontmatter to YAML
// 7. Combine frontmatter + skill content
// 8. Return Droid struct
func (t *Transformer) Transform(s *skill.Skill) (*Droid, error) {
	if s == nil {
		return nil, fmt.Errorf("skill is nil")
	}

	// Step 1: Extract name and description
	name := s.Metadata.Name
	description := s.Metadata.Description

	if name == "" {
		return nil, fmt.Errorf("skill missing name: %s", s.FilePath)
	}
	if description == "" {
		return nil, fmt.Errorf("skill missing description: %s", s.FilePath)
	}

	// Step 2: Map model
	model := t.modelMapper.MapModel(s)

	// Step 3: Assign reasoning effort
	effort := t.effortAssigner.AssignEffort(s)

	// Step 4: Select tools
	tools := t.toolSelector.SelectTools(s)

	// Step 5: Build frontmatter
	frontmatter := DroidFrontmatter{
		Name:            name,
		Description:     description,
		Model:           model,
		ReasoningEffort: effort,
		Tools:           tools,
	}

	// Step 6: Marshal frontmatter to YAML
	yamlBytes, err := yaml.Marshal(frontmatter)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal frontmatter for %s: %w", name, err)
	}

	// Step 7: Combine frontmatter + content
	var sb strings.Builder
	sb.WriteString("---\n")
	sb.Write(yamlBytes)
	sb.WriteString("---\n\n")
	sb.WriteString(s.Content)

	// Step 8: Return Droid
	return &Droid{
		Frontmatter: frontmatter,
		Content:     sb.String(),
	}, nil
}

// TransformBatch transforms multiple skills to droids in parallel.
//
// TransformBatch workflow:
// 1. Use goroutines to transform skills in parallel
// 2. Collect successes and errors separately
// 3. Return both slice (partial success pattern)
func (t *Transformer) TransformBatch(skills []*skill.Skill) ([]*Droid, []error) {
	var (
		droids []*Droid
		errors []error
		mu     sync.Mutex
		wg     sync.WaitGroup
	)

	// Create worker pool
	workerCount := 8
	skillChan := make(chan *skill.Skill, len(skills))

	// Start workers
	for i := 0; i < workerCount; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			for s := range skillChan {
				droid, err := t.Transform(s)

				mu.Lock()
				if err != nil {
					errors = append(errors, err)
				} else {
					droids = append(droids, droid)
				}
				mu.Unlock()
			}
		}()
	}

	// Send skills to workers
	for _, s := range skills {
		skillChan <- s
	}
	close(skillChan)

	// Wait for all workers to finish
	wg.Wait()

	return droids, errors
}
