# SSS OpenCode Configuration Installer (PowerShell)
# Installs SSS commands, skills, and agents into ~/.config/opencode/
# for global availability across all projects

param(
    [switch]$Force,
    [switch]$DryRun,
    [switch]$Backup,
    [switch]$Verbose,
    [switch]$SkillsOnly,
    [switch]$AgentsOnly,
    [switch]$CommandsOnly,
    [switch]$Help
)

# Colors
$Colors = @{
    Red     = "Red"
    Green   = "Green"
    Yellow  = "Yellow"
    Cyan    = "Cyan"
    Magenta = "Magenta"
    Gray    = "Gray"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Show-Help {
    Write-ColorOutput @"
Usage: .\install-opencode-config.ps1 [OPTIONS]

Installs SSS Protocol commands, skills, and agents into OpenCode's
global configuration directory (~/.config/opencode/).

Options:
  -Force          Override all existing files
  -DryRun         Preview only, don't modify files
  -Backup         Backup files before overriding
  -Verbose        Show detailed output
  -SkillsOnly     Only install skills
  -AgentsOnly     Only install agents
  -CommandsOnly   Only install commands
  -Help           Show this help message

After installation, commands are available in OpenCode as:
  /step-1-ideation     - Run ideation step
  /audit/gap-analysis  - Run gap analysis
  @sigma               - Use primary SSS agent
  @sss-researcher      - Use researcher subagent
"@ -Color "Cyan"
    exit 0
}

if ($Help) {
    Show-Help
}

# Get script directory and source root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SourceRoot = Split-Path -Parent $ScriptDir

# OpenCode config directory
$OpenCodeConfig = Join-Path $env:USERPROFILE ".config\opencode"

# Target directories
$TargetSkills = Join-Path $OpenCodeConfig "skill"
$TargetAgents = Join-Path $OpenCodeConfig "agent"
$TargetCommands = Join-Path $OpenCodeConfig "command"
$TargetPlugins = Join-Path $OpenCodeConfig "plugin"

# Counters
$script:Added = 0
$script:Updated = 0
$script:Skipped = 0
$script:Backed = 0

function Test-ShouldInstallAll {
    return -not ($SkillsOnly -or $AgentsOnly -or $CommandsOnly)
}

function Get-FileHash-Safe {
    param([string]$Path)
    try {
        return (Get-FileHash -Path $Path -Algorithm MD5).Hash
    } catch {
        return $null
    }
}

function Copy-FileWithComparison {
    param(
        [string]$Source,
        [string]$Target,
        [string]$DisplayName
    )
    
    # Ensure parent directory exists
    $TargetParent = Split-Path -Parent $Target
    if (-not $DryRun -and -not (Test-Path $TargetParent)) {
        New-Item -ItemType Directory -Path $TargetParent -Force | Out-Null
    }
    
    if (Test-Path $Target) {
        if ($Force) {
            # Force override
            if ($Backup) {
                $BackupPath = "$Target.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
                if (-not $DryRun) {
                    Copy-Item -Path $Target -Destination $BackupPath
                }
                $script:Backed++
                if ($Verbose) {
                    Write-ColorOutput "  📦 Backed up: $DisplayName" -Color $Colors.Yellow
                }
            }
            
            if (-not $DryRun) {
                Copy-Item -Path $Source -Destination $Target -Force
            }
            $script:Updated++
            Write-ColorOutput "  🔄 Overrode: $DisplayName" -Color $Colors.Yellow
        } else {
            # Smart comparison
            $SourceHash = Get-FileHash-Safe -Path $Source
            $TargetHash = Get-FileHash-Safe -Path $Target
            
            if ($SourceHash -ne $TargetHash) {
                if ($Backup) {
                    $BackupPath = "$Target.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
                    if (-not $DryRun) {
                        Copy-Item -Path $Target -Destination $BackupPath
                    }
                    $script:Backed++
                }
                
                if (-not $DryRun) {
                    Copy-Item -Path $Source -Destination $Target -Force
                }
                $script:Updated++
                Write-ColorOutput "  ✏️  Updated: $DisplayName" -Color $Colors.Cyan
            } else {
                $script:Skipped++
                if ($Verbose) {
                    Write-ColorOutput "  ⏭️  Skipped (unchanged): $DisplayName" -Color $Colors.Gray
                }
            }
        }
    } else {
        # New file
        if (-not $DryRun) {
            Copy-Item -Path $Source -Destination $Target
        }
        $script:Added++
        Write-ColorOutput "  ✅ Added: $DisplayName" -Color $Colors.Green
    }
}

# Header
Write-ColorOutput @"

╔══════════════════════════════════════════════════════════════════╗
║           SSS Protocol - OpenCode Configuration Installer         ║
╚══════════════════════════════════════════════════════════════════╝

"@ -Color $Colors.Magenta

Write-ColorOutput "Source: $SourceRoot" -Color $Colors.Gray
Write-ColorOutput "Target: $OpenCodeConfig" -Color $Colors.Gray
Write-Host ""

# Check if OpenCode is installed
$OpenCodePath = Get-Command opencode -ErrorAction SilentlyContinue
if (-not $OpenCodePath) {
    Write-ColorOutput "⚠️  OpenCode CLI not found. Install it first:" -Color $Colors.Yellow
    Write-ColorOutput "  npm install -g opencode" -Color $Colors.Cyan
    Write-Host ""
    Write-ColorOutput "Continuing with configuration installation anyway..." -Color $Colors.Yellow
    Write-Host ""
}

# Create directory structure
if (-not $DryRun) {
    @($TargetSkills, $TargetAgents, $TargetCommands, $TargetPlugins) | ForEach-Object {
        if (-not (Test-Path $_)) {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
        }
    }
    Write-ColorOutput "✅ Created OpenCode directory structure" -Color $Colors.Green
} else {
    Write-ColorOutput "📋 DRY RUN: Would create OpenCode directory structure" -Color $Colors.Yellow
}

# ══════════════════════════════════════════════════════════════════
# PHASE 1: Install Foundation Skills
# ══════════════════════════════════════════════════════════════════

if ((Test-ShouldInstallAll) -or $SkillsOnly) {
    Write-Host ""
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Color $Colors.Magenta
    Write-ColorOutput "📚 Phase 1: Installing Foundation Skills" -Color $Colors.Magenta
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Color $Colors.Magenta
    
    $SkillsSource = Join-Path $SourceRoot "platforms\opencode\skill"
    
    if (Test-Path $SkillsSource) {
        $SkillCount = 0
        Get-ChildItem -Path $SkillsSource -Directory | ForEach-Object {
            $SkillName = $_.Name
            $SkillFile = Join-Path $_.FullName "SKILL.md"
            
            if (Test-Path $SkillFile) {
                $TargetSkillDir = Join-Path $TargetSkills $SkillName
                if (-not $DryRun -and -not (Test-Path $TargetSkillDir)) {
                    New-Item -ItemType Directory -Path $TargetSkillDir -Force | Out-Null
                }
                Copy-FileWithComparison -Source $SkillFile -Target (Join-Path $TargetSkillDir "SKILL.md") -DisplayName "skill/$SkillName"
                $SkillCount++
            }
        }
        Write-ColorOutput "ℹ️  Processed $SkillCount skills" -Color $Colors.Cyan
    } else {
        Write-ColorOutput "⚠️  Skills source not found: $SkillsSource" -Color $Colors.Yellow
    }
}

# ══════════════════════════════════════════════════════════════════
# PHASE 2: Install SSS Agents
# ══════════════════════════════════════════════════════════════════

if ((Test-ShouldInstallAll) -or $AgentsOnly) {
    Write-Host ""
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Color $Colors.Magenta
    Write-ColorOutput "🤖 Phase 2: Installing SSS Agents" -Color $Colors.Magenta
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Color $Colors.Magenta
    
    $AgentsSource = Join-Path $SourceRoot "platforms\opencode\agent"
    
    if (Test-Path $AgentsSource) {
        $AgentCount = 0
        Get-ChildItem -Path $AgentsSource -Filter "*.md" | ForEach-Object {
            Copy-FileWithComparison -Source $_.FullName -Target (Join-Path $TargetAgents $_.Name) -DisplayName "agent/$($_.Name)"
            $AgentCount++
        }
        Write-ColorOutput "ℹ️  Processed $AgentCount agents" -Color $Colors.Cyan
    } else {
        Write-ColorOutput "⚠️  Agents source not found: $AgentsSource" -Color $Colors.Yellow
    }
}

# ══════════════════════════════════════════════════════════════════
# PHASE 3: Install Commands
# ══════════════════════════════════════════════════════════════════

if ((Test-ShouldInstallAll) -or $CommandsOnly) {
    Write-Host ""
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Color $Colors.Magenta
    Write-ColorOutput "⚡ Phase 3: Installing Commands" -Color $Colors.Magenta
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Color $Colors.Magenta
    
    $CommandFolders = @("steps", "audit", "deploy", "dev", "generators", "marketing", "ops")
    
    foreach ($Folder in $CommandFolders) {
        $FolderPath = Join-Path $SourceRoot $Folder
        
        if (-not (Test-Path $FolderPath)) {
            if ($Verbose) {
                Write-ColorOutput "  Folder not found: $Folder" -Color $Colors.Gray
            }
            continue
        }
        
        Write-Host ""
        Write-ColorOutput "📁 Processing $Folder/..." -Color $Colors.Cyan
        
        $TargetSubfolder = Join-Path $TargetCommands $Folder
        if (-not $DryRun -and -not (Test-Path $TargetSubfolder)) {
            New-Item -ItemType Directory -Path $TargetSubfolder -Force | Out-Null
        }
        
        # Process command files (skip .mdc rules, README, and JSON files)
        Get-ChildItem -Path $FolderPath -File | Where-Object {
            $_.Extension -ne ".mdc" -and $_.Name -ne "README.md" -and $_.Extension -ne ".json"
        } | ForEach-Object {
            $TargetFilename = if ($_.Extension -eq "") { "$($_.Name).md" } else { $_.Name }
            Copy-FileWithComparison -Source $_.FullName -Target (Join-Path $TargetSubfolder $TargetFilename) -DisplayName "$Folder/$($_.Name)"
        }
    }
}

# ══════════════════════════════════════════════════════════════════
# Summary
# ══════════════════════════════════════════════════════════════════

Write-Host ""
Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Color $Colors.Magenta
Write-ColorOutput "📊 Installation Summary" -Color $Colors.Magenta
Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Color $Colors.Magenta
Write-ColorOutput "   Added:   $script:Added files" -Color $Colors.Green
Write-ColorOutput "   Updated: $script:Updated files" -Color $Colors.Cyan
Write-ColorOutput "   Skipped: $script:Skipped files" -Color $Colors.Gray
Write-ColorOutput "   Backed:  $script:Backed files" -Color $Colors.Yellow

if ($DryRun) {
    Write-Host ""
    Write-ColorOutput "⚠️  DRY RUN - No files were actually modified" -Color $Colors.Yellow
    Write-ColorOutput "   Run without -DryRun to apply changes" -Color $Colors.Yellow
}

Write-Host ""
Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Color $Colors.Magenta

# Next steps
if (-not $DryRun) {
    Write-Host ""
    Write-ColorOutput "🎯 Next Steps:" -Color $Colors.Cyan
    Write-Host "   1. Start OpenCode in any project: " -NoNewline
    Write-ColorOutput "opencode" -Color $Colors.Green
    Write-Host "   2. Use SSS commands: " -NoNewline
    Write-ColorOutput "/step-1-ideation" -Color $Colors.Green
    Write-Host "   3. Use SSS agents: " -NoNewline
    Write-ColorOutput "@sigma" -Color $Colors.Green
    Write-Host " or " -NoNewline
    Write-ColorOutput "@sss-researcher" -Color $Colors.Green
    Write-Host "   4. List available commands: " -NoNewline
    Write-ColorOutput "/help" -Color $Colors.Green
    Write-Host ""
    Write-ColorOutput "📂 Installed to:" -Color $Colors.Cyan
    Write-Host "   Skills:   $TargetSkills"
    Write-Host "   Agents:   $TargetAgents"
    Write-Host "   Commands: $TargetCommands"
}

Write-Host ""
Write-ColorOutput "✅ OpenCode configuration installation complete!" -Color $Colors.Green
Write-Host ""





