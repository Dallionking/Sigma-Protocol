# ElevenLabs Voice Notification Setup

Guide to setting up high-quality voice notifications for Sigma Protocol's multi-agent orchestration system.

## Overview

Voice notifications alert you to important events during multi-agent orchestration:

- **"Sigma! Stream A completed User Authentication. Ready for testing."**
- **"Stream B is blocked, waiting for Stream A."**
- **"All streams complete. Ready for final merge."**

The system uses ElevenLabs for high-quality TTS, with automatic fallback to system TTS (macOS `say` or Linux `espeak`).

---

## Quick Setup

### 1. Get ElevenLabs API Key

1. Sign up at [elevenlabs.io](https://elevenlabs.io)
2. Go to **Profile Settings** → **API Keys**
3. Click **Create API Key**
4. Copy the key

### 2. Configure Environment

Add to your `.env` file:

```bash
ELEVENLABS_API_KEY=your_api_key_here
```

Or for MCP (`.cursor/mcp.json`):

```json
{
  "env": {
    "ELEVENLABS_API_KEY": "your_api_key_here"
  }
}
```

### 3. Test It

```bash
# Test voice notification
python scripts/notify/voice.py --test
```

---

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ELEVENLABS_API_KEY` | - | Your ElevenLabs API key |
| `ELEVENLABS_VOICE_ID` | `21m00Tcm4TlvDq8ikWAM` | Voice ID (Rachel) |
| `SIGMA_TTS_ENABLED` | `true` | Enable/disable voice notifications |
| `SIGMA_TTS_VOLUME` | `1.0` | Volume level (0.0-1.0) |
| `SIGMA_NOTIFY_ON` | `prd_complete,blocked,crash` | Events to notify on |

### Available Voices

| Voice Name | Voice ID | Description |
|------------|----------|-------------|
| Rachel | `21m00Tcm4TlvDq8ikWAM` | Female, American, calm |
| Drew | `29vD33N1CtxCmqQRPOHJ` | Male, American, conversational |
| Clyde | `2EiwWnXFnvU5JabPnv8n` | Male, American, deep |
| Paul | `5Q0t7uMcjvnagumLfvZi` | Male, American, narrative |
| Domi | `AZnzlk1XvdvUeBnXmlld` | Female, American, energetic |
| Dave | `CYw3kZ02Hs0563khs1Fj` | Male, British, conversational |
| Fin | `D38z5RcWu1voky8WS1ja` | Male, Irish, friendly |
| Sarah | `EXAVITQu4vr4xnSDxMaL` | Female, American, professional |
| Antoni | `ErXwobaYiN019PkySvjV` | Male, American, warm |
| Thomas | `GBv7mTt0atIp3Br8iCZE` | Male, American, calm |

### Using Custom Voice

```bash
# Via environment variable
export ELEVENLABS_VOICE_ID=29vD33N1CtxCmqQRPOHJ  # Drew

# Or via CLI
python scripts/notify/voice.py "Your message" --voice=drew
```

---

## Notification Events

### Configure Events

```bash
# .env
SIGMA_NOTIFY_ON=story_complete,prd_complete,blocked,all_complete,crash,error
```

### Event Descriptions

| Event | When | Default |
|-------|------|---------|
| `story_complete` | Stream finishes a story | No |
| `prd_complete` | Stream finishes entire PRD | **Yes** |
| `blocked` | Stream waiting on dependency | **Yes** |
| `all_complete` | All streams finished | **Yes** |
| `crash` | Stream instance crashed | **Yes** |
| `merge_conflict` | Git merge conflict | **Yes** |
| `error` | Error occurred | No |

---

## API Usage & Costs

### ElevenLabs Pricing (as of 2026)

| Plan | Characters/Month | Cost |
|------|------------------|------|
| Free | 10,000 | $0 |
| Starter | 30,000 | $5/mo |
| Creator | 100,000 | $22/mo |

### Estimated Usage

| Notification | ~Characters |
|--------------|-------------|
| PRD Complete | 60-80 |
| Blocked | 40-60 |
| All Complete | 50-70 |
| Crash | 40-50 |

**Typical project:** 20-50 PRDs = ~2,000-5,000 characters

---

## Fallback System

If ElevenLabs is unavailable, the system automatically falls back to:

### macOS

Uses built-in `say` command:

```bash
say "Your notification message"
```

### Linux

Uses `espeak` (install if needed):

```bash
sudo apt install espeak
espeak "Your notification message"
```

### Windows

Uses PowerShell:

```powershell
(New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak("Message")
```

---

## Testing

### Test ElevenLabs

```bash
# Basic test
python scripts/notify/voice.py --test

# With specific voice
python scripts/notify/voice.py "Testing Drew voice" --voice=drew

# List available voices
python scripts/notify/voice.py --list-voices
```

### Test Fallback

```bash
# Force system TTS
python scripts/notify/voice.py "Fallback test" --no-elevenlabs
```

### Disable Notifications

```bash
# Temporarily disable
export SIGMA_TTS_ENABLED=false

# Run orchestration silently
npx sigma-protocol orchestrate --streams=4
```

---

## Integration

### In Orchestrator

The orchestrator automatically calls voice notifications:

```python
# From orchestrator.py
def voice_notify(self, message: str) -> None:
    notify_script = self.project_root / "scripts" / "notify" / "voice.py"
    if notify_script.exists():
        subprocess.run([sys.executable, str(notify_script), message])
```

### In Shell Scripts

```bash
# From health-monitor.sh
notify() {
    local message="$1"
    python3 "./scripts/notify/voice.py" "$message" &
}

# Usage
notify "Stream B crashed and was restarted"
```

### Custom Notifications

```bash
# From anywhere in your workflow
python scripts/notify/voice.py "Custom notification message"

# With priority voices
python scripts/notify/voice.py "URGENT: Build failed!" --voice=clyde
```

---

## Troubleshooting

### No Sound

```bash
# Check TTS is enabled
echo $SIGMA_TTS_ENABLED  # Should be empty or "true"

# Test basic sound
say "test"  # macOS
espeak "test"  # Linux

# Check script execution
python scripts/notify/voice.py --test
```

### ElevenLabs Errors

```bash
# Verify API key
curl -H "xi-api-key: $ELEVENLABS_API_KEY" \
  https://api.elevenlabs.io/v1/user

# Check key is set
echo $ELEVENLABS_API_KEY | head -c 10
```

### Python Dependencies

```bash
# Install requests for ElevenLabs
pip install requests
```

### Audio Player Issues (Linux)

```bash
# Install mpv for audio playback
sudo apt install mpv

# Or ffplay
sudo apt install ffmpeg

# Or aplay (usually pre-installed)
which aplay
```

---

## Privacy & Security

### API Key Safety

- **Never commit** API keys to git
- Add `.env` to `.gitignore`
- Use environment variables or secrets managers

### Audio Processing

- Audio files are saved to `/tmp/sigma_notify.mp3`
- Files are deleted after playback
- No audio is stored permanently

### Network Requests

- Only occurs when ElevenLabs is configured
- Falls back to local TTS if network unavailable
- No sensitive data in TTS requests

---

## Related Documentation

- [ORCHESTRATION.md](./ORCHESTRATION.md) - Full orchestration guide
- [TMUX-GUIDE.md](./TMUX-GUIDE.md) - tmux tutorial
- [voice.py](../scripts/notify/voice.py) - Source code

---

## Quick Reference

```bash
# Setup
export ELEVENLABS_API_KEY=your_key

# Test
python scripts/notify/voice.py --test

# Custom message
python scripts/notify/voice.py "Your message" --voice=rachel

# List voices
python scripts/notify/voice.py --list-voices

# Disable
export SIGMA_TTS_ENABLED=false
```

---

*Part of the Sigma Protocol Multi-Agent Orchestration System*


