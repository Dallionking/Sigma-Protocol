package hooks

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// ValidateHooks validates all hooks in the registry
func ValidateHooks(registry *HookRegistry) ([]ValidationResult, error) {
	var results []ValidationResult

	for i := range registry.Hooks {
		hook := &registry.Hooks[i]
		result := validateHook(hook)
		results = append(results, result)
	}

	return results, nil
}

// validateHook validates a single hook
func validateHook(hook *Hook) ValidationResult {
	// Skip lib/ helpers (not executable hooks)
	if hook.SubDir == "lib" {
		return ValidationResult{Hook: hook, Status: StatusSkipped, Message: "helper library"}
	}

	// Check file exists
	info, err := os.Stat(hook.Path)
	if err != nil {
		return ValidationResult{Hook: hook, Status: StatusInvalid, Message: "file not found"}
	}

	// Check/fix executable permissions
	mode := info.Mode()
	if mode&0111 == 0 {
		if err := os.Chmod(hook.Path, 0755); err != nil {
			return ValidationResult{Hook: hook, Status: StatusInvalid, Message: "cannot set executable"}
		}
		return ValidationResult{Hook: hook, Status: StatusFixed, Message: "permissions corrected"}
	}

	// Validate shebang
	if !hasValidShebang(hook.Path) {
		return ValidationResult{Hook: hook, Status: StatusInvalid, Message: "missing shebang"}
	}

	// Syntax check
	if err := checkSyntax(hook.Path); err != nil {
		return ValidationResult{Hook: hook, Status: StatusInvalid, Message: fmt.Sprintf("syntax error: %v", err)}
	}

	return ValidationResult{Hook: hook, Status: StatusValid, Message: ""}
}

// hasValidShebang checks if the hook has a valid shebang line
func hasValidShebang(path string) bool {
	file, err := os.Open(path)
	if err != nil {
		return false
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	if scanner.Scan() {
		line := scanner.Text()
		return len(line) >= 2 && line[:2] == "#!"
	}
	return false
}

// checkSyntax performs basic syntax validation for shell/Python scripts
func checkSyntax(path string) error {
	ext := filepath.Ext(path)

	var cmd *exec.Cmd
	if ext == ".sh" {
		cmd = exec.Command("bash", "-n", path)
	} else if ext == ".py" {
		cmd = exec.Command("python3", "-m", "py_compile", path)
	} else {
		return nil // Unknown extension, skip syntax check
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("%s", string(output))
	}

	return nil
}

// ValidateHookDetailed validates a hook and returns detailed error information
func ValidateHookDetailed(hook *Hook, projectRoot string) ValidationResult {
	result := ValidationResult{
		Hook:   hook,
		Status: StatusValid,
	}

	var errors []string

	hookPath := filepath.Join(projectRoot, hook.DestPath)

	// Check existence
	if _, err := os.Stat(hookPath); os.IsNotExist(err) {
		result.Status = StatusInvalid
		errors = append(errors, "file not found")
		result.Message = strings.Join(errors, "; ")
		return result
	}

	// Check permissions
	info, _ := os.Stat(hookPath)
	mode := info.Mode()
	if mode&0111 == 0 {
		result.Status = StatusInvalid
		errors = append(errors, "not executable (missing chmod +x)")
	}

	// Check shebang
	if err := validateShebangDetailed(hookPath); err != nil {
		result.Status = StatusInvalid
		errors = append(errors, err.Error())
	}

	// Syntax check
	if err := checkSyntax(hookPath); err != nil {
		result.Status = StatusInvalid
		errors = append(errors, fmt.Sprintf("syntax error: %v", err))
	}

	if len(errors) > 0 {
		result.Message = strings.Join(errors, "; ")
	}

	return result
}

// validateShebangDetailed provides detailed shebang validation
func validateShebangDetailed(path string) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	if !scanner.Scan() {
		return fmt.Errorf("empty file")
	}

	shebang := scanner.Text()
	if !strings.HasPrefix(shebang, "#!") {
		return fmt.Errorf("missing shebang")
	}

	if !strings.Contains(shebang, "bash") && !strings.Contains(shebang, "python") {
		return fmt.Errorf("unsupported interpreter: %s", shebang)
	}

	return nil
}
