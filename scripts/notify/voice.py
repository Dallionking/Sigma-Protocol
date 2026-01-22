#!/usr/bin/env python3
"""
voice.py - Sigma Protocol Voice Notification System
===================================================

Provides text-to-speech notifications using ElevenLabs API with fallback
to system TTS (macOS 'say' command or espeak on Linux).

Usage:
    python voice.py "Your notification message"
    python voice.py "PRD complete" --voice=rachel
    python voice.py "Alert!" --priority=high

Environment Variables:
    ELEVENLABS_API_KEY: Your ElevenLabs API key (optional, uses fallback if not set)
    ELEVENLABS_VOICE_ID: Voice ID to use (default: Rachel)
    SIGMA_TTS_ENABLED: Set to 'false' to disable TTS
    SIGMA_TTS_VOLUME: Volume level 0.0-1.0 (default: 1.0)

Requirements:
    pip install requests
"""

import os
import sys
import subprocess
import tempfile
import argparse
from pathlib import Path
from typing import Optional

# Try to import requests, but make it optional
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


# ElevenLabs Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Rachel
ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"

# Voice ID mapping for common voices
VOICE_MAP = {
    "rachel": "21m00Tcm4TlvDq8ikWAM",
    "drew": "29vD33N1CtxCmqQRPOHJ",
    "clyde": "2EiwWnXFnvU5JabPnv8n",
    "paul": "5Q0t7uMcjvnagumLfvZi",
    "domi": "AZnzlk1XvdvUeBnXmlld",
    "dave": "CYw3kZ02Hs0563khs1Fj",
    "fin": "D38z5RcWu1voky8WS1ja",
    "sarah": "EXAVITQu4vr4xnSDxMaL",
    "antoni": "ErXwobaYiN019PkySvjV",
    "thomas": "GBv7mTt0atIp3Br8iCZE",
}

# Settings
TTS_ENABLED = os.getenv("SIGMA_TTS_ENABLED", "true").lower() != "false"
TTS_VOLUME = float(os.getenv("SIGMA_TTS_VOLUME", "1.0"))


def speak_elevenlabs(text: str, voice_id: str = ELEVENLABS_VOICE_ID) -> bool:
    """
    Use ElevenLabs API for high-quality TTS.
    
    Args:
        text: The text to speak
        voice_id: ElevenLabs voice ID
        
    Returns:
        True if successful, False otherwise
    """
    if not ELEVENLABS_API_KEY:
        return False
    
    if not HAS_REQUESTS:
        print("Warning: 'requests' package not installed. Run: pip install requests", file=sys.stderr)
        return False
    
    try:
        response = requests.post(
            f"{ELEVENLABS_API_URL}/{voice_id}",
            headers={
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "text": text,
                "model_id": "eleven_turbo_v2",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                }
            },
            timeout=30,
        )
        
        if response.status_code != 200:
            print(f"ElevenLabs API error: {response.status_code}", file=sys.stderr)
            return False
        
        # Save to temp file and play
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
            f.write(response.content)
            temp_path = f.name
        
        # Play audio based on platform
        play_audio(temp_path)
        
        # Cleanup
        os.unlink(temp_path)
        return True
        
    except Exception as e:
        print(f"ElevenLabs error: {e}", file=sys.stderr)
        return False


def play_audio(filepath: str) -> None:
    """Play audio file using system player."""
    if sys.platform == "darwin":
        # macOS
        subprocess.run(["afplay", filepath], check=False)
    elif sys.platform.startswith("linux"):
        # Linux - try multiple players
        players = ["mpv", "ffplay", "aplay", "paplay"]
        for player in players:
            try:
                if player == "ffplay":
                    subprocess.run([player, "-nodisp", "-autoexit", filepath], 
                                   check=True, capture_output=True)
                elif player == "mpv":
                    subprocess.run([player, "--no-video", filepath], 
                                   check=True, capture_output=True)
                else:
                    subprocess.run([player, filepath], check=True, capture_output=True)
                return
            except (FileNotFoundError, subprocess.CalledProcessError):
                continue
        print("No audio player found. Install mpv, ffplay, or aplay.", file=sys.stderr)
    elif sys.platform == "win32":
        # Windows
        subprocess.run(["start", "/wait", filepath], shell=True, check=False)


