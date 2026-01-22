#!/bin/bash
#
# Run in Sandbox - Executes commands in isolated sandbox environments
#
# Supports three sandbox providers:
#   - docker:  Local Docker containers (default)
#   - e2b:     E2B cloud sandboxes (requires E2B_API_KEY)
#   - daytona: Daytona workspace (requires daytona CLI)
#
# Usage:
#   ./run-in-sandbox.sh --provider docker --command "claude 'implement feature'"
#   ./run-in-sandbox.sh --provider e2b --session abc-123 --command "npm test"
#
# Environment Variables:
#   E2B_API_KEY     - API key for E2B cloud sandboxes
#   DAYTONA_TOKEN   - Auth token for Daytona workspaces
#   SANDBOX_TIMEOUT - Max execution time in seconds (default: 3600)
#
# Exit codes:
#   0 - Success
#   1 - Command failed inside sandbox
#   2 - Configuration/setup error
#   3 - Timeout exceeded

set -e

# Default values
PROVIDER="${PROVIDER:-docker}"
SESSION_ID="${SESSION_ID:-sandbox-$(date +%s)-$$}"
TIMEOUT="${SANDBOX_TIMEOUT:-3600}"
WORKSPACE_PATH="${WORKSPACE_PATH:-$(pwd)}"
COMMAND=""
CLEANUP="${CLEANUP:-true}"
DOCKER_IMAGE="${DOCKER_IMAGE:-sigma-sandbox:latest}"

# JSON output helper
json_output() {
    local status="$1"
    local message="$2"
    local session="$3"
    local provider="$4"
    local exit_code="${5:-0}"

    cat <<EOF
{
  "status": "${status}",
  "message": "${message}",
  "sessionId": "${session}",
  "provider": "${provider}",
  "exitCode": ${exit_code},
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
}

usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Execute commands in isolated sandbox environments.

Options:
  -p, --provider <type>     Sandbox provider: docker, e2b, daytona (default: docker)
  -s, --session <id>        Session ID for sandbox (auto-generated if not provided)
  -c, --command <cmd>       Command to execute in sandbox (required)
  -w, --workspace <path>    Workspace directory to mount (default: current directory)
  -t, --timeout <seconds>   Max execution time (default: 3600)
  -i, --image <name>        Docker image to use (default: sigma-sandbox:latest)
  --no-cleanup              Don't destroy sandbox after execution
  --json                    Output results as JSON
  -h, --help                Show this help message

Examples:
  # Run in Docker sandbox
  $(basename "$0") -p docker -c "npm test"

  # Run in E2B with specific session
  $(basename "$0") -p e2b -s my-session -c "claude 'fix bugs'"

  # Run with increased timeout
  $(basename "$0") -t 7200 -c "npm run build"

Environment Variables:
  E2B_API_KEY       Required for e2b provider
  DAYTONA_TOKEN     Required for daytona provider
  SANDBOX_TIMEOUT   Default timeout in seconds
EOF
    exit 0
}

# Parse arguments
JSON_OUTPUT=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--provider)
            PROVIDER="$2"
            shift 2
            ;;
        -s|--session)
            SESSION_ID="$2"
            shift 2
            ;;
        -c|--command)
            COMMAND="$2"
            shift 2
            ;;
        -w|--workspace)
            WORKSPACE_PATH="$2"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -i|--image)
            DOCKER_IMAGE="$2"
            shift 2
            ;;
        --no-cleanup)
            CLEANUP=false
            shift
            ;;
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 2
            ;;
    esac
done

# Validate required arguments
if [ -z "$COMMAND" ]; then
    if $JSON_OUTPUT; then
        json_output "error" "No command specified" "$SESSION_ID" "$PROVIDER" 2
    else
        echo "Error: No command specified. Use -c or --command" >&2
    fi
    exit 2
fi

# Validate provider
if [[ ! "$PROVIDER" =~ ^(docker|e2b|daytona)$ ]]; then
    if $JSON_OUTPUT; then
        json_output "error" "Invalid provider: $PROVIDER" "$SESSION_ID" "$PROVIDER" 2
    else
        echo "Error: Invalid provider '$PROVIDER'. Must be: docker, e2b, or daytona" >&2
    fi
    exit 2
fi

# ============================================================================
# Docker Sandbox Implementation
# ============================================================================

