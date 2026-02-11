package schema

import (
	"testing"
)

func TestValidator(t *testing.T) {
	t.Run("NewValidator creates empty validator", func(t *testing.T) {
		v := NewValidator()
		if v == nil {
			t.Fatal("expected validator to be created")
		}
		if len(v.schemas) != 0 {
			t.Error("expected empty schemas map")
		}
	})

	t.Run("RegisterSchema adds schema", func(t *testing.T) {
		v := NewValidator()
		schema := &Schema{
			Type: "object",
			Properties: map[string]Property{
				"name": {Type: "string"},
			},
			Required: []string{"name"},
		}

		v.RegisterSchema("test", schema)

		if _, exists := v.schemas["test"]; !exists {
			t.Error("expected schema to be registered")
		}
	})

	t.Run("Validate returns error for unknown schema", func(t *testing.T) {
		v := NewValidator()
		result := v.Validate("nonexistent", map[string]interface{}{})

		if result.Valid {
			t.Error("expected validation to fail for unknown schema")
		}
		if len(result.Errors) != 1 {
			t.Errorf("expected 1 error, got %d", len(result.Errors))
		}
	})

	t.Run("Validate checks required fields", func(t *testing.T) {
		v := NewValidator()
		v.RegisterSchema("test", &Schema{
			Type:     "object",
			Required: []string{"name", "version"},
		})

		result := v.Validate("test", map[string]interface{}{
			"name": "test",
		})

		if result.Valid {
			t.Error("expected validation to fail for missing required field")
		}

		found := false
		for _, err := range result.Errors {
			if err.Field == "version" {
				found = true
				break
			}
		}
		if !found {
			t.Error("expected error for missing 'version' field")
		}
	})

	t.Run("Validate passes for valid data", func(t *testing.T) {
		v := NewValidator()
		v.RegisterSchema("test", &Schema{
			Type: "object",
			Properties: map[string]Property{
				"name":    {Type: "string"},
				"version": {Type: "string"},
			},
			Required: []string{"name"},
		})

		result := v.Validate("test", map[string]interface{}{
			"name":    "test-app",
			"version": "1.0.0",
		})

		if !result.Valid {
			t.Errorf("expected validation to pass, got errors: %v", result.Errors)
		}
	})
}

func TestValidateProperty(t *testing.T) {
	t.Run("validates string type", func(t *testing.T) {
		err := validateProperty("field", "hello", Property{Type: "string"})
		if err != nil {
			t.Errorf("expected no error, got: %v", err)
		}

		err = validateProperty("field", 123.0, Property{Type: "string"})
		if err == nil {
			t.Error("expected type error for number as string")
		}
	})

	t.Run("validates enum values", func(t *testing.T) {
		prop := Property{
			Type: "string",
			Enum: []string{"a", "b", "c"},
		}

		err := validateProperty("field", "b", prop)
		if err != nil {
			t.Errorf("expected no error for valid enum, got: %v", err)
		}

		err = validateProperty("field", "z", prop)
		if err == nil {
			t.Error("expected error for invalid enum value")
		}
	})

	t.Run("validates string length", func(t *testing.T) {
		prop := Property{
			Type:      "string",
			MinLength: 3,
			MaxLength: 10,
		}

		err := validateProperty("field", "hello", prop)
		if err != nil {
			t.Errorf("expected no error, got: %v", err)
		}

		err = validateProperty("field", "ab", prop)
		if err == nil {
			t.Error("expected error for too short string")
		}

		err = validateProperty("field", "this is too long", prop)
		if err == nil {
			t.Error("expected error for too long string")
		}
	})

	t.Run("validates number range", func(t *testing.T) {
		prop := Property{
			Type:    "number",
			Minimum: 1,
			Maximum: 100,
		}

		err := validateProperty("field", 50.0, prop)
		if err != nil {
			t.Errorf("expected no error, got: %v", err)
		}

		err = validateProperty("field", 0.5, prop)
		if err == nil {
			t.Error("expected error for number below minimum")
		}

		err = validateProperty("field", 150.0, prop)
		if err == nil {
			t.Error("expected error for number above maximum")
		}
	})
}

func TestDefaultSchemas(t *testing.T) {
	t.Run("DefaultSkillSchema has required fields", func(t *testing.T) {
		schema := DefaultSkillSchema()

		if schema.Type != "object" {
			t.Error("expected object type")
		}
		if len(schema.Required) != 2 {
			t.Errorf("expected 2 required fields, got %d", len(schema.Required))
		}
	})

	t.Run("DefaultConfigSchema has platform enum", func(t *testing.T) {
		schema := DefaultConfigSchema()

		prop, exists := schema.Properties["platform"]
		if !exists {
			t.Fatal("expected platform property")
		}
		if len(prop.Enum) == 0 {
			t.Error("expected platform enum values")
		}
	})
}
