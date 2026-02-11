// Package config provides hierarchical configuration management using Viper.
// Configuration is loaded from multiple sources in the following order of precedence:
// 1. Command line flags (highest priority)
// 2. Environment variables
// 3. Project-level config file (.sigma/config.yaml)
// 4. User-level config file (~/.sigma/config.yaml)
// 5. Default values (lowest priority)
package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/viper"
)

// Config represents the application configuration
type Config struct {
	// Platforms defines platform-specific configurations
	Platforms map[string]PlatformConfig `mapstructure:"platforms"`

	// Validation controls schema validation behavior
	Validation ValidationConfig `mapstructure:"validation"`

	// Output controls output generation behavior
	Output OutputConfig `mapstructure:"output"`

	// Paths defines custom paths for skills, commands, etc.
	Paths PathsConfig `mapstructure:"paths"`
}

// PlatformConfig holds configuration for a specific platform
type PlatformConfig struct {
	// Enabled indicates if this platform is active
	Enabled bool `mapstructure:"enabled"`

	// SkillsPath is the path to platform skills
	SkillsPath string `mapstructure:"skills_path"`

	// CommandsPath is the path to platform commands
	CommandsPath string `mapstructure:"commands_path"`

	// AgentsPath is the path to platform agents
	AgentsPath string `mapstructure:"agents_path"`

	// OutputPath is where platform files will be generated
	OutputPath string `mapstructure:"output_path"`

	// Custom holds platform-specific custom settings
	Custom map[string]interface{} `mapstructure:"custom"`
}

// ValidationConfig controls schema validation
type ValidationConfig struct {
	// Enabled indicates if validation is active
	Enabled bool `mapstructure:"enabled"`

	// StrictMode fails on any validation error
	StrictMode bool `mapstructure:"strict_mode"`

	// SchemaPath is the path to JSON schema files
	SchemaPath string `mapstructure:"schema_path"`
}

// OutputConfig controls output generation
type OutputConfig struct {
	// Format specifies output format (json, yaml, toml)
	Format string `mapstructure:"format"`

	// Pretty enables pretty-printing
	Pretty bool `mapstructure:"pretty"`

	// DryRun prevents actual file writes
	DryRun bool `mapstructure:"dry_run"`
}

// PathsConfig defines custom paths
type PathsConfig struct {
	// SkillsDir is the base directory for skills
	SkillsDir string `mapstructure:"skills_dir"`

	// CommandsDir is the base directory for commands
	CommandsDir string `mapstructure:"commands_dir"`

	// AgentsDir is the base directory for agents
	AgentsDir string `mapstructure:"agents_dir"`

	// TemplatesDir is the directory for templates
	TemplatesDir string `mapstructure:"templates_dir"`
}

// Manager handles configuration loading and access
type Manager struct {
	v *viper.Viper
}

// NewManager creates a new configuration manager
func NewManager() *Manager {
	return &Manager{
		v: viper.New(),
	}
}

// Load loads configuration from all sources with hierarchical precedence
func (m *Manager) Load() (*Config, error) {
	// Set default values
	m.setDefaults()

	// Configure Viper
	m.v.SetConfigName("config")
	m.v.SetConfigType("yaml")

	// Add config search paths
	// 1. Current project: .sigma/
	if projectPath, err := os.Getwd(); err == nil {
		m.v.AddConfigPath(filepath.Join(projectPath, ".sigma"))
	}

	// 2. User home: ~/.sigma/
	if homeDir, err := os.UserHomeDir(); err == nil {
		m.v.AddConfigPath(filepath.Join(homeDir, ".sigma"))
	}

	// Enable environment variable support
	// SIGMA_VALIDATION_ENABLED -> validation.enabled
	m.v.SetEnvPrefix("SIGMA")
	m.v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	m.v.AutomaticEnv()

	// Read config file (if exists)
	if err := m.v.ReadInConfig(); err != nil {
		// Config file not found is acceptable - we have defaults
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("failed to read config: %w", err)
		}
	}

	// Unmarshal into Config struct
	var cfg Config
	if err := m.v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return &cfg, nil
}

// LoadWithFile loads configuration with a specific file path
func (m *Manager) LoadWithFile(configPath string) (*Config, error) {
	// Set default values
	m.setDefaults()

	// Set specific config file
	m.v.SetConfigFile(configPath)

	// Enable environment variable support
	// SIGMA_VALIDATION_ENABLED -> validation.enabled
	m.v.SetEnvPrefix("SIGMA")
	m.v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	m.v.AutomaticEnv()

	// Read config file
	if err := m.v.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("failed to read config file %s: %w", configPath, err)
	}

	// Unmarshal into Config struct
	var cfg Config
	if err := m.v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return &cfg, nil
}

// setDefaults sets default configuration values
func (m *Manager) setDefaults() {
	// Validation defaults
	m.v.SetDefault("validation.enabled", true)
	m.v.SetDefault("validation.strict_mode", false)
	m.v.SetDefault("validation.schema_path", "schemas")

	// Output defaults
	m.v.SetDefault("output.format", "yaml")
	m.v.SetDefault("output.pretty", true)
	m.v.SetDefault("output.dry_run", false)

	// Paths defaults
	m.v.SetDefault("paths.skills_dir", ".claude/skills")
	m.v.SetDefault("paths.commands_dir", ".claude/commands")
	m.v.SetDefault("paths.agents_dir", ".claude/agents")
	m.v.SetDefault("paths.templates_dir", "templates")

	// Platform defaults
	m.v.SetDefault("platforms.claude.enabled", true)
	m.v.SetDefault("platforms.claude.skills_path", ".claude/skills")
	m.v.SetDefault("platforms.claude.commands_path", ".claude/commands")
	m.v.SetDefault("platforms.claude.agents_path", ".claude/agents")
	m.v.SetDefault("platforms.claude.output_path", ".claude")

	m.v.SetDefault("platforms.cursor.enabled", false)
	m.v.SetDefault("platforms.cursor.skills_path", ".cursor/rules")
	m.v.SetDefault("platforms.cursor.output_path", ".cursor")

	m.v.SetDefault("platforms.codex.enabled", false)
	m.v.SetDefault("platforms.codex.skills_path", ".codex/skills")
	m.v.SetDefault("platforms.codex.output_path", ".codex")
}

// Get returns the underlying Viper instance for advanced usage
func (m *Manager) Get() *viper.Viper {
	return m.v
}

// GetString returns a string configuration value
func (m *Manager) GetString(key string) string {
	return m.v.GetString(key)
}

// GetBool returns a boolean configuration value
func (m *Manager) GetBool(key string) bool {
	return m.v.GetBool(key)
}

// GetStringMap returns a string map configuration value
func (m *Manager) GetStringMap(key string) map[string]interface{} {
	return m.v.GetStringMap(key)
}

// Set sets a configuration value
func (m *Manager) Set(key string, value interface{}) {
	m.v.Set(key, value)
}
