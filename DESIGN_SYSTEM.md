# CareerSwarm Design System Documentation

## 🎨 Current Design Philosophy

**Design Concept:** "Controlled Chaos to Order" - Entropy transforming into structured honeycomb patterns  
**Visual Metaphor:** Career data (chaos) → AI organization (swarm) → Structured applications (honeycomb)  
**Aesthetic:** Lindy-inspired, warm earthy tones, lab-clean interface with organic accents

---

## 📐 Typography

### Font Families

- **Body Text:** Inter (Google Fonts)
  - Weights: 300, 400, 500, 600, 700, 800, 900
  - Usage: All body copy, UI text, form inputs
  - Line height: 1.6
  - Letter spacing: 0

- **Headings:** Instrument Sans (fallback to system fonts)
  - Weight: 700 (Bold)
  - Line height: 1.1
  - Letter spacing: -0.02em (tight)

### Type Scale

```
H1: 48px / -0.03em letter-spacing
H2: 32px / -0.02em letter-spacing
H3: 24px / -0.02em letter-spacing
Body: 16px / 1.6 line-height
```

---

## 🎨 Color Palette

### Primary Colors (Light Mode)

```css
Primary (Action):     #F97316  /* Vibrant Matte Orange */
Primary Foreground:   #FFFFFF  /* White text on orange */

Secondary (Subtle):   #D4A574  /* Soft Amber */
Secondary Foreground: #111827  /* Dark text on amber */

Accent (Highlights):  #FED7AA  /* Light Orange */
Accent Foreground:    #111827  /* Dark text on light orange */
```

### Background & Surface

```css
Background:           #FFFFFF  /* Pure White - Lab aesthetic */
Foreground:           #111827  /* Near-black text */

Card:                 #FFFFFF  /* Content containers */
Card Foreground:      #111827  /* Text on cards */

Muted:                #F8FAFC  /* Cool Grey - section backgrounds */
Muted Foreground:     #6B7280  /* Grey text */
```

### Semantic Colors

```css
Destructive:          #F5E3E0  /* Soft Coral */
Destructive Foreground: #8C3A2B  /* Dark coral text */

Border:               rgba(249, 115, 22, 0.2)  /* Light orange with 20% opacity */
Input:                #F8FAFC  /* Light grey input backgrounds */
Ring (Focus):         #F97316  /* Orange focus rings */
```

### Extended Earthy Palette

```css
Cream:                #FFF8E7
Off-white:            #FEFDFB
Light Beige:          #F9F5EF
Honey Gold:           #E8D399
Warm Yellow:          #F4E5A1
Soft Amber:           #D4A574
Charcoal:             #2A2D34
Warm Grey:            #5A5A5A
Medium Grey:          #8C8C8C
Soft Lavender:        #E8E3F5
Light Mint:           #E3F5F0
Soft Coral:           #F5E3E0
```

### Chart Colors (Data Visualization)

```css
Chart 1:              #E3F5F0  /* Light Mint */
Chart 2:              #E8E3F5  /* Soft Lavender */
Chart 3:              #F4E5A1  /* Warm Yellow */
Chart 4:              #F5E3E0  /* Soft Coral */
Chart 5:              #E8D399  /* Honey Gold */
```

### Dark Mode (Optional)

```css
Background:           #2A2D34  /* Charcoal */
Foreground:           #F9F5EF  /* Light Beige */
Primary:              #E8D399  /* Honey Gold */
Card:                 #3A3D44  /* Lighter Charcoal */
```

---

## 🔲 Spacing & Layout

### Border Radius

```css
--radius: 0.5rem (8px) /* Lindy-style rounded corners */ --radius-sm: 4px
  --radius-md: 6px --radius-lg: 8px --radius-xl: 12px;
```

### Container Widths

```css
Mobile:    100% width, 1rem padding
Tablet:    100% width, 1.5rem padding
Desktop:   1280px max-width, 2rem padding
```

---

## ✨ Visual Effects & Patterns

### Background Patterns

**1. Dot Grid Background**

```css
.dot-grid-bg {
  background-image: radial-gradient(
    circle,
    rgba(0, 0, 0, 0.05) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
  mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
}
```

- **Usage:** Hero sections, feature backgrounds
- **Effect:** Subtle grid fading from center to edges

**2. Swarm Pattern**

```css
.swarm-pattern {
  background-image: radial-gradient(
    circle,
    rgba(244, 229, 161, 0.15) 1px,
    transparent 1px
  );
  background-size: 20px 20px;
}
```

- **Usage:** Section backgrounds, card overlays
- **Effect:** Light yellow dots suggesting movement/activity

**3. Hero Honeycomb Animation**

