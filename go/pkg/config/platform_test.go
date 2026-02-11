package config

import (
	"testing"
)

func TestNewPlatformLoader(t *testing.T) {
	cfg := &Config{}
	pl := NewPlatformLoader(cfg)
	if pl == nil {
		t.Fatal("NewPlatformLoader returned nil")
	}
	if pl.cfg != cfg {
		t.Error("PlatformLoader config mismatch")
	}
}

func TestGetPlatformConfig(t *testing.T) {
	cfg := &Config{
		Platforms: map[string]PlatformConfig{
			"claude": {
				Enabled:    true,
				SkillsPath: ".claude/skills",
			},
			"cursor": {
				Enabled:    false,
				SkillsPath: ".cursor/rules",
			},
		},
	}

	pl := NewPlatformLoader(cfg)

	// Test existing platform
	claudeCfg, err := pl.GetPlatformConfig(PlatformClaude)
	if err != nil {
		t.Fatalf("GetPlatformConfig failed: %v", err)
	}
	if !claudeCfg.Enabled {
		t.Error("Expected Claude platform to be enabled")
	}
	if claudeCfg.SkillsPath != ".claude/skills" {
		t.Errorf("Expected skills_path='.claude/skills', got '%s'", claudeCfg.SkillsPath)
	}

	// Test non-existent platform
	_, err = pl.GetPlatformConfig(PlatformType("nonexistent"))
	if err == nil {
		t.Error("Expected error for non-existent platform")
	}
}

func TestGetEnabledPlatforms(t *testing.T) {
	cfg := &Config{
		Platforms: map[string]PlatformConfig{
			"claude": {
				Enabled: true,
			},
			"cursor": {
				Enabled: false,
			},
			"codex": {
				Enabled: true,
			},
		},
	}

	pl := NewPlatformLoader(cfg)
	enabled := pl.GetEnabledPlatforms()

	if len(enabled) != 2 {
		t.Errorf("Expected 2 enabled platforms, got %d", len(enabled))
	}

	// Check that enabled platforms are in the list
	enabledMap := make(map[PlatformType]bool)
	for _, p := range enabled {
		enabledMap[p] = true
	}

	if !enabledMap[PlatformClaude] {
		t.Error("Claude should be enabled")
	}
	if !enabledMap[PlatformCodex] {
		t.Error("Codex should be enabled")
	}
	if enabledMap[PlatformCursor] {
		t.Error("Cursor should not be enabled")
	}
}

func TestGetPaths(t *testing.T) {
	cfg := &Config{
		Platforms: map[string]PlatformConfig{
			"claude": {
				Enabled:      true,
				SkillsPath:   ".claude/skills",
				CommandsPath: ".claude/commands",
				AgentsPath:   ".claude/agents",
				OutputPath:   ".claude",
			},
		},
	}

	pl := NewPlatformLoader(cfg)

	// Test GetSkillsPath
	skillsPath, err := pl.GetSkillsPath(PlatformClaude)
	if err != nil {
		t.Fatalf("GetSkillsPath failed: %v", err)
	}
	if skillsPath != ".claude/skills" {
		t.Errorf("Expected skills path '.claude/skills', got '%s'", skillsPath)
	}

	// Test GetCommandsPath
	commandsPath, err := pl.GetCommandsPath(PlatformClaude)
	if err != nil {
		t.Fatalf("GetCommandsPath failed: %v", err)
	}
	if commandsPath != ".claude/commands" {
		t.Errorf("Expected commands path '.claude/commands', got '%s'", commandsPath)
	}

	// Test GetAgentsPath
	agentsPath, err := pl.GetAgentsPath(PlatformClaude)
	if err != nil {
		t.Fatalf("GetAgentsPath failed: %v", err)
	}
	if agentsPath != ".claude/agents" {
		t.Errorf("Expected agents path '.claude/agents', got '%s'", agentsPath)
	}

	// Test GetOutputPath
	outputPath, err := pl.GetOutputPath(PlatformClaude)
	if err != nil {
		t.Fatalf("GetOutputPath failed: %v", err)
	}
	if outputPath != ".claude" {
		t.Errorf("Expected output path '.claude', got '%s'", outputPath)
	}

	// Test non-existent platform
	_, err = pl.GetSkillsPath(PlatformType("nonexistent"))
	if err == nil {
		t.Error("Expected error for non-existent platform")
	}
}

