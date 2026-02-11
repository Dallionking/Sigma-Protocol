package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/dallionking/sigma-protocol/pkg/platform"
	// Import all platform builders to trigger their init() registration
	_ "github.com/dallionking/sigma-protocol/pkg/platform/claude"
	_ "github.com/dallionking/sigma-protocol/pkg/platform/codex"
	_ "github.com/dallionking/sigma-protocol/pkg/platform/factory"
	_ "github.com/dallionking/sigma-protocol/pkg/platform/opencode"
	"github.com/spf13/cobra"
)

var (
	buildAllFlag      bool
	buildListFlag     bool
	buildValidateFlag bool
	buildDryRunFlag   bool
)

var buildCmd = &cobra.Command{
	Use:   "build <platform> [source] [destination]",
	Short: "Generate platform-specific configuration files",
	Long: `Generate configuration files for AI coding platforms.

Transforms the canonical .claude/ directory into platform-specific formats.

Examples:
  sigma build claude .              # Build Claude Code config in current dir
  sigma build codex ./src ./out     # Build Codex config from src to out
  sigma build --all .               # Build all platforms
  sigma build --list                # List available platforms

Available platforms: claude, codex, factory, opencode`,
	Run: runBuild,
}

func init() {
	rootCmd.AddCommand(buildCmd)
	buildCmd.Flags().BoolVar(&buildAllFlag, "all", false, "build all platforms")
	buildCmd.Flags().BoolVar(&buildListFlag, "list", false, "list available platforms")
	buildCmd.Flags().BoolVar(&buildValidateFlag, "validate", true, "validate output after build")
	buildCmd.Flags().BoolVar(&buildDryRunFlag, "dry-run", false, "show what would be built without writing")
}

func runBuild(cmd *cobra.Command, args []string) {
	// Handle --list flag
	if buildListFlag {
		listPlatforms()
		return
	}

	// Parse source and destination
	src, dest, err := parseSourceDest(args)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	// Validate source directory exists
	if _, err := os.Stat(src); os.IsNotExist(err) {
		fmt.Fprintf(os.Stderr, "Error: Source directory does not exist: %s\n", src)
		os.Exit(1)
	}

	// Handle --all flag
	if buildAllFlag {
		if err := buildAllPlatforms(src, dest); err != nil {
			os.Exit(1)
		}
		return
	}

	// Require platform name
	if len(args) < 1 {
		fmt.Fprintln(os.Stderr, "Error: Platform name required")
		fmt.Fprintln(os.Stderr, "")
		fmt.Fprintln(os.Stderr, "Usage: sigma build <platform> [source] [destination]")
		fmt.Fprintln(os.Stderr, "       sigma build --all [source] [destination]")
		fmt.Fprintln(os.Stderr, "       sigma build --list")
		fmt.Fprintln(os.Stderr, "")
		fmt.Fprintln(os.Stderr, "Run 'sigma build --list' to see available platforms")
		os.Exit(1)
	}

	platformName := args[0]
	if err := buildPlatform(platformName, src, dest); err != nil {
		os.Exit(1)
	}
}

func listPlatforms() {
	platforms := platform.DefaultRegistry.List()
	sort.Strings(platforms)

	fmt.Println("Available Platforms")
	fmt.Println("===================")
	fmt.Println()

	for _, name := range platforms {
		builder := platform.DefaultRegistry.Get(name)
		if builder != nil {
			outputDir := getOutputDir(name)
			fmt.Printf("  %-12s → %s\n", name, outputDir)
		}
	}

	fmt.Println()
	fmt.Println("Usage:")
	fmt.Println("  sigma build <platform> [source] [destination]")
	fmt.Println("  sigma build --all .    # Build all platforms")
}

func getOutputDir(name string) string {
	switch name {
	case "claude":
		return ".claude/"
	case "codex":
		return ".codex/"
	case "factory":
		return ".factory/"
	case "opencode":
		return ".opencode/"
	default:
		return "." + name + "/"
	}
}

func parseSourceDest(args []string) (string, string, error) {
	// Default to current directory
	src := "."
	dest := ""

	// When --all or --list is used, all args are source/dest (no platform name)
	// When a platform is specified, args[0] is platform name
	startIdx := 0
	if !buildAllFlag && !buildListFlag && len(args) > 0 {
		// First arg is platform name, skip it for source/dest parsing
		startIdx = 1
	}

	// Parse remaining args
	if len(args) > startIdx {
		src = args[startIdx]
	}
	if len(args) > startIdx+1 {
		dest = args[startIdx+1]
	}

	// Default dest to src
	if dest == "" {
		dest = src
	}

	// Convert to absolute paths
	var err error
	src, err = filepath.Abs(src)
	if err != nil {
		return "", "", fmt.Errorf("invalid source path: %w", err)
	}

	dest, err = filepath.Abs(dest)
	if err != nil {
		return "", "", fmt.Errorf("invalid destination path: %w", err)
	}

	return src, dest, nil
}

