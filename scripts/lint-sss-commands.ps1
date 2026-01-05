# SSS Commands Linter
# Validates command files for consistency and correctness

param(
    [switch]$Fix,        # Attempt to auto-fix issues
    [switch]$Strict,     # Fail on warnings
    [switch]$Verbose     # Show detailed output
)

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

class ValidationIssue {
    [string]$File
    [string]$Severity  # Error, Warning, Info
    [string]$Category
    [string]$Message
    [int]$Line
    [string]$FixSuggestion
}

function Test-CommandFile {
    param(
        [string]$FilePath
    )
    
    $issues = @()
    $fileName = Split-Path $FilePath -Leaf
    $content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
    
    if (-not $content) {
        return $issues
    }
    
    $lines = Get-Content $FilePath -ErrorAction SilentlyContinue
    
    # Check 1: Has YAML frontmatter
    if ($content -notmatch '(?s)^---\n.*?\n---') {
        $issues += [ValidationIssue]@{
            File = $fileName
            Severity = "Error"
            Category = "Frontmatter"
            Message = "Missing YAML frontmatter"
            Line = 1
            FixSuggestion = "Add YAML frontmatter with version, description, allowed-tools"
        }
    } else {
        # Parse frontmatter
        if ($content -match '(?s)^---\n(.*?)\n---') {
            $frontmatter = $matches[1]
            
            # Check required fields
            if ($frontmatter -notmatch 'version:') {
                $issues += [ValidationIssue]@{
                    File = $fileName
                    Severity = "Error"
                    Category = "Frontmatter"
                    Message = "Missing 'version' field"
                    Line = 1
                    FixSuggestion = "Add 'version: 1.0.0' to frontmatter"
                }
            }
            
            if ($frontmatter -notmatch 'description:') {
                $issues += [ValidationIssue]@{
                    File = $fileName
                    Severity = "Error"
                    Category = "Frontmatter"
                    Message = "Missing 'description' field"
                    Line = 1
                    FixSuggestion = "Add 'description' to frontmatter"
                }
            }
            
            if ($frontmatter -notmatch 'allowed-tools:') {
                $issues += [ValidationIssue]@{
                    File = $fileName
                    Severity = "Warning"
                    Category = "Frontmatter"
                    Message = "Missing 'allowed-tools' field"
                    Line = 1
                    FixSuggestion = "Add 'allowed-tools' list to frontmatter"
                }
            }
        }
    }
    
    # Check 2: Has H1 header after frontmatter
    if ($content -match '(?s)---\n.*?\n---\s*\n+(.+?)(\n|$)') {
        $firstLineAfterFrontmatter = $matches[1]
        
        if ($firstLineAfterFrontmatter -notmatch '^#\s+[/@]') {
            $issues += [ValidationIssue]@{
                File = $fileName
                Severity = "Error"
                Category = "Header"
                Message = "Missing H1 command header (should start with '# /' or '# @')"
                Line = 10
                FixSuggestion = "Add '# /command-name' or '# @command-name' header"
            }
        } else {
            # Check header matches filename
            $headerCommand = $firstLineAfterFrontmatter -replace '^#\s+[/@]', '' -replace '\s*$', ''
            $fileNameWithoutExt = $fileName -replace '\.(md|mdc)$', ''
            
            if ($headerCommand -ne $fileNameWithoutExt) {
                $issues += [ValidationIssue]@{
                    File = $fileName
                    Severity = "Warning"
                    Category = "Header"
                    Message = "Header name '$headerCommand' doesn't match filename '$fileNameWithoutExt'"
                    Line = 10
                    FixSuggestion = "Rename file to '$headerCommand' or change header to '# /$fileNameWithoutExt'"
                }
            }
        }
    }
    
    # Check 3: Consistent command prefix (/ vs @)
    $headerPrefixes = [regex]::Matches($content, '(?m)^#\s+([/@])') | ForEach-Object { $_.Groups[1].Value }
    if ($headerPrefixes.Count -gt 0) {
        $uniquePrefixes = $headerPrefixes | Select-Object -Unique
        if ($uniquePrefixes.Count -gt 1) {
            $issues += [ValidationIssue]@{
                File = $fileName
                Severity = "Warning"
                Category = "Consistency"
                Message = "Mixed command prefixes: uses both '/' and '@'"
                Line = 0
                FixSuggestion = "Standardize to '/' prefix everywhere"
            }
        }
    }
    
    # Check 4: No empty sections
    $emptyHeaderMatches = [regex]::Matches($content, '(?m)^##[^\n]+\n\s*\n##')
    if ($emptyHeaderMatches.Count -gt 0) {
        $issues += [ValidationIssue]@{
            File = $fileName
            Severity = "Warning"
            Category = "Content"
            Message = "Found $($emptyHeaderMatches.Count) empty section(s)"
            Line = 0
            FixSuggestion = "Add content to empty sections or remove them"
        }
    }
    
    # Check 5: Required sections for full commands
    $hasPurpose = $content -match '##\s+.*Purpose'
    $hasUsage = $content -match '##\s+.*Command Usage'
    $hasOutputs = $content -match '##\s+.*Outputs'
    
    if (-not $hasPurpose) {
        $issues += [ValidationIssue]@{
            File = $fileName
            Severity = "Warning"
            Category = "Structure"
            Message = "Missing 'Purpose' section"
            Line = 0
            FixSuggestion = "Add ## Purpose section explaining command goal"
        }
    }
    
    if (-not $hasUsage) {
        $issues += [ValidationIssue]@{
            File = $fileName
            Severity = "Warning"
            Category = "Structure"
            Message = "Missing 'Command Usage' section"
            Line = 0
            FixSuggestion = "Add ## Command Usage section with examples"
        }
    }
    
    # Check 6: Parameter consistency
    if ($content -match 'parameters:\s*\n((?:\s+-\s+--[a-z-]+\n)+)') {
        $declaredParams = [regex]::Matches($matches[1], '--([a-z-]+)') | 
                         ForEach-Object { $_.Groups[1].Value }
        
        # Check if parameters are documented
        foreach ($param in $declaredParams) {
            if ($content -notmatch "\|\s*\`--$param\`\s*\|" -and $content -notmatch "\|\s*--$param\s*\|") {
                $issues += [ValidationIssue]@{
                    File = $fileName
                    Severity = "Warning"
                    Category = "Parameters"
                    Message = "Parameter '--$param' declared but not documented in table"
                    Line = 0
                    FixSuggestion = "Add '--$param' row to Parameters table"
                }
            }
        }
    }
    
    return $issues
}

