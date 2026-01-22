#!/usr/bin/env python3
"""
orchestrator.py - Sigma Protocol Multi-Agent Orchestrator
==========================================================

Core Python logic for coordinating multiple Claude Code streams.
This module provides the orchestration backend that can be used
standalone or integrated with the @orchestrate command.

Usage:
    python orchestrator.py --project-root=/path/to/project --streams=4
    python orchestrator.py --status
    python orchestrator.py --approve=A

Features:
    - Load/save orchestration state
    - Message queue management (simulated mcp_agent_mail)
    - Stream status tracking
    - PRD assignment logic
    - Progress reporting
    - Voice notification integration

Requirements:
    pip install watchdog  # For file watching (optional)
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


class StreamStatus(Enum):
    """Status of a stream worker."""
    IDLE = "idle"
    WORKING = "working"
    AWAITING_VERIFICATION = "awaiting_verification"
    PRD_COMPLETE = "prd_complete"
    BLOCKED = "blocked"
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
class Stream:
    """Represents a stream worker."""
    name: str
    worktree: str
    prds: List[str]
    current_prd: Optional[str] = None
    current_story: Optional[str] = None
    status: StreamStatus = StreamStatus.IDLE
    stories_completed: List[str] = field(default_factory=list)
    prds_completed: List[str] = field(default_factory=list)
    last_activity: Optional[str] = None
    blocked_on: Optional[str] = None


@dataclass
class OrchestratorState:
    """Complete orchestrator state."""
    started: str
    project_root: str
    session_name: str
    streams: Dict[str, Stream]
    completed_prds: List[str] = field(default_factory=list)
    current_phase: str = "initializing"
    mode: str = "semi-auto"
    message_queue: List[Message] = field(default_factory=list)


class Orchestrator:
    """
    Main orchestrator class that coordinates multiple Claude Code streams.
    """
    
    def __init__(self, project_root: str, mode: str = "semi-auto"):
        self.project_root = Path(project_root).resolve()
        self.mode = mode
        self.config_dir = self.project_root / ".sigma" / "orchestration"
        self.state_file = self.config_dir / "state.json"
        self.inbox_dir = self.config_dir / "inbox"
        self.outbox_dir = self.config_dir / "outbox"
        
        # Ensure directories exist
        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.inbox_dir.mkdir(exist_ok=True)
        self.outbox_dir.mkdir(exist_ok=True)
        
        # Load or initialize state
        self.state = self._load_state()
    
    def _load_state(self) -> OrchestratorState:
        """Load state from file or create new."""
        if self.state_file.exists():
            try:
                with open(self.state_file) as f:
                    data = json.load(f)
                
                # Reconstruct streams
                streams = {}
                for name, stream_data in data.get("streams", {}).items():
                    stream_data["status"] = StreamStatus(stream_data.get("status", "idle"))
                    streams[name] = Stream(**stream_data)
                
                # Reconstruct messages
                messages = []
                for msg_data in data.get("message_queue", []):
                    msg_data["msg_type"] = MessageType(msg_data.get("msg_type", "status_update"))
                    messages.append(Message(**msg_data))
                
                return OrchestratorState(
                    started=data.get("started", datetime.utcnow().isoformat()),
                    project_root=str(self.project_root),
                    session_name=data.get("session_name", "sigma-orchestration"),
                    streams=streams,
                    completed_prds=data.get("completed_prds", []),
                    current_phase=data.get("current_phase", "initializing"),
                    mode=data.get("mode", self.mode),
                    message_queue=messages,
                )
            except Exception as e:
                print(f"Warning: Could not load state: {e}")
        
        # Create new state
        return OrchestratorState(
            started=datetime.utcnow().isoformat(),
            project_root=str(self.project_root),
            session_name="sigma-orchestration",
            streams={},
            mode=self.mode,
        )
    
    def _save_state(self) -> None:
        """Save state to file."""
        # Convert to serializable format
        data = {
            "started": self.state.started,
            "project_root": self.state.project_root,
            "session_name": self.state.session_name,
            "streams": {
                name: {
                    **asdict(stream),
                    "status": stream.status.value,
                }
                for name, stream in self.state.streams.items()
            },
            "completed_prds": self.state.completed_prds,
            "current_phase": self.state.current_phase,
            "mode": self.state.mode,
            "message_queue": [
                {
                    **asdict(msg),
                    "msg_type": msg.msg_type.value,
                }
                for msg in self.state.message_queue
            ],
        }
        
        with open(self.state_file, "w") as f:
            json.dump(data, f, indent=2)
    
    def load_streams_config(self) -> None:
        """Load streams configuration from streams.json."""
        config_file = self.config_dir / "streams.json"
        
        if not config_file.exists():
            raise FileNotFoundError(
                f"No streams configuration found at {config_file}\n"
                "Run spawn-streams.sh first to create the orchestration environment."
            )
        
        with open(config_file) as f:
            config = json.load(f)
        
        for stream_config in config.get("streams", []):
            name = stream_config["name"]
            self.state.streams[f"stream-{name.lower()}"] = Stream(
                name=name,
                worktree=stream_config["worktree"],
                prds=stream_config.get("prds", []),
            )
        
        self._save_state()
        print(f"Loaded {len(self.state.streams)} streams from config")
    
    def send_message(self, msg: Message) -> None:
        """Send a message to an agent (write to their inbox)."""
        # For file-based messaging
        inbox_file = self.inbox_dir / f"{msg.to_agent}.json"
        
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
        """Check for incoming messages."""
        inbox_file = self.inbox_dir / "orchestrator.json"
        
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
    
    def assign_prd(self, stream_name: str, prd_id: str) -> None:
        """Assign a PRD to a stream."""
        stream = self.state.streams.get(stream_name)
        if not stream:
            print(f"Error: Stream {stream_name} not found")
            return
        
        stream.current_prd = prd_id
        stream.status = StreamStatus.WORKING
        stream.last_activity = datetime.utcnow().isoformat()
        
        self.send_message(Message(
            from_agent="orchestrator",
            to_agent=stream_name,
            msg_type=MessageType.PRD_ASSIGNMENT,
            payload={
                "prd": prd_id,
                "worktree": stream.worktree,
            }
        ))
        
        self._save_state()
        print(f"✅ Assigned {prd_id} to {stream_name.upper()}")
    
    def handle_story_complete(self, msg: Message) -> None:
        """Handle story completion from a stream."""
        stream_name = msg.from_agent
        stream = self.state.streams.get(stream_name)
        
        if not stream:
            print(f"Warning: Unknown stream {stream_name}")
            return
        
        story_id = msg.payload.get("story_id")
        prd = msg.payload.get("prd")
        
        print(f"\n📬 {stream_name.upper()}: Story complete - {story_id}")
        
        stream.stories_completed.append(story_id)
        stream.last_activity = datetime.utcnow().isoformat()
        
        # In semi-auto mode, automatically continue
        if self.mode in ["semi-auto", "full-auto"]:
            self.send_message(Message(
                from_agent="orchestrator",
                to_agent=stream_name,
                msg_type=MessageType.CONTINUE,
                payload={"message": "Story verified. Proceed to next."}
            ))
        
        self._save_state()
    
    def handle_prd_complete(self, msg: Message) -> None:
        """Handle PRD completion from a stream."""
        stream_name = msg.from_agent
        stream = self.state.streams.get(stream_name)
        
        if not stream:
            print(f"Warning: Unknown stream {stream_name}")
            return
        
        prd = msg.payload.get("prd")
        
        print(f"\n🎉 {stream_name.upper()}: PRD COMPLETE - {prd}")
        
        stream.prds_completed.append(prd)
        stream.current_prd = None
        stream.status = StreamStatus.PRD_COMPLETE
        stream.last_activity = datetime.utcnow().isoformat()
        
        self.state.completed_prds.append(prd)
        
        # Voice notification
        self.voice_notify(f"Sigma! Stream {stream.name} completed {prd}. Ready for testing.")
        
        # In full-auto mode, assign next PRD
        if self.mode == "full-auto":
            self._assign_next_prd(stream_name)
        else:
            print(f"\n⏸️  Waiting for approval. Say 'approve {stream.name}' to continue.")
        
        self._save_state()
    
    def handle_blocked(self, msg: Message) -> None:
        """Handle blocked status from a stream."""
        stream_name = msg.from_agent
        stream = self.state.streams.get(stream_name)
        
        if not stream:
            return
        
        blocked_on = msg.payload.get("blockedOn")
        
        print(f"\n⚠️ {stream_name.upper()} BLOCKED on {blocked_on}")
        
        stream.status = StreamStatus.BLOCKED
        stream.blocked_on = blocked_on
        stream.last_activity = datetime.utcnow().isoformat()
        
        self.voice_notify(f"Stream {stream.name} is blocked, waiting for {blocked_on}")
        
        self._save_state()
    
    def approve_stream(self, stream_name: str) -> None:
        """Approve a stream's PRD completion and assign next."""
        full_name = f"stream-{stream_name.lower()}"
        stream = self.state.streams.get(full_name)
        
        if not stream:
            print(f"Error: Stream {stream_name} not found")
            return
        
        if stream.status != StreamStatus.PRD_COMPLETE:
            print(f"Stream {stream_name} is not awaiting approval (status: {stream.status.value})")
            return
        
        print(f"✅ Approval received for Stream {stream_name.upper()}")
        
        self._assign_next_prd(full_name)
    
    def _assign_next_prd(self, stream_name: str) -> None:
        """Find and assign the next PRD for a stream."""
        stream = self.state.streams.get(stream_name)
        if not stream:
            return
        
        # Find next unassigned PRD
        completed = set(self.state.completed_prds)
        next_prd = None
        
        for prd in stream.prds:
            if prd not in completed:
                next_prd = prd
                break
        
        if next_prd:
            self.assign_prd(stream_name, next_prd)
        else:
            stream.status = StreamStatus.DONE
            print(f"✅ Stream {stream.name} has completed all assigned PRDs")
            self._save_state()
            
            # Check if all streams done
            if self._all_streams_complete():
                self.handle_all_complete()
    
    def _all_streams_complete(self) -> bool:
        """Check if all streams have completed their work."""
        for stream in self.state.streams.values():
            if stream.status not in [StreamStatus.DONE, StreamStatus.IDLE]:
                # Check if stream has remaining PRDs
                completed = set(self.state.completed_prds)
                remaining = [p for p in stream.prds if p not in completed]
                if remaining:
                    return False
        return True
    
    def handle_all_complete(self) -> None:
        """Handle completion of all streams."""
        self.state.current_phase = "complete"
        self._save_state()
        
        print(f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 ALL STREAMS COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Completed PRDs:
{chr(10).join(f'  ✅ {p}' for p in self.state.completed_prds)}

Ready for merge sequence.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        """)
        
        self.voice_notify("All streams complete. Ready for final merge.")
    
    def voice_notify(self, message: str) -> None:
        """Send voice notification."""
        notify_script = self.project_root / "scripts" / "notify" / "voice.py"
        
        if notify_script.exists():
            try:
                subprocess.run(
                    [sys.executable, str(notify_script), message],
                    capture_output=True,
                    timeout=30,
                )
            except Exception as e:
                print(f"Voice notification failed: {e}")
        else:
            # Fallback to macOS say
            if sys.platform == "darwin":
                subprocess.run(["say", message], capture_output=True)
    
    def print_status(self) -> None:
        """Print current orchestration status."""
        print(f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 ORCHESTRATOR STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase: {self.state.current_phase}
Mode: {self.state.mode}
Started: {self.state.started}
PRDs Completed: {len(self.state.completed_prds)}

Streams:
""")
        
        for name, stream in self.state.streams.items():
            status_icon = {
                StreamStatus.IDLE: "⬜",
                StreamStatus.WORKING: "🔄",
                StreamStatus.AWAITING_VERIFICATION: "⏳",
                StreamStatus.PRD_COMPLETE: "✅",
                StreamStatus.BLOCKED: "⚠️",
                StreamStatus.DONE: "🏁",
                StreamStatus.ERROR: "❌",
            }.get(stream.status, "❓")
            
            current = stream.current_prd or "None"
            completed = len(stream.prds_completed)
            total = len(stream.prds)
            
            print(f"  {status_icon} {stream.name}: {stream.status.value}")
            print(f"     Current: {current} | Completed: {completed}/{total}")
        
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    def run_monitor_loop(self) -> None:
        """Main monitoring loop."""
        print("\n🔄 Starting orchestrator monitor loop...\n")
        
        while True:
            try:
                # Check for incoming messages
                messages = self.check_inbox()
                
                for msg in messages:
                    if msg.msg_type == MessageType.REGISTER:
                        print(f"📡 Stream registered: {msg.from_agent}")
                    elif msg.msg_type == MessageType.STORY_COMPLETE:
                        self.handle_story_complete(msg)
                    elif msg.msg_type == MessageType.PRD_COMPLETE:
                        self.handle_prd_complete(msg)
                    elif msg.msg_type == MessageType.BLOCKED:
                        self.handle_blocked(msg)
                    elif msg.msg_type == MessageType.ERROR:
                        print(f"❌ Error from {msg.from_agent}: {msg.payload.get('error')}")
                
                # Check if all complete
                if self._all_streams_complete():
                    self.handle_all_complete()
                    break
                
                time.sleep(2)
                
            except KeyboardInterrupt:
                print("\n\nOrchestrator interrupted. State saved.")
                self._save_state()
                break


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Sigma Protocol Orchestrator")
    parser.add_argument("--project-root", default=".", help="Project root directory")
    parser.add_argument("--mode", choices=["full-auto", "semi-auto", "manual"], 
                        default="semi-auto", help="Orchestration mode")
    parser.add_argument("--status", action="store_true", help="Show status and exit")
    parser.add_argument("--approve", metavar="STREAM", help="Approve stream (A, B, C, D)")
    parser.add_argument("--init", action="store_true", help="Initialize from streams.json")
    
    args = parser.parse_args()
    
    orchestrator = Orchestrator(args.project_root, args.mode)
    
    if args.status:
        orchestrator.print_status()
    elif args.approve:
        orchestrator.approve_stream(args.approve)
    elif args.init:
        orchestrator.load_streams_config()
        orchestrator.print_status()
    else:
        orchestrator.load_streams_config()
        orchestrator.run_monitor_loop()


if __name__ == "__main__":
    main()