def speak_system(text: str) -> bool:
    """
    Use system TTS as fallback.
    
    Args:
        text: The text to speak
        
    Returns:
        True if successful, False otherwise
    """
    try:
        if sys.platform == "darwin":
            # macOS 'say' command
            subprocess.run(["say", text], check=True)
            return True
        elif sys.platform.startswith("linux"):
            # Try espeak or festival
            for cmd in [["espeak", text], ["festival", "--tts"]]:
                try:
                    if "festival" in cmd:
                        subprocess.run(cmd, input=text.encode(), check=True)
                    else:
                        subprocess.run(cmd, check=True)
                    return True
                except FileNotFoundError:
                    continue
            print("No TTS found. Install espeak: sudo apt install espeak", file=sys.stderr)
            return False
        elif sys.platform == "win32":
            # Windows PowerShell
            ps_cmd = f'Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak("{text}")'
            subprocess.run(["powershell", "-Command", ps_cmd], check=True)
            return True
        else:
            print(f"Unsupported platform: {sys.platform}", file=sys.stderr)
            return False
    except Exception as e:
        print(f"System TTS error: {e}", file=sys.stderr)
        return False


def speak(text: str, voice: Optional[str] = None, use_elevenlabs: bool = True) -> None:
    """
    Speak the given text using the best available TTS.
    
    Tries ElevenLabs first if API key is available, then falls back to system TTS.
    
    Args:
        text: The text to speak
        voice: Voice name (for ElevenLabs)
        use_elevenlabs: Whether to try ElevenLabs first
    """
    if not TTS_ENABLED:
        print(f"[TTS Disabled] {text}")
        return
    
    # Resolve voice ID
    voice_id = ELEVENLABS_VOICE_ID
    if voice:
        voice_lower = voice.lower()
        if voice_lower in VOICE_MAP:
            voice_id = VOICE_MAP[voice_lower]
        elif len(voice) > 10:  # Looks like a voice ID
            voice_id = voice
    
    # Try ElevenLabs first
    if use_elevenlabs and ELEVENLABS_API_KEY:
        if speak_elevenlabs(text, voice_id):
            return
    
    # Fall back to system TTS
    if not speak_system(text):
        # Last resort: just print
        print(f"🔊 {text}")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Sigma Protocol Voice Notification System"
    )
    parser.add_argument(
        "message",
        nargs="?",
        default="Sigma notification",
        help="Message to speak"
    )
    parser.add_argument(
        "--voice", "-v",
        default=None,
        help="Voice to use (rachel, drew, paul, etc.)"
    )
    parser.add_argument(
        "--no-elevenlabs",
        action="store_true",
        help="Skip ElevenLabs and use system TTS only"
    )
    parser.add_argument(
        "--list-voices",
        action="store_true",
        help="List available voice names"
    )
    parser.add_argument(
        "--test",
        action="store_true",
        help="Run a test notification"
    )
    
    args = parser.parse_args()
    
    if args.list_voices:
        print("Available voices (for --voice flag):")
        for name, vid in sorted(VOICE_MAP.items()):
            print(f"  {name}: {vid}")
        print("\nOr use a custom ElevenLabs voice ID directly.")
        return
    
    if args.test:
        test_message = "Sigma Protocol notification system is working correctly."
        print(f"Testing: {test_message}")
        speak(test_message, args.voice, not args.no_elevenlabs)
        return
    
    speak(args.message, args.voice, not args.no_elevenlabs)


if __name__ == "__main__":
    main()


