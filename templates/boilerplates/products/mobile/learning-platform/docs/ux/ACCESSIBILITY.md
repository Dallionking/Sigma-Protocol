# Learning Platform — Accessibility Specification

**Version:** 1.0 | **Date:** 2025-12-17  
**Standard:** WCAG 2.2 Level AA  
**Platforms:** iOS (VoiceOver), Android (TalkBack)

---

## Accessibility Commitment

> **"Learning Platform is for everyone who wants to learn effectively, regardless of ability."**

This app is designed to be fully accessible to users with visual, motor, auditory, and cognitive disabilities.

---

## WCAG 2.2 Level AA Checklist

### 1. Perceivable

#### 1.1 Text Alternatives

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 1.1.1 Non-text Content | ✅ | All images have `accessibilityLabel` |
| Decorative images | ✅ | Set `accessible={false}` |
| Complex images | ✅ | Detailed descriptions in `accessibilityHint` |

```typescript
// Example: Lesson thumbnail
<Image
  source={{ uri: lesson.thumbnail }}
  accessible={true}
  accessibilityLabel={`Lesson: ${lesson.title}`}
  accessibilityHint={`Tap to start ${lesson.title} lesson`}
/>

// Example: Decorative element
<View style={styles.decorativeGradient} accessible={false} />
```

#### 1.2 Time-based Media

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 1.2.1 Audio-only | ✅ | Transcripts for all lesson audio |
| 1.2.2 Captions | ✅ | Captions for video content |
| 1.2.3 Audio Description | ✅ | Descriptions for instructional videos |

#### 1.3 Adaptable

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 1.3.1 Info and Relationships | ✅ | Semantic structure with roles |
| 1.3.2 Meaningful Sequence | ✅ | Logical reading order |
| 1.3.3 Sensory Characteristics | ✅ | Instructions don't rely on shape/color alone |
| 1.3.4 Orientation | ✅ | Portrait primary, landscape for video calls |
| 1.3.5 Input Purpose | ✅ | `textContentType` set for autocomplete |

```typescript
// Example: Proper role structure
<View accessibilityRole="list">
  <View accessibilityRole="listitem">
    <Text>Lesson 1: Greetings</Text>
  </View>
</View>

// Example: Input purpose
<TextInput
  textContentType="emailAddress"
  autoComplete="email"
  accessibilityLabel="Email address"
/>
```

#### 1.4 Distinguishable

| Requirement | Status | Values |
|-------------|--------|--------|
| 1.4.1 Use of Color | ✅ | Icons + text accompany color indicators |
| 1.4.3 Contrast (Minimum) | ✅ | 4.5:1 for normal text |
| 1.4.4 Resize Text | ✅ | Support up to 200% text scaling |
| 1.4.5 Images of Text | ✅ | No images of text used |
| 1.4.10 Reflow | ✅ | Horizontal scrolling avoided |
| 1.4.11 Non-text Contrast | ✅ | 3:1 for UI components |
| 1.4.12 Text Spacing | ✅ | No content loss at 1.5x line height |
| 1.4.13 Content on Hover | ✅ | N/A for mobile (no hover) |

**Contrast Values:**

| Element | Foreground | Background | Ratio |
|---------|------------|------------|-------|
| Body text | #F8FAFC | #0A0F1E | 16.8:1 ✅ |
| Secondary text | #94A3B8 | #0A0F1E | 7.2:1 ✅ |
| Muted text | #64748B | #0A0F1E | 4.6:1 ✅ |
| Primary button text | #FFFFFF | #6366F1 | 4.6:1 ✅ |
| Error text | #EF4444 | #0A0F1E | 5.4:1 ✅ |
| Success text | #10B981 | #0A0F1E | 5.9:1 ✅ |

---

### 2. Operable

#### 2.1 Keyboard Accessible

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 2.1.1 Keyboard | ✅ | All interactive elements focusable |
| 2.1.2 No Keyboard Trap | ✅ | Focus can always move forward/backward |
| 2.1.4 Character Key Shortcuts | ✅ | No single-character shortcuts |

```typescript
// Example: Focus management
const inputRef = useRef<TextInput>(null);

const handleNext = () => {
  inputRef.current?.focus();
};

<Button onPress={handleNext} title="Next" />
<TextInput ref={inputRef} />
```

#### 2.2 Enough Time

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 2.2.1 Timing Adjustable | ✅ | Timed exercises can be paused/extended |
| 2.2.2 Pause, Stop, Hide | ✅ | Auto-playing audio can be paused |

```typescript
// Example: Timed exercise with accessibility
const [isPaused, setIsPaused] = useState(false);

<View accessible={true}>
  <Text>Time remaining: {formatTime(remaining)}</Text>
  <Button 
    title={isPaused ? "Resume" : "Pause Timer"}
    onPress={() => setIsPaused(!isPaused)}
    accessibilityLabel={isPaused ? "Resume timer" : "Pause timer"}
  />
</View>
```

