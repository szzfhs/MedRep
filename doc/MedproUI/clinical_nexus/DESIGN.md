# Design System Document: The Clinical Precision Framework

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Laboratory"**

This design system moves beyond the "web portal" aesthetic to create a high-fidelity, immersive environment that mirrors the rigor of a clinical setting. We are not just building an educational platform; we are designing a digital laboratory. 

To achieve this, the system rejects the "boxed-in" layout of traditional academic software. Instead, it utilizes **The Layering Principle**—an editorial approach where depth is defined by tonal shifts and glassmorphism rather than rigid lines. By leveraging intentional asymmetry and high-contrast typography, we create an experience that feels authoritative yet breathable, guiding the student through complex medical data with the calm efficiency of a senior surgeon.

---

## 2. Colors & Surface Philosophy

The palette is anchored in a deep, institutional blue, supported by a sophisticated hierarchy of grayscale neutrals that prioritize optical comfort during long simulation sessions.

### Color Tokens
- **Primary Architecture:** `primary` (#003f87) for brand authority; `primary_container` (#0056b3) for interactive dominance.
- **Tonal Depth:** `surface` (#f8f9fa) is our laboratory floor. `surface_container_lowest` (#ffffff) acts as our sterile "work surface."
- **Functional Accents:** `tertiary` (#722b00) is used sparingly for critical warnings or physiological alerts, ensuring high visibility without causing "alarm fatigue."

### The "No-Line" Rule
Standard UI relies on 1px borders to separate content. In this system, **1px solid borders are prohibited for sectioning.** 
- **The Alternative:** Boundaries are defined by shifting from `surface` to `surface_container_low`. 
- **The Signature Polish:** Use `surface_container_lowest` for cards resting on a `surface_container` background. This "tonal lift" creates a cleaner, more scientific look than a stroke ever could.

### Glassmorphism & Tonal Gradients
To provide a "signature" feel, floating panels (like simulation controls or real-time vitals) should use a **Backdrop Blur (20px-30px)** combined with a 70% opacity `surface_container_lowest`. Main CTAs or Hero backgrounds should utilize a subtle linear gradient from `primary` to `primary_container` (135° angle) to add "soul" and depth to the academic environment.

---

## 3. Typography
We utilize a dual-typeface system to balance technical precision with modern readability.

*   **Display & Headlines (Manrope):** A geometric sans-serif that feels engineered and modern. Used for page titles and high-level data points.
    *   `display-lg` (3.5rem) / `headline-md` (1.75rem): Bold weights only.
*   **Body & Labels (Inter):** A highly legible, workhorse font designed for complex data. 
    *   `body-md` (0.875rem): The standard for all experimental descriptions and medical notes.
    *   `label-sm` (0.6875rem): Used for Echarts axis labels and metadata.

**Hierarchy Note:** Always pair a `headline-sm` in Manrope with a `label-md` in Inter (All Caps, 0.05em tracking) for section headers. This "Editorial Contrast" immediately signals the transition from "Content" to "Context."

---

## 4. Elevation & Depth

In a medical context, clarity is safety. We achieve hierarchy through **Tonal Layering** rather than traditional shadows.

- **The Stacking Principle:** 
    1. Base Level: `surface`
    2. Section Level: `surface_container_low`
    3. Content Level (Cards): `surface_container_lowest`
- **Ambient Shadows:** When an element must "float" (e.g., a modal or a floating action button), use an extra-diffused shadow: `box-shadow: 0 12px 40px rgba(0, 63, 135, 0.06);`. Note the blue tint in the shadow color—this keeps the "ink" from looking muddy.
- **The Ghost Border:** If a visual separator is required for accessibility, use `outline_variant` at **15% opacity**. This creates a "suggestion" of a boundary that doesn't clutter the scientific interface.

---

## 5. Components

### Cards & Listings
Cards must never have a border. Use a `0.5rem` (lg) corner radius. For experiment listings, the card title uses `title-md` (Manrope), and the progress indicator is a 4px-tall linear bar using the `primary` token. Vertical whitespace (using a 16px/24px/32px scale) is the primary divider—**forbid the use of horizontal rules.**

### Data Visualization (Echarts Integration)
- **Palette:** Use a sequence of `primary`, `secondary`, and `tertiary_fixed_dim`. 
- **Styling:** Line charts should have a 3px stroke width with a "Smooth" interpolation. Areas under the line should use a gradient from `primary_container` (20% opacity) to transparent.

### Input Fields
- **Resting State:** `surface_container_high` background, no border.
- **Active State:** `surface_container_lowest` background with a `primary` ghost border (20% opacity) and a 2px `primary` bottom-accent line.
- **Roundedness:** All inputs use the `md` (0.375rem) scale.

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `xl` (0.75rem) or `full` (9999px) roundedness. 
- **Secondary:** `surface_container_highest` background with `on_surface` text.
- **Tertiary (The "Clinician" Style):** Ghost style—text only in `primary_fixed_variant` with a subtle background shift on hover.

### Specialized Component: The Vitals Monitor
A custom component for medical simulations. A dark-themed container (`inverse_surface`) with a high-contrast `inverse_primary` sparkline and `display-sm` numerical values. This creates a "Control Room" feel within the browser.

---

## 6. Do's and Don'ts

### Do:
- **Do** use negative space as a functional tool. Medical data is dense; the UI shouldn't be.
- **Do** use "surface-tint" overlays on images or anatomy diagrams to integrate them into the color story.
- **Do** ensure all interactive elements have a minimum 44px hit target, even if the visual asset is smaller.

### Don't:
- **Don't** use 100% black (#000000) for text. Always use `on_surface` (#191c1d) to reduce eye strain during long study sessions.
- **Don't** use standard "Drop Shadows." If it looks like a 2010 web button, it's wrong.
- **Don't** crowd Echarts. If a chart has more than 5 data series, use a "Secondary Focus" toggle to hide/show data.

---

## 7. Spacing Scale
Stick strictly to a 4px-based grid for all padding and margins:
- **sm:** 4px | **md:** 8px | **lg:** 16px | **xl:** 24px | **2xl:** 40px | **3xl:** 64px