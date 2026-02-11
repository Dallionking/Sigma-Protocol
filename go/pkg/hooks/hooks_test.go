package hooks

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDiscoverHooks(t *testing.T) {
	// Setup mock project
	tmpDir := t.TempDir()
	setupMockProject(t, tmpDir)

	// Run discovery
	registry, err := DiscoverHooks(tmpDir)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, registry)
	assert.Greater(t, len(registry.Hooks), 0, "Should discover at least some hooks")
}

func TestDiscoverHooksEmptyDirectory(t *testing.T) {
	tmpDir := t.TempDir()

	// Run discovery on empty directory
	registry, err := DiscoverHooks(tmpDir)

	// Should not error, just return empty registry
	assert.NoError(t, err)
	assert.NotNil(t, registry)
	assert.Equal(t, 0, len(registry.Hooks))
}

func TestInstallHooks(t *testing.T) {
	tmpDir := t.TempDir()
	setupMockProject(t, tmpDir)

	registry, err := DiscoverHooks(tmpDir)
	require.NoError(t, err)

	// Create a separate destination directory
	destDir := filepath.Join(tmpDir, "install-test")
	os.MkdirAll(destDir, 0755)

	// Install hooks to the test destination
	err = InstallHooks(registry, destDir)
	assert.NoError(t, err)

	// Verify hooks installed
	for _, hook := range registry.Hooks {
		// Skip lib/ helpers
		if hook.SubDir == "lib" {
			continue
		}

		hookPath := filepath.Join(destDir, hook.DestPath)
		assert.FileExists(t, hookPath, "Hook should be installed: %s", hook.Name)

		// Check permissions
		info, err := os.Stat(hookPath)
		if assert.NoError(t, err) {
			assert.Equal(t, os.FileMode(0755), info.Mode().Perm(), "Hook should be executable: %s", hook.Name)
		}
	}
}

func TestValidateHook(t *testing.T) {
	tmpDir := t.TempDir()

	// Create valid hook
	validHook := createMockHook(t, tmpDir, "valid.sh", "#!/bin/bash\necho 'test'")
	result := validateHook(validHook)
	assert.True(t, result.Status == StatusValid || result.Status == StatusFixed, "Valid hook should pass validation")

	// Create invalid hook (no shebang)
	invalidHook := createMockHook(t, tmpDir, "invalid.sh", "echo 'test'")
	result = validateHook(invalidHook)
	assert.Equal(t, StatusInvalid, result.Status, "Hook without shebang should be invalid")
	assert.Contains(t, result.Message, "shebang")
}

func TestValidateHooks(t *testing.T) {
	tmpDir := t.TempDir()
	setupMockProject(t, tmpDir)

	registry, err := DiscoverHooks(tmpDir)
	require.NoError(t, err)

	// Validate all hooks
	results, err := ValidateHooks(registry)
	assert.NoError(t, err)
	assert.Equal(t, len(registry.Hooks), len(results))

	// All hooks should be valid or fixed
	for _, result := range results {
		assert.NotEqual(t, StatusInvalid, result.Status, "Hook validation failed: %s - %s", result.Hook.Name, result.Message)
	}
}

func TestGenerateSettingsJSON(t *testing.T) {
	tmpDir := t.TempDir()
	setupMockProject(t, tmpDir)

	registry, err := DiscoverHooks(tmpDir)
	require.NoError(t, err)

	// Generate settings.json
	err = GenerateSettingsJSON(registry, tmpDir)
	assert.NoError(t, err)

	// Verify settings.json created
	settingsPath := filepath.Join(tmpDir, ".claude/settings.json")
	assert.FileExists(t, settingsPath)

	// Parse and validate JSON
	settings, err := loadSettings(settingsPath)
	assert.NoError(t, err)
	assert.NotNil(t, settings.Hooks)
	assert.Greater(t, len(settings.Hooks), 0, "Settings should contain hooks")
}

func TestParseHook(t *testing.T) {
	tmpDir := t.TempDir()
	hooksDir := filepath.Join(tmpDir, ".claude/hooks")
	os.MkdirAll(hooksDir, 0755)

	// Create hook with metadata (matching the parser's expected format)
	hookPath := filepath.Join(hooksDir, "test-hook.sh")
	content := `#!/bin/bash
# ============================
# Event: SessionStart
# Required: true
# Description: A test hook
# ============================
echo "test"
`
	os.WriteFile(hookPath, []byte(content), 0755)

	// Parse hook
	hook, err := parseHook(hookPath, tmpDir)
	assert.NoError(t, err)
	assert.Equal(t, "test-hook.sh", hook.Name)
	assert.Equal(t, EventSessionStart, hook.Event)
	assert.True(t, hook.Required)
	assert.Equal(t, "A test hook", hook.Description)
}

