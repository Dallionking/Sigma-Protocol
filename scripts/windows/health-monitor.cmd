@echo off
REM =============================================================================
REM Sigma Health Monitor - Windows Wrapper
REM =============================================================================
REM Monitors orchestration stream health and auto-recovers crashed agents.
REM
REM Usage:
REM   health-monitor.cmd --workspace=C:\path\to\project
REM   health-monitor.cmd --watch
REM
REM Requirements:
REM   - WSL (Windows Subsystem for Linux) OR Git Bash
REM =============================================================================

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "BASH_SCRIPT=%SCRIPT_DIR%..\orchestrator\health-monitor.sh"
set "ALL_ARGS=%*"

REM Check for WSL first
where wsl >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Running health monitor via WSL...

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
    echo [INFO] Running health monitor via Git Bash...
    bash "%BASH_SCRIPT%" %ALL_ARGS%
    goto :end
)

REM Fallback: Use Node.js CLI
echo.
echo [INFO] Using Node.js health monitor (bash not available)...
echo.

REM Parse workspace from arguments
set "WORKSPACE=%CD%"
for %%A in (%ALL_ARGS%) do (
    echo %%A | findstr /C:"--workspace=" >nul
    if not errorlevel 1 (
        for /f "tokens=2 delims==" %%B in ("%%A") do set "WORKSPACE=%%B"
    )
)

REM Check for --watch flag
echo %ALL_ARGS% | findstr /C:"--watch" >nul
if not errorlevel 1 (
    echo Running continuous health monitor...
    sigma health --watch --target="%WORKSPACE%"
) else (
    echo Checking health status...
    sigma health --target="%WORKSPACE%"
)

:end
endlocal
