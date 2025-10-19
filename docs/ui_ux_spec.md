# Classroom Management Tool - UI/UX Design Specification

## Document Purpose
Complete UI/UX specifications including layouts, 6 color themes, component specs, and interactions.

---

## Color Themes

### Theme System
Users can switch between 6 themes in Settings. Each theme defines background, text, UI, and status colors.

---

### Calm Themes

#### 1. Blue Serenity (Default)
```css
--bg-primary: #1a1f2e;      /* Main background */
--bg-surface: #242b3d;      /* Cards, panels */
--bg-elevated: #2d3548;     /* Elevated elements */

--text-primary: #e4e6eb;    /* Main text */
--text-secondary: #b8bcc8;  /* Secondary text */
--text-disabled: #6b7280;   /* Disabled text */

--color-primary: #4a9eff;   /* Primary actions */
--color-secondary: #64b5f6; /* Secondary actions */
--color-accent: #81c784;    /* Accents */

--color-success: #81c784;   /* Green zone */
--color-warning: #ffb74d;   /* Yellow zone */
--color-error: #e57373;     /* Red zone */
--color-info: #64b5f6;      /* Info */
```

#### 2. Forest Mist
```css
--bg-primary: #1c2321;
--bg-surface: #263532;
--text-primary: #e8f4f2;
--color-primary: #4db6ac;
--color-accent: #a5d6a7;
```

#### 3. Twilight
```css
--bg-primary: #2d2838;
--bg-surface: #3d3650;
--text-primary: #f0e7e7;
--color-primary: #b39ddb;
--color-accent: #f48fb1;
```

---

### Energy Themes

#### 4. Vibrant Studio
```css
--bg-primary: #0f0f0f;
--bg-surface: #1e1e1e;
--text-primary: #ffffff;
--color-primary: #1db954;   /* Bright green */
--color-secondary: #ffd700; /* Gold */
--color-accent: #ff6b35;    /* Bright orange */
```

#### 5. Electric Blue
```css
--bg-primary: #0a0e27;
--bg-surface: #151b3d;
--text-primary: #ffffff;
--color-primary: #00d4ff;   /* Cyan */
--color-accent: #ff0080;    /* Hot pink */
```

#### 6. Sunset Energy
```css
--bg-primary: #1a1a2e;
--bg-surface: #16213e;
--text-primary: #ffffff;
--color-primary: #ff6b6b;   /* Coral red */
--color-secondary: #feca57; /* Yellow */
--color-accent: #48dbfb;    /* Sky blue */
```

---

## Layout System

### Main Application Tabs
```
┌───────────────────────────────────┐
│  ⏱️     🎵     👥     🛠️     ⚙️   │
│ Timer  Audio  Class  Tools   Set  │
├───────────────────────────────────┤
│                                   │
│         [Tab Content]             │
│                                   │
└───────────────────────────────────┘
```

---

## Component Specifications

### Timer Tab

**Display**:
- Font size: 72px (or larger)
- Font family: Monospace
- Font weight: 700 (bold)
- Format: MM:SS

**Controls**:
- Buttons: 64px × 64px (circular)
- Icons: 32px
- Touch-friendly spacing: 16px gap
- Colors: Green (play), Yellow (pause), Red (stop)

**Preset Buttons**:
- Size: 80px × 48px
- Labels: "5 min", "10 min", "15 min", "30 min"
- Grid layout: 2×2

---

### Audio Tab

**Volume Sliders**:
- Width: 80% of panel
- Height: 8px track
- Thumb: 24px circle
- Range: 0-100%

**Sound Selection**:
- Dropdown or grid of cards
- Preview button (speaker icon)
- Current selection highlighted

**Music Player**:
- Play/Pause: 56px circular button
- Track name: Truncate with ellipsis
- Progress bar (if applicable)

---

### Noise Meter Tab

**Meter Display**:
- Type: Horizontal bar or semi-circle arc
- Width: 80% of panel
- Height: 24px (bar) or 120px (arc)
- Colors: Dynamic based on zone
  - Green: 0-60%
  - Yellow: 61-75%
  - Red: 76-100%
- Smooth transitions: 0.3s ease

**Threshold Sliders**:
- Two sliders for green/yellow and yellow/red boundaries
- Visual preview of zones

**History Chart**:
- Line chart, last 10 minutes
- Update every 10 seconds
- X-axis: Time, Y-axis: Noise level %

