package codex

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/BurntSushi/toml"
	"github.com/dallionking/sigma-protocol/pkg/platform"
)

// CodexConfig represents the complete config.toml structure for Codex.
type CodexConfig struct {
	// Schema validation URL
	Schema string `toml:"#:schema,omitempty"`

	// Model configuration
	Model                string `toml:"model"`
	ApprovalPolicy       string `toml:"approval_policy"`
	SandboxMode          string `toml:"sandbox_mode"`
	ModelReasoningEffort string `toml:"model_reasoning_effort"`
	WebSearch            string `toml:"web_search"`
	ModelPersonality     string `toml:"model_personality"`

	// Feature flags
	Features FeatureFlags `toml:"features"`

	// Shell environment
	ShellEnvironmentPolicy ShellEnvPolicy `toml:"shell_environment_policy"`

	// Profiles
	Profiles map[string]Profile `toml:"profiles"`

	// MCP servers
	MCPServers map[string]MCPServer `toml:"mcp_servers"`

	// Sandbox network access
	SandboxWorkspaceWrite SandboxConfig `toml:"sandbox_workspace_write"`
}

// FeatureFlags contains feature toggles.
type FeatureFlags struct {
	UnifiedExec       bool `toml:"unified_exec"`
	ExecPolicy        bool `toml:"exec_policy"`
	ApplyPatchFreeform bool `toml:"apply_patch_freeform"`
}

// ShellEnvPolicy defines shell environment inheritance.
type ShellEnvPolicy struct {
	Inherit     string   `toml:"inherit"`
	IncludeOnly []string `toml:"include_only"`
}

// Profile represents a named configuration profile.
type Profile struct {
	ApprovalPolicy       string `toml:"approval_policy"`
	ModelReasoningEffort string `toml:"model_reasoning_effort"`
	SandboxMode          string `toml:"sandbox_mode"`
}

// MCPServer represents an MCP server configuration.
type MCPServer struct {
	Type              string   `toml:"type,omitempty"`
	Command           string   `toml:"command,omitempty"`
	Args              []string `toml:"args,omitempty"`
	URL               string   `toml:"url,omitempty"`
	BearerTokenEnvVar string   `toml:"bearer_token_env_var,omitempty"`
}

// SandboxConfig contains sandbox settings.
type SandboxConfig struct {
	NetworkAccess bool `toml:"network_access"`
}

// GenerateConfig creates a CodexConfig with platform defaults.
func GenerateConfig() *CodexConfig {
	return &CodexConfig{
		Schema:               "https://developers.openai.com/codex/config-schema.json",
		Model:                "gpt-5.3-codex",
		ApprovalPolicy:       "on-request",
		SandboxMode:          "workspace-write",
		ModelReasoningEffort: "high",
		WebSearch:            "cached",
		ModelPersonality:     "pragmatic",

		Features: FeatureFlags{
			UnifiedExec:       true,
			ExecPolicy:        true,
			ApplyPatchFreeform: true,
		},

		ShellEnvironmentPolicy: ShellEnvPolicy{
			Inherit: "core",
			IncludeOnly: []string{
				"PATH",
				"HOME",
				"NODE_PATH",
				"EDITOR",
				"SHELL",
				"TERM",
				"USER",
				"LANG",
				"LC_ALL",
				"GH_TOKEN",
				"NPM_TOKEN",
			},
		},

		Profiles: map[string]Profile{
			"sigma-dev": {
				ApprovalPolicy:       "on-request",
				ModelReasoningEffort: "high",
				SandboxMode:          "workspace-write",
			},
			"sigma-strict": {
				ApprovalPolicy:       "untrusted",
				ModelReasoningEffort: "high",
				SandboxMode:          "read-only",
			},
			"sigma-fast": {
				ApprovalPolicy:       "on-failure",
				ModelReasoningEffort: "medium",
				SandboxMode:          "workspace-write",
			},
		},

		MCPServers: map[string]MCPServer{
			"firecrawl": {
				Command: "npx",
				Args:    []string{"-y", "firecrawl-mcp"},
			},
			"exa": {
				Command: "npx",
				Args:    []string{"-y", "@anthropic/exa-mcp-server"},
			},
			"ref": {
				Command: "npx",
				Args:    []string{"-y", "@anthropic/ref-mcp-server"},
			},
			"task-master-ai": {
				Command: "npx",
				Args:    []string{"-y", "--package=task-master-ai", "task-master-ai"},
			},
			"greptile": {
				Type:              "http",
				URL:               "https://api.greptile.com/mcp",
				BearerTokenEnvVar: "GREPTILE_API_KEY",
			},
		},

		SandboxWorkspaceWrite: SandboxConfig{
			NetworkAccess: true,
		},
	}
}

