# ADR-003: Use LiveKit for Video Calls

## Status
**Accepted** — 2025-12-17

## Context

We need video calling capabilities for:
- 1:1 tutoring sessions between students and AI Tutor
- Future group class functionality
- Screen sharing for worksheet review
- Recording for session replay (future)

**Options Considered:**
1. **LiveKit** — Open-source WebRTC infrastructure
2. **Daily.co** — Video API platform
3. **Agora** — Real-time engagement platform
4. **Twilio Video** — Twilio's video SDK
5. **Whereby** — Embedded video meetings

## Decision

**Use LiveKit Cloud** with the React Native SDK.

## Rationale

### Why LiveKit:

1. **React Native SDK**
   - Official `@livekit/react-native` package
   - Expo plugin available (`@livekit/react-native-expo-plugin`)
   - Well-documented integration

2. **Low Latency**
   - < 500ms end-to-end latency
   - Global edge network for low-latency routing
   - WebRTC-based for optimal real-time performance

3. **Feature Complete**
   - Screen sharing supported
   - In-call chat via data channels
   - Recording and egress available
   - AI agent integration (for future voice AI)

4. **Pricing**
   - Free tier for development
   - Pay-as-you-go model aligns with usage
   - $0.004/min for voice — affordable for tutoring

5. **Open Source**
   - Server is open-source (can self-host if needed)
   - Transparent implementation
   - Active community

6. **Future Voice AI Potential**
   - LiveKit Agents framework for AI voice bots
   - Could power advanced "Talk to AI Tutor Mode"
   - Seamless upgrade path

### Why Not Alternatives:

| Option | Rejection Reason |
|--------|------------------|
| Daily.co | Higher pricing, less RN-specific documentation |
| Agora | More complex, enterprise-focused |
| Twilio Video | Reaching end-of-life, less investment |
| Whereby | Embedded-only, less control |

## Consequences

### Benefits
- ✅ Native React Native integration
- ✅ Expo-compatible via config plugin
- ✅ Low-latency video essential for tutoring
- ✅ Screen sharing for worksheet review
- ✅ Cost-effective for small-scale usage

### Trade-offs
- ⚠️ Requires backend token generation (Edge Function)
- ⚠️ Some features require development builds (not Expo Go)
- ⚠️ Self-hosting requires infrastructure if scaling significantly

### Risks
- ❌ LiveKit Cloud outage (mitigated: fallback to Zoom link)
- ❌ React Native SDK compatibility (mitigated: actively maintained)

## Implementation Notes

```typescript
// Edge Function: /functions/v1/generate-token
import { AccessToken, VideoGrant } from 'livekit-server-sdk';

const apiKey = Deno.env.get('LIVEKIT_API_KEY');
const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');

export async function generateToken(roomName: string, participantName: string) {
  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
  });
  
  token.addGrant({ 
    roomJoin: true, 
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  } as VideoGrant);
  
  return token.toJwt();
}
```

```typescript
// React Native usage
import { useRoom, VideoTrack } from '@livekit/react-native';

function VideoCall({ token, url }) {
  const room = useRoom();
  
  useEffect(() => {
    room.connect(url, token);
    return () => room.disconnect();
  }, [token]);
  
  return <VideoTrack />;
}
```

## References
- [LiveKit Documentation](https://docs.livekit.io/)
- [LiveKit React Native Quickstart](https://docs.livekit.io/home/quickstarts/react-native)
- [LiveKit Pricing](https://livekit.io/pricing)

