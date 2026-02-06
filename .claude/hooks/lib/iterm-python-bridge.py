#!/usr/bin/env python3
"""iterm-python-bridge.py — Python API bridge for iTerm2 automation.

Provides subcommands that map 1:1 to the bash helper functions in
iterm-applescript-helpers.sh. Called by the bash helpers when the
Python API is available; falls back to AppleScript when it isn't.

Usage:
    python3 iterm-python-bridge.py is-running
    python3 iterm-python-bridge.py create-window "Team: my-team"
    python3 iterm-python-bridge.py split-session "Team: my-team" 1 vertically "Pane-2"
    python3 iterm-python-bridge.py split-pane "Team: my-team" vertically "Pane-2"
    python3 iterm-python-bridge.py write-to-session "Team: my-team" 1 "echo hello"
    python3 iterm-python-bridge.py session-count "Team: my-team"
"""

import argparse
import sys

import iterm2


async def find_window_by_name(app, name):
    """Find a terminal window by its user-set title (titleOverride).

    In iTerm2's Python API, async_set_title() sets the 'titleOverride'
    variable. We match on that rather than 'title' (which is the
    computed display title and may include profile/job info).
    """
    for window in app.terminal_windows:
        title = await window.async_get_variable("titleOverride")
        if title == name:
            return window
    return None


async def cmd_is_running(connection, args):
    """Check if iTerm2 is reachable via the Python API."""
    # If we got a connection, iTerm2 is running and Python API works.
    await iterm2.async_get_app(connection)
    # Exit 0 = running (handled by normal return)


async def cmd_create_window(connection, args):
    """Create a new window, set its title, and label the first session."""
    app = await iterm2.async_get_app(connection)
    window = await iterm2.Window.async_create(connection)
    if window is None:
        print("Failed to create window", file=sys.stderr)
        sys.exit(1)

    await window.async_set_title(args.title)

    # Label the first session as "Leader"
    tab = window.current_tab
    if tab and tab.current_session:
        await tab.current_session.async_set_name("Leader")

    # Output the window title as the handle (matches bash convention)
    print(args.title)


async def cmd_split_pane(connection, args):
    """Split the current session in a named window."""
    app = await iterm2.async_get_app(connection)
    window = await find_window_by_name(app, args.window_name)
    if window is None:
        print(f"Window not found: {args.window_name}", file=sys.stderr)
        sys.exit(1)

    tab = window.current_tab
    session = tab.current_session
    vertical = args.direction == "vertically"
    new_session = await session.async_split_pane(vertical=vertical)
    await new_session.async_set_name(args.pane_name)


async def cmd_split_session(connection, args):
    """Split a specific session (by 1-based index) in a named window."""
    app = await iterm2.async_get_app(connection)
    window = await find_window_by_name(app, args.window_name)
    if window is None:
        print(f"Window not found: {args.window_name}", file=sys.stderr)
        sys.exit(1)

    tab = window.current_tab
    sessions = tab.sessions
    # Convert 1-based (bash convention) to 0-based (Python)
    idx = args.session_idx - 1
    if idx < 0 or idx >= len(sessions):
        print(f"Session index {args.session_idx} out of range (1-{len(sessions)})", file=sys.stderr)
        sys.exit(1)

    session = sessions[idx]
    vertical = args.direction == "vertically"
    new_session = await session.async_split_pane(vertical=vertical)
    await new_session.async_set_name(args.pane_name)


async def cmd_write_to_session(connection, args):
    """Write text to a specific session (by 1-based index)."""
    app = await iterm2.async_get_app(connection)
    window = await find_window_by_name(app, args.window_name)
    if window is None:
        print(f"Window not found: {args.window_name}", file=sys.stderr)
        sys.exit(1)

    tab = window.current_tab
    sessions = tab.sessions
    idx = args.session_idx - 1
    if idx < 0 or idx >= len(sessions):
        print(f"Session index {args.session_idx} out of range (1-{len(sessions)})", file=sys.stderr)
        sys.exit(1)

    session = sessions[idx]
    await session.async_send_text(args.text + "\n")


async def cmd_session_count(connection, args):
    """Count sessions in the current tab of a named window."""
    app = await iterm2.async_get_app(connection)
    window = await find_window_by_name(app, args.window_name)
    if window is None:
        print(f"Window not found: {args.window_name}", file=sys.stderr)
        sys.exit(1)

    tab = window.current_tab
    print(len(tab.sessions))


# Dispatch table mapping subcommand names to async handlers
COMMANDS = {
    "is-running": cmd_is_running,
    "create-window": cmd_create_window,
    "split-pane": cmd_split_pane,
    "split-session": cmd_split_session,
    "write-to-session": cmd_write_to_session,
    "session-count": cmd_session_count,
}


def build_parser():
    parser = argparse.ArgumentParser(
        description="iTerm2 Python API bridge for Sigma Protocol team launcher"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # is-running
    subparsers.add_parser("is-running", help="Check if iTerm2 Python API is reachable")

    # create-window <title>
    p = subparsers.add_parser("create-window", help="Create a new window with title")
    p.add_argument("title", help="Window title")

    # split-pane <window_name> <direction> <pane_name>
    p = subparsers.add_parser("split-pane", help="Split current session in a window")
    p.add_argument("window_name", help="Window title to target")
    p.add_argument("direction", choices=["vertically", "horizontally"])
    p.add_argument("pane_name", help="Label for the new session")

    # split-session <window_name> <session_idx> <direction> <pane_name>
    p = subparsers.add_parser("split-session", help="Split a specific session by index")
    p.add_argument("window_name", help="Window title to target")
    p.add_argument("session_idx", type=int, help="1-based session index")
    p.add_argument("direction", choices=["vertically", "horizontally"])
    p.add_argument("pane_name", help="Label for the new session")

    # write-to-session <window_name> <session_idx> <text>
    p = subparsers.add_parser("write-to-session", help="Write text to a session")
    p.add_argument("window_name", help="Window title to target")
    p.add_argument("session_idx", type=int, help="1-based session index")
    p.add_argument("text", help="Text to write")

    # session-count <window_name>
    p = subparsers.add_parser("session-count", help="Count sessions in a window")
    p.add_argument("window_name", help="Window title to target")

    return parser


async def main(connection, args):
    handler = COMMANDS[args.command]
    await handler(connection, args)


if __name__ == "__main__":
    parser = build_parser()
    args = parser.parse_args()

    try:
        iterm2.run_until_complete(lambda conn: main(conn, args), retry=False)
    except Exception as e:
        print(f"Python API error: {e}", file=sys.stderr)
        sys.exit(1)