// WriteTOML writes the config to a TOML file.
func (c *CodexConfig) WriteTOML(path string) error {
	// Get security config for consistent permissions
	cfg := platform.DefaultSecurityConfig()

	// Create directory if missing
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, cfg.DirMode); err != nil {
		return fmt.Errorf("failed to create directory %s: %w", dir, err)
	}

	// Create file with secure permissions
	f, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, cfg.FileMode)
	if err != nil {
		return fmt.Errorf("failed to create file %s: %w", path, err)
	}
	defer f.Close()

	// Write TOML header comment
	if _, err := f.WriteString("#:schema https://developers.openai.com/codex/config-schema.json\n"); err != nil {
		return fmt.Errorf("failed to write schema comment: %w", err)
	}
	if _, err := f.WriteString("# Sigma Protocol - Codex Production Configuration\n\n"); err != nil {
		return fmt.Errorf("failed to write header comment: %w", err)
	}

	// Encode TOML
	encoder := toml.NewEncoder(f)
	if err := encoder.Encode(c); err != nil {
		return fmt.Errorf("failed to encode TOML: %w", err)
	}

	return nil
}

// LoadUserConfig loads existing user config from .codex/config.toml.
// Returns nil if file doesn't exist (not an error).
func LoadUserConfig(path string) (*CodexConfig, error) {
	// Check if file exists
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return nil, nil // Not an error
	}

	var cfg CodexConfig
	if _, err := toml.DecodeFile(path, &cfg); err != nil {
		return nil, fmt.Errorf("failed to parse %s: %w", path, err)
	}

	return &cfg, nil
}

// MergeConfigs merges base and override configs.
// Override values take precedence.
func MergeConfigs(base, override *CodexConfig) *CodexConfig {
	if override == nil {
		return base
	}

	merged := *base // Copy base

	// Merge top-level fields
	if override.Model != "" {
		merged.Model = override.Model
	}
	if override.ApprovalPolicy != "" {
		merged.ApprovalPolicy = override.ApprovalPolicy
	}
	if override.SandboxMode != "" {
		merged.SandboxMode = override.SandboxMode
	}
	if override.ModelReasoningEffort != "" {
		merged.ModelReasoningEffort = override.ModelReasoningEffort
	}
	if override.WebSearch != "" {
		merged.WebSearch = override.WebSearch
	}
	if override.ModelPersonality != "" {
		merged.ModelPersonality = override.ModelPersonality
	}

	// Merge profiles (preserve user-added profiles)
	if len(override.Profiles) > 0 {
		if merged.Profiles == nil {
			merged.Profiles = make(map[string]Profile)
		}
		for name, profile := range override.Profiles {
			merged.Profiles[name] = profile
		}
	}

	// Merge MCP servers (preserve user-added servers)
	if len(override.MCPServers) > 0 {
		if merged.MCPServers == nil {
			merged.MCPServers = make(map[string]MCPServer)
		}
		for name, server := range override.MCPServers {
			merged.MCPServers[name] = server
		}
	}

	// Merge shell environment (append user variables)
	if len(override.ShellEnvironmentPolicy.IncludeOnly) > 0 {
		// Combine and deduplicate
		envVars := make(map[string]bool)
		for _, v := range merged.ShellEnvironmentPolicy.IncludeOnly {
			envVars[v] = true
		}
		for _, v := range override.ShellEnvironmentPolicy.IncludeOnly {
			envVars[v] = true
		}
		merged.ShellEnvironmentPolicy.IncludeOnly = make([]string, 0, len(envVars))
		for v := range envVars {
			merged.ShellEnvironmentPolicy.IncludeOnly = append(merged.ShellEnvironmentPolicy.IncludeOnly, v)
		}
	}

	return &merged
}

// generateConfigFiles generates config.toml in both locations.
func generateConfigFiles(src, dest string, builder *Builder) error {
	// Generate base config
	baseConfig := GenerateConfig()

	// Load user config if exists
	userConfigPath := filepath.Join(dest, ".codex", "config.toml")
	userConfig, err := LoadUserConfig(userConfigPath)
	if err != nil {
		return err
	}

	// Merge configs
	mergedConfig := MergeConfigs(baseConfig, userConfig)

	// Write platform defaults to platforms/codex/config.toml
	platformConfigPath := filepath.Join(dest, "platforms", "codex", "config.toml")
	if err := baseConfig.WriteTOML(platformConfigPath); err != nil {
		return err
	}

	// Track file
	builder.files = append(builder.files, platform.FileEntry{
		Path:       platformConfigPath,
		Type:       platform.FileTypeConfig,
		SourcePath: "",
	})
	builder.metrics.TotalFiles++

	// Write merged config to .codex/config.toml (if user config existed)
	if userConfig != nil {
		if err := mergedConfig.WriteTOML(userConfigPath); err != nil {
			return err
		}
		builder.files = append(builder.files, platform.FileEntry{
			Path:       userConfigPath,
			Type:       platform.FileTypeConfig,
			SourcePath: "",
		})
		builder.metrics.TotalFiles++
	}

	return nil
}
