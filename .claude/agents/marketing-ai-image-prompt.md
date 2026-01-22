---
name: ai-image-prompt
description: "Sigma marketing command: ai-image-prompt"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# ai-image-prompt

**Source:** Sigma Protocol marketing module
**Version:** 1.0.0

---

# AI Image Generation Prompt Creator

**Generate optimized prompts for Midjourney, DALL-E 3, Stable Diffusion, and Flux**

---

## INPUTS REQUIRED

Before generating, gather:
- **Subject**: What's the main focus?
- **Style**: Photorealistic, illustration, 3D, artistic
- **Purpose**: Social media, thumbnail, marketing, product
- **Mood**: The emotion you want to convey
- **Platform**: Which AI tool will be used

---

## UNIVERSAL PROMPT STRUCTURE

```
[Subject] + [Action/Pose] + [Setting/Background] + [Style] + [Lighting] + [Camera/Lens] + [Quality Tags] + [Artistic References]
```

---

## MIDJOURNEY PROMPT TEMPLATES

### Portrait/Person

**Professional Headshot:**
```
Professional headshot of a [AGE] [GENDER] [ETHNICITY] [DESCRIPTION], confident expression, [CLOTHING], clean studio background, soft key lighting, shallow depth of field, shot on Canon 5D Mark IV, 85mm lens, corporate photography --ar 3:4 --v 6
```

**Lifestyle:**
```
[PERSON DESCRIPTION] [ACTION] in [LOCATION], candid moment, golden hour lighting, lifestyle photography, warm tones, shot on Sony A7III, 35mm lens, documentary style --ar 16:9 --v 6
```

### Product Photography

**Hero Shot:**
```
Product photography of [PRODUCT], floating in air, dramatic studio lighting, [COLOR] gradient background, reflective surface, commercial photography, 8K, hyperrealistic --ar 1:1 --v 6
```

**Lifestyle Context:**
```
[PRODUCT] in [USE CONTEXT], lifestyle setting, soft natural light, shallow depth of field, premium feel, magazine advertisement quality --ar 16:9 --v 6
```

### Thumbnails

**YouTube Thumbnail:**
```
[SUBJECT] with [EXPRESSION] expression, bold dramatic lighting, vibrant [COLOR] background with gradient, text space on [SIDE], high contrast, eye-catching, YouTube thumbnail style --ar 16:9 --v 6
```

### Abstract/Artistic

**Concept Visualization:**
```
Abstract representation of [CONCEPT], [STYLE like fluid art/geometric/organic], [COLOR PALETTE], ethereal atmosphere, digital art, trending on Artstation --ar 16:9 --v 6
```

### Midjourney Parameters Cheat Sheet

```
--ar [W:H]    → Aspect ratio (16:9, 9:16, 1:1, 3:4)
--v 6         → Version 6 (latest)
--style raw   → Less Midjourney "style", more literal
--s [0-1000]  → Stylize (higher = more artistic)
--c [0-100]   → Chaos (higher = more variety)
--q 2         → Quality (1, 2, or .5)
--no [thing]  → Negative prompt
--sref [URL]  → Style reference image
--cref [URL]  → Character reference
--tile        → Seamless pattern
```

---

## DALL-E 3 PROMPT TEMPLATES

### Best Practices for DALL-E 3
- Be descriptive and specific
- Include style references
- Mention what NOT to include
- Works well with natural language

**Product:**
```
A professional product photograph of [PRODUCT] on a clean white surface with soft studio lighting. The [PRODUCT] should be the focal point, positioned slightly off-center. Add subtle shadows for depth. The style should be similar to Apple product photography - minimal, elegant, and premium feeling. High resolution, commercial quality.
```

**Illustration:**
```
A [STYLE] style illustration of [SUBJECT], featuring [SPECIFIC DETAILS]. The color palette should include [COLORS]. The composition should have [DESCRIPTION]. Style reference: similar to [ARTIST/BRAND] illustrations. Do not include any text, watermarks, or logos.
```

**Realistic Scene:**
```
A photorealistic image of [SCENE DESCRIPTION]. Time of day: [TIME]. Weather: [WEATHER]. The mood should feel [EMOTION]. Camera perspective: [ANGLE]. Lighting: [DESCRIPTION]. The image should look like it was taken with a professional DSLR camera.
```

### DALL-E 3 Specific Tips:
- Accepts longer, more conversational prompts
- Great at following specific instructions
- Can generate text in images (use carefully)
- Best for realistic and illustrative styles

---

## STABLE DIFFUSION PROMPT TEMPLATES

### Structure
```
[Quality Tags], [Subject], [Details], [Style], [Lighting], [Camera]
```

**Photorealistic:**
```
masterpiece, best quality, photorealistic, 8k uhd, dslr, high quality, [SUBJECT DESCRIPTION], [SETTING], [LIGHTING], shot on Canon EOS R5, 85mm f/1.4 lens, shallow depth of field
```

