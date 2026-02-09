# Security Flow - Quick Start Guide

Get started testing the Security & Privacy features in **5 minutes**.

---

## Prerequisites

- Expo dev server running (`npm start`)
- Mobile device or simulator
- App navigated to **Account → Security**

---

## Test Features

### 1. Biometric Toggle (30 seconds)

**Location**: Security Center → Face ID toggle

```
1. Toggle Face ID ON
   → Should prompt biometric authentication
   → Badge appears: "Enabled"
   
2. Toggle Face ID OFF
   → No prompt required
   → Badge disappears
```

**Expected**: Smooth toggle animation, indigo badge when enabled.

---

### 2. Password Change (2 minutes)

**Location**: Security Center → Change Password

```
1. Enter current password: password123
2. Enter new password: NewPass123!
3. Watch strength indicator update in real-time
   ✓ At least 8 characters
   ✓ Uppercase and lowercase letters
   ✓ At least one number
   ✓ At least one special character
   
4. Confirm new password: NewPass123!
5. Tap "Save Password"
   → Success animation plays
   → Returns to Security Center
```

**Expected**: Real-time strength bar, checkmarks, success animation.

---

### 3. Active Sessions (1 minute)

**Location**: Security Center → Active Sessions

```
Mock Sessions Displayed:
  📱 iPhone 15 Pro (This Device)
  💻 MacBook Pro - 2 days ago
  📲 iPad Air - 5 days ago

Test Actions:
1. Pull down to refresh
   → Spinner shows, list refreshes
   
2. Tap "End" on MacBook session
   → Session disappears
   
3. Tap "End All Other Sessions"
   → Only "This Device" remains
```

**Expected**: Device icons, indigo "This Device" badge, smooth animations.

---

### 4. Logout (30 seconds)

**Location**: Security Center → Log Out

```
1. Tap "Log Out" button
   → Modal appears
   → Animated 👋 emoji with glow
   → "What happens" info card

2. Review info:
   • Sign in required after logout
   • Portfolio data remains safe
   • Only this device logged out

3. Tap "Log Out" (red button)
   → Routes to auth/signin

4. OR tap "Cancel" (gray button)
   → Returns to Security Center
```

**Expected**: Smooth modal, clear hierarchy (red = danger, gray = cancel).

---

### 5. Delete Account (2 minutes)

**Location**: Security Center → Delete Account

```
1. Tap "Delete Account"
   → Warning screen appears
   → Animated ⚠️ icon with red pulse
   
2. Review what will be lost:
   🗑️ All personal data
   🔌 All broker connections
   💳 Subscription & billing
   📊 Trading history

3. Type: DELETE (uppercase)
   → Button becomes enabled
   
4. Tap "Delete Account Permanently"
   → Processing (2s delay in mock)
   → Routes to auth/signin

⚠️ Note: In mock mode, no actual deletion occurs
```

**Expected**: Pulsing red icon, disabled until "DELETE" typed, heavy haptic on confirm.

---

## Mock Mode Testing

### Current Behavior

All features work in mock mode (`__DEV__` = true):

- **Biometric**: Simulates authentication (no real biometric)
- **Password**: Validates but doesn't persist
- **Sessions**: Shows 3 mock devices
- **Logout**: Clears Zustand store
- **Delete**: Simulates 2s API call

### Check Mock Mode Status

```typescript
// In mobile/lib/utils/mock-auth-data.ts
export const MOCK_MODE = __DEV__ || process.env.EXPO_PUBLIC_MOCK_MODE === 'true';
```

---

## Visual Checklist

**Typography**:
- [ ] Bold screen titles (H2, 24px)
- [ ] Clear body text (16px)
- [ ] Muted secondary text (13px, gray)

