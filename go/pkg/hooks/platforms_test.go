package hooks

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetAdapter(t *testing.T) {
	tests := []struct {
		platform string
		wantNil  bool
	}{
		{"claude-code", false},
		{"codex", false},
		{"factory-droid", false},
		{"unknown", true},
	}

	for _, tt := range tests {
		t.Run(tt.platform, func(t *testing.T) {
			adapter := GetAdapter(tt.platform)
			if tt.wantNil {
				assert.Nil(t, adapter)
			} else {
				assert.NotNil(t, adapter)
				assert.Equal(t, tt.platform, adapter.Name())
			}
		})
	}
}

func TestDetectPlatform(t *testing.T) {
	tmpDir := t.TempDir()

	// No platforms
	platforms := DetectPlatform(tmpDir)
	assert.Equal(t, 0, len(platforms))

	// Add Claude Code
	os.MkdirAll(filepath.Join(tmpDir, ".claude"), 0755)
	platforms = DetectPlatform(tmpDir)
	assert.Contains(t, platforms, "claude-code")

	// Add Codex
	os.MkdirAll(filepath.Join(tmpDir, "platforms/codex"), 0755)
	platforms = DetectPlatform(tmpDir)
	assert.Contains(t, platforms, "claude-code")
	assert.Contains(t, platforms, "codex")

	// Add Factory Droid
	os.MkdirAll(filepath.Join(tmpDir, ".factory"), 0755)
	platforms = DetectPlatform(tmpDir)
	assert.Contains(t, platforms, "claude-code")
	assert.Contains(t, platforms, "codex")
	assert.Contains(t, platforms, "factory-droid")
}

func TestClaudeCodeAdapter(t *testing.T) {
	tmpDir := t.TempDir()
	setupMockProject(t, tmpDir)

	registry, err := DiscoverHooks(tmpDir)
	require.NoError(t, err)

	adapter := &ClaudeCodeAdapter{}
	err = adapter.RegisterHooks(registry, tmpDir)
	assert.NoError(t, err)

	// Verify settings.json was created
	settingsPath := filepath.Join(tmpDir, ".claude/settings.json")
	assert.FileExists(t, settingsPath)
}

func TestCodexAdapter(t *testing.T) {
	tmpDir := t.TempDir()
	setupMockProject(t, tmpDir)

	registry, err := DiscoverHooks(tmpDir)
	require.NoError(t, err)

	// Create Codex platform directory
	codexDir := filepath.Join(tmpDir, "platforms/codex")
	os.MkdirAll(codexDir, 0755)

	adapter := &CodexAdapter{}
	err = adapter.RegisterHooks(registry, tmpDir)
	assert.NoError(t, err)

	// Verify config.toml was created
	configPath := filepath.Join(codexDir, "config.toml")
	assert.FileExists(t, configPath)
}

func TestFactoryDroidAdapter(t *testing.T) {
	tmpDir := t.TempDir()
	setupMockProject(t, tmpDir)

	registry, err := DiscoverHooks(tmpDir)
	require.NoError(t, err)

	// Create Factory Droid directory
	factoryDir := filepath.Join(tmpDir, ".factory")
	os.MkdirAll(factoryDir, 0755)

	adapter := &FactoryDroidAdapter{}
	err = adapter.RegisterHooks(registry, tmpDir)
	assert.NoError(t, err)

	// Verify config.yaml was created
	configPath := filepath.Join(factoryDir, "config.yaml")
	assert.FileExists(t, configPath)
}

func TestRegisterHooksForAllPlatforms(t *testing.T) {
	tmpDir := t.TempDir()
	setupMockProject(t, tmpDir)

	registry, err := DiscoverHooks(tmpDir)
	require.NoError(t, err)

	// Create all platform directories
	os.MkdirAll(filepath.Join(tmpDir, ".claude"), 0755)
	os.MkdirAll(filepath.Join(tmpDir, "platforms/codex"), 0755)
	os.MkdirAll(filepath.Join(tmpDir, ".factory"), 0755)

	// Register for all platforms
	err = RegisterHooksForAllPlatforms(registry, tmpDir)
	assert.NoError(t, err)

	// Verify all platform configs were created
	assert.FileExists(t, filepath.Join(tmpDir, ".claude/settings.json"))
	assert.FileExists(t, filepath.Join(tmpDir, "platforms/codex/config.toml"))
	assert.FileExists(t, filepath.Join(tmpDir, ".factory/config.yaml"))
}

func TestRegisterHooksForAllPlatformsNoPlatforms(t *testing.T) {
	tmpDir := t.TempDir()
	registry := &HookRegistry{Hooks: []Hook{}}

	// No platforms present
	err := RegisterHooksForAllPlatforms(registry, tmpDir)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "no supported platforms")
}

func TestCodexAdapterSkipsMissingPlatform(t *testing.T) {
	tmpDir := t.TempDir()
	registry := &HookRegistry{Hooks: []Hook{}}

	adapter := &CodexAdapter{}
	// Should not error when platform doesn't exist
	err := adapter.RegisterHooks(registry, tmpDir)
	assert.NoError(t, err)
}

func TestFactoryDroidAdapterSkipsMissingPlatform(t *testing.T) {
	tmpDir := t.TempDir()
	registry := &HookRegistry{Hooks: []Hook{}}

	adapter := &FactoryDroidAdapter{}
	// Should not error when platform doesn't exist
	err := adapter.RegisterHooks(registry, tmpDir)
	assert.NoError(t, err)
}