func TestGetCustomValue(t *testing.T) {
	cfg := &Config{
		Platforms: map[string]PlatformConfig{
			"claude": {
				Enabled: true,
				Custom: map[string]interface{}{
					"max_file_size": 1000000,
					"auto_format":   true,
					"model":         "opus-4.5",
				},
			},
			"cursor": {
				Enabled: true,
				Custom:  nil, // No custom config
			},
		},
	}

	pl := NewPlatformLoader(cfg)

	// Test existing custom value
	val, err := pl.GetCustomValue(PlatformClaude, "max_file_size")
	if err != nil {
		t.Fatalf("GetCustomValue failed: %v", err)
	}
	if val != 1000000 {
		t.Errorf("Expected max_file_size=1000000, got %v", val)
	}

	// Test non-existent custom key
	_, err = pl.GetCustomValue(PlatformClaude, "nonexistent")
	if err == nil {
		t.Error("Expected error for non-existent custom key")
	}

	// Test platform with no custom config
	_, err = pl.GetCustomValue(PlatformCursor, "any_key")
	if err == nil {
		t.Error("Expected error for platform with no custom config")
	}

	// Test non-existent platform
	_, err = pl.GetCustomValue(PlatformType("nonexistent"), "key")
	if err == nil {
		t.Error("Expected error for non-existent platform")
	}
}

func TestResolvePlatformPath(t *testing.T) {
	cfg := &Config{
		Platforms: map[string]PlatformConfig{
			"claude": {
				Enabled:    true,
				OutputPath: ".claude",
			},
		},
	}

	pl := NewPlatformLoader(cfg)

	// Test absolute path (should remain unchanged)
	absPath := "/absolute/path/to/file.md"
	resolved, err := pl.ResolvePlatformPath(PlatformClaude, absPath)
	if err != nil {
		t.Fatalf("ResolvePlatformPath failed: %v", err)
	}
	if resolved != absPath {
		t.Errorf("Expected absolute path unchanged, got '%s'", resolved)
	}

	// Test relative path (should be joined with output path)
	relPath := "skills/test.md"
	resolved, err = pl.ResolvePlatformPath(PlatformClaude, relPath)
	if err != nil {
		t.Fatalf("ResolvePlatformPath failed: %v", err)
	}
	expected := ".claude/skills/test.md"
	if resolved != expected {
		t.Errorf("Expected '%s', got '%s'", expected, resolved)
	}

	// Test non-existent platform
	_, err = pl.ResolvePlatformPath(PlatformType("nonexistent"), "path")
	if err == nil {
		t.Error("Expected error for non-existent platform")
	}
}

func TestValidatePlatformConfig(t *testing.T) {
	tests := []struct {
		name      string
		cfg       *Config
		platform  PlatformType
		shouldErr bool
	}{
		{
			name: "valid config",
			cfg: &Config{
				Platforms: map[string]PlatformConfig{
					"claude": {
						Enabled:    true,
						SkillsPath: ".claude/skills",
						OutputPath: ".claude",
					},
				},
			},
			platform:  PlatformClaude,
			shouldErr: false,
		},
		{
			name: "missing skills path",
			cfg: &Config{
				Platforms: map[string]PlatformConfig{
					"claude": {
						Enabled:    true,
						SkillsPath: "",
						OutputPath: ".claude",
					},
				},
			},
			platform:  PlatformClaude,
			shouldErr: true,
		},
		{
			name: "missing output path",
			cfg: &Config{
				Platforms: map[string]PlatformConfig{
					"claude": {
						Enabled:    true,
						SkillsPath: ".claude/skills",
						OutputPath: "",
					},
				},
			},
			platform:  PlatformClaude,
			shouldErr: true,
		},
		{
			name: "non-existent platform",
			cfg: &Config{
				Platforms: map[string]PlatformConfig{},
			},
			platform:  PlatformClaude,
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			pl := NewPlatformLoader(tt.cfg)
			err := pl.ValidatePlatformConfig(tt.platform)
			if tt.shouldErr && err == nil {
				t.Error("Expected validation error, got nil")
			}
			if !tt.shouldErr && err != nil {
				t.Errorf("Expected no validation error, got: %v", err)
			}
		})
	}
}

