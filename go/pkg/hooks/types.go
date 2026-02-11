package hooks

// HookEvent represents Claude Code lifecycle events
type HookEvent string

const (
	EventSessionStart  HookEvent = "SessionStart"
	EventSessionEnd    HookEvent = "SessionEnd"
	EventPreToolUse    HookEvent = "PreToolUse"
	EventPostToolUse   HookEvent = "PostToolUse"
	EventStop          HookEvent = "Stop"
	EventSubagentStart HookEvent = "SubagentStart"
	EventTaskCompleted HookEvent = "TaskCompleted"
	EventTeammateIdle  HookEvent = "TeammateIdle"
)

// Hook represents metadata for a single hook script
type Hook struct {
	Name         string    // e.g., "setup-check.sh"
	Path         string    // Absolute path to source hook
	DestPath     string    // Target installation path (preserves relative structure)
	Event        HookEvent // When to trigger
	Matcher      string    // Optional glob pattern for conditional execution
	Required     bool      // Block install if missing
	SubDir       string    // Subdirectory: "validators", "slas", "lib", or "" for root
	Description  string    // Human-readable purpose
	Dependencies []string  // Other hooks that must run first
}

// HookRegistry holds all discovered hooks
type HookRegistry struct {
	Hooks []Hook
}

// ValidationResult represents the outcome of validating a single hook
type ValidationResult struct {
	Hook    *Hook
	Status  ValidationStatus
	Message string
}

// ValidationStatus indicates the validation state of a hook
type ValidationStatus string

const (
	StatusValid   ValidationStatus = "valid"
	StatusFixed   ValidationStatus = "fixed"   // Permissions corrected
	StatusInvalid ValidationStatus = "invalid" // Cannot auto-fix
	StatusSkipped ValidationStatus = "skipped" // lib/ helpers
)