func buildPlatform(name, src, dest string) error {
	builder := platform.DefaultRegistry.Get(name)
	if builder == nil {
		availablePlatforms := platform.DefaultRegistry.List()
		sort.Strings(availablePlatforms)
		fmt.Fprintf(os.Stderr, "Error: Unknown platform: %s\n", name)
		fmt.Fprintf(os.Stderr, "Available: %s\n", strings.Join(availablePlatforms, ", "))
		return fmt.Errorf("unknown platform: %s", name)
	}

	// Dry run mode
	if buildDryRunFlag {
		return dryRunBuild(builder, src, dest)
	}

	// Execute build
	start := time.Now()
	fmt.Printf("Building %s...\n", name)

	ctx := context.Background()
	if err := builder.Build(ctx, src, dest); err != nil {
		fmt.Fprintf(os.Stderr, "Error: Build failed: %v\n", err)
		return err
	}

	elapsed := time.Since(start)

	// Get metrics
	metrics := builder.GetMetrics()
	printMetrics(metrics, elapsed)

	// Validate if requested
	if buildValidateFlag {
		if err := validateBuild(builder, dest); err != nil {
			return err
		}
	}

	return nil
}

func buildAllPlatforms(src, dest string) error {
	platforms := platform.DefaultRegistry.List()
	sort.Strings(platforms)

	fmt.Printf("Building all platforms (%d)...\n\n", len(platforms))

	var failed []string
	totalStart := time.Now()

	for i, name := range platforms {
		fmt.Printf("[%d/%d] %s\n", i+1, len(platforms), name)

		if err := buildPlatform(name, src, dest); err != nil {
			failed = append(failed, name)
			fmt.Println()
			continue
		}
		fmt.Println()
	}

	totalElapsed := time.Since(totalStart)

	// Summary
	fmt.Println("═══════════════════════════════════")
	fmt.Printf("Total time: %v\n", totalElapsed.Round(time.Millisecond))
	fmt.Printf("Platforms: %d built, %d failed\n", len(platforms)-len(failed), len(failed))

	if len(failed) > 0 {
		fmt.Printf("Failed: %s\n", strings.Join(failed, ", "))
		return fmt.Errorf("%d platforms failed", len(failed))
	}

	fmt.Println("✓ All platforms built successfully!")
	return nil
}

func dryRunBuild(builder platform.PlatformBuilder, src, dest string) error {
	fmt.Printf("[DRY RUN] Would build %s\n", builder.Name())
	fmt.Printf("  Source:      %s\n", src)
	fmt.Printf("  Destination: %s\n", dest)
	fmt.Printf("  Output dir:  %s\n", getOutputDir(builder.Name()))
	fmt.Println()

	// Show files that would be generated
	files := builder.GetFiles()
	if len(files) > 0 {
		fmt.Printf("Would generate %d files:\n", len(files))
		for _, f := range files {
			fmt.Printf("  %s\n", f.Path)
		}
	} else {
		fmt.Println("(Run build to see generated files)")
	}

	return nil
}

func printMetrics(metrics *platform.PlatformMetrics, elapsed time.Duration) {
	fmt.Printf("  ✓ %s built in %v\n", metrics.Platform, elapsed.Round(time.Millisecond))
	if verbose {
		fmt.Printf("    Skills:   %d\n", metrics.Skills)
		fmt.Printf("    Agents:   %d\n", metrics.Agents)
		fmt.Printf("    Commands: %d\n", metrics.Commands)
		fmt.Printf("    Rules:    %d\n", metrics.Rules)
		fmt.Printf("    Hooks:    %d\n", metrics.Hooks)
		fmt.Printf("    Total:    %d files (%d bytes)\n", metrics.TotalFiles, metrics.TotalBytes)
	}
}

func validateBuild(builder platform.PlatformBuilder, dest string) error {
	// Validate expects the project root, not the platform output dir.
	// The Validate function will look for .codex/, .claude/, etc. inside dest.
	result, err := builder.Validate(dest)
	if err != nil {
		fmt.Fprintf(os.Stderr, "  ⚠ Validation error: %v\n", err)
		return err
	}

	if !result.Valid {
		fmt.Println("  ✗ Validation failed:")
		for _, e := range result.Errors {
			fmt.Printf("    - %s: %s\n", e.Code, e.Message)
		}
		return fmt.Errorf("validation failed")
	}

	if len(result.Warnings) > 0 && verbose {
		fmt.Println("  ⚠ Warnings:")
		for _, w := range result.Warnings {
			fmt.Printf("    - %s: %s\n", w.Code, w.Message)
		}
	}

	fmt.Println("  ✓ Validation passed")
	return nil
}