func TestGetPlatformFileExtension(t *testing.T) {
	cfg := &Config{}
	pl := NewPlatformLoader(cfg)

	tests := []struct {
		platform PlatformType
		expected string
	}{
		{PlatformClaude, ".md"},
		{PlatformCursor, ".mdc"},
		{PlatformCodex, ".md"},
		{PlatformFactory, ".md"},
		{PlatformType("unknown"), ".md"},
	}

	for _, tt := range tests {
		t.Run(string(tt.platform), func(t *testing.T) {
			ext := pl.GetPlatformFileExtension(tt.platform)
			if ext != tt.expected {
				t.Errorf("Expected extension '%s', got '%s'", tt.expected, ext)
			}
		})
	}
}

func TestIsPlatformFile(t *testing.T) {
	cfg := &Config{
		Platforms: map[string]PlatformConfig{
			"claude": {
				Enabled:      true,
				SkillsPath:   ".claude/skills",
				CommandsPath: ".claude/commands",
				AgentsPath:   ".claude/agents",
				OutputPath:   ".claude",
			},
			"cursor": {
				Enabled:    true,
				SkillsPath: ".cursor/rules",
				OutputPath: ".cursor",
			},
		},
	}

	pl := NewPlatformLoader(cfg)

	tests := []struct {
		name     string
		platform PlatformType
		filePath string
		expected bool
	}{
		{"claude skill file", PlatformClaude, ".claude/skills/test.md", true},
		{"claude command file", PlatformClaude, ".claude/commands/test.md", true},
		{"claude agent file", PlatformClaude, ".claude/agents/test.md", true},
		{"cursor skill file", PlatformCursor, ".cursor/rules/test.mdc", true},
		{"wrong platform", PlatformClaude, ".cursor/rules/test.mdc", false},
		{"unrelated file", PlatformClaude, "src/main.go", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := pl.IsPlatformFile(tt.platform, tt.filePath)
			if result != tt.expected {
				t.Errorf("Expected %v for path '%s', got %v", tt.expected, tt.filePath, result)
			}
		})
	}
}

func TestGetPlatformFromPath(t *testing.T) {
	cfg := &Config{
		Platforms: map[string]PlatformConfig{
			"claude": {
				Enabled:    true,
				SkillsPath: ".claude/skills",
				OutputPath: ".claude",
			},
			"cursor": {
				Enabled:    true,
				SkillsPath: ".cursor/rules",
				OutputPath: ".cursor",
			},
		},
	}

	pl := NewPlatformLoader(cfg)

	tests := []struct {
		name      string
		filePath  string
		expected  PlatformType
		shouldErr bool
	}{
		{"claude file", ".claude/skills/test.md", PlatformClaude, false},
		{"cursor file", ".cursor/rules/test.mdc", PlatformCursor, false},
		{"unrelated file", "src/main.go", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			platform, err := pl.GetPlatformFromPath(tt.filePath)
			if tt.shouldErr {
				if err == nil {
					t.Error("Expected error, got nil")
				}
			} else {
				if err != nil {
					t.Fatalf("Unexpected error: %v", err)
				}
				if platform != tt.expected {
					t.Errorf("Expected platform '%s', got '%s'", tt.expected, platform)
				}
			}
		})
	}
}