---

### Traffic Light Tab

**Display**:
- Circular lights: 120px diameter each
- Vertical stack: Red (top), Yellow (middle), Green (bottom)
- Active light: Full opacity + glow effect
- Inactive lights: 30% opacity

**Controls**:
- 3 buttons: Red, Yellow, Green
- Size: 100px × 60px
- Icons + text labels
- Keyboard shortcuts shown: (1), (2), (3)

**Auto Mode Toggle**:
- Switch component
- Label: "Auto mode based on noise"
- Configuration button (gear icon)

---

### Class Tab

**Class Selector**:
- Dropdown: Full width
- Shows: "Class 3A (24 students, 2 absent)"
- Manage button: Opens modal

**Student Actions**:
- Large buttons: 200px × 80px
- Icons + text
- Options:
  - 👤 Random Student
  - 👥 Generate Groups
  - ✓ Mark Absences

---

### Floating Windows

**Timer Floating**:
- Min size: 400px × 300px
- Display: MM:SS (96px font)
- Minimal controls

**Noise Meter Floating**:
- Min size: 400px × 300px
- Large meter display
- Current percentage (48px font)
- Color-coded status text

**Traffic Light Floating**:
- Min size: 300px × 500px
- Large circular lights (150px each)
- Minimal text

---

## Touch Optimization

### Hit Targets
- Minimum: 44px × 44px (W3C recommendation)
- Preferred: 56px × 56px
- Spacing: Minimum 8px between touch targets

### Gestures
- Tap: Primary interaction
- Long press: Context menu (if applicable)
- Drag: For floating windows
- Swipe: Not used (avoid conflicts with OneNote)

---

## Accessibility

### Keyboard Navigation
- Tab order: Logical left-to-right, top-to-bottom
- Focus indicators: 2px outline, high contrast
- Shortcuts: Listed in tooltips

### Screen Reader
- Semantic HTML: `<button>`, `<input>`, `<section>`
- ARIA labels: For icons and complex components
- Live regions: For timer updates, alerts

### Color Contrast
- Text: Minimum 4.5:1 ratio (WCAG AA)
- UI elements: Minimum 3:1 ratio
- Test with all 6 themes

---

## Responsive Behavior

### Window Sizes
- Minimum: 800px × 600px
- Optimal: 1200px × 800px
- Maximum: No limit (scales up)

### Overlay Mode
- Fixed size: 200px × 60px
- Draggable to any screen position
- Remember position (persist)

### Fullscreen Mode
- Scale elements proportionally
- Maintain readability from 5+ meters distance

---

## Animations & Transitions

### Standard Transitions
- Duration: 200-300ms
- Easing: `ease-in-out`
- Properties: opacity, transform, background-color

### Specific Animations
- Random Student: 2-second slot machine effect
- Timer Alert: Pulse effect (scale 1.0 → 1.1 → 1.0)
- Traffic Light Change: Fade transition (300ms)
- Noise Meter: Smooth fill animation (100ms)

---

## Iconography

### Icon Set
Use: Lucide React icons (or similar)

### Sizes
- Small: 16px (inline text)
- Medium: 24px (buttons)
- Large: 32px (primary actions)
- XL: 48px (floating windows)

### Style
- Stroke width: 2px
- Style: Outlined (not filled)
- Color: Inherit from theme

---

## Typography

### Font Family
```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'Roboto Mono', monospace;
```

### Scale
```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 32px;
--text-4xl: 48px;
--text-5xl: 64px;
--text-6xl: 96px;
```

### Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## Spacing System

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

---

## Border Radius

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px; /* Circular */
```

---

## Implementation Notes

### Tailwind Configuration
All design tokens should be defined in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Theme colors as CSS variables
      },
      fontSize: {
        // Typography scale
      },
      spacing: {
        // Spacing system
      }
    }
  }
}
```

### Theme Switching
- Store selected theme in Zustand
- Apply theme class to root element
- CSS variables update automatically

---

## Reference Screens

### Normal Mode
- Timer visible in tab
- Noise meter monitoring
- Traffic light shows current state

### Overlay Mode
- Minimized widget shows key info
- Tap to expand controls
- Draggable position

### Fullscreen Mode
- Large timer or traffic light
- Minimal controls
- ESC to exit

---

This specification ensures consistent, accessible, and visually appealing UI across all 6 themes and application modes.