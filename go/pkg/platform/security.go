// Package platform provides security utilities for platform builders.
package platform

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// SecurityConfig holds security constraints for file operations.
type SecurityConfig struct {
	// MaxFileSize is the maximum allowed file size in bytes (default: 10MB).
	MaxFileSize int64

	// AllowSymlinks if true, allows following symlinks (default: false).
	AllowSymlinks bool

	// FileMode is the default file permissions (default: 0644).
	FileMode os.FileMode

	// DirMode is the default directory permissions (default: 0755).
	DirMode os.FileMode
}

// DefaultSecurityConfig returns secure default settings.
func DefaultSecurityConfig() *SecurityConfig {
	return &SecurityConfig{
		MaxFileSize:   10 * 1024 * 1024, // 10MB
		AllowSymlinks: false,
		FileMode:      0644,
		DirMode:       0755,
	}
}

// ValidatePath ensures a path is safe and within the expected base directory.
// It prevents path traversal attacks (../) and validates symlinks.
func ValidatePath(path, baseDir string, cfg *SecurityConfig) error {
	if cfg == nil {
		cfg = DefaultSecurityConfig()
	}

	// Clean and resolve the paths
	cleanPath := filepath.Clean(path)
	cleanBase := filepath.Clean(baseDir)

	// Get absolute paths for comparison
	absPath, err := filepath.Abs(cleanPath)
	if err != nil {
		return fmt.Errorf("failed to resolve path: %w", err)
	}

	absBase, err := filepath.Abs(cleanBase)
	if err != nil {
		return fmt.Errorf("failed to resolve base directory: %w", err)
	}

	// Check for path traversal - path must be within base directory
	// Add trailing separator to base to prevent prefix matching issues
	// e.g., /foo/bar should not match /foo/barbaz
	if !strings.HasPrefix(absPath+string(filepath.Separator), absBase+string(filepath.Separator)) &&
		absPath != absBase {
		return fmt.Errorf("path traversal detected: %s is outside %s", absPath, absBase)
	}

	// Check for symlinks if not allowed
	if !cfg.AllowSymlinks {
		// Check each component of the path for symlinks
		current := absBase
		relPath, err := filepath.Rel(absBase, absPath)
		if err != nil {
			return fmt.Errorf("failed to get relative path: %w", err)
		}

		parts := strings.Split(relPath, string(filepath.Separator))
		for _, part := range parts {
			if part == "" || part == "." {
				continue
			}
			current = filepath.Join(current, part)
			info, err := os.Lstat(current)
			if err != nil {
				if os.IsNotExist(err) {
					// Path doesn't exist yet, which is fine for destination paths
					break
				}
				return fmt.Errorf("failed to stat %s: %w", current, err)
			}
			if info.Mode()&os.ModeSymlink != 0 {
				return fmt.Errorf("symlink detected in path: %s", current)
			}
		}
	}

	return nil
}

// ValidateFileSize checks if a file is within the allowed size limit.
func ValidateFileSize(path string, cfg *SecurityConfig) error {
	if cfg == nil {
		cfg = DefaultSecurityConfig()
	}

	info, err := os.Stat(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil // File doesn't exist yet
		}
		return fmt.Errorf("failed to stat file: %w", err)
	}

	if info.Size() > cfg.MaxFileSize {
		return fmt.Errorf("file size %d exceeds limit %d: %s", info.Size(), cfg.MaxFileSize, path)
	}

	return nil
}

// ValidateFileName checks if a filename is safe.
// Prevents null bytes, control characters, and reserved names.
func ValidateFileName(name string) error {
	if name == "" {
		return fmt.Errorf("filename cannot be empty")
	}

	// Check for null bytes
	if strings.Contains(name, "\x00") {
		return fmt.Errorf("filename contains null byte")
	}

	// Check for control characters
	for _, r := range name {
		if r < 32 {
			return fmt.Errorf("filename contains control character: %q", r)
		}
	}

	// Check for path separators (shouldn't be in a filename)
	if strings.ContainsAny(name, "/\\") {
		return fmt.Errorf("filename contains path separator")
	}

	// Check for reserved names on Windows (also bad practice elsewhere)
	reserved := []string{
		"CON", "PRN", "AUX", "NUL",
		"COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
		"LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
	}
	upperName := strings.ToUpper(strings.TrimSuffix(name, filepath.Ext(name)))
	for _, r := range reserved {
		if upperName == r {
			return fmt.Errorf("filename uses reserved name: %s", name)
		}
	}

	return nil
}

