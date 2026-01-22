#!/usr/bin/env python3
"""
stream-worker.py - Sigma Protocol Stream Worker
================================================

Worker script for executing PRDs in a multi-agent orchestration system.
This module provides the stream worker backend that can be used
standalone or integrated with the @stream command.

Usage:
    python stream-worker.py --name=A
    python stream-worker.py --name=B --project-root=/path/to/project
    python stream-worker.py --status

Features:
    - Register with orchestrator
    - Receive PRD assignments
    - Report story/PRD completion
    - Handle blocking dependencies
    - Execute Ralph loop methodology

Requirements:
    Standard library only (no external dependencies)
"""

import json
import os
import sys
import time
import argparse
import subprocess
from pathlib import Path
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime


class WorkerStatus(Enum):
    """Status of the stream worker."""
    IDLE = "idle"
    REGISTERED = "registered"
    WAITING = "waiting_assignment"
    WORKING = "working"
    BLOCKED = "blocked"
    PAUSED = "paused"
    DONE = "done"
    ERROR = "error"


class MessageType(Enum):
    """Types of inter-agent messages."""
    REGISTER = "register"
    PRD_ASSIGNMENT = "prd_assignment"
    STORY_COMPLETE = "story_complete"
    PRD_COMPLETE = "prd_complete"
    CONTINUE = "continue"
    REVISION_NEEDED = "revision_needed"
    BLOCKED = "blocked"
    UNBLOCK = "unblock"
    ERROR = "error"
    STATUS_UPDATE = "status_update"
    PAUSE = "pause"
    RESUME = "resume"


@dataclass
class Message:
    """Inter-agent message."""
    from_agent: str
    to_agent: str
    msg_type: MessageType
    payload: Dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    id: str = field(default_factory=lambda: f"msg-{int(time.time() * 1000)}")


@dataclass
class Story:
    """Represents a story from a PRD."""
    id: str
    title: str
    acceptance_criteria: List[str]
    status: str = "pending"
    dependencies: List[str] = field(default_factory=list)


@dataclass
class WorkerState:
    """Stream worker state."""
    name: str
    worktree: str
    status: WorkerStatus = WorkerStatus.IDLE
    current_prd: Optional[str] = None
    current_story: Optional[str] = None
    stories_completed: List[str] = field(default_factory=list)
    prds_completed: List[str] = field(default_factory=list)
    last_commit: Optional[str] = None
    registered: bool = False


