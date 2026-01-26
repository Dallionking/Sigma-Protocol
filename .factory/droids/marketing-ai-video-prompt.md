---
name: ai-video-prompt
description: "Sigma marketing command: ai-video-prompt"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# ai-video-prompt

**Source:** Sigma Protocol marketing module
**Version:** 1.0.0

---

# AI Video Generation Prompt Creator

**Generate optimized prompts for AI video tools (Runway, Pika, Kling, Sora)**

---

## INPUTS REQUIRED

Before generating, gather:
- **Video concept**: What do you want to create?
- **Style**: Cinematic, animated, realistic, abstract
- **Duration**: Short clip (4s) or longer (10-15s)
- **Target platform**: Runway ML, Pika Labs, Kling AI
- **Mood**: Energetic, calm, dramatic, playful

---

## PROMPT GENERATION FRAMEWORK

### Structure for AI Video Prompts

```
[SUBJECT] + [ACTION] + [STYLE] + [CAMERA MOVEMENT] + [LIGHTING] + [ATMOSPHERE]
```

### Example Breakdown

**Basic**: "A person walking"
**Enhanced**: "A confident businessman in a tailored navy suit walks through a futuristic glass corridor, cinematic lighting, slow-motion tracking shot, lens flare, photorealistic, 8K"

---

## RUNWAY ML PROMPT TEMPLATES

### For Text-to-Video (Gen-3)

**Product Showcase:**
```
A sleek [PRODUCT] rotates slowly on a minimalist pedestal, dramatic studio lighting with soft shadows, camera dollies around the object revealing details, black background with subtle gradient, photorealistic, commercial quality, 4K
```

**App Demo Aesthetic:**
```
A smartphone displaying [APP SCREEN] floats in mid-air with holographic UI elements emerging from the screen, soft bokeh background in [COLOR] tones, gentle camera orbit, futuristic tech aesthetic, cinematic
```

**Lifestyle/Brand:**
```
[PERSON DESCRIPTION] [ACTION] in a [LOCATION], golden hour lighting, shot on Arri Alexa, shallow depth of field, cinematic color grading, slow-motion, lifestyle commercial aesthetic
```

**Abstract/Motion Graphics:**
```
Fluid [COLOR] ink dissolving in water, macro photography, swirling organic patterns, ethereal lighting, satisfying motion, abstract art aesthetic, seamless loop potential
```

### For Image-to-Video

**Add Motion:**
```
Add subtle [MOVEMENT TYPE]: gentle wind through hair, soft breathing motion, slight camera parallax, atmospheric particles floating
```

**Movement Types:**
- `subtle sway` - Natural movement
- `slow zoom` - Dramatic reveal
- `parallax` - 3D depth
- `flowing fabric` - Material motion
- `particle effects` - Atmospheric

---

## PIKA LABS PROMPT TEMPLATES

### Basic Structure
```
[Subject], [Action], [Style], [Camera], [Quality tags]
```

### Templates by Use Case

**Person/Portrait:**
```
Portrait of [DESCRIPTION], [EXPRESSION], [ACTION like turns head slightly], cinematic lighting, bokeh background, film grain, 4K, professional photography
```

**Product:**
```
[PRODUCT] in [SETTING], [MOTION like rotates/reveals], dramatic lighting, studio setup, commercial quality, smooth motion
```

**Scene:**
```
[SCENE DESCRIPTION], [TIME OF DAY], [WEATHER/ATMOSPHERE], [CAMERA MOVEMENT], cinematic, establishing shot, movie quality
```

### Pika-Specific Tips:
- Keep prompts 50-100 words
- Start with the main subject
- End with quality/style tags
- Use "smooth motion" for better results

---

## KLING AI PROMPT TEMPLATES

### Long-Form Video (10-15s)

**Narrative Sequence:**
```
A [CHARACTER DESCRIPTION] [INITIAL ACTION] then [SECOND ACTION] and finally [FINAL ACTION], continuous shot, [SETTING], [LIGHTING], cinematic, storytelling
```

