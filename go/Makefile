# Sigma CLI Makefile
# Build, test, and lint targets for the Go CLI

.PHONY: build test test-short test-coverage lint clean install dev help

# Build variables
BINARY_NAME := sigma
BUILD_DIR := dist
VERSION := $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
LDFLAGS := -ldflags "-X main.version=$(VERSION)"

# Default target
all: lint test build

## Build targets

build: ## Build the sigma binary
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/sigma

build-all: ## Build for all platforms
	@echo "Building for all platforms..."
	@mkdir -p $(BUILD_DIR)
	GOOS=darwin GOARCH=amd64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-amd64 ./cmd/sigma
	GOOS=darwin GOARCH=arm64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-arm64 ./cmd/sigma
	GOOS=linux GOARCH=amd64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64 ./cmd/sigma
	GOOS=linux GOARCH=arm64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-linux-arm64 ./cmd/sigma
	GOOS=windows GOARCH=amd64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-windows-amd64.exe ./cmd/sigma

install: build ## Install sigma to GOPATH/bin
	@echo "Installing $(BINARY_NAME)..."
	go install $(LDFLAGS) ./cmd/sigma

## Test targets

test: ## Run all tests
	@echo "Running tests..."
	go test -v ./...

test-short: ## Run tests in short mode (skip integration tests)
	@echo "Running short tests..."
	go test -v -short ./...

test-coverage: ## Run tests with coverage report
	@echo "Running tests with coverage..."
	@mkdir -p $(BUILD_DIR)
	go test -v -coverprofile=$(BUILD_DIR)/coverage.out ./...
	go tool cover -html=$(BUILD_DIR)/coverage.out -o $(BUILD_DIR)/coverage.html
	@echo "Coverage report: $(BUILD_DIR)/coverage.html"

test-race: ## Run tests with race detector
	@echo "Running tests with race detector..."
	go test -v -race ./...

test-integration: ## Run integration tests only
	@echo "Running integration tests..."
	go test -v ./tests/integration/...

## Lint targets

lint: ## Run golangci-lint
	@echo "Running linter..."
	golangci-lint run

lint-fix: ## Run golangci-lint with auto-fix
	@echo "Running linter with auto-fix..."
	golangci-lint run --fix

fmt: ## Format code with gofmt
	@echo "Formatting code..."
	gofmt -w -s .

vet: ## Run go vet
	@echo "Running go vet..."
	go vet ./...

## Development targets

dev: ## Build and run in development mode
	@echo "Running in development mode..."
	go run ./cmd/sigma $(ARGS)

watch: ## Watch for changes and rebuild (requires entr)
	@echo "Watching for changes..."
	find . -name "*.go" | entr -r make build

## Clean targets

clean: ## Clean build artifacts
	@echo "Cleaning..."
	rm -rf $(BUILD_DIR)
	go clean

## Dependency targets

deps: ## Download dependencies
	@echo "Downloading dependencies..."
	go mod download

deps-update: ## Update dependencies
	@echo "Updating dependencies..."
	go get -u ./...
	go mod tidy

deps-tidy: ## Tidy go.mod and go.sum
	@echo "Tidying dependencies..."
	go mod tidy

## Security targets

vuln: ## Check for vulnerabilities
	@echo "Checking for vulnerabilities..."
	govulncheck ./...

## Help

help: ## Show this help
	@echo "Sigma CLI Makefile"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
