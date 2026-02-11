package claude

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/dallionking/sigma-protocol/pkg/platform"
	"gopkg.in/yaml.v3"
)

// AgentMetadata represents the YAML frontmatter of an agent file.
type AgentMetadata struct {
	Name           string   `yaml:"name"`
	Description    string   `yaml:"description"`
	Tools          []string `yaml:"tools"`
	Model          string   `yaml:"model"`
	PermissionMode string   `yaml:"permissionMode,omitempty"`
	Skills         []string `yaml:"skills,omitempty"`
	Memory         string   `yaml:"memory,omitempty"` // Simplified: "project", "local", or "user"
}

// Agent represents an agent file with its metadata.
type Agent struct {
	Name     string
	Metadata AgentMetadata
	Content  string
	FilePath string
}

// Valid models for Claude Code agents.
var validModels = []string{"sonnet", "opus", "haiku", "gpt-4o", "gpt-5.3", "gpt-5.3-codex", "inherit"}

// Valid permission modes.
var validPermissionModes = []string{"acceptEdits", "prompt", "auto", "default"}

// Valid memory scopes.
var validMemoryScopes = []string{"project", "local", "user"}

// Valid tools for Claude Code agents.
var validTools = []string{
	// Core tools
	"Read", "Write", "Edit", "Bash", "Glob", "Grep", "LSP",
	// Web tools
	"WebFetch", "WebSearch",
	// Collaboration tools
	"Task", "TaskCreate", "TaskUpdate", "TaskList", "TaskGet",
	"TeammateTool", "SendMessage",
}

// copyAgents copies agent files from source to destination.
func (b *Builder) copyAgents(src, dest string) error {
	srcAgentsDir := filepath.Join(src, ".claude/agents")
	destAgentsDir := filepath.Join(dest, ".claude/agents")

	// Check if source agents directory exists
	if _, err := os.Stat(srcAgentsDir); os.IsNotExist(err) {
		// Agents are optional, just skip
		return nil
	}

	// Discover agents
	agents, err := discoverAgents(srcAgentsDir)
	if err != nil {
		return fmt.Errorf("failed to discover agents: %w", err)
	}

	// Validate each agent
	for _, agent := range agents {
		if err := agent.Validate(); err != nil {
			return fmt.Errorf("agent %s validation failed: %w", agent.Name, err)
		}
	}

	// Only copy if source and dest are different
	if srcAgentsDir != destAgentsDir {
		// Create destination directory
		cfg := platform.DefaultSecurityConfig()
		if err := os.MkdirAll(destAgentsDir, cfg.DirMode); err != nil {
			return fmt.Errorf("failed to create agents directory: %w", err)
		}

		// Copy each agent securely
		for _, agent := range agents {
			destPath := filepath.Join(destAgentsDir, agent.Name+".md")
			if err := platform.SecureCopyFile(agent.FilePath, destPath, srcAgentsDir, destAgentsDir, cfg); err != nil {
				return fmt.Errorf("failed to copy agent %s: %w", agent.Name, err)
			}
		}
	}

	b.metrics.Agents = len(agents)
	return nil
}

// discoverAgents discovers all agent files in the source directory.
func discoverAgents(sourceDir string) ([]*Agent, error) {
	var agents []*Agent

	// Find all .md files
	files, err := filepath.Glob(filepath.Join(sourceDir, "*.md"))
	if err != nil {
		return nil, fmt.Errorf("failed to glob agent files: %w", err)
	}

	for _, file := range files {
		agent, err := parseAgent(file)
		if err != nil {
			return nil, fmt.Errorf("failed to parse agent %s: %w", file, err)
		}
		agents = append(agents, agent)
	}

	return agents, nil
}