func TestInferEventFromFilename(t *testing.T) {
	tests := []struct {
		filename string
		subDir   string
		expected HookEvent
	}{
		{"setup-check.sh", "", EventSessionStart},
		{"session-start-context.sh", "slas", EventSessionStart},
		{"session-end-summary.sh", "slas", EventSessionEnd},
		{"ui-validation.sh", "validators", EventPostToolUse},
		{"ralph-skill-enforcement.sh", "", EventPreToolUse},
		{"orchestrator-stop.sh", "", EventStop},
		{"task-completed-handler.sh", "", EventTaskCompleted},
		{"teammate-idle-handler.sh", "", EventTeammateIdle},
		{"iterm-launcher.sh", "", EventSubagentStart},
	}

	for _, tt := range tests {
		t.Run(tt.filename, func(t *testing.T) {
			result := inferEventFromFilename(tt.filename, tt.subDir)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestGroupHooksByEvent(t *testing.T) {
	registry := &HookRegistry{
		Hooks: []Hook{
			{Name: "hook1.sh", Event: EventSessionStart, SubDir: ""},
			{Name: "hook2.sh", Event: EventSessionStart, SubDir: ""},
			{Name: "hook3.sh", Event: EventPostToolUse, SubDir: "validators"},
			{Name: "lib.sh", Event: EventSessionStart, SubDir: "lib"}, // Should be skipped
		},
	}

	grouped := groupHooksByEvent(registry)

	assert.Equal(t, 2, len(grouped[EventSessionStart]), "Should have 2 SessionStart hooks (lib excluded)")
	assert.Equal(t, 1, len(grouped[EventPostToolUse]), "Should have 1 PostToolUse hook")
}

func TestBuildHookCommand(t *testing.T) {
	tests := []struct {
		name      string
		hook      Hook
		event     HookEvent
		wantCmd   string
	}{
		{
			name:    "basic hook",
			hook:    Hook{Name: "test.sh", DestPath: ".claude/hooks/test.sh"},
			event:   EventSessionStart,
			wantCmd: "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/test.sh\"",
		},
		{
			name:    "validator hook",
			hook:    Hook{Name: "validator.sh", DestPath: ".claude/hooks/validators/validator.sh", SubDir: "validators"},
			event:   EventPostToolUse,
			wantCmd: "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/validators/validator.sh\" \"$CLAUDE_FILE_PATH\"",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := buildHookCommand(&tt.hook, tt.event)
			assert.Equal(t, "command", cmd.Type)
			assert.Equal(t, tt.wantCmd, cmd.Command)
		})
	}
}

func TestLoadSettings(t *testing.T) {
	tmpDir := t.TempDir()
	settingsPath := filepath.Join(tmpDir, ".claude/settings.json")
	os.MkdirAll(filepath.Dir(settingsPath), 0755)

	// Test loading non-existent file
	_, err := loadSettings(settingsPath)
	assert.Error(t, err)

	// Create valid settings file
	content := `{"hooks": {}}`
	os.WriteFile(settingsPath, []byte(content), 0644)

	// Test loading valid file
	settings, err := loadSettings(settingsPath)
	assert.NoError(t, err)
	assert.NotNil(t, settings)
	assert.NotNil(t, settings.Hooks)
}

func TestWriteSettings(t *testing.T) {
	tmpDir := t.TempDir()
	settingsPath := filepath.Join(tmpDir, "subdir/.claude/settings.json")

	settings := &SettingsJSON{
		Hooks: map[HookEvent][]HookEntry{
			EventSessionStart: {
				{
					Hooks: []HookCommand{
						{Type: "command", Command: "test"},
					},
				},
			},
		},
	}

	// Write settings
	err := writeSettings(settingsPath, settings)
	assert.NoError(t, err)
	assert.FileExists(t, settingsPath)

	// Verify content
	data, _ := os.ReadFile(settingsPath)
	assert.Contains(t, string(data), "SessionStart")
}

func TestHasValidShebang(t *testing.T) {
	tmpDir := t.TempDir()

	tests := []struct {
		name     string
		content  string
		expected bool
	}{
		{"valid bash", "#!/bin/bash\necho test", true},
		{"valid python", "#!/usr/bin/env python3\nprint('test')", true},
		{"missing shebang", "echo test", false},
		{"empty file", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := filepath.Join(tmpDir, tt.name+".sh")
			os.WriteFile(path, []byte(tt.content), 0755)

			result := hasValidShebang(path)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestValidateShebangDetailed(t *testing.T) {
	tmpDir := t.TempDir()

	tests := []struct {
		name      string
		content   string
		wantError bool
		errorMsg  string
	}{
		{"valid bash", "#!/bin/bash\necho test", false, ""},
		{"valid python", "#!/usr/bin/env python3\nprint('test')", false, ""},
		{"missing shebang", "echo test", true, "missing shebang"},
		{"empty file", "", true, "empty file"},
		{"unsupported interpreter", "#!/bin/zsh\necho test", true, "unsupported interpreter"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := filepath.Join(tmpDir, tt.name+".sh")
			os.WriteFile(path, []byte(tt.content), 0755)

			err := validateShebangDetailed(path)
			if tt.wantError {
				assert.Error(t, err)
				if tt.errorMsg != "" {
					assert.Contains(t, err.Error(), tt.errorMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestValidateHookDetailed(t *testing.T) {
	tmpDir := t.TempDir()

	// Create a valid hook
	validHook := createMockHook(t, tmpDir, "valid.sh", "#!/bin/bash\necho test")
	validHook.DestPath = "valid.sh"

	result := ValidateHookDetailed(validHook, tmpDir)
	assert.Equal(t, StatusValid, result.Status)

	// Test non-existent file
	missingHook := &Hook{
		Name:     "missing.sh",
		Path:     filepath.Join(tmpDir, "missing.sh"),
		DestPath: "missing.sh",
	}
	result = ValidateHookDetailed(missingHook, tmpDir)
	assert.Equal(t, StatusInvalid, result.Status)
	assert.Contains(t, result.Message, "file not found")
}

func TestInstallHooksWithProgress(t *testing.T) {
	tmpDir := t.TempDir()
	setupMockProject(t, tmpDir)

	registry, err := DiscoverHooks(tmpDir)
	require.NoError(t, err)

	destDir := filepath.Join(tmpDir, "progress-test")
	os.MkdirAll(destDir, 0755)

	// Track progress callbacks
	var progressCalls []string
	err = InstallHooksWithProgress(registry, destDir, func(current, total int, hookName string) {
		progressCalls = append(progressCalls, hookName)
	})

	assert.NoError(t, err)
	assert.Greater(t, len(progressCalls), 0, "Should have progress callbacks")
}

func TestGroupByMatcher(t *testing.T) {
	hooks := []Hook{
		{Name: "hook1.sh", Matcher: ""},
		{Name: "hook2.sh", Matcher: "Edit|Write"},
		{Name: "hook3.sh", Matcher: "Edit|Write"},
		{Name: "hook4.sh", Matcher: "*.ts"},
	}

	grouped := groupByMatcher(hooks)

	assert.Equal(t, 1, len(grouped[""]))
	assert.Equal(t, 2, len(grouped["Edit|Write"]))
	assert.Equal(t, 1, len(grouped["*.ts"]))
}

func TestCheckSyntax(t *testing.T) {
	tmpDir := t.TempDir()

	// Valid bash script
	validBash := filepath.Join(tmpDir, "valid.sh")
	os.WriteFile(validBash, []byte("#!/bin/bash\necho test"), 0755)
	assert.NoError(t, checkSyntax(validBash))

	// Invalid bash script
	invalidBash := filepath.Join(tmpDir, "invalid.sh")
	os.WriteFile(invalidBash, []byte("#!/bin/bash\nif without fi"), 0755)
	assert.Error(t, checkSyntax(invalidBash))

	// Unknown extension (should pass)
	unknown := filepath.Join(tmpDir, "unknown.txt")
	os.WriteFile(unknown, []byte("anything"), 0755)
	assert.NoError(t, checkSyntax(unknown))
}

// Helper functions

func setupMockProject(t *testing.T, dir string) {
	t.Helper()

	// Create hooks directory structure
	hooksDir := filepath.Join(dir, ".claude/hooks")
	os.MkdirAll(hooksDir, 0755)
	os.MkdirAll(filepath.Join(hooksDir, "validators"), 0755)
	os.MkdirAll(filepath.Join(hooksDir, "slas"), 0755)
	os.MkdirAll(filepath.Join(hooksDir, "lib"), 0755)

	// Create mock hooks
	createMockHook(t, hooksDir, "setup-check.sh", "#!/bin/bash\necho 'setup'")
	createMockHook(t, filepath.Join(hooksDir, "validators"), "ui-validation.sh", "#!/bin/bash\necho 'validate'")
	createMockHook(t, filepath.Join(hooksDir, "slas"), "session-start-context.sh", "#!/bin/bash\necho 'start'")
	createMockHook(t, filepath.Join(hooksDir, "lib"), "common.sh", "#!/bin/bash\necho 'lib'")
}

func createMockHook(t *testing.T, dir, name, content string) *Hook {
	t.Helper()

	path := filepath.Join(dir, name)
	err := os.WriteFile(path, []byte(content), 0755)
	require.NoError(t, err)

	return &Hook{
		Name:     name,
		Path:     path,
		DestPath: filepath.Join(".claude/hooks", name),
		Event:    EventSessionStart,
	}
}
