# Lindy Gradient Blending Analysis

**Source:** https://www.lindy.ai/
**Date:** January 22, 2026

## Key Observations

### Section Background Colors
1. **Hero Section**: Cream/beige (#FFF9E6 approximately)
2. **"How It Works" Section**: White (#FFFFFF) with subtle gradient
3. **Feature Cards**: Light mint/cyan gradient backgrounds
4. **Customer Stories**: White background

### Gradient Blending Technique

**Visual Analysis:**
- Sections do NOT have hard color breaks
- Each section appears to fade at the edges (top and bottom)
- The transition creates a "soft blend" effect between sections
- Gradients are **very subtle** - barely perceptible but create smooth flow

**Implementation Pattern:**
- Sections use `linear-gradient` with multiple color stops
- Gradient starts opaque in the center, fades to transparent/blend at edges
- Example pattern: `linear-gradient(to bottom, transparent 0%, color 10%, color 90%, transparent 100%)`
- This creates ~10% fade zones at top and bottom of each section

**Color Transitions Observed:**
1. Cream hero → fades at bottom
2. White "How it works" → fades at top and bottom
3. Feature cards have individual gradients (lavender, mint)
4. No harsh boundaries - everything blends

### Key Takeaways for Careerswarm

1. **Add vertical gradient masks** to each section:
   - Start: transparent or previous section color (0-10%)
   - Middle: solid section color (10-90%)
   - End: transparent or next section color (90-100%)

2. **Opacity levels**:
   - Very subtle: 0% → 100% → 0% over the section height
   - Fade zones should be ~10-15% of section height

3. **CSS Implementation**:
   ```css
   .section-cream-fade {
     background: linear-gradient(
       to bottom,
       transparent 0%,
       #FFF8E7 10%,
       #FFF8E7 90%,
       transparent 100%
     );
   }
   ```

4. **Layering approach**:
   - Base layer: solid background color
   - Top layer: gradient mask that fades at edges
   - This allows sections to "blend" into each other

5. **Visual effect**:
   - Creates seamless flow between sections
   - No harsh color breaks
   - Professional, polished appearance
   - Guides eye naturally down the page
