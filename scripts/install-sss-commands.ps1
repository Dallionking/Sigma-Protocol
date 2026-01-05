# SSS Commands Installer
# Installs SSS commands into .cursor/ structure with folder preservation and smart override handling

param(
    [switch]$Force,      # Override all existing files
    [switch]$DryRun,     # Preview only, don't modify files
    [switch]$Backup,     # Backup files before overriding
    [switch]$Verbose     # Show detailed output
)

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Get-FileHashSafe {
    param([string]$Path)
    try {
        return (Get-FileHash $Path -ErrorAction Stop).Hash
    } catch {
        return $null
    }
}

function Install-SSSCommands {
    Write-ColorOutput "`n🚀 SSS Commands Installer`n" "Magenta"
    
    $sourceRoot = $PSScriptRoot | Split-Path -Parent
    $targetCommands = ".cursor/commands"
    $targetRules = ".cursor/rules"
    
    Write-ColorOutput "Source: $sourceRoot" "Gray"
    Write-ColorOutput "Target: $targetCommands (commands), $targetRules (rules)" "Gray"
    
    # Create target directories if they don't exist
    if (-not $DryRun) {
        New-Item -ItemType Directory -Force -Path $targetCommands | Out-Null
        New-Item -ItemType Directory -Force -Path $targetRules | Out-Null
        Write-ColorOutput "✅ Created .cursor directory structure" "Green"
    } else {
        Write-ColorOutput "📋 DRY RUN: Would create .cursor directory structure" "Yellow"
    }
    
    # Track changes
    $stats = @{
        Added = @()
        Updated = @()
        Skipped = @()
        Backed = @()
        Errors = @()
    }
    
    # Define command source folders (preserve folder structure)
    $commandFolders = @(
        "steps",
        "audit", 
        "deploy",
        "dev",
        "generators",
        "marketing",
        "ops",
        "Magic UI"
    )
    
    Write-ColorOutput "`n📦 Processing command files..." "Cyan"
    
    foreach ($folder in $commandFolders) {
        $folderPath = Join-Path $sourceRoot $folder
        
        if (-not (Test-Path $folderPath)) {
            if ($Verbose) {
                Write-ColorOutput "⚠️  Folder not found: $folder" "Yellow"
            }
            continue
        }
        
        Write-ColorOutput "`n📁 Processing $folder/..." "Cyan"
        
        # Create target subfolder to preserve structure
        $targetSubfolder = Join-Path $targetCommands $folder
        if (-not $DryRun) {
            New-Item -ItemType Directory -Force -Path $targetSubfolder | Out-Null
        }
        
        # Get all files recursively
        Get-ChildItem -Path $folderPath -File -Recurse | ForEach-Object {
            $file = $_
            $relativePath = $file.FullName.Substring($folderPath.Length + 1)
            
            # Determine if it's a rule or command
            $isRule = $file.Extension -eq ".mdc"
            
            if ($isRule) {
                # Rules go to .cursor/rules/ flat
                $targetPath = Join-Path $targetRules $file.Name
            } else {
                # Commands go to .cursor/commands/[folder]/ preserving subfolder structure
                $targetPath = Join-Path $targetSubfolder $relativePath
                
                # Ensure parent directory exists
                $targetParent = Split-Path $targetPath -Parent
                if (-not $DryRun -and -not (Test-Path $targetParent)) {
                    New-Item -ItemType Directory -Force -Path $targetParent | Out-Null
                }
            }
            
            $targetName = "$folder/$relativePath"
            
            # Check if file exists
            $exists = Test-Path $targetPath
            
            try {
                if ($exists) {
                    # File exists - decide what to do
                    
                    if ($Force) {
                        # Force override
                        if ($Backup) {
                            $backupPath = "$targetPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
                            if (-not $DryRun) {
                                Copy-Item $targetPath $backupPath -Force
                            }
                            $stats.Backed += $targetName
                            if ($Verbose) {
                                Write-ColorOutput "  📦 Backed up: $targetName" "Yellow"
                            }
                        }
                        
                        if (-not $DryRun) {
                            Copy-Item $file.FullName $targetPath -Force
                        }
                        $stats.Updated += $targetName
                        Write-ColorOutput "  🔄 Overrode: $targetName" "Yellow"
                        
                    } else {
                        # Smart comparison - only update if content changed
                        $sourceHash = Get-FileHashSafe $file.FullName
                        $targetHash = Get-FileHashSafe $targetPath
                        
                        if ($sourceHash -and $targetHash -and $sourceHash -ne $targetHash) {
                            # Content changed - update
                            if ($Backup) {
                                $backupPath = "$targetPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
                                if (-not $DryRun) {
                                    Copy-Item $targetPath $backupPath -Force
                                }
                                $stats.Backed += $targetName
                            }
                            
                            if (-not $DryRun) {
                                Copy-Item $file.FullName $targetPath -Force
                            }
                            $stats.Updated += $targetName
                            Write-ColorOutput "  ✏️  Updated: $targetName" "Cyan"
                            
                        } else {
                            $stats.Skipped += $targetName
                            if ($Verbose) {
                                Write-ColorOutput "  ⏭️  Skipped (unchanged): $targetName" "Gray"
                            }
                        }
                    }
                    
                } else {
                    # New file - add it
                    if (-not $DryRun) {
                        Copy-Item $file.FullName $targetPath -Force
                    }
                    $stats.Added += $targetName
                    Write-ColorOutput "  ✅ Added: $targetName" "Green"
                }
                
            } catch {
                $stats.Errors += @{
                    File = $targetName
                    Error = $_.Exception.Message
                }
                Write-ColorOutput "  ❌ Error processing $targetName`: $($_.Exception.Message)" "Red"
            }
        }
    }
    
    # Summary
    Write-ColorOutput "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Magenta"
    Write-ColorOutput "📊 Installation Summary" "Magenta"
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Magenta"
    Write-ColorOutput "   Added:   $($stats.Added.Count) files" "Green"
    Write-ColorOutput "   Updated: $($stats.Updated.Count) files" "Cyan"
    Write-ColorOutput "   Skipped: $($stats.Skipped.Count) files" "Gray"
    Write-ColorOutput "   Backed:  $($stats.Backed.Count) files" "Yellow"
    
    if ($stats.Errors.Count -gt 0) {
        Write-ColorOutput "   Errors:  $($stats.Errors.Count) files" "Red"
    }
    
    if ($DryRun) {
        Write-ColorOutput "`n⚠️  DRY RUN - No files were actually modified" "Yellow"
        Write-ColorOutput "   Run without --DryRun to apply changes" "Yellow"
    }
    
    # Show detailed lists if verbose
    if ($Verbose -and $stats.Added.Count -gt 0) {
        Write-ColorOutput "`n✅ Added Files:" "Green"
        $stats.Added | ForEach-Object { Write-ColorOutput "   - $_" "Gray" }
    }
    
    if ($Verbose -and $stats.Updated.Count -gt 0) {
        Write-ColorOutput "`n✏️  Updated Files:" "Cyan"
        $stats.Updated | ForEach-Object { Write-ColorOutput "   - $_" "Gray" }
    }
    
    if ($stats.Errors.Count -gt 0) {
        Write-ColorOutput "`n❌ Errors:" "Red"
        $stats.Errors | ForEach-Object { 
            Write-ColorOutput "   - $($_.File): $($_.Error)" "Gray" 
        }
    }
    
    Write-ColorOutput "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" "Magenta"
    
    # Next steps
    if (-not $DryRun) {
        Write-ColorOutput "🎯 Next Steps:" "Cyan"
        Write-ColorOutput "   1. Review installed commands in .cursor/commands/" "White"
        Write-ColorOutput "   2. Review rules in .cursor/rules/" "White"
        Write-ColorOutput "   3. Run validation: /lint-commands" "White"
        Write-ColorOutput "   4. Test a command: /step-0-environment-setup" "White"
    }
    
    return $stats
}

# Main execution
try {
    $result = Install-SSSCommands
    
    if (-not $DryRun -and ($result.Added.Count -gt 0 -or $result.Updated.Count -gt 0)) {
        Write-ColorOutput "✅ Installation complete!" "Green"
        exit 0
    } elseif ($DryRun) {
        Write-ColorOutput "✅ Dry run complete - review changes above" "Green"
        exit 0
    } else {
        Write-ColorOutput "ℹ️  No changes needed - all files up to date" "Cyan"
        exit 0
    }
    
} catch {
    Write-ColorOutput "`n❌ Installation failed: $($_.Exception.Message)" "Red"
    Write-ColorOutput $_.ScriptStackTrace "Gray"
    exit 1
}

