package hooks

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// validDestPathPattern matches safe destination paths within .claude/hooks/
var validDestPathPattern = regexp.MustCompile(`^\.claude/hooks/[a-zA-Z0-9_\-/]+\.(sh|py|js)$`)

// sanitizeDestPath validates and cleans a destination path to prevent path traversal
func sanitizeDestPath(destPath string) (string, error) {
	// Clean the path to resolve . and .. components
	cleaned := filepath.Clean(destPath)

	// Convert to forward slashes for consistent validation
	normalized := filepath.ToSlash(cleaned)

	// Check for path traversal attempts
	if strings.HasPrefix(normalized, "..") || strings.Contains(normalized, "/../") {
		return "", fmt.Errorf("path traversal detected in destPath: %s", destPath)
	}

	// Reject absolute paths
	if filepath.IsAbs(cleaned) {
		return "", fmt.Errorf("absolute paths not allowed: %s", destPath)
	}

	// Validate against allowed pattern
	if !validDestPathPattern.MatchString(normalized) {
		return "", fmt.Errorf("destPath must match pattern .claude/hooks/<name>.(sh|py|js): got %s", destPath)
	}

	return cleaned, nil
}

// InstallHooks copies hooks to .claude/hooks/ with correct permissions
func InstallHooks(registry *HookRegistry, projectRoot string) error {
	for _, hook := range registry.Hooks {
		// Skip lib/ helpers for installation (they're already in place)
		if strings.Contains(hook.DestPath, "/lib/") {
			continue
		}

		// Validate destination path to prevent path traversal
		sanitizedPath, err := sanitizeDestPath(hook.DestPath)
		if err != nil {
			return fmt.Errorf("invalid hook destination for %s: %w", hook.Name, err)
		}

		destPath := filepath.Join(projectRoot, sanitizedPath)

		// Create nested directory structure
		destDir := filepath.Dir(destPath)
		if err := os.MkdirAll(destDir, 0755); err != nil {
			return fmt.Errorf("failed to create directory %s: %w", destDir, err)
		}

		// Copy file (preserving content)
		if err := copyFile(hook.Path, destPath); err != nil {
			return fmt.Errorf("failed to copy %s: %w", hook.Name, err)
		}

		// Set executable permissions
		if err := os.Chmod(destPath, 0755); err != nil {
			return fmt.Errorf("failed to chmod %s: %w", destPath, err)
		}
	}

	return nil
}

// copyFile copies a file from src to dst
func copyFile(src, dst string) error {
	// Check if source and destination are the same
	srcAbs, err := filepath.Abs(src)
	if err != nil {
		return err
	}
	dstAbs, err := filepath.Abs(dst)
	if err != nil {
		return err
	}

	// Skip copy if source and dest are the same file
	if srcAbs == dstAbs {
		return nil
	}

	// Open source file
	srcFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	// Create destination file
	dstFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer dstFile.Close()

	// Copy content
	if _, err := io.Copy(dstFile, srcFile); err != nil {
		return err
	}

	// Sync to ensure write completes
	return dstFile.Sync()
}

// InstallHooksWithProgress installs hooks and reports progress via callback
func InstallHooksWithProgress(registry *HookRegistry, projectRoot string, progressCallback func(current, total int, hookName string)) error {
	// Filter out lib/ helpers for installation count
	installableHooks := []Hook{}
	for _, hook := range registry.Hooks {
		if !strings.Contains(hook.DestPath, "/lib/") {
			installableHooks = append(installableHooks, hook)
		}
	}

	total := len(installableHooks)

	for i, hook := range installableHooks {
		if progressCallback != nil {
			progressCallback(i+1, total, hook.Name)
		}

		// Validate destination path to prevent path traversal
		sanitizedPath, err := sanitizeDestPath(hook.DestPath)
		if err != nil {
			return fmt.Errorf("invalid hook destination for %s: %w", hook.Name, err)
		}

		destPath := filepath.Join(projectRoot, sanitizedPath)

		// Create nested directory structure
		destDir := filepath.Dir(destPath)
		if err := os.MkdirAll(destDir, 0755); err != nil {
			return fmt.Errorf("failed to create directory %s: %w", destDir, err)
		}

		// Copy file
		if err := copyFile(hook.Path, destPath); err != nil {
			return fmt.Errorf("failed to copy %s: %w", hook.Name, err)
		}

		// Set executable permissions
		if err := os.Chmod(destPath, 0755); err != nil {
			return fmt.Errorf("failed to chmod %s: %w", destPath, err)
		}
	}

	return nil
}