**Anime/Illustration:**
```
masterpiece, best quality, [ANIME STYLE like "by studio ghibli"], [CHARACTER DESCRIPTION], [SCENE], [ACTION], vibrant colors, detailed background, professional illustration
```

**Negative Prompt (Always Include):**
```
lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, deformed, distorted, disfigured, mutation, mutated, ugly
```

### Stable Diffusion Models:
- **SDXL**: Best for general purpose
- **Realistic Vision**: Photorealistic humans
- **DreamShaper**: Fantasy/artistic
- **Juggernaut**: High quality realistic

---

## FLUX PROMPT TEMPLATES

### Flux Strengths
- Excellent text rendering
- High detail retention
- Good prompt following

**With Text:**
```
A [STYLE] image of [SUBJECT] with text that says "[YOUR TEXT]" in [FONT STYLE] typography, [ADDITIONAL DETAILS], high quality, detailed
```

**Product with Label:**
```
Professional product photograph of [PRODUCT] with clearly visible label showing "[TEXT]", studio lighting, [BACKGROUND], commercial photography quality
```

---

## STYLE REFERENCE LIBRARY

### Photography Styles
```
- "shot on Hasselblad" (medium format quality)
- "shot on Leica" (street photography feel)
- "Polaroid aesthetic" (vintage, warm)
- "editorial photography" (magazine quality)
- "photojournalism" (documentary feel)
```

### Artistic Styles
```
- "trending on ArtStation" (digital art quality)
- "by Greg Rutkowski" (fantasy art)
- "Studio Ghibli style" (anime)
- "Pixar 3D style" (3D animation)
- "cyberpunk aesthetic"
- "cottagecore aesthetic"
- "dark academia"
- "vaporwave"
```

### Lighting Terms
```
- "Rembrandt lighting" (dramatic portrait)
- "butterfly lighting" (beauty/glamour)
- "rim lighting" (edge highlight)
- "volumetric lighting" (god rays)
- "neon lighting" (cyberpunk)
- "soft box lighting" (studio)
```

---

## OUTPUT FORMAT

Generate prompts in this structure:

```markdown
## Image Prompt Package

### Concept
[Description of the image]

### Midjourney Prompt
```
[Optimized Midjourney prompt with parameters]
```

### DALL-E 3 Prompt
```
[Natural language prompt for DALL-E]
```

### Stable Diffusion Prompt
```
Positive: [prompt]
Negative: [negative prompt]
Model recommendation: [model]
```

### Flux Prompt (if text needed)
```
[Flux-optimized prompt]
```

### Recommended Settings
- Aspect Ratio: [X:Y]
- Use case: [purpose]
- Variations to try: [list]

### Post-Processing Suggestions
- [Editing recommendations]
```

---

## COMMON USE CASES

### Social Media

**Instagram Post:**
```
Aesthetic [THEME] flat lay arrangement of [ITEMS], [COLOR SCHEME], soft natural lighting from above, lifestyle photography, Instagram-worthy, cohesive feed aesthetic --ar 1:1 --v 6
```

**LinkedIn Banner:**
```
Professional abstract background with [THEME] elements, [BRAND COLORS], modern corporate aesthetic, subtle geometric patterns, space for text overlay on left --ar 4:1 --v 6
```

### Marketing

**Hero Image:**
```
[PRODUCT/SERVICE] concept visualization, [BENEFIT shown visually], aspirational, premium feel, [TARGET AUDIENCE appeal], marketing hero image, commercial photography --ar 16:9 --v 6
```

**Email Header:**
```
Clean modern header image for [TOPIC], [COLOR SCHEME], minimal design, space for text overlay, professional, corporate communication style --ar 3:1 --v 6
```

### Course/Educational

**Module Cover:**
```
Educational concept art for "[MODULE TOPIC]", visual metaphor showing [CONCEPT], professional, inspiring, clean design, [COLOR SCHEME], course thumbnail --ar 16:9 --v 6
```

---

## TIPS FOR BETTER RESULTS

1. **Order Matters**: Put most important elements first
2. **Be Specific**: "Woman" → "30-year-old woman with short black hair"
3. **Use References**: "in the style of [Artist/Brand]"
4. **Include Mood**: "serene", "energetic", "mysterious"
5. **Specify What NOT to Include**: Avoid common AI artifacts
6. **Test Aspect Ratios**: Different ratios for different uses
7. **Iterate**: Use good outputs to refine prompts

---

## EXECUTION

When user provides an image request:

1. Clarify the purpose and platform
2. Generate optimized prompts for each AI tool
3. Include appropriate parameters/settings
4. Suggest variations to test
5. Recommend post-processing if needed

---

*This command creates professional image generation prompts optimized for each major AI platform.*