// parseAgent parses an agent file and extracts its metadata.
func parseAgent(path string) (*Agent, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	// Extract name from filename (without .md extension)
	name := strings.TrimSuffix(filepath.Base(path), ".md")

	agent := &Agent{
		Name:     name,
		FilePath: path,
		Content:  string(content),
	}

	// Extract frontmatter
	if strings.HasPrefix(string(content), "---") {
		parts := strings.SplitN(string(content), "---", 3)
		if len(parts) >= 3 {
			// Parse YAML frontmatter
			if err := yaml.Unmarshal([]byte(parts[1]), &agent.Metadata); err != nil {
				return nil, fmt.Errorf("failed to parse frontmatter: %w", err)
			}
		}
	}

	return agent, nil
}

// Validate validates the agent metadata.
func (a *Agent) Validate() error {
	// Check required fields
	if a.Metadata.Name == "" {
		return fmt.Errorf("name is required")
	}
	if a.Metadata.Description == "" {
		return fmt.Errorf("description is required")
	}
	if len(a.Metadata.Tools) == 0 {
		return fmt.Errorf("tools cannot be empty")
	}
	if a.Metadata.Model == "" {
		return fmt.Errorf("model is required")
	}

	// Validate model
	if !contains(validModels, a.Metadata.Model) {
		return fmt.Errorf("invalid model: %s (must be one of: %v)", a.Metadata.Model, validModels)
	}

	// Validate permission mode (if specified)
	if a.Metadata.PermissionMode != "" && !contains(validPermissionModes, a.Metadata.PermissionMode) {
		return fmt.Errorf("invalid permissionMode: %s (must be one of: %v)", a.Metadata.PermissionMode, validPermissionModes)
	}

	// Validate memory scope (if specified)
	if a.Metadata.Memory != "" && !contains(validMemoryScopes, a.Metadata.Memory) {
		return fmt.Errorf("invalid memory scope: %s (must be one of: %v)", a.Metadata.Memory, validMemoryScopes)
	}

	// Validate tools
	for _, tool := range a.Metadata.Tools {
		if !isValidTool(tool) {
			return fmt.Errorf("invalid tool: %s", tool)
		}
	}

	return nil
}

// isValidTool checks if a tool name is valid.
// Valid tools include core tools, web tools, collaboration tools, and MCP tools (mcp__*__*).
func isValidTool(tool string) bool {
	// Check if it's a core/web/collaboration tool
	if contains(validTools, tool) {
		return true
	}

	// Check if it's an MCP tool (format: mcp__<server>__<tool>)
	if strings.HasPrefix(tool, "mcp__") {
		parts := strings.Split(tool, "__")
		return len(parts) == 3 && parts[1] != "" && parts[2] != ""
	}

	return false
}

// contains checks if a string slice contains a value.
func contains(slice []string, value string) bool {
	for _, item := range slice {
		if item == value {
			return true
		}
	}
	return false
}

// validateAgents validates all agent files in the directory.
func validateAgents(dir string, result *platform.ValidationResult) error {
	// Check if agents directory exists
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		// Agents are optional
		result.Warnings = append(result.Warnings, platform.ValidationWarning{
			Code:    "MISSING_AGENTS_DIR",
			Message: "agents directory not found (optional)",
			File:    dir,
		})
		return nil
	}

	// Find all agent files
	files, err := filepath.Glob(filepath.Join(dir, "*.md"))
	if err != nil {
		return fmt.Errorf("failed to glob agent files: %w", err)
	}

	// Validate each agent
	for _, file := range files {
		agent, err := parseAgent(file)
		if err != nil {
			result.Errors = append(result.Errors, platform.ValidationError{
				Code:    "INVALID_AGENT",
				Message: fmt.Sprintf("failed to parse agent: %v", err),
				File:    file,
			})
			continue
		}

		if err := agent.Validate(); err != nil {
			result.Errors = append(result.Errors, platform.ValidationError{
				Code:    "INVALID_AGENT_METADATA",
				Message: err.Error(),
				File:    file,
			})
		}
	}

	return nil
}
