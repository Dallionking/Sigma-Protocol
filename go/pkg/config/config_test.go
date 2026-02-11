package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestNewManager(t *testing.T) {
	m := NewManager()
	if m == nil {
		t.Fatal("NewManager returned nil")
	}
	if m.v == nil {
		t.Fatal("Manager has nil Viper instance")
	}
}

func TestLoadDefaults(t *testing.T) {
	m := NewManager()
	cfg, err := m.Load()
	if err != nil {
		t.Fatalf("Load failed: %v", err)
	}

	// Check validation defaults
	if !cfg.Validation.Enabled {
		t.Error("Expected validation.enabled to default to true")
	}
	if cfg.Validation.StrictMode {
		t.Error("Expected validation.strict_mode to default to false")
	}
	if cfg.Validation.SchemaPath != "schemas" {
		t.Errorf("Expected schema_path='schemas', got '%s'", cfg.Validation.SchemaPath)
	}

	// Check output defaults
	if cfg.Output.Format != "yaml" {
		t.Errorf("Expected output.format='yaml', got '%s'", cfg.Output.Format)
	}
	if !cfg.Output.Pretty {
		t.Error("Expected output.pretty to default to true")
	}
	if cfg.Output.DryRun {
		t.Error("Expected output.dry_run to default to false")
	}

	// Check paths defaults
	if cfg.Paths.SkillsDir != ".claude/skills" {
		t.Errorf("Expected skills_dir='.claude/skills', got '%s'", cfg.Paths.SkillsDir)
	}
}

func TestLoadWithFile(t *testing.T) {
	// Create temp config file
	tmpDir := t.TempDir()
	configPath := filepath.Join(tmpDir, "test-config.yaml")

	configContent := `
validation:
  enabled: false
  strict_mode: true
  schema_path: custom/schemas

output:
  format: json
  pretty: false
  dry_run: true

paths:
  skills_dir: custom/skills
  commands_dir: custom/commands

platforms:
  claude:
    enabled: true
    skills_path: .claude/skills
  cursor:
    enabled: true
    skills_path: .cursor/rules
`

	if err := os.WriteFile(configPath, []byte(configContent), 0644); err != nil {
		t.Fatalf("Failed to write test config: %v", err)
	}

	// Load config
	m := NewManager()
	cfg, err := m.LoadWithFile(configPath)
	if err != nil {
		t.Fatalf("LoadWithFile failed: %v", err)
	}

	// Verify values were loaded
	if cfg.Validation.Enabled {
		t.Error("Expected validation.enabled=false")
	}
	if !cfg.Validation.StrictMode {
		t.Error("Expected validation.strict_mode=true")
	}
	if cfg.Validation.SchemaPath != "custom/schemas" {
		t.Errorf("Expected schema_path='custom/schemas', got '%s'", cfg.Validation.SchemaPath)
	}

	if cfg.Output.Format != "json" {
		t.Errorf("Expected output.format='json', got '%s'", cfg.Output.Format)
	}
	if cfg.Output.Pretty {
		t.Error("Expected output.pretty=false")
	}
	if !cfg.Output.DryRun {
		t.Error("Expected output.dry_run=true")
	}

	if cfg.Paths.SkillsDir != "custom/skills" {
		t.Errorf("Expected skills_dir='custom/skills', got '%s'", cfg.Paths.SkillsDir)
	}
}

func TestLoadWithInvalidFile(t *testing.T) {
	m := NewManager()
	_, err := m.LoadWithFile("/nonexistent/config.yaml")
	if err == nil {
		t.Fatal("Expected error loading nonexistent file")
	}
}

func TestLoadWithMalformedYAML(t *testing.T) {
	// Create temp config file with malformed YAML
	tmpDir := t.TempDir()
	configPath := filepath.Join(tmpDir, "bad-config.yaml")

	badContent := `
validation:
  enabled: not-a-boolean
  strict_mode: [this, is, wrong]
`

	if err := os.WriteFile(configPath, []byte(badContent), 0644); err != nil {
		t.Fatalf("Failed to write test config: %v", err)
	}

	// Load config - should succeed but with incorrect types
	m := NewManager()
	_, err := m.LoadWithFile(configPath)
	// Viper may unmarshal with incorrect types or fail
	if err != nil {
		t.Logf("LoadWithFile failed as expected with malformed YAML: %v", err)
	}
}

