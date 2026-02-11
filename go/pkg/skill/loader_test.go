package skill

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestLoadDirectory(t *testing.T) {
	// Create temp directory structure with test skills
	tmpDir := t.TempDir()

	// Create some valid skill files
	validSkill1 := `---
name: skill-1
description: First skill
---
# Content 1`

	validSkill2 := `---
name: skill-2
description: Second skill
---
# Content 2`

	// Create invalid skill (missing name)
	invalidSkill := `---
description: Invalid skill missing name
---
# Content`

	// Create nested directory structure
	err := os.MkdirAll(filepath.Join(tmpDir, "subdir"), 0755)
	if err != nil {
		t.Fatalf("Failed to create subdirectory: %v", err)
	}

	// Write skill files
	writeSkillFile(t, tmpDir, "skill1.md", validSkill1)
	writeSkillFile(t, tmpDir, "skill2.skill", validSkill2)
	writeSkillFile(t, tmpDir, "invalid.md", invalidSkill)
	writeSkillFile(t, filepath.Join(tmpDir, "subdir"), "skill3.md", validSkill1)
	writeSkillFile(t, tmpDir, "readme.txt", "Not a skill file") // Should be ignored

	// Load directory
	result, err := LoadDirectory(tmpDir)
	if err != nil {
		t.Fatalf("LoadDirectory() failed: %v", err)
	}

	// Verify we got 3 valid skills (skill1, skill2, skill3 in subdir)
	if len(result.Skills) != 3 {
		t.Errorf("LoadDirectory() loaded %d skills, want 3", len(result.Skills))
	}

	// Verify we got 1 parse error (invalid skill)
	if len(result.Errors) != 1 {
		t.Errorf("LoadDirectory() has %d errors, want 1", len(result.Errors))
	}

	// Verify error message mentions missing name
	if len(result.Errors) > 0 {
		errMsg := result.Errors[0].Error()
		if !strings.Contains(errMsg, "missing required field 'name'") {
			t.Errorf("LoadDirectory() error = %v, want it to contain 'missing required field'", errMsg)
		}
	}

	// Verify skill names
	names := make(map[string]bool)
	for _, skill := range result.Skills {
		names[skill.Metadata.Name] = true
	}

	expectedNames := []string{"skill-1", "skill-2"}
	for _, name := range expectedNames {
		if !names[name] {
			t.Errorf("LoadDirectory() missing skill with name %q", name)
		}
	}
}

func TestLoadDirectoryEmpty(t *testing.T) {
	tmpDir := t.TempDir()

	result, err := LoadDirectory(tmpDir)
	if err != nil {
		t.Fatalf("LoadDirectory() failed on empty dir: %v", err)
	}

	if len(result.Skills) != 0 {
		t.Errorf("LoadDirectory() on empty dir returned %d skills, want 0", len(result.Skills))
	}

	if len(result.Errors) != 0 {
		t.Errorf("LoadDirectory() on empty dir returned %d errors, want 0", len(result.Errors))
	}
}

func TestLoadDirectoryNonExistent(t *testing.T) {
	result, err := LoadDirectory("/nonexistent/directory")
	// WalkDir returns an error for non-existent directories
	// We expect either an error from WalkDir or an error in the result
	if err == nil && len(result.Errors) == 0 {
		t.Error("LoadDirectory() on non-existent dir should return error or have errors in result")
	}
}

func TestLoadDirectoryParallel(t *testing.T) {
	// Create temp directory with multiple skill files
	tmpDir := t.TempDir()

	validSkill := `---
name: skill-%d
description: Skill number %d
---
# Content %d`

	// Create 10 skill files
	for i := 0; i < 10; i++ {
		content := strings.Replace(validSkill, "%d", string(rune('0'+i)), -1)
		writeSkillFile(t, tmpDir, "skill"+string(rune('0'+i))+".md", content)
	}

	// Load with parallel processing
	result, err := LoadDirectoryParallel(tmpDir, 4)
	if err != nil {
		t.Fatalf("LoadDirectoryParallel() failed: %v", err)
	}

	// Verify all skills loaded
	if len(result.Skills) != 10 {
		t.Errorf("LoadDirectoryParallel() loaded %d skills, want 10", len(result.Skills))
	}

	if len(result.Errors) != 0 {
		t.Errorf("LoadDirectoryParallel() has %d errors, want 0", len(result.Errors))
	}
}

