@echo off
REM =============================================================================
REM Sigma Stream Merger - Windows Wrapper
REM =============================================================================
REM Merges completed stream worktrees back to the main branch.
REM
REM Usage:
REM   merge-streams.cmd --workspace=C:\path\to\project
REM   merge-streams.cmd --dry-run
REM   merge-streams.cmd --status
REM
REM Requirements:
REM   - Git for Windows
REM   - WSL OR Git Bash (for full script, or use Node.js fallback)
REM =============================================================================

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "BASH_SCRIPT=%SCRIPT_DIR%..\orchestrator\merge-streams.sh"
set "ALL_ARGS=%*"

REM Check for WSL first
where wsl >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Running merge via WSL...

    set "BASH_SCRIPT_UNIX=%BASH_SCRIPT:\=/%"
    set "BASH_SCRIPT_UNIX=!BASH_SCRIPT_UNIX:C:=/mnt/c!"
    set "BASH_SCRIPT_UNIX=!BASH_SCRIPT_UNIX:D:=/mnt/d!"

    set "CONVERTED_ARGS="
    for %%A in (%ALL_ARGS%) do (
        set "ARG=%%A"
        set "ARG=!ARG:\=/!"
        set "ARG=!ARG:C:=/mnt/c!"
        set "ARG=!ARG:D:=/mnt/d!"
        set "CONVERTED_ARGS=!CONVERTED_ARGS! !ARG!"
    )

    wsl bash "!BASH_SCRIPT_UNIX!" !CONVERTED_ARGS!
    goto :end
)

REM Check for Git Bash
where bash >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Running merge via Git Bash...
    bash "%BASH_SCRIPT%" %ALL_ARGS%
    goto :end
)

REM Fallback: Use Node.js CLI
echo.
echo [INFO] Using Node.js merge command (bash not available)...
echo.

REM Parse workspace from arguments
set "WORKSPACE=%CD%"
for %%A in (%ALL_ARGS%) do (
    echo %%A | findstr /C:"--workspace=" >nul
    if not errorlevel 1 (
        for /f "tokens=2 delims==" %%B in ("%%A") do set "WORKSPACE=%%B"
    )
)

REM Build sigma merge command with appropriate flags
set "MERGE_CMD=sigma merge --target="%WORKSPACE%""

echo %ALL_ARGS% | findstr /C:"--dry-run" >nul
if not errorlevel 1 set "MERGE_CMD=!MERGE_CMD! --dry-run"

echo %ALL_ARGS% | findstr /C:"--status" >nul
if not errorlevel 1 set "MERGE_CMD=!MERGE_CMD! --status"

echo %ALL_ARGS% | findstr /C:"--continue" >nul
if not errorlevel 1 set "MERGE_CMD=!MERGE_CMD! --continue"

echo %ALL_ARGS% | findstr /C:"--abort" >nul
if not errorlevel 1 set "MERGE_CMD=!MERGE_CMD! --abort"

echo Running: !MERGE_CMD!
!MERGE_CMD!

:end
endlocal
