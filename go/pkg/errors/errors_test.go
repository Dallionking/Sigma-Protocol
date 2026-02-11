package errors

import (
	"errors"
	"testing"
)

func TestSigmaError(t *testing.T) {
	t.Run("New creates error with code and message", func(t *testing.T) {
		err := New(ErrCodeConfigNotFound, "config not found")

		if err.Code != ErrCodeConfigNotFound {
			t.Errorf("expected code %d, got %d", ErrCodeConfigNotFound, err.Code)
		}
		if err.Message != "config not found" {
			t.Errorf("expected message 'config not found', got '%s'", err.Message)
		}
	})

	t.Run("Error returns formatted string", func(t *testing.T) {
		err := New(ErrCodeHookNotFound, "hook missing")
		expected := "[200] hook missing"

		if err.Error() != expected {
			t.Errorf("expected '%s', got '%s'", expected, err.Error())
		}
	})

	t.Run("Error includes cause when wrapped", func(t *testing.T) {
		cause := errors.New("underlying error")
		err := Wrap(cause, ErrCodeFileRead, "read failed")

		if !errors.Is(err, cause) {
			t.Error("wrapped error should contain cause")
		}
	})

	t.Run("WithContext adds context", func(t *testing.T) {
		err := New(ErrCodeHookValidation, "validation failed").
			WithContext("hook", "my-hook").
			WithContext("reason", "missing shebang")

		if err.Context["hook"] != "my-hook" {
			t.Error("expected hook context")
		}
		if err.Context["reason"] != "missing shebang" {
			t.Error("expected reason context")
		}
	})

	t.Run("GetCode extracts code from SigmaError", func(t *testing.T) {
		err := New(ErrCodeSkillNotFound, "skill missing")

		code, ok := GetCode(err)
		if !ok {
			t.Error("expected GetCode to succeed")
		}
		if code != ErrCodeSkillNotFound {
			t.Errorf("expected code %d, got %d", ErrCodeSkillNotFound, code)
		}
	})

	t.Run("GetCode returns false for non-SigmaError", func(t *testing.T) {
		err := errors.New("standard error")

		_, ok := GetCode(err)
		if ok {
			t.Error("expected GetCode to fail for standard error")
		}
	})

	t.Run("IsCode matches error codes", func(t *testing.T) {
		err := New(ErrCodeConfigParse, "parse failed")

		if !IsCode(err, ErrCodeConfigParse) {
			t.Error("expected IsCode to match")
		}
		if IsCode(err, ErrCodeHookNotFound) {
			t.Error("expected IsCode to not match different code")
		}
	})
}

func TestErrorConstructors(t *testing.T) {
	t.Run("ConfigNotFound", func(t *testing.T) {
		err := ConfigNotFound("/path/to/config")

		if err.Code != ErrCodeConfigNotFound {
			t.Errorf("expected code %d", ErrCodeConfigNotFound)
		}
		if err.Context["path"] != "/path/to/config" {
			t.Error("expected path context")
		}
	})

	t.Run("HookValidation", func(t *testing.T) {
		err := HookValidation("my-hook", "missing shebang")

		if err.Code != ErrCodeHookValidation {
			t.Errorf("expected code %d", ErrCodeHookValidation)
		}
		if err.Context["hook"] != "my-hook" {
			t.Error("expected hook context")
		}
	})

	t.Run("PathTraversal", func(t *testing.T) {
		err := PathTraversal("../../../etc/passwd")

		if err.Code != ErrCodeHookPathTraversal {
			t.Errorf("expected code %d", ErrCodeHookPathTraversal)
		}
	})

	t.Run("FileRead wraps cause", func(t *testing.T) {
		cause := errors.New("permission denied")
		err := FileRead(cause, "/secret/file")

		if !errors.Is(err, cause) {
			t.Error("expected wrapped cause")
		}
		if err.Code != ErrCodeFileRead {
			t.Errorf("expected code %d", ErrCodeFileRead)
		}
	})
}
