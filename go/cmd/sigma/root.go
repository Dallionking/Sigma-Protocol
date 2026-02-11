package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var (
	cfgFile string
	verbose bool
	noColor bool
)

var rootCmd = &cobra.Command{
	Use:   "sigma",
	Short: "Sigma Protocol - Platform-agnostic AI development workflow",
	Long: `Sigma Protocol is a 13-step product development methodology
with support for Claude Code, Codex, Factory Droid, and OpenCode.`,
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func init() {
	cobra.OnInitialize(initConfig)
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.sigmarc.yaml)")
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "verbose output")
	rootCmd.PersistentFlags().BoolVar(&noColor, "no-color", false, "disable color output")
}

func initConfig() {
	// Configuration initialization will be implemented in Task 5
	// For now, this is a placeholder
}
