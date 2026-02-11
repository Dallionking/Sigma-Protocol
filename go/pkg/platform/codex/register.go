package codex

import (
	"github.com/dallionking/sigma-protocol/pkg/platform"
)

func init() {
	// Register Codex builder with the global platform registry
	platform.DefaultRegistry.Register(NewBuilder())
}
