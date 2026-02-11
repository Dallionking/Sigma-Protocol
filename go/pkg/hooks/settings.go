package hooks

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// SettingsJSON represents the Claude Code settings.json structure
type SettingsJSON struct {
	Hooks map[HookEvent][]HookEntry `json:"hooks"`
}

// HookEntry represents a group of hooks with an optional matcher
type HookEntry struct {
	Matcher string        `json:"matcher,omitempty"`
	Hooks   []HookCommand `json:"hooks"`
}

// HookCommand represents a single hook command
type HookCommand struct {
	Type    string `json:"type"`
	Command string `json:"command"`
}

// GenerateSettingsJSON creates or updates settings.json with hook entries
func GenerateSettingsJSON(registry *HookRegistry, projectRoot string) error {
	settingsPath := filepath.Join(projectRoot, ".claude/settings.json")

	// Load existing settings
	existing, err := loadSettings(settingsPath)
	if err != nil {
		// Create new settings if file doesn't exist
		existing = &SettingsJSON{Hooks: make(map[HookEvent][]HookEntry)}
	}

	// Group hooks by event
	hooksByEvent := groupHooksByEvent(registry)

	// Generate hook entries for each event
	for event, hooks := range hooksByEvent {
		entries := []HookEntry{}

		// Group hooks by matcher pattern
		hooksByMatcher := groupByMatcher(hooks)

		for matcher, matcherHooks := range hooksByMatcher {
			entry := HookEntry{
				Matcher: matcher,
				Hooks:   []HookCommand{},
			}

			for _, hook := range matcherHooks {
				cmd := buildHookCommand(&hook, event)
				entry.Hooks = append(entry.Hooks, cmd)
			}

			entries = append(entries, entry)
		}

		existing.Hooks[event] = entries
	}

	// Write settings.json
	return writeSettings(settingsPath, existing)
}

// buildHookCommand constructs the command string for a hook
func buildHookCommand(hook *Hook, event HookEvent) HookCommand {
	cmd := HookCommand{
		Type:    "command",
		Command: fmt.Sprintf("bash \"$CLAUDE_PROJECT_DIR/%s\"", hook.DestPath),
	}

	// Add file path argument for validators (PostToolUse events)
	if event == EventPostToolUse && (strings.Contains(hook.Name, "validator") || strings.Contains(hook.SubDir, "validators")) {
		cmd.Command += " \"$CLAUDE_FILE_PATH\""
	}

	return cmd
}

// groupHooksByEvent organizes hooks by their event type
func groupHooksByEvent(registry *HookRegistry) map[HookEvent][]Hook {
	result := make(map[HookEvent][]Hook)

	for _, hook := range registry.Hooks {
		// Skip lib/ helpers
		if hook.SubDir == "lib" {
			continue
		}

		result[hook.Event] = append(result[hook.Event], hook)
	}

	return result
}

// groupByMatcher organizes hooks by their matcher pattern
func groupByMatcher(hooks []Hook) map[string][]Hook {
	result := make(map[string][]Hook)

	for _, hook := range hooks {
		matcher := hook.Matcher
		if matcher == "" {
			matcher = "" // Empty string key for hooks without matcher
		}
		result[matcher] = append(result[matcher], hook)
	}

	return result
}

// loadSettings reads existing settings.json
func loadSettings(path string) (*SettingsJSON, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var settings SettingsJSON
	if err := json.Unmarshal(data, &settings); err != nil {
		return nil, err
	}

	// Initialize hooks map if nil
	if settings.Hooks == nil {
		settings.Hooks = make(map[HookEvent][]HookEntry)
	}

	return &settings, nil
}

// writeSettings writes settings.json with pretty formatting
func writeSettings(path string, settings *SettingsJSON) error {
	// Ensure directory exists
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// Marshal with indentation
	data, err := json.MarshalIndent(settings, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal settings: %w", err)
	}

	// Write to file
	if err := os.WriteFile(path, data, 0644); err != nil {
		return fmt.Errorf("failed to write settings.json: %w", err)
	}

	return nil
}