run_docker_sandbox() {
    local workspace="$1"
    local command="$2"
    local session="$3"
    local timeout="$4"
    local image="$5"

    # Check if Docker is available
    if ! command -v docker &>/dev/null; then
        if $JSON_OUTPUT; then
            json_output "error" "Docker not found" "$session" "docker" 2
        else
            echo "Error: Docker not found. Install Docker first." >&2
        fi
        return 2
    fi

    # Check if image exists, build if not
    if ! docker image inspect "$image" &>/dev/null; then
        local dockerfile_dir
        dockerfile_dir="$(dirname "${BASH_SOURCE[0]}")"

        if [ -f "$dockerfile_dir/Dockerfile" ]; then
            if ! $JSON_OUTPUT; then
                echo "Building Docker image: $image..."
            fi
            docker build -t "$image" "$dockerfile_dir" || {
                if $JSON_OUTPUT; then
                    json_output "error" "Failed to build Docker image" "$session" "docker" 2
                else
                    echo "Error: Failed to build Docker image" >&2
                fi
                return 2
            }
        else
            if $JSON_OUTPUT; then
                json_output "error" "Docker image '$image' not found and no Dockerfile available" "$session" "docker" 2
            else
                echo "Error: Docker image '$image' not found" >&2
            fi
            return 2
        fi
    fi

    # Create container
    local container_name="sigma-${session}"

    if ! $JSON_OUTPUT; then
        echo "Starting Docker sandbox: $container_name"
    fi

    # Run command in container with timeout
    local exit_code=0
    timeout "$timeout" docker run \
        --name "$container_name" \
        --rm \
        -v "$workspace:/workspace/repo:rw" \
        -v "$HOME/.gitconfig:/root/.gitconfig:ro" 2>/dev/null || true \
        -e "SIGMA_SESSION=$session" \
        -e "SIGMA_SANDBOX=docker" \
        -w /workspace/repo \
        "$image" \
        bash -c "$command" || exit_code=$?

    # Handle timeout
    if [ $exit_code -eq 124 ]; then
        if $JSON_OUTPUT; then
            json_output "timeout" "Command exceeded timeout of ${timeout}s" "$session" "docker" 124
        else
            echo "Error: Command timed out after ${timeout}s" >&2
        fi
        # Force stop container if still running
        docker stop "$container_name" 2>/dev/null || true
        return 3
    fi

    return $exit_code
}

# ============================================================================
# E2B Sandbox Implementation
# ============================================================================

run_e2b_sandbox() {
    local workspace="$1"
    local command="$2"
    local session="$3"
    local timeout="$4"

    # Check for E2B API key
    if [ -z "$E2B_API_KEY" ]; then
        if $JSON_OUTPUT; then
            json_output "error" "E2B_API_KEY not set" "$session" "e2b" 2
        else
            echo "Error: E2B_API_KEY environment variable not set" >&2
        fi
        return 2
    fi

    # Check if e2b CLI is available
    if ! command -v e2b &>/dev/null; then
        # Try npx
        if ! npx e2b --version &>/dev/null; then
            if $JSON_OUTPUT; then
                json_output "error" "E2B CLI not found" "$session" "e2b" 2
            else
                echo "Error: E2B CLI not found. Install with: npm install -g @e2b/cli" >&2
            fi
            return 2
        fi
        E2B_CMD="npx e2b"
    else
        E2B_CMD="e2b"
    fi

    if ! $JSON_OUTPUT; then
        echo "Creating E2B sandbox: $session"
    fi

    # Create sandbox with sigma template (or base template)
    local sandbox_id
    sandbox_id=$($E2B_CMD sandbox create --template "sigma-sandbox" 2>/dev/null || \
                 $E2B_CMD sandbox create 2>/dev/null) || {
        if $JSON_OUTPUT; then
            json_output "error" "Failed to create E2B sandbox" "$session" "e2b" 2
        else
            echo "Error: Failed to create E2B sandbox" >&2
        fi
        return 2
    }

    if ! $JSON_OUTPUT; then
        echo "E2B Sandbox ID: $sandbox_id"
    fi

    # Upload workspace (sync files)
    # Note: E2B has file upload API, using basic approach here
    $E2B_CMD sandbox exec "$sandbox_id" "mkdir -p /workspace/repo" 2>/dev/null || true

    # Execute command with timeout
    local exit_code=0
    timeout "$timeout" $E2B_CMD sandbox exec "$sandbox_id" "$command" || exit_code=$?

    # Cleanup unless --no-cleanup
    if [ "$CLEANUP" = "true" ]; then
        $E2B_CMD sandbox stop "$sandbox_id" 2>/dev/null || true
    else
        if ! $JSON_OUTPUT; then
            echo "Sandbox kept alive: $sandbox_id"
        fi
    fi

    if [ $exit_code -eq 124 ]; then
        if $JSON_OUTPUT; then
            json_output "timeout" "Command exceeded timeout of ${timeout}s" "$session" "e2b" 124
        else
            echo "Error: Command timed out after ${timeout}s" >&2
        fi
        return 3
    fi

    return $exit_code
}

