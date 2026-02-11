package hooks

import (
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// DiscoverHooks scans .claude/hooks/ for all hook scripts and returns a registry
func DiscoverHooks(projectRoot string) (*HookRegistry, error) {
	registry := &HookRegistry{
		Hooks: make([]Hook, 0),
	}

	// Hooks are consolidated in .claude/hooks/ (not in platform directories)
	hooksDir := filepath.Join(projectRoot, ".claude/hooks")

	// Check if hooks directory exists
	if _, err := os.Stat(hooksDir); os.IsNotExist(err) {
		return registry, nil // Return empty registry if no hooks dir
	}

	err := filepath.Walk(hooksDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip lib/ directories (helpers, not hooks)
		if strings.Contains(path, "/lib/") {
			if info.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		// Only process shell/Python scripts
		if info.IsDir() || !isHookScript(path) {
			return nil
		}

		hook, err := parseHook(path, projectRoot)
		if err != nil {
			// Log error but don't fail discovery
			return nil
		}

		registry.Hooks = append(registry.Hooks, *hook)
		return nil
	})

	if err != nil {
		return nil, err
	}

	// Sort hooks by path for deterministic ordering
	sort.Slice(registry.Hooks, func(i, j int) bool {
		return registry.Hooks[i].Path < registry.Hooks[j].Path
	})

	return registry, nil
}

// isHookScript checks if a file is a shell or Python script
func isHookScript(path string) bool {
	ext := filepath.Ext(path)
	return ext == ".sh" || ext == ".py"
}
