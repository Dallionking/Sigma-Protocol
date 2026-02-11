package config

import (
	"fmt"
	"path/filepath"
	"strings"
)

// PlatformType represents supported platforms
type PlatformType string

const (
	PlatformClaude  PlatformType = "claude"
	PlatformCursor  PlatformType = "cursor"
	PlatformCodex   PlatformType = "codex"
	PlatformFactory PlatformType = "factory"
)

// PlatformLoader handles platform-specific configuration loading
type PlatformLoader struct {
	cfg *Config
}

// NewPlatformLoader creates a new platform configuration loader
func NewPlatformLoader(cfg *Config) *PlatformLoader {
	return &PlatformLoader{
		cfg: cfg,
	}
}

// GetPlatformConfig returns configuration for a specific platform
func (pl *PlatformLoader) GetPlatformConfig(platform PlatformType) (*PlatformConfig, error) {
	platformStr := string(platform)
	if cfg, ok := pl.cfg.Platforms[platformStr]; ok {
		return &cfg, nil
	}
	return nil, fmt.Errorf("platform '%s' not configured", platformStr)
}

// GetEnabledPlatforms returns all enabled platforms
func (pl *PlatformLoader) GetEnabledPlatforms() []PlatformType {
	var enabled []PlatformType
	for name, cfg := range pl.cfg.Platforms {
		if cfg.Enabled {
			enabled = append(enabled, PlatformType(name))
		}
	}
	return enabled
}

// GetSkillsPath returns the skills path for a platform
func (pl *PlatformLoader) GetSkillsPath(platform PlatformType) (string, error) {
	cfg, err := pl.GetPlatformConfig(platform)
	if err != nil {
		return "", err
	}
	return cfg.SkillsPath, nil
}

// GetCommandsPath returns the commands path for a platform
func (pl *PlatformLoader) GetCommandsPath(platform PlatformType) (string, error) {
	cfg, err := pl.GetPlatformConfig(platform)
	if err != nil {
		return "", err
	}
	return cfg.CommandsPath, nil
}

// GetAgentsPath returns the agents path for a platform
func (pl *PlatformLoader) GetAgentsPath(platform PlatformType) (string, error) {
	cfg, err := pl.GetPlatformConfig(platform)
	if err != nil {
		return "", err
	}
	return cfg.AgentsPath, nil
}

// GetOutputPath returns the output path for a platform
func (pl *PlatformLoader) GetOutputPath(platform PlatformType) (string, error) {
	cfg, err := pl.GetPlatformConfig(platform)
	if err != nil {
		return "", err
	}
	return cfg.OutputPath, nil
}

// GetCustomValue returns a custom configuration value for a platform
func (pl *PlatformLoader) GetCustomValue(platform PlatformType, key string) (interface{}, error) {
	cfg, err := pl.GetPlatformConfig(platform)
	if err != nil {
		return nil, err
	}
	if cfg.Custom == nil {
		return nil, fmt.Errorf("no custom configuration for platform '%s'", platform)
	}
	if val, ok := cfg.Custom[key]; ok {
		return val, nil
	}
	return nil, fmt.Errorf("custom key '%s' not found for platform '%s'", key, platform)
}

// ResolvePlatformPath resolves a platform-specific path
// It handles both absolute and relative paths, expanding relative paths
// from the platform's output path
func (pl *PlatformLoader) ResolvePlatformPath(platform PlatformType, path string) (string, error) {
	if filepath.IsAbs(path) {
		return path, nil
	}

	outputPath, err := pl.GetOutputPath(platform)
	if err != nil {
		return "", err
	}

	return filepath.Join(outputPath, path), nil
}

// ValidatePlatformConfig validates platform configuration
func (pl *PlatformLoader) ValidatePlatformConfig(platform PlatformType) error {
	cfg, err := pl.GetPlatformConfig(platform)
	if err != nil {
		return err
	}

	// Check required paths are set
	if cfg.SkillsPath == "" {
		return fmt.Errorf("platform '%s' missing skills_path", platform)
	}
	if cfg.OutputPath == "" {
		return fmt.Errorf("platform '%s' missing output_path", platform)
	}

	return nil
}

// GetPlatformFileExtension returns the file extension for a platform
func (pl *PlatformLoader) GetPlatformFileExtension(platform PlatformType) string {
	switch platform {
	case PlatformClaude:
		return ".md"
	case PlatformCursor:
		return ".mdc"
	case PlatformCodex:
		return ".md"
	case PlatformFactory:
		return ".md"
	default:
		return ".md"
	}
}

// IsPlatformFile checks if a file belongs to a specific platform
// based on its path and extension
func (pl *PlatformLoader) IsPlatformFile(platform PlatformType, filePath string) bool {
	cfg, err := pl.GetPlatformConfig(platform)
	if err != nil {
		return false
	}

	// Check if path contains platform directories
	pathLower := strings.ToLower(filePath)

	if cfg.SkillsPath != "" && strings.Contains(pathLower, strings.ToLower(cfg.SkillsPath)) {
		return true
	}
	if cfg.CommandsPath != "" && strings.Contains(pathLower, strings.ToLower(cfg.CommandsPath)) {
		return true
	}
	if cfg.AgentsPath != "" && strings.Contains(pathLower, strings.ToLower(cfg.AgentsPath)) {
		return true
	}

	// Check file extension
	ext := filepath.Ext(filePath)
	expectedExt := pl.GetPlatformFileExtension(platform)
	return ext == expectedExt
}

// GetPlatformFromPath attempts to determine the platform from a file path
func (pl *PlatformLoader) GetPlatformFromPath(filePath string) (PlatformType, error) {
	for name := range pl.cfg.Platforms {
		platform := PlatformType(name)
		if pl.IsPlatformFile(platform, filePath) {
			return platform, nil
		}
	}
	return "", fmt.Errorf("could not determine platform from path: %s", filePath)
}