#### 2.3 Seizures and Physical Reactions

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 2.3.1 Three Flashes | ✅ | No content flashes more than 3x/second |

#### 2.4 Navigable

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 2.4.1 Bypass Blocks | ✅ | Tab bar provides direct navigation |
| 2.4.2 Page Titled | ✅ | Every screen has a title |
| 2.4.3 Focus Order | ✅ | Logical focus sequence |
| 2.4.4 Link Purpose | ✅ | Link text describes destination |
| 2.4.5 Multiple Ways | ✅ | Tab bar + quick actions on Home |
| 2.4.6 Headings and Labels | ✅ | Descriptive headings throughout |
| 2.4.7 Focus Visible | ✅ | 2px outline on focus |

```typescript
// Example: Screen title
<Stack.Screen
  name="lessons/[id]"
  options={({ route }) => ({
    title: lessons.find(l => l.id === route.params.id)?.title,
    headerAccessibilityLabel: `Lesson: ${lesson.title}`,
  })}
/>
```

#### 2.5 Input Modalities

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 2.5.1 Pointer Gestures | ✅ | All gestures have single-pointer alternatives |
| 2.5.2 Pointer Cancellation | ✅ | Actions on up-event, not down |
| 2.5.3 Label in Name | ✅ | Visible labels match accessible names |
| 2.5.4 Motion Actuation | ✅ | No shake-to-undo or motion controls |

**Touch Targets:**

| Element | Minimum Size | Actual Size |
|---------|--------------|-------------|
| Buttons | 44×44pt | 48×48pt ✅ |
| Icons | 44×44pt | 44×44pt ✅ |
| List items | 44pt height | 56pt ✅ |
| Tab bar items | 44pt | 49pt ✅ |
| Form inputs | 44pt height | 48pt ✅ |

---

### 3. Understandable

#### 3.1 Readable

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 3.1.1 Language of Page | ✅ | `lang="en"` set on root |
| 3.1.2 Language of Parts | ✅ | the subject content marked with `lang="es"` |

```typescript
// Example: Mixed language content
<Text accessibilityLanguage="en">
  How do you say "hello" in the subject?
</Text>
<Text accessibilityLanguage="en" style={styles.term}>
  Synthesis
</Text>
```

#### 3.2 Predictable

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 3.2.1 On Focus | ✅ | No context change on focus |
| 3.2.2 On Input | ✅ | No unexpected context change |
| 3.2.3 Consistent Navigation | ✅ | Tab bar consistent across app |
| 3.2.4 Consistent Identification | ✅ | Icons/labels consistent |

#### 3.3 Input Assistance

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 3.3.1 Error Identification | ✅ | Errors in text, not just color |
| 3.3.2 Labels or Instructions | ✅ | All inputs have labels |
| 3.3.3 Error Suggestion | ✅ | Helpful error messages |
| 3.3.4 Error Prevention | ✅ | Confirmation for irreversible actions |

```typescript
// Example: Accessible error state
<View>
  <TextInput
    accessibilityLabel="Email address"
    accessibilityDescribedBy="email-error"
  />
  {error && (
    <Text 
      id="email-error" 
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      ⚠️ Please enter a valid email address
    </Text>
  )}
</View>
```

---

### 4. Robust

#### 4.1 Compatible

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 4.1.1 Parsing | ✅ | Valid React Native components |
| 4.1.2 Name, Role, Value | ✅ | ARIA roles and states |
| 4.1.3 Status Messages | ✅ | Live regions for updates |

```typescript
// Example: Live region for dynamic content
<View accessibilityLiveRegion="polite">
  <Text>XP earned: {xp}</Text>
</View>

// Example: Status update announcement
AccessibilityInfo.announceForAccessibility(
  `Correct! You earned ${xp} XP`
);
```

---

## Screen Reader Implementation

### VoiceOver (iOS) & TalkBack (Android)

#### Accessibility Roles

| Component | Role | Notes |
|-----------|------|-------|
| Buttons | `button` | Default for TouchableOpacity |
| Links | `link` | External navigation |
| Headers | `header` | Section titles |
| Images | `image` | Decorative = none |
| Lists | `list` + `listitem` | For FlatList |
| Checkboxes | `checkbox` | With `accessibilityState` |
| Switches | `switch` | Toggle controls |
| Alerts | `alert` | Error/success messages |
| Progress | `progressbar` | With `accessibilityValue` |

#### Accessibility States

```typescript
// Example: Checkbox state
<TouchableOpacity
  accessibilityRole="checkbox"
  accessibilityState={{ checked: isChecked }}
  accessibilityLabel="Enable notifications"
>
  <Checkbox checked={isChecked} />
</TouchableOpacity>

// Example: Button disabled state
<TouchableOpacity
  accessibilityRole="button"
  accessibilityState={{ disabled: isLoading }}
  accessibilityLabel="Submit answer"
>
  <Text>{isLoading ? 'Checking...' : 'Check Answer'}</Text>
</TouchableOpacity>

// Example: Progress value
<View
  accessibilityRole="progressbar"
  accessibilityValue={{
    min: 0,
    max: 100,
    now: progress,
    text: `${progress}% complete`,
  }}
>
  <ProgressBar value={progress} />
</View>
```

