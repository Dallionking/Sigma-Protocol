// Package schema provides JSON schema validation for sigma CLI configuration files.
package schema

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// Validator validates configuration objects against their schemas
type Validator struct {
	schemas map[string]*Schema
}

// Schema represents a JSON schema definition
type Schema struct {
	Type       string              `json:"type"`
	Properties map[string]Property `json:"properties"`
	Required   []string            `json:"required"`
}

// Property represents a property in a JSON schema
type Property struct {
	Type        string   `json:"type"`
	Description string   `json:"description,omitempty"`
	Enum        []string `json:"enum,omitempty"`
	Pattern     string   `json:"pattern,omitempty"`
	MinLength   int      `json:"minLength,omitempty"`
	MaxLength   int      `json:"maxLength,omitempty"`
	Minimum     float64  `json:"minimum,omitempty"`
	Maximum     float64  `json:"maximum,omitempty"`
}

// ValidationError represents a schema validation error
type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// ValidationResult contains all validation errors
type ValidationResult struct {
	Valid  bool
	Errors []ValidationError
}

// NewValidator creates a new Validator instance
func NewValidator() *Validator {
	return &Validator{
		schemas: make(map[string]*Schema),
	}
}

// LoadSchema loads a JSON schema from a file
func (v *Validator) LoadSchema(name, path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("failed to read schema file: %w", err)
	}

	var schema Schema
	if err := json.Unmarshal(data, &schema); err != nil {
		return fmt.Errorf("failed to parse schema: %w", err)
	}

	v.schemas[name] = &schema
	return nil
}

// RegisterSchema registers a schema directly
func (v *Validator) RegisterSchema(name string, schema *Schema) {
	v.schemas[name] = schema
}

// Validate validates data against a named schema
func (v *Validator) Validate(schemaName string, data map[string]interface{}) ValidationResult {
	result := ValidationResult{Valid: true}

	schema, ok := v.schemas[schemaName]
	if !ok {
		result.Valid = false
		result.Errors = append(result.Errors, ValidationError{
			Field:   "",
			Message: fmt.Sprintf("schema '%s' not found", schemaName),
		})
		return result
	}

	// Check required fields
	for _, required := range schema.Required {
		if _, exists := data[required]; !exists {
			result.Valid = false
			result.Errors = append(result.Errors, ValidationError{
				Field:   required,
				Message: "field is required",
			})
		}
	}

	// Validate each field against its property definition
	for fieldName, value := range data {
		prop, exists := schema.Properties[fieldName]
		if !exists {
			continue // Unknown fields are allowed
		}

		if err := validateProperty(fieldName, value, prop); err != nil {
			result.Valid = false
			result.Errors = append(result.Errors, *err)
		}
	}

	return result
}

// validateProperty validates a single field value against its property definition
func validateProperty(name string, value interface{}, prop Property) *ValidationError {
	// Type validation
	if err := validateType(name, value, prop.Type); err != nil {
		return err
	}

	// String-specific validations
	if str, ok := value.(string); ok {
		// Enum validation
		if len(prop.Enum) > 0 {
			found := false
			for _, enumVal := range prop.Enum {
				if str == enumVal {
					found = true
					break
				}
			}
			if !found {
				return &ValidationError{
					Field:   name,
					Message: fmt.Sprintf("must be one of: %s", strings.Join(prop.Enum, ", ")),
				}
			}
		}

		// Length validation
		if prop.MinLength > 0 && len(str) < prop.MinLength {
			return &ValidationError{
				Field:   name,
				Message: fmt.Sprintf("must be at least %d characters", prop.MinLength),
			}
		}
		if prop.MaxLength > 0 && len(str) > prop.MaxLength {
			return &ValidationError{
				Field:   name,
				Message: fmt.Sprintf("must be at most %d characters", prop.MaxLength),
			}
		}
	}

	// Number-specific validations
	if num, ok := value.(float64); ok {
		if prop.Minimum != 0 && num < prop.Minimum {
			return &ValidationError{
				Field:   name,
				Message: fmt.Sprintf("must be at least %v", prop.Minimum),
			}
		}
		if prop.Maximum != 0 && num > prop.Maximum {
			return &ValidationError{
				Field:   name,
				Message: fmt.Sprintf("must be at most %v", prop.Maximum),
			}
		}
	}

	return nil
}

// validateType checks if the value matches the expected JSON type
func validateType(name string, value interface{}, expectedType string) *ValidationError {
	var actualType string

	switch value.(type) {
	case string:
		actualType = "string"
	case float64, int, int64:
		actualType = "number"
	case bool:
		actualType = "boolean"
	case []interface{}:
		actualType = "array"
	case map[string]interface{}:
		actualType = "object"
	case nil:
		actualType = "null"
	default:
		actualType = "unknown"
	}

	if expectedType != "" && actualType != expectedType {
		// Handle integer type (JSON uses number for both)
		if expectedType == "integer" && actualType == "number" {
			if num, ok := value.(float64); ok && num == float64(int(num)) {
				return nil
			}
			return &ValidationError{
				Field:   name,
				Message: fmt.Sprintf("expected %s, got %s", expectedType, actualType),
			}
		}
		return &ValidationError{
			Field:   name,
			Message: fmt.Sprintf("expected %s, got %s", expectedType, actualType),
		}
	}

	return nil
}

// ValidateFile validates a JSON file against a schema
func (v *Validator) ValidateFile(schemaName, filePath string) (ValidationResult, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return ValidationResult{}, fmt.Errorf("failed to read file: %w", err)
	}

	var obj map[string]interface{}
	if err := json.Unmarshal(data, &obj); err != nil {
		return ValidationResult{}, fmt.Errorf("failed to parse JSON: %w", err)
	}

	return v.Validate(schemaName, obj), nil
}

// DefaultSkillSchema returns the default schema for skill files
func DefaultSkillSchema() *Schema {
	return &Schema{
		Type: "object",
		Properties: map[string]Property{
			"name": {
				Type:        "string",
				Description: "Skill name",
				MinLength:   1,
			},
			"description": {
				Type:        "string",
				Description: "Skill description",
				MinLength:   10,
			},
			"triggers": {
				Type:        "array",
				Description: "Keywords that trigger the skill",
			},
		},
		Required: []string{"name", "description"},
	}
}

// DefaultConfigSchema returns the default schema for config files
func DefaultConfigSchema() *Schema {
	return &Schema{
		Type: "object",
		Properties: map[string]Property{
			"platform": {
				Type:        "string",
				Description: "Target platform",
				Enum:        []string{"claude-code", "codex", "factory-droid", "opencode", "cursor", "antigravity"},
			},
			"verbose": {
				Type:        "boolean",
				Description: "Enable verbose output",
			},
		},
		Required: []string{},
	}
}

// FindSchemaFiles locates schema files in standard locations
func FindSchemaFiles(projectRoot string) (map[string]string, error) {
	schemas := make(map[string]string)

	// Check standard schema locations
	locations := []struct {
		name string
		path string
	}{
		{"skill", filepath.Join(projectRoot, "go", "pkg", "schema", "skill.schema.json")},
		{"config", filepath.Join(projectRoot, "go", "pkg", "schema", "config.schema.json")},
		{"hook", filepath.Join(projectRoot, "go", "pkg", "schema", "hook.schema.json")},
	}

	for _, loc := range locations {
		if _, err := os.Stat(loc.path); err == nil {
			schemas[loc.name] = loc.path
		}
	}

	return schemas, nil
}
