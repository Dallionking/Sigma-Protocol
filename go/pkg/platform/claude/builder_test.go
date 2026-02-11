package claude

import (
	"context"
	"os"
	"path/filepath"
	"testing"

	"github.com/dallionking/sigma-protocol/pkg/hooks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewBuilder(t *testing.T) {
	builder := NewBuilder()
	assert.NotNil(t, builder)
	assert.Equal(t, "claude", builder.Name())
	assert.NotNil(t, builder.metrics)
}

func TestBuilder_Build(t *testing.T) {
	tests := []struct {
		name    string
		setup   func(string) error
		wantErr bool
		errMsg  string
	}{
		{
			name: "successful build with all components",
			setup: func(tmpDir string) error {
				return setupFullProject(tmpDir)
			},
			wantErr: false,
		},
		{
			name: "build fails with missing .claude directory",
			setup: func(tmpDir string) error {
				// Don't create .claude directory
				return nil
			},
			wantErr: true,
			errMsg:  ".claude directory not found",
		},
		{
			name: "build fails with missing skills directory",
			setup: func(tmpDir string) error {
				// Create .claude but no skills
				return os.MkdirAll(filepath.Join(tmpDir, ".claude"), 0755)
			},
			wantErr: true,
			errMsg:  ".claude/skills directory not found",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create temp directories
			srcDir := t.TempDir()
			destDir := t.TempDir()

			// Setup test environment
			if tt.setup != nil {
				err := tt.setup(srcDir)
				require.NoError(t, err)
			}

			// Build
			builder := NewBuilder()
			err := builder.Build(context.Background(), srcDir, destDir)

			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)

				// Verify output structure
				assert.DirExists(t, filepath.Join(destDir, ".claude"))
				assert.FileExists(t, filepath.Join(destDir, ".claude/settings.json"))

				// Check metrics
				metrics := builder.GetMetrics()
				assert.Greater(t, metrics.Skills, 0)
			}
		})
	}
}

func TestBuilder_Validate(t *testing.T) {
	tests := []struct {
		name      string
		setup     func(string) error
		wantValid bool
		wantErrs  int
		wantWarns int
	}{
		{
			name: "valid configuration",
			setup: func(dir string) error {
				// Create full project (skills included)
				if err := setupFullProject(dir); err != nil {
					return err
				}
				// Build in place (src == dest for real-world use case)
				builder := NewBuilder()
				return builder.Build(context.Background(), dir, dir)
			},
			wantValid: true,
			wantErrs:  0,
		},
		{
			name: "missing .claude directory",
			setup: func(dir string) error {
				// Don't create anything
				return nil
			},
			wantValid: false,
			wantErrs:  1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			dir := t.TempDir()

			// Setup
			if tt.setup != nil {
				err := tt.setup(dir)
				require.NoError(t, err)
			}

			// Validate
			builder := NewBuilder()
			result, err := builder.Validate(dir)
			require.NoError(t, err)
			require.NotNil(t, result)

			assert.Equal(t, tt.wantValid, result.Valid)
			assert.Len(t, result.Errors, tt.wantErrs)
			if tt.wantWarns > 0 {
				assert.GreaterOrEqual(t, len(result.Warnings), tt.wantWarns)
			}
		})
	}
}

func TestBuilder_GetMetrics(t *testing.T) {
	builder := NewBuilder()
	metrics := builder.GetMetrics()

	assert.NotNil(t, metrics)
	assert.Equal(t, "claude", metrics.Platform)
}

func TestBuilder_GetFiles(t *testing.T) {
	builder := NewBuilder()
	files := builder.GetFiles()

	assert.NotNil(t, files)
	// At minimum, should include settings.json
	assert.GreaterOrEqual(t, len(files), 1)
}

// setupFullProject creates a full test project structure.
func setupFullProject(baseDir string) error {
	claudeDir := filepath.Join(baseDir, ".claude")

	// Create directories
	dirs := []string{
		filepath.Join(claudeDir, "skills"),
		filepath.Join(claudeDir, "commands"),
		filepath.Join(claudeDir, "agents"),
		filepath.Join(claudeDir, "rules"),
		filepath.Join(claudeDir, "hooks"),
	}
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return err
		}
	}

	// Create sample skills
	for i := 0; i < 3; i++ {
		skillPath := filepath.Join(claudeDir, "skills", filepath.Base(filepath.Join("skill-", string(rune(i+'a'))+".md")))
		if err := os.WriteFile(skillPath, []byte("# Skill "+string(rune(i+'a'))), 0644); err != nil {
			return err
		}
	}

	// Create sample command with proper indentation
	cmdContent := "---\n" +
		"description: \"Test command\"\n" +
		"allowed-tools:\n" +
		"  - Read\n" +
		"  - Write\n" +
		"---\n" +
		"# Test Command\n"
	if err := os.WriteFile(filepath.Join(claudeDir, "commands", "test-command.md"), []byte(cmdContent), 0644); err != nil {
		return err
	}

	// Create sample agent with proper indentation
	agentContent := "---\n" +
		"name: test-agent\n" +
		"description: \"Test agent\"\n" +
		"tools:\n" +
		"  - Read\n" +
		"  - Write\n" +
		"model: sonnet\n" +
		"---\n" +
		"# Test Agent\n"
	if err := os.WriteFile(filepath.Join(claudeDir, "agents", "test-agent.md"), []byte(agentContent), 0644); err != nil {
		return err
	}

	// Create sample rule with proper indentation
	ruleContent := "---\n" +
		"paths:\n" +
		"  - \"src/**/*.ts\"\n" +
		"---\n" +
		"# Test Rule\n"
	if err := os.WriteFile(filepath.Join(claudeDir, "rules", "test-rule.md"), []byte(ruleContent), 0644); err != nil {
		return err
	}

	return nil
}

