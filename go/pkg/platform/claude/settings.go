package claude

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/dallionking/sigma-protocol/pkg/hooks"
	"github.com/dallionking/sigma-protocol/pkg/platform"
)

// SettingsJSON represents the Claude Code settings.json structure.
type SettingsJSON struct {
	Env         map[string]string        `json:"env"`
	Permissions PermissionsConfig        `json:"permissions"`
	Hooks       map[string][]HookGroup   `json:"hooks,omitempty"`
}

// PermissionsConfig represents the permissions section of settings.json.
type PermissionsConfig struct {
	Allow         []string `json:"allow"`
	McpAutoEnable string   `json:"mcpAutoEnable"`
}

// HookGroup represents a group of hooks with an optional matcher.
type HookGroup struct {
	Matcher string      `json:"matcher,omitempty"`
	Hooks   []HookEntry `json:"hooks"`
}

// HookEntry represents a single hook command.
type HookEntry struct {
	Type    string `json:"type"`
	Command string `json:"command"`
}

// generateSettings generates the settings.json file with hooks integration.
func (b *Builder) generateSettings(dest string, hookRegistry *hooks.HookRegistry) error {
	settings := &SettingsJSON{
		Env:         getDefaultEnvVars(),
		Permissions: getDefaultPermissions(),
	}

	// Add hooks from registry
	if err := settings.AddHooks(hookRegistry); err != nil {
		return fmt.Errorf("failed to add hooks: %w", err)
	}

	// Write settings.json
	settingsPath := filepath.Join(dest, ".claude/settings.json")
	if err := settings.Write(settingsPath); err != nil {
		return fmt.Errorf("failed to write settings.json: %w", err)
	}

	return nil
}

// getDefaultEnvVars returns the default environment variables for Claude Code.
func getDefaultEnvVars() map[string]string {
	return map[string]string{
		"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
		"ENABLE_TOOL_SEARCH":                   "auto:5",
		"CLAUDE_CODE_MAX_OUTPUT_TOKENS":        "64000",
		"CLAUDE_CODE_AUTOCOMPACT_PCT_OVERRIDE": "85",
		"CLAUDE_CODE_EFFORT_LEVEL":             "high",
		"SLASH_COMMAND_TOOL_CHAR_BUDGET":       "500000",
	}
}

// getDefaultPermissions returns the default permissions configuration.
func getDefaultPermissions() PermissionsConfig {
	return PermissionsConfig{
		Allow: []string{
			"Bash(git *)",
			"Read(src/**)",
			"Bash(xcrun mcpbridge*)",
		},
		McpAutoEnable: "auto:3",
	}
}

// AddHooks adds hooks from the hook registry to settings.json.
func (s *SettingsJSON) AddHooks(hookRegistry *hooks.HookRegistry) error {
	// Group hooks by event type
	hooksByEvent := groupHooksByEvent(hookRegistry.Hooks)

	// Generate hook entries for each event
	s.Hooks = make(map[string][]HookGroup)

	for event, eventHooks := range hooksByEvent {
		groups := []HookGroup{}

		// Group by matcher pattern
		hooksByMatcher := groupByMatcher(eventHooks)

		for matcher, matcherHooks := range hooksByMatcher {
			group := HookGroup{
				Matcher: matcher,
				Hooks:   []HookEntry{},
			}

			for _, hook := range matcherHooks {
				entry := HookEntry{
					Type:    "command",
					Command: fmt.Sprintf("bash \"$CLAUDE_PROJECT_DIR/%s\"", hook.DestPath),
				}

				// Add file path argument for validators
				if event == hooks.EventPostToolUse && strings.Contains(hook.Name, "validator") {
					entry.Command += " \"$CLAUDE_FILE_PATH\""
				}

				group.Hooks = append(group.Hooks, entry)
			}

			groups = append(groups, group)
		}

		s.Hooks[string(event)] = groups
	}

	return nil
}

// Write writes the settings.json to the specified path.
func (s *SettingsJSON) Write(path string) error {
	// Ensure directory exists
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// Marshal to JSON with indentation
	data, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal settings: %w", err)
	}

	// Write to file
	if err := os.WriteFile(path, data, 0644); err != nil {
		return fmt.Errorf("failed to write settings file: %w", err)
	}

	return nil
}

// Validate validates the settings.json structure.
func (s *SettingsJSON) Validate() error {
	// Validate env vars are strings
	if s.Env == nil {
		return fmt.Errorf("env vars cannot be nil")
	}

	// Validate permissions
	if len(s.Permissions.Allow) == 0 {
		return fmt.Errorf("permissions.allow cannot be empty")
	}

	// Validate hook structure
	for event, groups := range s.Hooks {
		if event == "" {
			return fmt.Errorf("hook event cannot be empty")
		}
		for i, group := range groups {
			if len(group.Hooks) == 0 {
				return fmt.Errorf("hook group %d for event %s has no hooks", i, event)
			}
			for j, hook := range group.Hooks {
				if hook.Type != "command" {
					return fmt.Errorf("hook %d in group %d for event %s has invalid type: %s", j, i, event, hook.Type)
				}
				if hook.Command == "" {
					return fmt.Errorf("hook %d in group %d for event %s has empty command", j, i, event)
				}
			}
		}
	}

	return nil
}

// groupHooksByEvent groups hooks by their event type.
func groupHooksByEvent(hks []hooks.Hook) map[hooks.HookEvent][]hooks.Hook {
	grouped := make(map[hooks.HookEvent][]hooks.Hook)
	for _, hook := range hks {
		grouped[hook.Event] = append(grouped[hook.Event], hook)
	}
	return grouped
}

// groupByMatcher groups hooks by their matcher pattern.
func groupByMatcher(hks []hooks.Hook) map[string][]hooks.Hook {
	grouped := make(map[string][]hooks.Hook)
	for _, hook := range hks {
		matcher := hook.Matcher
		if matcher == "" {
			matcher = "" // Default group for hooks without matchers
		}
		grouped[matcher] = append(grouped[matcher], hook)
	}
	return grouped
}

// validateSettingsJSON validates the settings.json file.
func validateSettingsJSON(path string, result *platform.ValidationResult) error {
	// Check file exists
	if _, err := os.Stat(path); os.IsNotExist(err) {
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "MISSING_SETTINGS",
			Message: "settings.json not found",
			File:    path,
		})
		return nil
	}

	// Read and parse JSON
	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("failed to read settings.json: %w", err)
	}

	var settings SettingsJSON
	if err := json.Unmarshal(data, &settings); err != nil {
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "INVALID_JSON",
			Message: fmt.Sprintf("settings.json has invalid JSON: %v", err),
			File:    path,
		})
		return nil
	}

	// Validate structure
	if err := settings.Validate(); err != nil {
		result.Errors = append(result.Errors, platform.ValidationError{
			Code:    "INVALID_SETTINGS",
			Message: err.Error(),
			File:    path,
		})
	}

	return nil
}