**Example:**
```
A young woman in a red dress stands at the edge of a cliff, wind blowing her hair, she closes her eyes then opens them with a smile, revealing a beautiful sunset, continuous shot, golden hour, emotional, cinematic
```

### Kling-Specific Tips:
- Can handle longer sequences
- Better at maintaining character consistency
- Include transition descriptions
- Specify "continuous shot" for seamless movement

---

## STYLE MODIFIERS LIBRARY

### Cinematic Styles
```
- "shot on Arri Alexa"
- "anamorphic lens flare"
- "shallow depth of field"
- "color graded"
- "35mm film"
- "IMAX quality"
```

### Lighting
```
- "golden hour"
- "dramatic side lighting"
- "soft diffused light"
- "neon glow"
- "chiaroscuro"
- "volumetric rays"
```

### Camera Movements
```
- "slow tracking shot"
- "dolly zoom"
- "crane shot"
- "steadicam follow"
- "handheld documentary style"
- "smooth orbit"
- "push in"
- "pull out"
```

### Quality Tags
```
- "8K"
- "photorealistic"
- "hyperrealistic"
- "professional quality"
- "broadcast quality"
- "film grain"
```

### Mood/Atmosphere
```
- "ethereal"
- "dramatic"
- "whimsical"
- "dark and moody"
- "bright and airy"
- "nostalgic"
```

---

## OUTPUT FORMAT

Generate prompts in this structure:

```markdown
## Video Prompt Package

### Concept
[Description of what the video will show]

### Primary Prompt (Runway ML)
[Full optimized prompt]

### Alternative Prompt (Pika Labs)
[Adjusted for Pika's strengths]

### Alternative Prompt (Kling AI)
[Adjusted for Kling's capabilities]

### Negative Prompt (if supported)
[What to avoid]

### Recommended Settings
- Duration: [X seconds]
- Aspect Ratio: [16:9, 9:16, 1:1]
- Style Mode: [if applicable]
- Motion Amount: [Low/Medium/High]

### Variations
1. [Slight variation for A/B testing]
2. [Different angle/perspective]
3. [Alternative mood]
```

---

## COMMON USE CASES

### Social Media Content

**TikTok/Reels Opener:**
```
Dramatic close-up of [SUBJECT] with intense eye contact, quick zoom out revealing [CONTEXT], energetic, trendy, vertical format, hook-worthy first frame
```

**YouTube Thumbnail Animation:**
```
[PERSON/SUBJECT] with exaggerated surprised expression, bold colors, animated text elements floating around, YouTube thumbnail energy, vibrant, eye-catching
```

### Marketing/Ads

**Product Launch:**
```
Sleek product reveal, [PRODUCT] emerges from smoke/light, slow-motion rotation, premium feel, Apple-style minimalism, black background, dramatic lighting
```

**Brand Story:**
```
[BRAND NARRATIVE] scene, authentic moments, diverse people, warm color palette, emotional storytelling, documentary style, inspiring music implied
```

### Educational/Course Content

**Talking Head B-Roll:**
```
Abstract visualization of [CONCEPT], flowing data streams, clean modern aesthetic, educational but engaging, subtle motion, professional background
```

**Concept Visualization:**
```
[COMPLEX CONCEPT] represented as [METAPHOR], animated diagram style, clear visual hierarchy, educational, clean lines, modern infographic aesthetic
```

---

## TIPS FOR BETTER RESULTS

1. **Be Specific**: "A woman" → "A confident 30-year-old woman with curly auburn hair"
2. **Include Motion**: Always describe what moves and how
3. **Reference Real Cameras**: "Shot on RED camera" adds quality cues
4. **Layer Descriptions**: Subject → Action → Environment → Lighting → Style
5. **Test Variations**: Generate 3-4 prompts and compare
6. **Iterate**: Use good outputs as references for refinement

---

## EXECUTION

When user provides a video concept:

1. Ask clarifying questions about style, mood, and platform
2. Generate optimized prompts using the frameworks above
3. Include variations for testing
4. Provide recommended settings
5. Suggest complementary audio/music style

---

*This command helps create professional AI video prompts optimized for each major platform.*
