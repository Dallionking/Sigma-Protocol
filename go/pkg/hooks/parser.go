package hooks

import (
	"bufio"
	"os"
	"path/filepath"
	"strings"
)

// parseHook extracts hook metadata from file headers and infers event types
func parseHook(path, projectRoot string) (*Hook, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// Compute relative path and subdirectory category
	hooksBase := filepath.Join(projectRoot, ".claude/hooks")
	relPath, _ := filepath.Rel(hooksBase, path)
	subDir := filepath.Dir(relPath)
	if subDir == "." {
		subDir = "" // Root-level hook
	}

	hook := &Hook{
		Name:         filepath.Base(path),
		Path:         path,
		SubDir:       subDir, // "validators", "slas", "lib", or "" for root
		Dependencies: []string{},
	}

	scanner := bufio.NewScanner(file)
	inHeader := false

	for scanner.Scan() {
		line := scanner.Text()

		// Detect header block (=============)
		if strings.HasPrefix(line, "# ====") {
			inHeader = !inHeader
			continue
		}

		if !inHeader {
			continue
		}

		// Parse metadata
		if strings.HasPrefix(line, "# Event:") {
			hook.Event = HookEvent(strings.TrimSpace(strings.TrimPrefix(line, "# Event:")))
		} else if strings.HasPrefix(line, "# Required:") {
			hook.Required = strings.Contains(line, "true")
		} else if strings.HasPrefix(line, "# Description:") {
			hook.Description = strings.TrimSpace(strings.TrimPrefix(line, "# Description:"))
		} else if strings.HasPrefix(line, "# Matcher:") {
			hook.Matcher = strings.TrimSpace(strings.TrimPrefix(line, "# Matcher:"))
		}
	}

	// Infer event if not explicit
	if hook.Event == "" {
		hook.Event = inferEventFromFilename(hook.Name, hook.SubDir)
	}

	// DestPath is the target installation path (same structure as source)
	// Since hooks are already in .claude/hooks/, DestPath preserves structure
	hook.DestPath = filepath.Join(".claude/hooks", relPath)

	return hook, scanner.Err()
}

// inferEventFromFilename determines the hook event from filename and directory
func inferEventFromFilename(filename, subDir string) HookEvent {
	// Validators are always PostToolUse
	if subDir == "validators" {
		return EventPostToolUse
	}

	// SLAS session hooks
	if subDir == "slas" {
		if strings.Contains(filename, "session-start") {
			return EventSessionStart
		}
		if strings.Contains(filename, "session-end") {
			return EventSessionEnd
		}
	}

	// Root-level hooks - infer from filename
	switch {
	case strings.Contains(filename, "setup"):
		return EventSessionStart
	case strings.Contains(filename, "session-start"):
		return EventSessionStart
	case strings.Contains(filename, "session-end"):
		return EventSessionEnd
	case strings.Contains(filename, "ralph-skill"):
		return EventPreToolUse
	case strings.Contains(filename, "orchestrator-stop"):
		return EventStop
	case strings.Contains(filename, "idle"):
		return EventTeammateIdle
	case strings.Contains(filename, "task-completed"):
		return EventTaskCompleted
	case strings.Contains(filename, "iterm-launcher"):
		return EventSubagentStart
	case strings.Contains(filename, "pane-watcher"):
		return EventPostToolUse
	case strings.Contains(filename, "greptile-pr"):
		return EventPostToolUse
	default:
		return EventPostToolUse // Safe default
	}
}
