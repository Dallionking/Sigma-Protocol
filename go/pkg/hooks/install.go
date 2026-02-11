package hooks

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

// InstallHooks copies hooks to .claude/hooks/ with correct permissions
func InstallHooks(registry *HookRegistry, projectRoot string) error {
	for _, hook := range registry.Hooks {
		// Skip lib/ helpers for installation (they're already in place)
		if strings.Contains(hook.DestPath, "/lib/") {
			continue
		}

		destPath := filepath.Join(projectRoot, hook.DestPath)

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

		destPath := filepath.Join(projectRoot, hook.DestPath)

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