func TestSettings_AddHooks(t *testing.T) {
	settings := &SettingsJSON{
		Env:         getDefaultEnvVars(),
		Permissions: getDefaultPermissions(),
	}

	// Create a mock hook registry
	registry := &hooks.HookRegistry{
		Hooks: []hooks.Hook{
			{
				Name:     "setup-check.sh",
				DestPath: ".claude/hooks/setup-check.sh",
				Event:    hooks.EventSessionStart,
				Matcher:  "",
			},
			{
				Name:     "validate-file.sh",
				DestPath: ".claude/hooks/validators/validate-file.sh",
				Event:    hooks.EventPostToolUse,
				Matcher:  "Edit|Write",
			},
		},
	}

	err := settings.AddHooks(registry)
	assert.NoError(t, err)
	assert.NotEmpty(t, settings.Hooks)
	assert.Contains(t, settings.Hooks, string(hooks.EventSessionStart))
	assert.Contains(t, settings.Hooks, string(hooks.EventPostToolUse))
}

func TestSettings_Write(t *testing.T) {
	tmpDir := t.TempDir()
	settingsPath := filepath.Join(tmpDir, ".claude/settings.json")

	settings := &SettingsJSON{
		Env:         getDefaultEnvVars(),
		Permissions: getDefaultPermissions(),
	}

	err := settings.Write(settingsPath)
	assert.NoError(t, err)
	assert.FileExists(t, settingsPath)

	// Verify file is valid JSON
	data, err := os.ReadFile(settingsPath)
	assert.NoError(t, err)
	assert.Contains(t, string(data), "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS")
}

func TestSettings_Validate(t *testing.T) {
	tests := []struct {
		name     string
		settings *SettingsJSON
		wantErr  bool
	}{
		{
			name: "valid settings",
			settings: &SettingsJSON{
				Env: map[string]string{
					"TEST": "value",
				},
				Permissions: PermissionsConfig{
					Allow:         []string{"Bash(git *)"},
					McpAutoEnable: "auto:3",
				},
			},
			wantErr: false,
		},
		{
			name: "nil env vars",
			settings: &SettingsJSON{
				Env: nil,
				Permissions: PermissionsConfig{
					Allow: []string{"Bash(git *)"},
				},
			},
			wantErr: true,
		},
		{
			name: "empty permissions",
			settings: &SettingsJSON{
				Env: map[string]string{
					"TEST": "value",
				},
				Permissions: PermissionsConfig{
					Allow: []string{},
				},
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.settings.Validate()
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestParseCommand(t *testing.T) {
	tmpDir := t.TempDir()
	cmdPath := filepath.Join(tmpDir, "test-command.md")

	cmdContent := "---\n" +
		"description: \"Test command\"\n" +
		"allowed-tools:\n" +
		"  - Read\n" +
		"  - Write\n" +
		"---\n" +
		"# Test Command\n"

	err := os.WriteFile(cmdPath, []byte(cmdContent), 0644)
	require.NoError(t, err)

	cmd, err := parseCommand(cmdPath)
	require.NoError(t, err)
	assert.Equal(t, "test-command.md", cmd.Name)
	assert.Equal(t, "Test command", cmd.Metadata.Description)
	assert.Equal(t, []string{"Read", "Write"}, cmd.Metadata.AllowedTools)

	// Validate should pass
	err = cmd.Validate()
	assert.NoError(t, err)
}

func TestParseAgent(t *testing.T) {
	tmpDir := t.TempDir()
	agentPath := filepath.Join(tmpDir, "test-agent.md")

	agentContent := "---\n" +
		"name: test-agent\n" +
		"description: \"Test agent\"\n" +
		"tools:\n" +
		"  - Read\n" +
		"  - Write\n" +
		"model: sonnet\n" +
		"---\n" +
		"# Test Agent\n"

	err := os.WriteFile(agentPath, []byte(agentContent), 0644)
	require.NoError(t, err)

	agent, err := parseAgent(agentPath)
	require.NoError(t, err)
	assert.Equal(t, "test-agent", agent.Name)
	assert.Equal(t, "test-agent", agent.Metadata.Name)
	assert.Equal(t, "Test agent", agent.Metadata.Description)
	assert.Equal(t, []string{"Read", "Write"}, agent.Metadata.Tools)
	assert.Equal(t, "sonnet", agent.Metadata.Model)

	// Validate should pass
	err = agent.Validate()
	assert.NoError(t, err)
}
