package skill

import (
	"fmt"
	"io/fs"
	"path/filepath"
	"sync"
)

// LoadResult contains the results of loading skills from a directory.
// It includes both successfully parsed skills and any errors encountered.
type LoadResult struct {
	Skills []*Skill
	Errors []error
}

// LoadDirectory recursively loads all .skill and .md files from a directory.
// It collects all parse errors without stopping, allowing partial success.
// Returns a LoadResult containing both successful parses and errors.
func LoadDirectory(dir string) (*LoadResult, error) {
	result := &LoadResult{
		Skills: make([]*Skill, 0),
		Errors: make([]error, 0),
	}

	// Walk directory recursively
	err := filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			result.Errors = append(result.Errors, fmt.Errorf("error accessing path %s: %w", path, err))
			return nil // Continue walking despite error
		}

		// Skip directories
		if d.IsDir() {
			return nil
		}

		// Check for .skill or .md extension
		ext := filepath.Ext(path)
		if ext != ".skill" && ext != ".md" {
			return nil
		}

		// Parse the skill file
		skill, parseErr := Parse(path)
		if parseErr != nil {
			result.Errors = append(result.Errors, parseErr)
			return nil // Continue despite parse error
		}

		result.Skills = append(result.Skills, skill)
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to walk directory %s: %w", dir, err)
	}

	return result, nil
}

// LoadDirectoryParallel loads skills from a directory using parallel processing
// with a worker pool pattern. This is significantly faster for large directories.
// The results are identical to LoadDirectory() but processed concurrently.
func LoadDirectoryParallel(dir string, workers int) (*LoadResult, error) {
	if workers <= 0 {
		workers = 4 // Default to 4 workers
	}

	// First, collect all skill file paths
	var paths []string
	err := filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return nil // Skip inaccessible paths
		}

		if d.IsDir() {
			return nil
		}

		ext := filepath.Ext(path)
		if ext == ".skill" || ext == ".md" {
			paths = append(paths, path)
		}

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to walk directory %s: %w", dir, err)
	}

	// Create result with mutex for concurrent access
	result := &LoadResult{
		Skills: make([]*Skill, 0, len(paths)),
		Errors: make([]error, 0),
	}
	var mu sync.Mutex

	// Create worker pool
	var wg sync.WaitGroup
	pathChan := make(chan string, len(paths))

	// Start workers
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			for path := range pathChan {
				skill, parseErr := Parse(path)

				mu.Lock()
				if parseErr != nil {
					result.Errors = append(result.Errors, parseErr)
				} else {
					result.Skills = append(result.Skills, skill)
				}
				mu.Unlock()
			}
		}()
	}

	// Send paths to workers
	for _, path := range paths {
		pathChan <- path
	}
	close(pathChan)

	// Wait for all workers to finish
	wg.Wait()

	return result, nil
}
