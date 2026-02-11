package factory

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

// Writer writes droid files to the output directory.
type Writer struct {
	outputDir string
}

// WriteResult contains the results of a batch write operation.
type WriteResult struct {
	FilesWritten int
	FilesSkipped int
	Errors       []error
}

// NewWriter creates a new droid writer.
func NewWriter(outputDir string) *Writer {
	return &Writer{
		outputDir: outputDir,
	}
}

// Write writes a single droid to a file.
//
// Write workflow:
// 1. Create output directory if missing
// 2. Format droid as YAML frontmatter + Markdown content
// 3. Write to outputDir/filename.md
// 4. Set file permissions to 0644
// 5. Return error if write fails
func (w *Writer) Write(droid *Droid, filename string) error {
	// Step 1: Create output directory if missing
	if err := os.MkdirAll(w.outputDir, 0755); err != nil {
		return fmt.Errorf("failed to create output directory %s: %w", w.outputDir, err)
	}

	// Step 2: Content is already formatted in transformer (includes frontmatter)
	content := droid.Content

	// Step 3: Write file
	filePath := filepath.Join(w.outputDir, filename)
	if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
		return fmt.Errorf("failed to write file %s: %w", filePath, err)
	}

	return nil
}

// WriteBatch writes multiple droids in parallel.
//
// WriteBatch workflow:
// 1. Write droids in parallel using goroutines
// 2. Collect write errors
// 3. Return WriteResult with counts and errors
func (w *Writer) WriteBatch(droids []*Droid) (*WriteResult, error) {
	result := &WriteResult{
		FilesWritten: 0,
		FilesSkipped: 0,
		Errors:       []error{},
	}

	var (
		mu sync.Mutex
		wg sync.WaitGroup
	)

	// Create worker pool
	workerCount := 8
	droidChan := make(chan *Droid, len(droids))

	// Start workers
	for i := 0; i < workerCount; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			for droid := range droidChan {
				filename := fmt.Sprintf("%s.md", droid.Frontmatter.Name)
				err := w.Write(droid, filename)

				mu.Lock()
				if err != nil {
					result.Errors = append(result.Errors, err)
					result.FilesSkipped++
				} else {
					result.FilesWritten++
				}
				mu.Unlock()
			}
		}()
	}

	// Send droids to workers
	for _, droid := range droids {
		droidChan <- droid
	}
	close(droidChan)

	// Wait for all workers to finish
	wg.Wait()

	return result, nil
}