**Colors**:
- [ ] Indigo (#6366F1) for success states
- [ ] Red (#FF4136) for danger actions
- [ ] Gray for secondary actions

**Animations**:
- [ ] Screen entry: fade + slide up
- [ ] Staggered cards (100ms delays)
- [ ] Pulse effects on icons
- [ ] Spring animations on toggles

**Haptics**:
- [ ] Light: Navigation taps
- [ ] Medium: Toggles, form submission
- [ ] Heavy: Logout, deletion
- [ ] Success/Error: Notifications

---

## Common Test Scenarios

### Happy Path (All Features)

```
Time: ~5 minutes

1. Enter Security Center
2. Toggle biometric ON
3. Change password successfully
4. View sessions, end one
5. Log out → Cancel
6. Delete account → Back
7. Return to Account hub
```

### Error Scenarios

**Invalid Password**:
```
Current: wrong_password
Expected: Error toast
```

**Delete Without Typing DELETE**:
```
Type: delete (lowercase)
Expected: Button stays disabled
```

**End Current Session**:
```
Try to end "This Device"
Expected: Should not allow
```

---

## Debugging Tips

### Enable Logs

```typescript
// In security screens, add:
console.log('State:', useAuthStore.getState());
```

### Check Biometric Status

```typescript
// In security/index.tsx:
const { data: biometricStatus } = useBiometricStatus();
console.log('Biometric:', biometricStatus);
```

### Inspect Store

```bash
# In browser console (with Expo DevTools):
> require('@/lib/stores/auth-store').useAuthStore.getState()
```

---

## Performance Testing

### Animation Smoothness

**Test**: Rapidly navigate between screens
**Expected**: 60fps, no dropped frames

### Scroll Performance

**Test**: Scroll sessions list with 10+ items
**Expected**: Smooth scrolling, no lag

### Form Responsiveness

**Test**: Type in password field
**Expected**: Instant feedback, strength updates < 100ms

---

## Next Steps

After manual testing:

1. **Phase 2**: Integrate real backend API
2. **Phase 3**: Add real device testing (biometrics require physical device)
3. **Phase 4**: Performance profiling with React DevTools
4. **Phase 5**: Accessibility testing (screen readers)

---

## Quick Reference

### Navigation Paths

```
Account Hub
  → Security & Privacy
      → Change Password
      → Active Sessions
      → Delete Account
      → Log Out
```

### Key Files

```
Screens:     mobile/app/(tabs)/account/security/
Store:       mobile/lib/stores/auth-store.ts
Hooks:       mobile/lib/hooks/use-auth.ts
Biometric:   mobile/lib/utils/biometric.ts
Mock Data:   mobile/lib/utils/mock-auth-data.ts
```

### Store State

```typescript
{
  user: User | null,
  isAuthenticated: boolean,
  biometricEnabled: boolean,
  sessions: Session[],
  isLoading: boolean,
  error: string | null,
}
```

---

## Troubleshooting

**Issue**: Biometric prompt doesn't appear
- **Fix**: Run on physical device (simulators have limited biometric support)

**Issue**: Password strength stays "Too weak"
- **Fix**: Ensure 8+ chars, mixed case, number, special char

**Issue**: Sessions don't appear
- **Fix**: Check MOCK_MODE is enabled, restart app

**Issue**: Animations laggy
- **Fix**: Enable "Release" mode or test on physical device

---

## Testing Matrix

| Feature | Works? | Notes |
|---------|--------|-------|
| Biometric Toggle | ✅ | Requires real device for full test |
| Password Change | ✅ | Form validation working |
| Sessions List | ✅ | Mock data displays |
| End Session | ✅ | Optimistic update |
| End All Sessions | ✅ | Keeps current device |
| Logout | ✅ | Clears store, routes correctly |
| Delete Account | ✅ | Confirmation works |

---

## Summary

✅ **All features** work in mock mode  
✅ **5 minute** test coverage of entire flow  
✅ **Visual design** follows SKILL.md principles  
✅ **Smooth animations** and haptic feedback  
✅ **Ready for** real API integration

**Total Testing Time**: ~10 minutes (with exploration)

---

**Quick Start Version**: 1.0  
**Last Updated**: December 2025  
**Status**: Ready for Testing

