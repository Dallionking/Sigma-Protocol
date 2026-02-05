#!/usr/bin/env python3
"""
Session Parser - Extract patterns from Claude session transcripts
Used by SLAS distillation for learning user preferences
"""

import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional
from collections import Counter
from datetime import datetime


class SessionParser:
    """Parse Claude session transcripts (JSONL format) for pattern extraction."""

    # Patterns indicating user frustration
    FRUSTRATION_PATTERNS = [
        r"(?:no|don't|stop|wrong|incorrect|that's not|not what|already told|again\?|why did)",
        r"(?:frustrated|annoying|annoyed|ugh|sigh|come on|seriously)",
        r"(?:i said|like i said|as i mentioned|i already)",
    ]

    # Patterns indicating preferences
    PREFERENCE_PATTERNS = [
        r"(?:i prefer|always use|never use|i like|i want|don't ask|just do)",
        r"(?:my style|the way i|how i usually|i typically)",
    ]

    # Patterns indicating autonomy level
    AUTONOMY_PATTERNS = {
        'high': [
            r"(?:just do it|don't ask|go ahead|proceed|execute)",
            r"(?:stop asking|no confirmation|autonomous|auto)",
        ],
        'low': [
            r"(?:ask first|confirm|check with me|wait for|approval)",
            r"(?:step by step|one at a time|slowly)",
        ]
    }

    def __init__(self, transcript_path: str):
        self.transcript_path = Path(transcript_path)
        self.messages: List[Dict] = []
        self.user_messages: List[str] = []
        self.assistant_messages: List[str] = []

    def load(self) -> bool:
        """Load transcript from JSONL file."""
        if not self.transcript_path.exists():
            return False

        try:
            with open(self.transcript_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            msg = json.loads(line)
                            self.messages.append(msg)

                            # Extract text based on message type
                            if msg.get('type') == 'human':
                                content = self._extract_text(msg.get('message', {}))
                                if content:
                                    self.user_messages.append(content)
                            elif msg.get('type') == 'assistant':
                                content = self._extract_text(msg.get('message', {}))
                                if content:
                                    self.assistant_messages.append(content)
                        except json.JSONDecodeError:
                            continue
            return True
        except Exception as e:
            print(f"Error loading transcript: {e}", file=sys.stderr)
            return False

    def _extract_text(self, message: Dict) -> str:
        """Extract text content from message structure."""
        content = message.get('content', '')

        # Handle string content
        if isinstance(content, str):
            return content

        # Handle list content (Claude format)
        if isinstance(content, list):
            texts = []
            for item in content:
                if isinstance(item, dict) and item.get('type') == 'text':
                    texts.append(item.get('text', ''))
                elif isinstance(item, str):
                    texts.append(item)
            return ' '.join(texts)

        return ''

    def extract_frustrations(self) -> List[Dict[str, Any]]:
        """Extract instances of user frustration."""
        frustrations = []
        combined_pattern = '|'.join(self.FRUSTRATION_PATTERNS)

        for msg in self.user_messages:
            matches = re.findall(combined_pattern, msg.lower())
            if matches:
                frustrations.append({
                    'trigger': msg[:200],  # First 200 chars for context
                    'matches': matches,
                    'timestamp': datetime.now().isoformat()
                })

        return frustrations

    def extract_preferences(self) -> List[Dict[str, str]]:
        """Extract explicit user preferences."""
        preferences = []
        combined_pattern = '|'.join(self.PREFERENCE_PATTERNS)

        for msg in self.user_messages:
            if re.search(combined_pattern, msg.lower()):
                preferences.append({
                    'statement': msg[:300],
                    'category': self._categorize_preference(msg)
                })

        return preferences

    def _categorize_preference(self, text: str) -> str:
        """Categorize a preference statement."""
        text_lower = text.lower()

        if any(w in text_lower for w in ['code', 'typescript', 'function', 'class']):
            return 'coding_style'
        elif any(w in text_lower for w in ['explain', 'verbose', 'brief', 'concise']):
            return 'communication'
        elif any(w in text_lower for w in ['test', 'verify', 'check']):
            return 'quality'
        elif any(w in text_lower for w in ['fast', 'quick', 'slow', 'careful']):
            return 'pace'
        else:
            return 'general'

    def calculate_autonomy_score(self) -> float:
        """Calculate autonomy preference score (0=low, 1=high)."""
        high_count = 0
        low_count = 0

        for msg in self.user_messages:
            msg_lower = msg.lower()

            for pattern in self.AUTONOMY_PATTERNS['high']:
                if re.search(pattern, msg_lower):
                    high_count += 1

            for pattern in self.AUTONOMY_PATTERNS['low']:
                if re.search(pattern, msg_lower):
                    low_count += 1

        total = high_count + low_count
        if total == 0:
            return 0.5  # Neutral default

        return high_count / total

    def analyze_verbosity(self) -> str:
        """Analyze user's preferred verbosity level."""
        # Calculate average user message length
        if not self.user_messages:
            return 'standard'

        avg_len = sum(len(m) for m in self.user_messages) / len(self.user_messages)

        # Check for explicit verbosity preferences
        for msg in self.user_messages:
            msg_lower = msg.lower()
            if any(w in msg_lower for w in ['brief', 'concise', 'short', 'less', 'minimal']):
                return 'minimal'
            if any(w in msg_lower for w in ['explain', 'detail', 'verbose', 'thorough']):
                return 'detailed'

        # Infer from message lengths
        if avg_len < 50:
            return 'minimal'
        elif avg_len > 200:
            return 'detailed'
        else:
            return 'standard'

    def extract_topics(self) -> Dict[str, int]:
        """Extract frequently discussed topics."""
        # Common technical topics
        topics = Counter()

        topic_patterns = {
            'typescript': r'\b(?:typescript|ts|tsx)\b',
            'react': r'\b(?:react|jsx|component|hook)\b',
            'api': r'\b(?:api|endpoint|rest|graphql)\b',
            'database': r'\b(?:database|sql|postgres|mongo|supabase)\b',
            'testing': r'\b(?:test|jest|vitest|cypress)\b',
            'styling': r'\b(?:css|tailwind|style|theme)\b',
            'git': r'\b(?:git|commit|branch|merge|pr)\b',
            'deployment': r'\b(?:deploy|vercel|aws|docker)\b',
        }

        all_text = ' '.join(self.user_messages + self.assistant_messages).lower()

        for topic, pattern in topic_patterns.items():
            count = len(re.findall(pattern, all_text))
            if count > 0:
                topics[topic] = count

        return dict(topics.most_common(10))

    def get_full_analysis(self) -> Dict[str, Any]:
        """Run complete analysis and return all patterns."""
        return {
            'message_count': {
                'user': len(self.user_messages),
                'assistant': len(self.assistant_messages),
                'total': len(self.messages)
            },
            'autonomy_score': self.calculate_autonomy_score(),
            'verbosity': self.analyze_verbosity(),
            'frustrations': self.extract_frustrations(),
            'preferences': self.extract_preferences(),
            'topics': self.extract_topics(),
            'analyzed_at': datetime.now().isoformat()
        }


def main():
    """CLI entry point for session parsing."""
    if len(sys.argv) < 2:
        print("Usage: session-parser.py <transcript.jsonl> [--output json|yaml]", file=sys.stderr)
        sys.exit(1)

    transcript_path = sys.argv[1]
    output_format = 'json'

    if '--output' in sys.argv:
        idx = sys.argv.index('--output')
        if idx + 1 < len(sys.argv):
            output_format = sys.argv[idx + 1]

    parser = SessionParser(transcript_path)
    if not parser.load():
        print(f"Failed to load transcript: {transcript_path}", file=sys.stderr)
        sys.exit(1)

    analysis = parser.get_full_analysis()

    if output_format == 'yaml':
        try:
            import yaml
            print(yaml.dump(analysis, default_flow_style=False))
        except ImportError:
            print(json.dumps(analysis, indent=2))
    else:
        print(json.dumps(analysis, indent=2))


if __name__ == '__main__':
    main()