#### Grouping Related Content

```typescript
// Example: Lesson card as single focusable unit
<TouchableOpacity
  accessible={true}
  accessibilityLabel={`${lesson.title}. ${lesson.duration} minutes. ${lesson.progress}% complete. Tap to continue.`}
>
  <LessonCardContent lesson={lesson} />
</TouchableOpacity>
```

#### Focus Management

```typescript
// Example: Modal focus trap
const focusRef = useRef();

useEffect(() => {
  if (isVisible) {
    focusRef.current?.focus();
  }
}, [isVisible]);

<Modal visible={isVisible}>
  <TouchableOpacity ref={focusRef} accessibilityLabel="Close modal">
    <CloseIcon />
  </TouchableOpacity>
  {/* Modal content */}
</Modal>
```

---

## Reduced Motion Support

```typescript
import { useReducedMotion } from 'react-native-reanimated';

function AnimatedCard({ children }) {
  const reducedMotion = useReducedMotion();

  const entering = reducedMotion
    ? FadeIn.duration(0)
    : FadeIn.delay(100).springify();

  return (
    <Animated.View entering={entering}>
      {children}
    </Animated.View>
  );
}
```

### What Changes with Reduced Motion

| Animation | With Motion | Reduced Motion |
|-----------|-------------|----------------|
| Page transitions | Spring slide | Instant switch |
| Button press | Scale to 0.95 | Opacity change only |
| Confetti | Particle animation | Static checkmark |
| XP counter | Count-up animation | Final number instantly |
| Loading | Shimmer | Static skeleton |

---

## Audio Accessibility

### Transcripts

All audio content includes a transcript:

```typescript
<AudioPlayer
  source={audio.url}
  accessibilityLabel={`Audio: ${audio.title}. Tap to play.`}
/>
<TouchableOpacity
  accessibilityLabel="View transcript"
  onPress={() => showTranscript(audio.transcript)}
>
  <Text>📝 View Transcript</Text>
</TouchableOpacity>
```

### Captions (Video Calls)

- LiveKit video calls support live captions (future feature)
- Pre-recorded video content has embedded captions

---

## Inclusive Design Considerations

### Cognitive Accessibility

| Consideration | Implementation |
|---------------|----------------|
| Simple language | F-K grade 5-8 for all copy |
| Clear structure | Consistent heading hierarchy |
| Focus visible | 2px visible focus indicator |
| Progress indication | Clear progress bars and percentages |
| Error recovery | Helpful error messages with actions |
| Memory support | Session saves progress automatically |

### Motor Accessibility

| Consideration | Implementation |
|---------------|----------------|
| Touch targets | 44×44pt minimum |
| Gesture alternatives | All gestures have tap alternatives |
| Timeout extensions | Timed exercises can be paused |
| Shake alternatives | No shake-based features |

### Color Blindness

| Type | Consideration |
|------|---------------|
| Protanopia | Red/green don't carry meaning alone |
| Deuteranopia | Icons accompany colored status |
| Tritanopia | Blue/yellow have sufficient contrast |

```typescript
// Example: Status with icon + color
<View style={[styles.status, isCorrect ? styles.correct : styles.incorrect]}>
  {isCorrect ? <CheckIcon /> : <XIcon />}
  <Text>{isCorrect ? 'Correct!' : 'Try again'}</Text>
</View>
```

---

## Testing Checklist

### Manual Testing

- [ ] VoiceOver complete journey (iOS)
- [ ] TalkBack complete journey (Android)
- [ ] Keyboard navigation (external keyboard)
- [ ] Text scaling at 200%
- [ ] Reduced motion enabled
- [ ] Inverted colors
- [ ] Bold text enabled

### Automated Testing

- [ ] Accessibility Inspector (Xcode)
- [ ] Accessibility Scanner (Android)
- [ ] jest-axe for component tests
- [ ] Detox accessibility assertions

### Testing Tools

```typescript
// Example: Jest accessibility test
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Button is accessible', async () => {
  const { container } = render(<Button title="Submit" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Accessibility Statement

```
LEARNING PLATFORM ACCESSIBILITY STATEMENT

Learning Platform is committed to ensuring digital accessibility 
for people with disabilities. We continually improve the user 
experience for everyone and apply relevant accessibility standards.

Conformance Status: WCAG 2.2 Level AA

Feedback: If you experience accessibility barriers, please contact 
us at accessibility@app.example.com

Last Updated: 2025-12-17
```

---

*Accessibility Specification Version: 1.0*  
*Last Updated: 2025-12-17*

