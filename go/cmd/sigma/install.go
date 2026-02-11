package main

import (
	"fmt"
	"os"
	"time"

	"github.com/dallionking/sigma-protocol/pkg/hooks"
	"github.com/spf13/cobra"
)

var (
	installHooksOnlyFlag bool
)

var installCmd = &cobra.Command{
	Use:   "install [platform]",
	Short: "Install Sigma Protocol for a platform",
	Long: `Install or reinstall Sigma Protocol components.

Use --hooks-only to reinstall hooks without full platform rebuild.

Examples:
  sigma install claude-code         # Full platform install
  sigma install --hooks-only        # Reinstall hooks only`,
	Run: runInstall,
}

func init() {
	rootCmd.AddCommand(installCmd)
	installCmd.Flags().BoolVar(&installHooksOnlyFlag, "hooks-only", false, "reinstall hooks without full platform rebuild")
}

func runInstall(cmd *cobra.Command, args []string) {
	projectRoot, err := os.Getwd()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: Failed to get current directory: %v\n", err)
		os.Exit(1)
	}

	if installHooksOnlyFlag {
		if err := installHooksOnly(projectRoot); err != nil {
			os.Exit(1)
		}
		return
	}

	// Full platform install (not implemented in this PRD)
	if len(args) == 0 {
		fmt.Println("Error: Platform name required (or use --hooks-only)")
		fmt.Println()
		fmt.Println("Usage:")
		fmt.Println("  sigma install claude-code        # Full platform install")
		fmt.Println("  sigma install --hooks-only       # Reinstall hooks only")
		os.Exit(1)
	}

	platform := args[0]
	fmt.Printf("Full platform install for '%s' not yet implemented\n", platform)
	fmt.Println("Use 'sigma install --hooks-only' to install hooks")
}

func installHooksOnly(projectRoot string) error {
	startTime := time.Now()

	fmt.Println("Reinstalling Hooks")
	fmt.Println("==================")
	fmt.Println()

	// Step 1: Discover hooks
	fmt.Println("1. Discovering hooks...")
	registry, err := hooks.DiscoverHooks(projectRoot)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: Failed to discover hooks: %v\n", err)
		return err
	}

	if len(registry.Hooks) == 0 {
		fmt.Println("Warning: No hooks found in .claude/hooks/")
		return fmt.Errorf("no hooks to install")
	}

	fmt.Printf("   Found %d hooks\n\n", len(registry.Hooks))

	// Step 2: Install hooks
	fmt.Println("2. Installing hooks...")

	// Install with progress feedback
	err = hooks.InstallHooksWithProgress(registry, projectRoot, func(current, total int, hookName string) {
		fmt.Printf("   [%d/%d] %s\n", current, total, hookName)
	})

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: Failed to install hooks: %v\n", err)
		return err
	}

	fmt.Println()

	// Step 3: Generate settings.json
	fmt.Println("3. Generating settings.json...")
	if err := hooks.GenerateSettingsJSON(registry, projectRoot); err != nil {
		fmt.Fprintf(os.Stderr, "Error: Failed to generate settings.json: %v\n", err)
		return err
	}
	fmt.Println("   ✓ settings.json updated")
	fmt.Println()

	// Step 4: Validate installation
	fmt.Println("4. Validating hooks...")
	results, err := hooks.ValidateHooks(registry)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: Failed to validate hooks: %v\n", err)
		return err
	}

	invalidCount := 0
	for _, result := range results {
		if result.Status == hooks.StatusInvalid {
			invalidCount++
			fmt.Printf("   ✗ %s: %s\n", result.Hook.Name, result.Message)
		}
	}

	if invalidCount > 0 {
		fmt.Println()
		fmt.Printf("Warning: %d hooks failed validation\n", invalidCount)
		fmt.Println("Run 'sigma doctor --hooks' for details")
		fmt.Println()
	} else {
		fmt.Println("   ✓ All hooks validated successfully")
		fmt.Println()
	}

	// Success summary
	elapsed := time.Since(startTime)
	fmt.Println("✓ Hooks installed successfully!")
	fmt.Printf("  Completed in %.2f seconds\n", elapsed.Seconds())

	if invalidCount > 0 {
		return fmt.Errorf("some hooks failed validation")
	}

	return nil
}