class StreamWorker:
    """
    Stream worker that executes PRDs and reports to orchestrator.
    """
    
    def __init__(self, name: str, project_root: Optional[str] = None):
        self.name = name.upper()
        self.agent_id = f"stream-{name.lower()}"
        
        # Determine project root
        if project_root:
            self.project_root = Path(project_root).resolve()
        else:
            self.project_root = Path(os.environ.get("SIGMA_PROJECT_ROOT", ".")).resolve()
        
        self.worktree = Path.cwd()
        self.config_dir = self.project_root / ".sigma" / "orchestration"
        self.inbox_dir = self.config_dir / "inbox"
        self.outbox_dir = self.config_dir / "outbox"
        
        # State
        self.state = WorkerState(
            name=self.name,
            worktree=str(self.worktree),
        )
    
    def send_message(self, msg: Message) -> None:
        """Send a message to the orchestrator."""
        # File-based messaging
        inbox_file = self.inbox_dir / f"{msg.to_agent}.json"
        
        # Ensure directory exists
        self.inbox_dir.mkdir(parents=True, exist_ok=True)
        
        # Load existing messages
        messages = []
        if inbox_file.exists():
            with open(inbox_file) as f:
                messages = json.load(f)
        
        # Add new message
        messages.append({
            **asdict(msg),
            "msg_type": msg.msg_type.value,
        })
        
        # Save
        with open(inbox_file, "w") as f:
            json.dump(messages, f, indent=2)
        
        print(f"📤 Sent {msg.msg_type.value} to {msg.to_agent}")
    
    def check_inbox(self) -> List[Message]:
        """Check for messages from orchestrator."""
        inbox_file = self.inbox_dir / f"{self.agent_id}.json"
        
        if not inbox_file.exists():
            return []
        
        with open(inbox_file) as f:
            messages = json.load(f)
        
        # Clear inbox after reading
        inbox_file.unlink()
        
        # Convert to Message objects
        result = []
        for msg_data in messages:
            msg_data["msg_type"] = MessageType(msg_data.get("msg_type", "status_update"))
            result.append(Message(**msg_data))
        
        return result
    
    def register(self) -> None:
        """Register with the orchestrator."""
        print(f"\n📡 Registering as Stream {self.name}...\n")
        
        self.send_message(Message(
            from_agent=self.agent_id,
            to_agent="orchestrator",
            msg_type=MessageType.REGISTER,
            payload={
                "name": self.name,
                "worktree": str(self.worktree),
                "capabilities": ["implement", "test", "verify"],
                "status": "ready",
            }
        ))
        
        self.state.status = WorkerStatus.REGISTERED
        self.state.registered = True
        
        print(f"✅ Registered as Stream {self.name}")
        print("Waiting for PRD assignment...\n")
    
    def wait_for_assignment(self) -> Optional[Dict[str, Any]]:
        """Wait for PRD assignment from orchestrator."""
        self.state.status = WorkerStatus.WAITING
        
        print("📬 Checking inbox for assignments...")
        
        while True:
            messages = self.check_inbox()
            
            for msg in messages:
                if msg.msg_type == MessageType.PRD_ASSIGNMENT:
                    prd = msg.payload.get("prd")
                    
                    print(f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PRD ASSIGNMENT RECEIVED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRD: {prd}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    """)
                    
                    self.state.current_prd = prd
                    self.state.status = WorkerStatus.WORKING
                    
                    return msg.payload
            
            time.sleep(2)
    
    def report_story_complete(self, story_id: str, story_title: str) -> None:
        """Report story completion to orchestrator."""
        print(f"\n📤 Reporting story completion: {story_id}\n")
        
        # Get last commit
        try:
            result = subprocess.run(
                ["git", "rev-parse", "--short", "HEAD"],
                capture_output=True, text=True
            )
            commit = result.stdout.strip()
        except:
            commit = None
        
        self.send_message(Message(
            from_agent=self.agent_id,
            to_agent="orchestrator",
            msg_type=MessageType.STORY_COMPLETE,
            payload={
                "prd": self.state.current_prd,
                "story_id": story_id,
                "story_title": story_title,
                "status": "done",
                "commit": commit,
            }
        ))
        
        self.state.stories_completed.append(story_id)
        self.state.last_commit = commit
    
    def report_prd_complete(self) -> None:
        """Report PRD completion to orchestrator."""
        prd = self.state.current_prd
        
        print(f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 PRD COMPLETE: {prd}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All stories implemented.
Reporting to orchestrator...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        """)
        
        # Get branch and commit
        try:
            branch_result = subprocess.run(
                ["git", "branch", "--show-current"],
                capture_output=True, text=True
            )
            branch = branch_result.stdout.strip()
            
            commit_result = subprocess.run(
                ["git", "rev-parse", "--short", "HEAD"],
                capture_output=True, text=True
            )
            commit = commit_result.stdout.strip()
        except:
            branch = None
            commit = None
        
        self.send_message(Message(
            from_agent=self.agent_id,
            to_agent="orchestrator",
            msg_type=MessageType.PRD_COMPLETE,
            payload={
                "prd": prd,
                "stories_completed": len(self.state.stories_completed),
                "branch": branch,
                "commit": commit,
            }
        ))
        
        self.state.prds_completed.append(prd)
        self.state.current_prd = None
        self.state.stories_completed = []
        
        print("\n⏸️ Waiting for orchestrator approval...\n")
    
    def report_blocked(self, blocked_on: str, reason: str) -> None:
        """Report blocked status to orchestrator."""
        print(f"\n⚠️ BLOCKED on {blocked_on}: {reason}\n")
        
        self.send_message(Message(
            from_agent=self.agent_id,
            to_agent="orchestrator",
            msg_type=MessageType.BLOCKED,
            payload={
                "story_id": self.state.current_story,
                "blockedOn": blocked_on,
                "reason": reason,
            }
        ))
        
        self.state.status = WorkerStatus.BLOCKED
    
    def report_error(self, error: str) -> None:
        """Report error to orchestrator."""
        print(f"\n❌ ERROR: {error}\n")
        
        self.send_message(Message(
            from_agent=self.agent_id,
            to_agent="orchestrator",
            msg_type=MessageType.ERROR,
            payload={
                "error": error,
                "story": self.state.current_story,
                "prd": self.state.current_prd,
            }
        ))
        
        self.state.status = WorkerStatus.ERROR
    
    def wait_for_verification(self) -> bool:
        """Wait for verification from orchestrator."""
        print("Waiting for verification...")
        
        while True:
            messages = self.check_inbox()
            
            for msg in messages:
                if msg.msg_type == MessageType.CONTINUE:
                    print("✅ Verified by orchestrator")
                    return True
                elif msg.msg_type == MessageType.REVISION_NEEDED:
                    print(f"⚠️ Revision needed:")
                    for issue in msg.payload.get("issues", []):
                        print(f"  - {issue}")
                    return False
                elif msg.msg_type == MessageType.PAUSE:
                    print("⏸️ Paused by orchestrator")
                    self.state.status = WorkerStatus.PAUSED
                    self._wait_for_resume()
            
            time.sleep(2)
    
    def _wait_for_resume(self) -> None:
        """Wait for resume command."""
        while True:
            messages = self.check_inbox()
            
            for msg in messages:
                if msg.msg_type == MessageType.RESUME:
                    print("▶️ Resumed")
                    self.state.status = WorkerStatus.WORKING
                    return
            
            time.sleep(2)
    
    def print_status(self) -> None:
        """Print current worker status."""
        print(f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐝 STREAM {self.name} STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: {self.state.status.value}
Registered: {self.state.registered}
Current PRD: {self.state.current_prd or 'None'}
Current Story: {self.state.current_story or 'None'}
Stories Completed: {len(self.state.stories_completed)}
PRDs Completed: {len(self.state.prds_completed)}
Worktree: {self.state.worktree}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        """)
    
    def run(self) -> None:
        """Main execution loop."""
        print(f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐝 SIGMA STREAM {self.name} — WORKER STARTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Worktree: {self.worktree}
Project Root: {self.project_root}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        """)
        
        # Register with orchestrator
        self.register()
        
        # Main loop
        while True:
            try:
                # Wait for assignment
                assignment = self.wait_for_assignment()
                
                if not assignment:
                    time.sleep(2)
                    continue
                
                # Print assignment received
                print(f"\n🚀 Starting PRD: {self.state.current_prd}\n")
                print("Use @implement-prd or implement stories manually.")
                print("After each story, run: worker.report_story_complete(story_id, title)")
                print("When PRD is done, run: worker.report_prd_complete()")
                
                # In a real integration, this would trigger @implement-prd
                # For now, we wait for manual interaction
                
                # Wait for next assignment or completion signal
                while self.state.current_prd:
                    messages = self.check_inbox()
                    
                    for msg in messages:
                        if msg.msg_type == MessageType.PRD_ASSIGNMENT:
                            # New assignment
                            print(f"\n📋 New PRD assigned: {msg.payload.get('prd')}")
                            self.state.current_prd = msg.payload.get("prd")
                            self.state.stories_completed = []
                        elif msg.msg_type == MessageType.PAUSE:
                            print("\n⏸️ Paused by orchestrator")
                            self.state.status = WorkerStatus.PAUSED
                        elif msg.msg_type == MessageType.RESUME:
                            print("\n▶️ Resumed")
                            self.state.status = WorkerStatus.WORKING
                    
                    time.sleep(2)
                
            except KeyboardInterrupt:
                print("\n\nStream worker interrupted.")
                break
            except Exception as e:
                self.report_error(str(e))
                time.sleep(5)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Sigma Protocol Stream Worker")
    parser.add_argument("--name", required=True, help="Stream name (A, B, C, D)")
    parser.add_argument("--project-root", help="Project root directory")
    parser.add_argument("--status", action="store_true", help="Show status and exit")
    parser.add_argument("--register-only", action="store_true", help="Just register and exit")
    
    args = parser.parse_args()
    
    # Validate name
    if not args.name or args.name.upper() not in "ABCDEFGH":
        print("Error: --name must be a single letter A-H")
        sys.exit(1)
    
    worker = StreamWorker(args.name, args.project_root)
    
    if args.status:
        worker.print_status()
    elif args.register_only:
        worker.register()
    else:
        worker.run()


if __name__ == "__main__":
    main()