- **Left side:** Scattered hexagon fragments (chaos/entropy)
- **Center:** Streaming particles with glow (swarm/processing)
- **Right side:** Organized honeycomb structure (order/output)
- **Animation:** 20s float cycle, particles flow from chaos to structure

### Animations

```css
@keyframes scan {
  /* Scanning line effect - 4s duration */
  0% {
    top: 0%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

@keyframes float {
  /* Gentle floating motion - 6s duration */
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse-slow {
  /* Slow opacity pulse - 3s duration */
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes marquee {
  /* Horizontal scrolling - 30s duration */
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
```

---

## 🧩 Component Patterns

### Cards

- **Background:** Pure white (#FFFFFF)
- **Border:** Light orange with 20% opacity
- **Border Radius:** 8px
- **Shadow:** Subtle elevation (defined by shadcn/ui)
- **Padding:** Consistent internal spacing via CardHeader/CardContent

### Buttons

- **Primary:** Orange background (#F97316), white text
- **Secondary:** Amber background (#D4A574), dark text
- **Ghost:** Transparent background, orange text on hover
- **Outline:** Transparent background, orange border

### Badges

- **Default:** Light orange background, dark text
- **Secondary:** Soft amber background
- **Destructive:** Soft coral background
- **Outline:** Transparent background, border only

### Progress Indicators

- **Track:** Light grey (#F8FAFC)
- **Fill:** Orange gradient (#F97316)
- **Height:** 8px standard, 12px for emphasis

---

## 🎯 Design Principles

### 1. **Clarity Over Complexity**

- Clean, uncluttered interfaces
- Generous whitespace
- Clear visual hierarchy

### 2. **Warm & Approachable**

- Earthy color palette (not cold corporate blues)
- Rounded corners (8px) for friendliness
- Organic patterns (honeycomb, swarm) vs rigid grids

### 3. **Data-Driven Aesthetics**

- Visual metaphors for AI processing (chaos → swarm → order)
- Animated transitions showing transformation
- Metrics and stats prominently displayed

### 4. **Professional Yet Human**

- Lab-clean white backgrounds
- Warm accent colors (orange, amber, gold)
- Personality through micro-animations

### 5. **Accessibility First**

- High contrast ratios (WCAG AA compliant)
- Clear focus states (orange ring)
- Readable typography (16px base, 1.6 line-height)

---

## 📱 Responsive Behavior

### Breakpoints

```css
Mobile:    < 640px
Tablet:    640px - 1024px
Desktop:   > 1024px
```

### Layout Patterns

- **Mobile:** Single column, stacked cards
- **Tablet:** 2-column grid for cards, sidebar collapses
- **Desktop:** Full sidebar navigation, 3-column grids

---

## 🔧 Component Library

**UI Framework:** shadcn/ui (Tailwind CSS + Radix UI)

**Available Components:**

- Button, Card, Badge, Progress
- Dialog, Popover, Select, Input
- Tabs, Accordion, Collapsible
- Avatar, Skeleton, Separator
- Alert, Toast (alerts via window.alert currently)

---

## 🎨 Visual Identity Summary

**Brand Personality:**

- Intelligent but approachable
- Organized but not rigid
- Professional but warm
- Data-driven but human

**Key Visual Elements:**

1. **Orange (#F97316)** - Energy, action, transformation
2. **Honeycomb Pattern** - Organization, structure, efficiency
3. **Swarm Metaphor** - Collective intelligence, AI processing
4. **Earthy Tones** - Trust, stability, warmth
5. **Clean White Space** - Clarity, focus, professionalism

**Inspiration:**

- Lindy effect (timeless, proven design patterns)
- Laboratory aesthetics (clean, precise, scientific)
- Natural systems (honeycomb, swarms, organic growth)
- Modern SaaS (Notion, Linear, Stripe)

---

## 📝 Usage Notes

### Current Implementation

- All pages use consistent color palette
- Typography scales properly across devices
- Animations are subtle and purposeful
- Dark mode is defined but not actively used (light mode is primary)

### Areas for Enhancement

1. **Micro-interactions:** Add more button hover states, loading animations
2. **Illustrations:** Custom SVG illustrations for empty states
3. **Data Visualization:** Enhanced chart styling with custom colors
4. **Onboarding Flow:** More visual progress indicators
5. **Mobile Polish:** Optimize touch targets, improve mobile navigation

---

## 🔗 Design References

**Color Palette Tool:** Use OKLCH color format for Tailwind 4  
**Typography:** Inter (body) + Instrument Sans (headings)  
**Component Library:** shadcn/ui documentation  
**Animation Inspiration:** Framer Motion, GSAP examples  
**Pattern Library:** Hero Patterns, Cool Backgrounds
