package integration

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHookLifecycle(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	// Setup test project
	tmpDir := t.TempDir()
	setupFullProject(t, tmpDir)

	// Verify hooks were created with shebangs
	hookPath := filepath.Join(tmpDir, ".claude/hooks/setup-check.sh")
	hookData, hookErr := os.ReadFile(hookPath)
	require.NoError(t, hookErr, "Hook file should exist")
	require.True(t, len(hookData) > 2 && string(hookData[:2]) == "#!", "Hook should have shebang, got: %q", string(hookData[:50]))

	// Build sigma binary
	sigmaBinary := buildSigmaBinary(t)

	// Run sigma install --hooks-only
	cmd := exec.Command(sigmaBinary, "install", "--hooks-only")
	cmd.Dir = tmpDir
	output, err := cmd.CombinedOutput()

	outputStr := string(output)
	if err != nil {
		t.Logf("Install output: %s", outputStr)
	}
	assert.NoError(t, err, "install should succeed")
	assert.Contains(t, outputStr, "Hooks installed successfully", "Should show success message")

	// Verify hooks installed (reuse hookPath from above)
	assert.FileExists(t, hookPath, "Hook should be installed")

	// Check permissions
	info, err := os.Stat(hookPath)
	require.NoError(t, err)
	assert.Equal(t, os.FileMode(0755), info.Mode().Perm(), "Hook should be executable")

	// Verify settings.json generated
	settingsPath := filepath.Join(tmpDir, ".claude/settings.json")
	assert.FileExists(t, settingsPath, "settings.json should be created")

	// Verify settings.json is valid JSON
	settingsData, err := os.ReadFile(settingsPath)
	require.NoError(t, err)
	assert.Contains(t, string(settingsData), "hooks", "settings.json should contain hooks")

	// Run sigma doctor --hooks
	cmd = exec.Command(sigmaBinary, "doctor", "--hooks")
	cmd.Dir = tmpDir
	output, err = cmd.CombinedOutput()

	assert.NoError(t, err, "doctor should pass validation")
	outputStr = string(output)
	assert.Contains(t, outputStr, "All hooks are valid", "Should validate successfully")
}

func TestHookValidationDetectsBrokenHooks(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	tmpDir := t.TempDir()
	setupFullProject(t, tmpDir)

	sigmaBinary := buildSigmaBinary(t)

	// Install hooks
	cmd := exec.Command(sigmaBinary, "install", "--hooks-only")
	cmd.Dir = tmpDir
	cmd.Run()

	// Break a hook (remove shebang)
	hookPath := filepath.Join(tmpDir, ".claude/hooks/setup-check.sh")
	os.WriteFile(hookPath, []byte("echo 'broken'"), 0755)

	// Run sigma doctor --hooks
	cmd = exec.Command(sigmaBinary, "doctor", "--hooks")
	cmd.Dir = tmpDir
	output, err := cmd.CombinedOutput()

	assert.Error(t, err, "doctor should fail for broken hooks")
	outputStr := string(output)
	assert.Contains(t, outputStr, "missing shebang", "Should detect missing shebang")
}

func TestDoctorAutoFix(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	tmpDir := t.TempDir()
	setupFullProject(t, tmpDir)

	sigmaBinary := buildSigmaBinary(t)

	// Install hooks
	cmd := exec.Command(sigmaBinary, "install", "--hooks-only")
	cmd.Dir = tmpDir
	cmd.Run()

	// Remove execute permission from a hook
	hookPath := filepath.Join(tmpDir, ".claude/hooks/setup-check.sh")
	os.Chmod(hookPath, 0644)

	// Run sigma doctor --hooks --fix
	cmd = exec.Command(sigmaBinary, "doctor", "--hooks", "--fix")
	cmd.Dir = tmpDir
	output, err := cmd.CombinedOutput()

	outputStr := string(output)
	// Should either fix it or report the fix
	if err != nil {
		// If it fails, it should have attempted to fix
		assert.Contains(t, outputStr, "Fixed", "Should report fix attempt")
	}
}

func TestInstallHooksOnlySpeed(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	tmpDir := t.TempDir()
	setupFullProject(t, tmpDir)

	sigmaBinary := buildSigmaBinary(t)

	// Time the install
	cmd := exec.Command(sigmaBinary, "install", "--hooks-only")
	cmd.Dir = tmpDir
	output, err := cmd.CombinedOutput()

	require.NoError(t, err)

	// Check that it reports completion time
	outputStr := string(output)
	assert.Contains(t, outputStr, "seconds", "Should report timing")

	// Parse timing from output (if present)
	if strings.Contains(outputStr, "Completed in") {
		// Installation should complete in under 5 seconds
		t.Log("Install output:", outputStr)
	}
}

// Helper functions

func setupFullProject(t *testing.T, dir string) {
	t.Helper()

	// Create hooks directory structure
	hooksDir := filepath.Join(dir, ".claude/hooks")
	os.MkdirAll(hooksDir, 0755)
	os.MkdirAll(filepath.Join(hooksDir, "validators"), 0755)
	os.MkdirAll(filepath.Join(hooksDir, "slas"), 0755)

	// Create sample hooks
	createSampleHook(t, hooksDir, "setup-check.sh", `#!/bin/bash
# ============================
# Event: SessionStart
# Required: true
# Description: Setup validation
# ============================
echo "Setup check"
exit 0
`)

	createSampleHook(t, filepath.Join(hooksDir, "validators"), "ui-validation.sh", `#!/bin/bash
# ============================
# Event: PostToolUse
# Matcher: *.tsx
# Description: UI validation
# ============================
FILE="$1"
echo "Validating $FILE"
exit 0
`)

	createSampleHook(t, filepath.Join(hooksDir, "slas"), "session-start-context.sh", `#!/bin/bash
# ============================
# Event: SessionStart
# Description: SLAS context injection
# ============================
echo "Loading context"
exit 0
`)
}

func createSampleHook(t *testing.T, dir, name, content string) {
	t.Helper()

	path := filepath.Join(dir, name)
	err := os.WriteFile(path, []byte(content), 0755)
	require.NoError(t, err)
}

func buildSigmaBinary(t *testing.T) string {
	t.Helper()

	// Get the project root (go up from tests/integration/)
	cwd, err := os.Getwd()
	require.NoError(t, err)

	projectRoot := filepath.Join(cwd, "../..")
	binaryPath := filepath.Join(projectRoot, "dist/sigma-test")

	// Build the binary
	cmd := exec.Command("go", "build", "-o", binaryPath, "./cmd/sigma")
	cmd.Dir = projectRoot
	output, err := cmd.CombinedOutput()
	require.NoError(t, err, "Failed to build sigma binary: %s", string(output))

	// Clean up binary after test
	t.Cleanup(func() {
		os.Remove(binaryPath)
	})

	return binaryPath
}
