package factory

import (
	"testing"

	"github.com/dallionking/sigma-protocol/pkg/platform"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRegistration(t *testing.T) {
	// Test that factory builder is registered in the global registry
	builder := platform.DefaultRegistry.Get("factory")
	require.NotNil(t, builder, "Factory builder should be registered")

	// Verify it's the correct type
	_, ok := builder.(*Builder)
	assert.True(t, ok, "Registered builder should be *Builder type")

	// Verify it has the correct name
	assert.Equal(t, "factory", builder.Name())
}

func TestRegisteredBuilderWorks(t *testing.T) {
	// Get builder from registry
	builder := platform.DefaultRegistry.Get("factory")
	require.NotNil(t, builder)

	// Test that it can get metrics
	metrics := builder.GetMetrics()
	assert.Equal(t, "factory", metrics.Platform)
}
