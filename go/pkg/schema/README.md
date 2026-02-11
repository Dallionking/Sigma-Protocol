# Schema Package

JSON Schema validation for sigma CLI configuration files.

## Usage

```go
import "github.com/dallionking/sigma-protocol/pkg/schema"

// Create validator
v := schema.NewValidator()

// Register built-in schemas
v.RegisterSchema("skill", schema.DefaultSkillSchema())
v.RegisterSchema("config", schema.DefaultConfigSchema())

// Validate data
result := v.Validate("skill", map[string]interface{}{
    "name": "my-skill",
    "description": "A custom skill",
})

if !result.Valid {
    for _, err := range result.Errors {
        fmt.Printf("Validation error: %s\n", err)
    }
}
```

## Supported Validations

- Type checking (string, number, boolean, array, object)
- Required fields
- Enum values
- String length (minLength, maxLength)
- Number range (minimum, maximum)
