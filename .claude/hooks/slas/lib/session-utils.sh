#!/bin/bash
# Session Utilities - Shared functions for SLAS hooks

# Get the project sessions directory
get_sessions_dir() {
    local project_dir="${1:-$CLAUDE_PROJECT_DIR}"
    echo "$project_dir/docs/sessions"
}

# Get today's log file path
get_today_log() {
    local sessions_dir="$1"
    local today=$(date +%Y-%m-%d)
    echo "$sessions_dir/logs/$today.md"
}

# Parse a session log file and extract sections
extract_section() {
    local file="$1"
    local section="$2"

    awk -v section="$section" '
        $0 ~ "^## " section {found=1; next}
        found && /^## / {found=0}
        found {print}
    ' "$file"
}

# Get recent session files (last N days)
get_recent_sessions() {
    local logs_dir="$1"
    local days="${2:-3}"

    local files=()
    for i in $(seq 0 $((days - 1))); do
        local check_date
        # macOS date
        check_date=$(date -v-${i}d +%Y-%m-%d 2>/dev/null) || \
        # Linux date
        check_date=$(date -d "today - $i days" +%Y-%m-%d 2>/dev/null) || \
        continue

        local file="$logs_dir/$check_date.md"
        if [[ -f "$file" ]]; then
            files+=("$file")
        fi
    done

    printf '%s\n' "${files[@]}"
}

# Extract patterns from session content
extract_patterns() {
    local content="$1"

    # Look for pattern indicators
    echo "$content" | grep -iE '(prefers?|always|never|frustrated|annoyed|likes?|wants?|style)' | head -10
}

# Calculate session duration from timestamps
calc_duration() {
    local start="$1"
    local end="$2"

    local start_sec=$(date -d "$start" +%s 2>/dev/null || echo 0)
    local end_sec=$(date -d "$end" +%s 2>/dev/null || echo 0)

    if [[ $start_sec -gt 0 && $end_sec -gt 0 ]]; then
        local diff=$((end_sec - start_sec))
        local hours=$((diff / 3600))
        local minutes=$(((diff % 3600) / 60))
        echo "${hours}h ${minutes}m"
    else
        echo "unknown"
    fi
}

# Merge patterns into patterns file
merge_patterns() {
    local patterns_file="$1"
    local new_patterns="$2"

    if [[ ! -f "$patterns_file" ]]; then
        echo "$new_patterns" > "$patterns_file"
        return
    fi

    # Use Python for JSON merging
    python3 -c "
import json
import sys

try:
    with open('$patterns_file', 'r') as f:
        existing = json.load(f)
except:
    existing = {'patterns': {}}

try:
    new = json.loads('''$new_patterns''')
except:
    sys.exit(0)

# Deep merge patterns
for key, value in new.get('patterns', {}).items():
    if key not in existing['patterns']:
        existing['patterns'][key] = value
    elif isinstance(value, list):
        existing['patterns'][key].extend(value)
    elif isinstance(value, dict):
        existing['patterns'][key].update(value)

existing['last_updated'] = '$(date -u +%Y-%m-%dT%H:%M:%SZ)'

with open('$patterns_file', 'w') as f:
    json.dump(existing, f, indent=2)
" 2>/dev/null || true
}