func TestLoadDirectoryParallelMatchesSerial(t *testing.T) {
	// Create temp directory with test skills
	tmpDir := t.TempDir()

	skills := []string{
		`---
name: skill-a
description: Skill A
tags: [TAG-A]
---
# Content A`,
		`---
name: skill-b
description: Skill B
tags: [TAG-B]
---
# Content B`,
		`---
name: skill-c
description: Skill C
tags: [TAG-C]
---
# Content C`,
	}

	for i, content := range skills {
		writeSkillFile(t, tmpDir, "skill-"+string(rune('a'+i))+".md", content)
	}

	// Load serially
	serialResult, err := LoadDirectory(tmpDir)
	if err != nil {
		t.Fatalf("LoadDirectory() failed: %v", err)
	}

	// Load in parallel
	parallelResult, err := LoadDirectoryParallel(tmpDir, 2)
	if err != nil {
		t.Fatalf("LoadDirectoryParallel() failed: %v", err)
	}

	// Verify counts match
	if len(serialResult.Skills) != len(parallelResult.Skills) {
		t.Errorf("LoadDirectoryParallel() loaded %d skills, serial loaded %d", len(parallelResult.Skills), len(serialResult.Skills))
	}

	// Verify all names are present in both
	serialNames := make(map[string]bool)
	for _, skill := range serialResult.Skills {
		serialNames[skill.Metadata.Name] = true
	}

	parallelNames := make(map[string]bool)
	for _, skill := range parallelResult.Skills {
		parallelNames[skill.Metadata.Name] = true
	}

	for name := range serialNames {
		if !parallelNames[name] {
			t.Errorf("LoadDirectoryParallel() missing skill %q that was loaded serially", name)
		}
	}
}

func TestLoadDirectoryParallelWithErrors(t *testing.T) {
	tmpDir := t.TempDir()

	// Mix of valid and invalid skills
	validSkill := `---
name: valid-skill
description: Valid skill
---
# Content`

	invalidSkill := `---
name: invalid-skill
---
# Missing description`

	writeSkillFile(t, tmpDir, "valid1.md", validSkill)
	writeSkillFile(t, tmpDir, "invalid1.md", invalidSkill)
	writeSkillFile(t, tmpDir, "valid2.md", validSkill)

	result, err := LoadDirectoryParallel(tmpDir, 2)
	if err != nil {
		t.Fatalf("LoadDirectoryParallel() failed: %v", err)
	}

	// Should have 2 valid skills
	if len(result.Skills) != 2 {
		t.Errorf("LoadDirectoryParallel() loaded %d skills, want 2", len(result.Skills))
	}

	// Should have 1 error
	if len(result.Errors) != 1 {
		t.Errorf("LoadDirectoryParallel() has %d errors, want 1", len(result.Errors))
	}
}

// BenchmarkLoadDirectory measures performance of serial loading
func BenchmarkLoadDirectory(b *testing.B) {
	tmpDir := b.TempDir()

	// Create 50 skill files
	validSkill := `---
name: bench-skill
description: Benchmark skill
tags: [BENCH]
---
# Benchmark content`

	for i := 0; i < 50; i++ {
		writeSkillFile(b, tmpDir, filepath.Join("skill-", string(rune('0'+i)), ".md"), validSkill)
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = LoadDirectory(tmpDir)
	}
}

// BenchmarkLoadDirectoryParallel measures performance of parallel loading
func BenchmarkLoadDirectoryParallel(b *testing.B) {
	tmpDir := b.TempDir()

	// Create 50 skill files
	validSkill := `---
name: bench-skill
description: Benchmark skill
tags: [BENCH]
---
# Benchmark content`

	for i := 0; i < 50; i++ {
		writeSkillFile(b, tmpDir, filepath.Join("skill-", string(rune('0'+i)), ".md"), validSkill)
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = LoadDirectoryParallel(tmpDir, 4)
	}
}

// TestLoadRealSkillsDirectory tests against the actual .claude/skills directory if it exists
func TestLoadRealSkillsDirectory(t *testing.T) {
	skillsDir := filepath.Join("..", "..", ".claude", "skills")

	if _, err := os.Stat(skillsDir); os.IsNotExist(err) {
		t.Skipf("Skipping real skills directory test - directory not found: %s", skillsDir)
	}

	result, err := LoadDirectory(skillsDir)
	if err != nil {
		t.Fatalf("LoadDirectory() failed on real skills directory: %v", err)
	}

	// Should load at least 100 skills (PRD mentions 186)
	if len(result.Skills) < 100 {
		t.Errorf("LoadDirectory() loaded %d skills from real directory, expected at least 100", len(result.Skills))
	}

	// Log errors if any (for debugging, not a failure)
	if len(result.Errors) > 0 {
		t.Logf("LoadDirectory() encountered %d parse errors:", len(result.Errors))
		for i, err := range result.Errors {
			if i < 5 { // Only log first 5 errors
				t.Logf("  Error %d: %v", i+1, err)
			}
		}
	}

	// Verify all loaded skills have required fields
	for _, skill := range result.Skills {
		if skill.Metadata.Name == "" {
			t.Errorf("Loaded skill from %s has empty name", skill.FilePath)
		}
		if skill.Metadata.Description == "" {
			t.Errorf("Loaded skill from %s has empty description", skill.FilePath)
		}
	}
}

// Helper function to write skill files in tests
func writeSkillFile(t testing.TB, dir, filename, content string) {
	path := filepath.Join(dir, filename)
	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		t.Fatalf("Failed to write test skill file %s: %v", path, err)
	}
}