function Invoke-CommandLint {
    Write-ColorOutput "`n🔍 SSS Commands Linter`n" "Magenta"
    
    # Get script directory and navigate to source root
    $scriptDir = $PSScriptRoot
    $sourceRoot = Split-Path $scriptDir -Parent
    
    $commandDirs = @(
        (Join-Path $sourceRoot "steps"),
        (Join-Path $sourceRoot "audit"),
        (Join-Path $sourceRoot "deploy"),
        (Join-Path $sourceRoot "dev"),
        (Join-Path $sourceRoot "generators"),
        (Join-Path $sourceRoot "marketing"),
        (Join-Path $sourceRoot "ops"),
        ".cursor/commands/steps",
        ".cursor/commands/audit",
        ".cursor/commands/deploy",
        ".cursor/commands/dev",
        ".cursor/commands/generators",
        ".cursor/commands/marketing",
        ".cursor/commands/ops"
    )
    
    $allIssues = @()
    $fileCount = 0
    
    foreach ($dir in $commandDirs) {
        if (-not (Test-Path $dir)) {
            if ($Verbose) {
                Write-ColorOutput "⏭️  Skipping $dir (not found)" "Gray"
            }
            continue
        }
        
        # Skip boilerplates, node_modules, and other vendor directories
        if ($dir -match 'boilerplates|node_modules|\.git|dist') {
            if ($Verbose) {
                Write-ColorOutput "⏭️  Skipping $dir (vendor)" "Gray"
            }
            continue
        }
        
        $displayDir = if ($dir.StartsWith($sourceRoot)) { 
            $dir.Substring($sourceRoot.Length + 1) 
        } else { 
            $dir 
        }
        Write-ColorOutput "📁 Checking $displayDir/" "Cyan"
        
        $files = Get-ChildItem -Path $dir -File -ErrorAction SilentlyContinue | Where-Object { 
            ($_.Extension -eq ".md" -or $_.Extension -eq "" -or $_.Extension -eq ".mdc") -and
            $_.Name -notmatch '\.backup-' -and
            $_.FullName -notmatch 'boilerplates|node_modules'
        }
        
        foreach ($file in $files) {
            $fileCount++
            $issues = Test-CommandFile -FilePath $file.FullName
            
            if ($issues.Count -eq 0) {
                if ($Verbose) {
                    Write-ColorOutput "  ✅ $($file.Name)" "Green"
                }
            } else {
                $errorCount = ($issues | Where-Object { $_.Severity -eq "Error" }).Count
                $warningCount = ($issues | Where-Object { $_.Severity -eq "Warning" }).Count
                
                if ($errorCount -gt 0) {
                    Write-ColorOutput "  ❌ $($file.Name) - $errorCount error(s), $warningCount warning(s)" "Red"
                } else {
                    Write-ColorOutput "  ⚠️  $($file.Name) - $warningCount warning(s)" "Yellow"
                }
                
                if ($Verbose) {
                    foreach ($issue in $issues) {
                        $color = switch ($issue.Severity) {
                            "Error" { "Red" }
                            "Warning" { "Yellow" }
                            "Info" { "Cyan" }
                        }
                        Write-ColorOutput "     [$($issue.Severity)] $($issue.Category): $($issue.Message)" $color
                        if ($issue.FixSuggestion) {
                            Write-ColorOutput "     💡 $($issue.FixSuggestion)" "Gray"
                        }
                    }
                }
                
                $allIssues += $issues
            }
        }
    }
    
    # Summary
    Write-ColorOutput "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Magenta"
    Write-ColorOutput "📊 Lint Summary" "Magenta"
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Magenta"
    
    $errorCount = ($allIssues | Where-Object { $_.Severity -eq "Error" }).Count
    $warningCount = ($allIssues | Where-Object { $_.Severity -eq "Warning" }).Count
    $infoCount = ($allIssues | Where-Object { $_.Severity -eq "Info" }).Count
    
    Write-ColorOutput "Files Checked: $fileCount" "White"
    Write-ColorOutput "Errors:        $errorCount" $(if ($errorCount -gt 0) { "Red" } else { "Green" })
    Write-ColorOutput "Warnings:      $warningCount" $(if ($warningCount -gt 0) { "Yellow" } else { "Green" })
    Write-ColorOutput "Info:          $infoCount" "Cyan"
    
    if ($allIssues.Count -eq 0) {
        Write-ColorOutput "`n✅ All command files pass validation!" "Green"
        exit 0
    }
    
    # Group issues by category
    Write-ColorOutput "`n📋 Issues by Category:" "Cyan"
    $byCategory = $allIssues | Group-Object Category | Sort-Object Count -Descending
    foreach ($group in $byCategory) {
        $errors = ($group.Group | Where-Object { $_.Severity -eq "Error" }).Count
        $warnings = ($group.Group | Where-Object { $_.Severity -eq "Warning" }).Count
        Write-ColorOutput "   $($group.Name): $errors errors, $warnings warnings" "White"
    }
    
    # Top offenders
    Write-ColorOutput "`n🔴 Files with most issues:" "Cyan"
    $byFile = $allIssues | Group-Object File | Sort-Object Count -Descending | Select-Object -First 5
    foreach ($group in $byFile) {
        Write-ColorOutput "   $($group.Name): $($group.Count) issues" "White"
    }
    
    Write-ColorOutput "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" "Magenta"
    
    # Exit code
    if ($Strict -and $warningCount -gt 0) {
        Write-ColorOutput "❌ Lint failed (strict mode, warnings present)" "Red"
        exit 1
    } elseif ($errorCount -gt 0) {
        Write-ColorOutput "❌ Lint failed ($errorCount errors)" "Red"
        exit 1
    } else {
        Write-ColorOutput "⚠️  Lint passed with warnings" "Yellow"
        exit 0
    }
}

# Main execution
try {
    Invoke-CommandLint
} catch {
    Write-ColorOutput "`n❌ Linter failed: $($_.Exception.Message)" "Red"
    Write-ColorOutput $_.ScriptStackTrace "Gray"
    exit 1
}

