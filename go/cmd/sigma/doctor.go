package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/dallionking/sigma-protocol/pkg/hooks"
	"github.com/spf13/cobra"
)

var (
	doctorHooksFlag bool
	doctorFixFlag   bool
)

var doctorCmd = &cobra.Command{
	Use:   "doctor",
	Short: "Diagnose Sigma Protocol installation issues",
	Long: `Validate your Sigma Protocol installation and configuration.

Use --hooks to validate hook installation, permissions, and registration.
Use --fix to automatically repair common issues like missing permissions.`,
	Run: runDoctor,
}

func init() {
	rootCmd.AddCommand(doctorCmd)
	doctorCmd.Flags().BoolVar(&doctorHooksFlag, "hooks", false, "validate hook installation")
	doctorCmd.Flags().BoolVar(&doctorFixFlag, "fix", false, "auto-fix common issues")
}

func runDoctor(cmd *cobra.Command, args []string) {
	if !doctorHooksFlag {
		fmt.Println("Sigma Protocol Doctor")
		fmt.Println("====================")
		fmt.Println()
		fmt.Println("Available checks:")
		fmt.Println("  --hooks    Validate hook installation")
		fmt.Println()
		fmt.Println("Run 'sigma doctor --hooks' to validate hooks")
		return
	}

	projectRoot, err := os.Getwd()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: Failed to get current directory: %v\n", err)
		os.Exit(1)
	}

	// Run hook validation
	if err := validateHooks(projectRoot); err != nil {
		os.Exit(1)
	}
}

func validateHooks(projectRoot string) error {
	fmt.Println("Validating Hook Installation")
	fmt.Println("============================")
	fmt.Println()

	// Discover installed hooks
	fmt.Println("Discovering hooks...")
	registry, err := hooks.DiscoverHooks(projectRoot)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: Failed to discover hooks: %v\n", err)
		return err
	}

	if len(registry.Hooks) == 0 {
		fmt.Println("No hooks found in .claude/hooks/")
		fmt.Println()
		fmt.Println("Run 'sigma install --hooks-only' to install hooks")
		return fmt.Errorf("no hooks found")
	}

	fmt.Printf("Found %d hooks\n\n", len(registry.Hooks))

	// Validate each hook
	results, err := hooks.ValidateHooks(registry)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: Failed to validate hooks: %v\n", err)
		return err
	}

	// Display results
	allValid := true
	validCount := 0
	fixedCount := 0
	invalidCount := 0
	skippedCount := 0

	for _, result := range results {
		switch result.Status {
		case hooks.StatusValid:
			validCount++
			if verbose {
				fmt.Printf("✓ %s\n", result.Hook.Name)
			}
		case hooks.StatusFixed:
			fixedCount++
			fmt.Printf("⚠ %s - %s\n", result.Hook.Name, result.Message)
		case hooks.StatusInvalid:
			allValid = false
			invalidCount++
			fmt.Printf("✗ %s\n", result.Hook.Name)
			fmt.Printf("  Error: %s\n", result.Message)
			if doctorFixFlag {
				attemptFix(result, projectRoot)
			} else {
				suggestFix(result.Message)
			}
		case hooks.StatusSkipped:
			skippedCount++
			if verbose {
				fmt.Printf("- %s (skipped: %s)\n", result.Hook.Name, result.Message)
			}
		}
	}

	// Summary
	fmt.Println()
	fmt.Println("Summary:")
	fmt.Printf("  Valid:   %d\n", validCount)
	if fixedCount > 0 {
		fmt.Printf("  Fixed:   %d\n", fixedCount)
	}
	if invalidCount > 0 {
		fmt.Printf("  Invalid: %d\n", invalidCount)
	}
	if skippedCount > 0 && verbose {
		fmt.Printf("  Skipped: %d\n", skippedCount)
	}

	if !allValid {
		fmt.Println()
		if doctorFixFlag {
			fmt.Println("Some hooks could not be auto-fixed. Please fix manually.")
		} else {
			fmt.Println("Some hooks are invalid. Run with --fix to auto-repair common issues.")
		}
		return fmt.Errorf("validation failed")
	}

	fmt.Println()
	fmt.Println("✓ All hooks are valid!")
	return nil
}

func suggestFix(errorMsg string) {
	switch {
	case strings.Contains(errorMsg, "not executable"):
		fmt.Println("  → Fix: Run 'chmod +x <hook>' or use 'sigma doctor --hooks --fix'")
	case strings.Contains(errorMsg, "file not found"):
		fmt.Println("  → Fix: Run 'sigma install --hooks-only' to reinstall hooks")
	case strings.Contains(errorMsg, "missing shebang"):
		fmt.Println("  → Fix: Add '#!/bin/bash' or '#!/usr/bin/env python3' as the first line")
	case strings.Contains(errorMsg, "syntax error"):
		fmt.Println("  → Fix: Check hook script syntax with 'bash -n <hook>'")
	default:
		fmt.Println("  → Fix: Check the error message above for details")
	}
}

func attemptFix(result hooks.ValidationResult, projectRoot string) {
	// Attempt to fix common issues
	if strings.Contains(result.Message, "not executable") {
		hookPath := result.Hook.Path
		if err := os.Chmod(hookPath, 0755); err == nil {
			fmt.Println("  → Fixed: Set executable permissions")
		} else {
			fmt.Printf("  → Failed to fix: %v\n", err)
		}
	} else {
		fmt.Println("  → Cannot auto-fix this issue")
	}
}
