package factory

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// DroidConfig represents the .factory/.droid.yaml configuration file structure.
type DroidConfig struct {
	Review ReviewConfig `yaml:"review"`
}

// ReviewConfig contains Factory Droid review settings.
type ReviewConfig struct {
	AutoReview           AutoReviewConfig `yaml:"auto_review"`
	PRSummary            bool             `yaml:"pr_summary"`
	FileSummaries        bool             `yaml:"file_summaries"`
	Tips                 bool             `yaml:"tips"`
	GitHubActionRepair   bool             `yaml:"github_action_repair"`
}

// AutoReviewConfig contains automatic review trigger settings.
type AutoReviewConfig struct {
	Enabled bool `yaml:"enabled"`
	Draft   bool `yaml:"draft"`
	Bot     bool `yaml:"bot"`
}

// ConfigGenerator generates Factory Droid configuration files.
type ConfigGenerator struct{}

// NewConfigGenerator creates a new config generator.
func NewConfigGenerator() *ConfigGenerator {
	return &ConfigGenerator{}
}

// Generate creates a DroidConfig with default values.
//
// Default config values:
// - review.auto_review.enabled: true
// - review.auto_review.draft: false
// - review.auto_review.bot: false
// - review.pr_summary: true
// - review.file_summaries: true
// - review.tips: true
// - review.github_action_repair: true
func (g *ConfigGenerator) Generate() (*DroidConfig, error) {
	return &DroidConfig{
		Review: ReviewConfig{
			AutoReview: AutoReviewConfig{
				Enabled: true,
				Draft:   false,
				Bot:     false,
			},
			PRSummary:          true,
			FileSummaries:      true,
			Tips:               true,
			GitHubActionRepair: true,
		},
	}, nil
}

// Write writes the DroidConfig to a file with proper YAML formatting.
//
// Write workflow:
// 1. Marshal DroidConfig to YAML
// 2. Create .factory/ directory if missing
// 3. Write .factory/.droid.yaml with proper permissions
// 4. Return error if write fails
func (g *ConfigGenerator) Write(path string, config *DroidConfig) error {
	// Step 1: Marshal to YAML
	yamlBytes, err := yaml.Marshal(config)
	if err != nil {
		return fmt.Errorf("failed to marshal config to YAML: %w", err)
	}

	// Step 3: Write file with permissions 0644
	if err := os.WriteFile(path, yamlBytes, 0644); err != nil {
		return fmt.Errorf("failed to write config file %s: %w", path, err)
	}

	return nil
}
