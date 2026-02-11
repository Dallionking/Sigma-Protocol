// Package errors provides error handling utilities and custom error types for sigma CLI.
package errors

import (
	"errors"
	"fmt"
)

// Error codes for common failures
const (
	// Configuration errors (1xx)
	ErrCodeConfigNotFound    = 100
	ErrCodeConfigParse       = 101
	ErrCodeConfigValidation  = 102
	ErrCodeConfigPermission  = 103

	// Hook errors (2xx)
	ErrCodeHookNotFound      = 200
	ErrCodeHookParse         = 201
	ErrCodeHookValidation    = 202
	ErrCodeHookExecution     = 203
	ErrCodeHookPermission    = 204
	ErrCodeHookPathTraversal = 205

	// Skill errors (3xx)
	ErrCodeSkillNotFound    = 300
	ErrCodeSkillParse       = 301
	ErrCodeSkillValidation  = 302

	// Platform errors (4xx)
	ErrCodePlatformNotSupported = 400
	ErrCodePlatformDetection    = 401
	ErrCodePlatformConfig       = 402

	// I/O errors (5xx)
	ErrCodeFileNotFound  = 500
	ErrCodeFileRead      = 501
	ErrCodeFileWrite     = 502
	ErrCodeDirCreate     = 503
	ErrCodePermission    = 504
)

// SigmaError is a custom error type with error codes and context
type SigmaError struct {
	Code    int
	Message string
	Cause   error
	Context map[string]string
}

// Error implements the error interface
func (e *SigmaError) Error() string {
	if e.Cause != nil {
		return fmt.Sprintf("[%d] %s: %v", e.Code, e.Message, e.Cause)
	}
	return fmt.Sprintf("[%d] %s", e.Code, e.Message)
}

// Unwrap returns the underlying error for errors.Is and errors.As
func (e *SigmaError) Unwrap() error {
	return e.Cause
}

// New creates a new SigmaError with the given code and message
func New(code int, message string) *SigmaError {
	return &SigmaError{
		Code:    code,
		Message: message,
		Context: make(map[string]string),
	}
}

// Wrap wraps an existing error with a SigmaError
func Wrap(err error, code int, message string) *SigmaError {
	return &SigmaError{
		Code:    code,
		Message: message,
		Cause:   err,
		Context: make(map[string]string),
	}
}

// Wrapf wraps an error with a formatted message
func Wrapf(err error, code int, format string, args ...interface{}) *SigmaError {
	return &SigmaError{
		Code:    code,
		Message: fmt.Sprintf(format, args...),
		Cause:   err,
		Context: make(map[string]string),
	}
}

// WithContext adds context key-value pairs to the error
func (e *SigmaError) WithContext(key, value string) *SigmaError {
	if e.Context == nil {
		e.Context = make(map[string]string)
	}
	e.Context[key] = value
	return e
}

// Is checks if the error matches a given code
func (e *SigmaError) Is(code int) bool {
	return e.Code == code
}

// GetCode extracts the error code from an error if it's a SigmaError
func GetCode(err error) (int, bool) {
	var sigmaErr *SigmaError
	if errors.As(err, &sigmaErr) {
		return sigmaErr.Code, true
	}
	return 0, false
}

// IsCode checks if an error has a specific error code
func IsCode(err error, code int) bool {
	c, ok := GetCode(err)
	return ok && c == code
}

// Common error constructors for convenience

// ConfigNotFound creates a configuration not found error
func ConfigNotFound(path string) *SigmaError {
	return New(ErrCodeConfigNotFound, "configuration file not found").
		WithContext("path", path)
}

// ConfigParse creates a configuration parse error
func ConfigParse(err error, path string) *SigmaError {
	return Wrap(err, ErrCodeConfigParse, "failed to parse configuration").
		WithContext("path", path)
}

// HookNotFound creates a hook not found error
func HookNotFound(name string) *SigmaError {
	return New(ErrCodeHookNotFound, "hook not found").
		WithContext("hook", name)
}

// HookValidation creates a hook validation error
func HookValidation(name, reason string) *SigmaError {
	return New(ErrCodeHookValidation, "hook validation failed: "+reason).
		WithContext("hook", name)
}

// PathTraversal creates a path traversal security error
func PathTraversal(path string) *SigmaError {
	return New(ErrCodeHookPathTraversal, "path traversal detected").
		WithContext("path", path)
}

// FileNotFound creates a file not found error
func FileNotFound(path string) *SigmaError {
	return New(ErrCodeFileNotFound, "file not found").
		WithContext("path", path)
}

// FileRead creates a file read error
func FileRead(err error, path string) *SigmaError {
	return Wrap(err, ErrCodeFileRead, "failed to read file").
		WithContext("path", path)
}

// FileWrite creates a file write error
func FileWrite(err error, path string) *SigmaError {
	return Wrap(err, ErrCodeFileWrite, "failed to write file").
		WithContext("path", path)
}