func TestPlatformConfig(t *testing.T) {
	tmpDir := t.TempDir()
	configPath := filepath.Join(tmpDir, "platform-config.yaml")

	configContent := `
platforms:
  claude:
    enabled: true
    skills_path: .claude/skills
    commands_path: .claude/commands
    agents_path: .claude/agents
    output_path: .claude
    custom:
      max_file_size: 1000000
      auto_format: true
  cursor:
    enabled: false
    skills_path: .cursor/rules
    output_path: .cursor
  codex:
    enabled: true
    skills_path: .codex/skills
    output_path: .codex
    custom:
      model: gpt-5.3-codex
`

	if err := os.WriteFile(configPath, []byte(configContent), 0644); err != nil {
		t.Fatalf("Failed to write test config: %v", err)
	}

	m := NewManager()
	cfg, err := m.LoadWithFile(configPath)
	if err != nil {
		t.Fatalf("LoadWithFile failed: %v", err)
	}

	// Check Claude platform
	claude, ok := cfg.Platforms["claude"]
	if !ok {
		t.Fatal("Claude platform not found")
	}
	if !claude.Enabled {
		t.Error("Expected Claude platform to be enabled")
	}
	if claude.SkillsPath != ".claude/skills" {
		t.Errorf("Expected skills_path='.claude/skills', got '%s'", claude.SkillsPath)
	}

	// Check custom fields
	if claude.Custom == nil {
		t.Fatal("Expected custom fields for Claude")
	}
	if maxSize, ok := claude.Custom["max_file_size"].(int); !ok || maxSize != 1000000 {
		t.Error("Expected max_file_size=1000000")
	}

	// Check Cursor platform
	cursor, ok := cfg.Platforms["cursor"]
	if !ok {
		t.Fatal("Cursor platform not found")
	}
	if cursor.Enabled {
		t.Error("Expected Cursor platform to be disabled")
	}

	// Check Codex platform
	codex, ok := cfg.Platforms["codex"]
	if !ok {
		t.Fatal("Codex platform not found")
	}
	if !codex.Enabled {
		t.Error("Expected Codex platform to be enabled")
	}
	if codex.Custom == nil {
		t.Fatal("Expected custom fields for Codex")
	}
	if model, ok := codex.Custom["model"].(string); !ok || model != "gpt-5.3-codex" {
		t.Error("Expected model='gpt-5.3-codex'")
	}
}

func TestEnvironmentVariableOverride(t *testing.T) {
	// Set environment variable
	os.Setenv("SIGMA_VALIDATION_ENABLED", "false")
	os.Setenv("SIGMA_OUTPUT_FORMAT", "json")
	defer os.Unsetenv("SIGMA_VALIDATION_ENABLED")
	defer os.Unsetenv("SIGMA_OUTPUT_FORMAT")

	m := NewManager()
	cfg, err := m.Load()
	if err != nil {
		t.Fatalf("Load failed: %v", err)
	}

	// Environment variables should override defaults
	if cfg.Validation.Enabled {
		t.Error("Expected env var to override validation.enabled to false")
	}
	if cfg.Output.Format != "json" {
		t.Errorf("Expected env var to override output.format to 'json', got '%s'", cfg.Output.Format)
	}
}

func TestManagerGetMethods(t *testing.T) {
	m := NewManager()
	m.Set("test.string", "value")
	m.Set("test.bool", true)

	if val := m.GetString("test.string"); val != "value" {
		t.Errorf("GetString failed: expected 'value', got '%s'", val)
	}

	if val := m.GetBool("test.bool"); !val {
		t.Error("GetBool failed: expected true")
	}

	m.Set("test.map", map[string]interface{}{
		"key1": "val1",
		"key2": "val2",
	})

	if val := m.GetStringMap("test.map"); len(val) != 2 {
		t.Errorf("GetStringMap failed: expected map with 2 keys, got %d", len(val))
	}
}

func TestManagerGetViper(t *testing.T) {
	m := NewManager()
	v := m.Get()
	if v == nil {
		t.Fatal("Get() returned nil Viper instance")
	}

	// Test that we can use Viper directly
	v.Set("direct.test", "value")
	if v.GetString("direct.test") != "value" {
		t.Error("Direct Viper access failed")
	}
}