// SecureCopyFile copies a file with security validations.
// It validates paths, checks file sizes, and uses secure permissions.
func SecureCopyFile(src, dst, srcBase, dstBase string, cfg *SecurityConfig) error {
	if cfg == nil {
		cfg = DefaultSecurityConfig()
	}

	// Validate source path
	if err := ValidatePath(src, srcBase, cfg); err != nil {
		return fmt.Errorf("invalid source path: %w", err)
	}

	// Validate destination path
	if err := ValidatePath(dst, dstBase, cfg); err != nil {
		return fmt.Errorf("invalid destination path: %w", err)
	}

	// Validate file size
	if err := ValidateFileSize(src, cfg); err != nil {
		return fmt.Errorf("source file validation failed: %w", err)
	}

	// Open source file
	srcFile, err := os.Open(src)
	if err != nil {
		return fmt.Errorf("failed to open source file: %w", err)
	}
	defer srcFile.Close()

	// Get source file info to verify it's a regular file
	srcInfo, err := srcFile.Stat()
	if err != nil {
		return fmt.Errorf("failed to stat source file: %w", err)
	}

	if !srcInfo.Mode().IsRegular() {
		return fmt.Errorf("source is not a regular file: %s", src)
	}

	// Create destination directory if needed
	dstDir := filepath.Dir(dst)
	if err := os.MkdirAll(dstDir, cfg.DirMode); err != nil {
		return fmt.Errorf("failed to create destination directory: %w", err)
	}

	// Create destination file with secure permissions
	dstFile, err := os.OpenFile(dst, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, cfg.FileMode)
	if err != nil {
		return fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dstFile.Close()

	// Copy content with size limit check
	written, err := copyWithLimit(dstFile, srcFile, cfg.MaxFileSize)
	if err != nil {
		// Clean up partial file on error
		os.Remove(dst)
		return fmt.Errorf("failed to copy file content: %w", err)
	}

	if written != srcInfo.Size() {
		os.Remove(dst)
		return fmt.Errorf("copy size mismatch: wrote %d, expected %d", written, srcInfo.Size())
	}

	return nil
}

// copyWithLimit copies from src to dst with a size limit.
func copyWithLimit(dst *os.File, src *os.File, limit int64) (int64, error) {
	var total int64
	buf := make([]byte, 32*1024) // 32KB buffer

	for {
		n, err := src.Read(buf)
		if n > 0 {
			total += int64(n)
			if total > limit {
				return total, fmt.Errorf("file exceeds size limit of %d bytes", limit)
			}
			if _, writeErr := dst.Write(buf[:n]); writeErr != nil {
				return total, writeErr
			}
		}
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			return total, err
		}
	}

	return total, nil
}

// SecureWriteFile writes content to a file with security validations.
func SecureWriteFile(path, baseDir string, content []byte, cfg *SecurityConfig) error {
	if cfg == nil {
		cfg = DefaultSecurityConfig()
	}

	// Validate path
	if err := ValidatePath(path, baseDir, cfg); err != nil {
		return fmt.Errorf("invalid path: %w", err)
	}

	// Validate content size
	if int64(len(content)) > cfg.MaxFileSize {
		return fmt.Errorf("content size %d exceeds limit %d", len(content), cfg.MaxFileSize)
	}

	// Validate filename
	if err := ValidateFileName(filepath.Base(path)); err != nil {
		return fmt.Errorf("invalid filename: %w", err)
	}

	// Create directory if needed
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, cfg.DirMode); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// Write file with secure permissions
	if err := os.WriteFile(path, content, cfg.FileMode); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}