# ============================================================================
# Daytona Sandbox Implementation
# ============================================================================

run_daytona_sandbox() {
    local workspace="$1"
    local command="$2"
    local session="$3"
    local timeout="$4"

    # Check if daytona CLI is available
    if ! command -v daytona &>/dev/null; then
        if $JSON_OUTPUT; then
            json_output "error" "Daytona CLI not found" "$session" "daytona" 2
        else
            echo "Error: Daytona CLI not found. Install from: https://www.daytona.io/docs/installation" >&2
        fi
        return 2
    fi

    if ! $JSON_OUTPUT; then
        echo "Creating Daytona workspace: $session"
    fi

    # Check if workspace exists, create if not
    local workspace_exists
    workspace_exists=$(daytona workspace list --format json 2>/dev/null | jq -r ".[] | select(.name==\"$session\") | .name" 2>/dev/null || echo "")

    if [ -z "$workspace_exists" ]; then
        # Create workspace from current directory
        daytona workspace create --name "$session" --path "$workspace" 2>/dev/null || {
            if $JSON_OUTPUT; then
                json_output "error" "Failed to create Daytona workspace" "$session" "daytona" 2
            else
                echo "Error: Failed to create Daytona workspace" >&2
            fi
            return 2
        }
    fi

    # Execute command in workspace
    local exit_code=0
    timeout "$timeout" daytona workspace exec "$session" "$command" || exit_code=$?

    # Cleanup unless --no-cleanup
    if [ "$CLEANUP" = "true" ]; then
        daytona workspace delete "$session" --force 2>/dev/null || true
    else
        if ! $JSON_OUTPUT; then
            echo "Workspace kept alive: $session"
        fi
    fi

    if [ $exit_code -eq 124 ]; then
        if $JSON_OUTPUT; then
            json_output "timeout" "Command exceeded timeout of ${timeout}s" "$session" "daytona" 124
        else
            echo "Error: Command timed out after ${timeout}s" >&2
        fi
        return 3
    fi

    return $exit_code
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    if ! $JSON_OUTPUT; then
        echo "========================================="
        echo "Sigma Protocol - Sandbox Runner"
        echo "========================================="
        echo "Provider:  $PROVIDER"
        echo "Session:   $SESSION_ID"
        echo "Workspace: $WORKSPACE_PATH"
        echo "Timeout:   ${TIMEOUT}s"
        echo "Command:   $COMMAND"
        echo "========================================="
        echo ""
    fi

    local exit_code=0

    case $PROVIDER in
        docker)
            run_docker_sandbox "$WORKSPACE_PATH" "$COMMAND" "$SESSION_ID" "$TIMEOUT" "$DOCKER_IMAGE" || exit_code=$?
            ;;
        e2b)
            run_e2b_sandbox "$WORKSPACE_PATH" "$COMMAND" "$SESSION_ID" "$TIMEOUT" || exit_code=$?
            ;;
        daytona)
            run_daytona_sandbox "$WORKSPACE_PATH" "$COMMAND" "$SESSION_ID" "$TIMEOUT" || exit_code=$?
            ;;
    esac

    if $JSON_OUTPUT; then
        if [ $exit_code -eq 0 ]; then
            json_output "success" "Command completed successfully" "$SESSION_ID" "$PROVIDER" 0
        elif [ $exit_code -eq 3 ]; then
            # Timeout already reported
            :
        else
            json_output "failed" "Command failed with exit code $exit_code" "$SESSION_ID" "$PROVIDER" $exit_code
        fi
    else
        if [ $exit_code -eq 0 ]; then
            echo ""
            echo "✓ Sandbox execution completed successfully"
        else
            echo ""
            echo "✗ Sandbox execution failed (exit code: $exit_code)"
        fi
    fi

    exit $exit_code
}

main
