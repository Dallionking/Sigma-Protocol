package factory

import (
	"strings"

	"github.com/dallionking/sigma-protocol/pkg/skill"
)

// ToolSelector determines which Factory Droid tools to enable for each droid
// based on skill requirements and file patterns.
type ToolSelector struct {
	rules []ToolRule
}

// ToolRule represents a mapping rule from skill properties to tools.
type ToolRule struct {
	Matcher func(*skill.Skill) bool
	Tools   []string
}

// Factory Droid available tools
const (
	ToolRead     = "Read"     // Read files
	ToolWrite    = "Write"    // Write/create files
	ToolEdit     = "Edit"     // Edit existing files
	ToolBash     = "Bash"     // Execute shell commands
	ToolGlob     = "Glob"     // Find files by pattern
	ToolGrep     = "Grep"     // Search file contents
	ToolWebFetch = "WebFetch" // Fetch web content (MCP integration)
)

// NewToolSelector creates a new tool selector with default rules.
func NewToolSelector() *ToolSelector {
	return &ToolSelector{
		rules: []ToolRule{},
	}
}

// SelectTools returns the minimal set of tools needed for a skill.
//
// Tool selection logic:
// 1. Start with base tools: [Read, Bash]
// 2. If skill has globs (*.go, *.tsx, etc.) → add Glob
// 3. If skill mentions "search" or "find" → add Grep
// 4. If skill mentions "write" or "create" → add Write
// 5. If skill mentions "edit" or "modify" → add Edit
// 6. If skill mentions "web" or "fetch" or "search" → add WebFetch
// 7. Deduplicate and return
func (s *ToolSelector) SelectTools(skill *skill.Skill) []string {
	tools := make(map[string]bool)

	// Step 1: Base tools
	tools[ToolRead] = true
	tools[ToolBash] = true

	// Step 2: Globs → add Glob
	if len(skill.Metadata.Globs) > 0 {
		tools[ToolGlob] = true
	}

	// Get combined text from name and description for keyword matching
	text := strings.ToLower(skill.Metadata.Name + " " + skill.Metadata.Description + " " + skill.Content)

	// Step 3: "search" or "find" → add Grep
	if strings.Contains(text, "search") || strings.Contains(text, "find") {
		tools[ToolGrep] = true
	}

	// Step 4: "write" or "create" → add Write
	if strings.Contains(text, "write") || strings.Contains(text, "create") {
		tools[ToolWrite] = true
	}

	// Step 5: "edit" or "modify" → add Edit
	if strings.Contains(text, "edit") || strings.Contains(text, "modify") {
		tools[ToolEdit] = true
	}

	// Step 6: "web" or "fetch" → add WebFetch
	if strings.Contains(text, "web") || strings.Contains(text, "fetch") {
		tools[ToolWebFetch] = true
	}

	// Step 7: Deduplicate and return
	result := make([]string, 0, len(tools))
	// Return in consistent order
	toolOrder := []string{ToolRead, ToolWrite, ToolEdit, ToolBash, ToolGlob, ToolGrep, ToolWebFetch}
	for _, tool := range toolOrder {
		if tools[tool] {
			result = append(result, tool)
		}
	}

	return result
}

// AddRule adds a custom tool selection rule.
// Rules are evaluated in the order they are added.
func (s *ToolSelector) AddRule(matcher func(*skill.Skill) bool, tools []string) {
	s.rules = append(s.rules, ToolRule{
		Matcher: matcher,
		Tools:   tools,
	})
}
