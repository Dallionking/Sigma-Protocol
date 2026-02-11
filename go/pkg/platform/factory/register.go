package factory

import (
	"github.com/dallionking/sigma-protocol/pkg/platform"
)

// init registers the Factory Droid builder with the global platform registry.
// This enables Factory Droid builder to be discovered via:
//   builder := platform.DefaultRegistry.Get("factory")
func init() {
	platform.DefaultRegistry.Register(NewBuilder())
}
