package hooks

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/BurntSushi/toml"
	"gopkg.in/yaml.v3"
)

// PlatformAdapter defines the interface for platform-specific hook registration
type PlatformAdapter interface {
	RegisterHooks(registry *HookRegistry, projectRoot string) error
	Name() string
}

// ClaudeCodeAdapter handles Claude Code settings.json format
type ClaudeCodeAdapter struct{}

func (a *ClaudeCodeAdapter) Name() string {
	return "claude-code"
}

func (a *ClaudeCodeAdapter) RegisterHooks(registry *HookRegistry, projectRoot string) error {
	// Generate settings.json (implemented in settings.go)
	return GenerateSettingsJSON(registry, projectRoot)
}

// CodexAdapter handles Codex TOML format
type CodexAdapter struct{}

func (a *CodexAdapter) Name() string {
	return "codex"
}

func (a *CodexAdapter) RegisterHooks(registry *HookRegistry, projectRoot string) error {
	configPath := filepath.Join(projectRoot, "platforms/codex/config.toml")

	// Check if Codex platform exists
	if _, err := os.Stat(filepath.Dir(configPath)); os.IsNotExist(err) {
		return nil // Silently skip if platform not present
	}

	// Load existing config
	config := &CodexConfig{}
	if data, err := os.ReadFile(configPath); err == nil {
		if err := toml.Unmarshal(data, config); err != nil {
			return fmt.Errorf("failed to parse config.toml: %w", err)
		}
	}

	// Clear existing hooks and rebuild
	config.Hooks = []CodexHook{}

	// Convert hooks to Codex format
	for _, hook := range registry.Hooks {
		// Skip lib/ helpers
		if hook.SubDir == "lib" {
			continue
		}

		codexHook := CodexHook{
			Event:    string(hook.Event),
			Script:   hook.DestPath,
			Required: hook.Required,
		}

		config.Hooks = append(config.Hooks, codexHook)
	}

	// Write back to config.toml
	file, err := os.Create(configPath)
	if err != nil {
		return fmt.Errorf("failed to create config.toml: %w", err)
	}
	defer file.Close()

	encoder := toml.NewEncoder(file)
	if err := encoder.Encode(config); err != nil {
		return fmt.Errorf("failed to write config.toml: %w", err)
	}

	return nil
}

// CodexConfig represents the Codex configuration structure
type CodexConfig struct {
	Hooks []CodexHook `toml:"hooks"`
	// Add other Codex config fields as needed
}

// CodexHook represents a hook in Codex TOML format
type CodexHook struct {
	Event    string `toml:"event"`
	Script   string `toml:"script"`
	Required bool   `toml:"required"`
}

// FactoryDroidAdapter handles Factory Droid YAML format
type FactoryDroidAdapter struct{}

func (a *FactoryDroidAdapter) Name() string {
	return "factory-droid"
}

func (a *FactoryDroidAdapter) RegisterHooks(registry *HookRegistry, projectRoot string) error {
	configPath := filepath.Join(projectRoot, ".factory/config.yaml")

	// Check if Factory Droid platform exists
	if _, err := os.Stat(filepath.Dir(configPath)); os.IsNotExist(err) {
		return nil // Silently skip if platform not present
	}

	// Load existing config
	config := &FactoryDroidConfig{}
	if data, err := os.ReadFile(configPath); err == nil {
		if err := yaml.Unmarshal(data, config); err != nil {
			return fmt.Errorf("failed to parse config.yaml: %w", err)
		}
	}

	// Clear existing hooks and rebuild
	config.Hooks = []FactoryDroidHook{}

	// Convert hooks to Factory Droid format
	for _, hook := range registry.Hooks {
		// Skip lib/ helpers
		if hook.SubDir == "lib" {
			continue
		}

		fdHook := FactoryDroidHook{
			Event:    string(hook.Event),
			Script:   hook.DestPath,
			Required: hook.Required,
		}

		config.Hooks = append(config.Hooks, fdHook)
	}

	// Write back to config.yaml
	data, err := yaml.Marshal(config)
	if err != nil {
		return fmt.Errorf("failed to marshal config.yaml: %w", err)
	}

	if err := os.WriteFile(configPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write config.yaml: %w", err)
	}

	return nil
}

// FactoryDroidConfig represents the Factory Droid configuration structure
type FactoryDroidConfig struct {
	Hooks []FactoryDroidHook `yaml:"hooks"`
	// Add other Factory Droid config fields as needed
}

// FactoryDroidHook represents a hook in Factory Droid YAML format
type FactoryDroidHook struct {
	Event    string `yaml:"event"`
	Script   string `yaml:"script"`
	Required bool   `yaml:"required"`
}

// GetAdapter returns the appropriate platform adapter for the given platform name
func GetAdapter(platform string) PlatformAdapter {
	switch platform {
	case "claude-code":
		return &ClaudeCodeAdapter{}
	case "codex":
		return &CodexAdapter{}
	case "factory-droid":
		return &FactoryDroidAdapter{}
	default:
		return nil
	}
}

// DetectPlatform attempts to detect which platform(s) are present in the project
func DetectPlatform(projectRoot string) []string {
	platforms := []string{}

	// Check for Claude Code
	if _, err := os.Stat(filepath.Join(projectRoot, ".claude")); err == nil {
		platforms = append(platforms, "claude-code")
	}

	// Check for Codex
	if _, err := os.Stat(filepath.Join(projectRoot, "platforms/codex")); err == nil {
		platforms = append(platforms, "codex")
	}

	// Check for Factory Droid
	if _, err := os.Stat(filepath.Join(projectRoot, ".factory")); err == nil {
		platforms = append(platforms, "factory-droid")
	}

	return platforms
}

// RegisterHooksForAllPlatforms registers hooks for all detected platforms
func RegisterHooksForAllPlatforms(registry *HookRegistry, projectRoot string) error {
	platforms := DetectPlatform(projectRoot)

	if len(platforms) == 0 {
		return fmt.Errorf("no supported platforms detected")
	}

	for _, platformName := range platforms {
		adapter := GetAdapter(platformName)
		if adapter == nil {
			continue
		}

		if err := adapter.RegisterHooks(registry, projectRoot); err != nil {
			return fmt.Errorf("failed to register hooks for %s: %w", platformName, err)
		}
	}

	return nil
}
