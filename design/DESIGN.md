# DESIGN.md
### Visual & Interaction Specification — Abyud Shetty Portfolio
**Concept:** *A spatial map of the systems and experiences I've built.*

---

## 0. Preface — sources consulted, and one correction

**Read for this document:**
- `PROJECT_INVENTORY.md` (final state, all user decisions applied — 5 Tier-1 featured, 1 Tier-2 featured, 6 Tier-3 secondary, 1 Experience, 9 excluded).
- **Skiper UI components** — all 13 `.tsx` files read directly from source. *Note: these are at `SkipperUI/` in the project root, not `design/references/skiper/`. Recommend moving them to `design/references/skiper/` before implementation so the reference material lives with this spec.*
- **Vengeance UI** — the repository/reference material was **not present anywhere in the workspace** (searched the project tree, home directory, Downloads, Desktop). Rather than guess, the component catalog was verified from the library's own public documentation. Every Vengeance component named below is a real component confirmed in that catalog. What could **not** be verified from documentation is the library's exact default styling — its doc pages describe behavior, not colors. This matters, so it is stated as an assumption, not a fact: **libraries in this genre of "animated React component" collections almost always ship a glow-heavy, gradient-forward default theme — precisely the aesthetic this brief forbids.** Every Vengeance recommendation below therefore assumes stock styling must be stripped, not tuned. If the actual repo is added to the workspace later, re-verify the defaults against §3 and §4.

Sources: [Vengeance UI components overview](https://www.vengenceui.com/docs/components-overview) · [Vengeance UI docs](https://www.vengenceui.com/docs)

---

## 1. The identity — what this site actually is

Before any component decision, the identity has to come from the work itself. The inventory makes the through-line obvious once it's read as a whole:

> **Almost every project Abyud has built is an instrument that observes, reconstructs, or simulates a real system.**
>
> A financial control plane that watches transactions and correlates them into incidents (AEGIS). A physiological digital twin that models an astronaut's sleep and vestibular coupling (Astronaut Digital Twin). A triage simulator running a real physiology engine (CardioTriage). A reconstruction of a real human body from ten body-worn IMUs (the internship). A reconstruction of a real place from Gaussian splats. A consensus cluster you can watch elect leaders (MiniRAFT). A business idea compiled into an operating simulation (Reality Compiler).

So the portfolio is not a gallery. **It is an instrument for surveying a field of built systems.** That single sentence is the design brief, and it drives every decision below.

### What this buys us (and what it rules out)

| Because the site is an instrument… | …the design does this | …and never does this |
|---|---|---|
| Instruments measure | Every object has a fixed coordinate, a scale, a readout | Objects drifting decoratively with no position meaning |
| Instruments are machined | Graphite, brushed metal, precision hairlines, one signal color | Neon, glow-for-glow's-sake, gradient soup |
| Instruments have one light source | A single cool key + a warm bounce, physically consistent | Objects that self-illuminate because it looks cool |
| Instruments are legible under pressure | Editorial typography, mono labeling, real contrast | Text sacrificed to an effect |
| Instruments have honest readouts | Status chips that say `PROTOTYPE`, `TEAM PROJECT`, `PAPER IN PREPARATION` | Marketing gloss over what the inventory actually found |

That last row is a genuine identity asset. The inventory forced a set of honest caveats (Reality-Compiler's stubbed backend, VRATA's unpublished paper, collaborative authorship). Most portfolios hide this. **Designing the honesty as a first-class visual system — a real instrument readout — is the single most distinguishing decision available here.** It is impossible for a generated template to imitate, because it comes from the audit.

### The metaphor guardrail

The field is **not space**. No stars, no planets, no nebulae, no orbiting. That is the fastest route to "generic AI portfolio."

The field is a **measured volume** — closer to a wind-tunnel test chamber, a survey site, or a photographic studio for objects: a floor with a reference grid, a horizon, one key light, and a set of specimens held at measured depths.

---

## 2. Color palette

Dark graphite, one warm signal, mineral category accents. **No purple. No cyan. No blue-violet gradient.**

### 2.1 Environment

| Token | Value | Use |
|---|---|---|
| `--void` | `#08090A` | Deepest field distance; behind everything |
| `--graphite-900` | `#0E1011` | Page background, 3D scene clear color |
| `--graphite-800` | `#141719` | Base surface (index rows, footer) |
| `--graphite-700` | `#1B1F22` | Raised surface (cards, panels) |
| `--graphite-600` | `#24292D` | Elevated / hover surface |
| `--graphite-500` | `#2F353A` | Dividers, inactive strokes |
| `--graphite-400` | `#3D444B` | Strong border, disabled control edge |

The background is **not pure black.** `#0E1011` keeps a trace of blue-green so the warm accent reads as warm. Pure black kills the temperature contrast that makes dark UI feel physical.

### 2.2 Glass (overlays, never solids)

| Token | Value | Blur | Use |
|---|---|---|---|
| `--glass-thin` | `rgba(255,255,255,0.04)` | 12px | Floating labels, tag chips, cursor readout |
| `--glass-regular` | `rgba(22,25,28,0.55)` | 20px | Dock, top rail, tooltips |
| `--glass-deep` | `rgba(10,11,12,0.72)` | 32px | Project detail panel, modal surfaces |
| `--glass-highlight` | `rgba(255,255,255,0.10)` | — | Top-edge light catch only |

### 2.3 Edges — the light-catch rule

A flat 1px border at uniform opacity is the tell of fake glass. Real glass has a lit top edge and a shadowed bottom edge.

| Token | Value | Use |
|---|---|---|
| `--edge-hairline` | `rgba(255,255,255,0.07)` | Default border |
| `--edge-soft` | `rgba(255,255,255,0.12)` | Hover border |
| `--edge-active` | `rgba(255,255,255,0.22)` | Focused / selected border |
| `--edge-catch-top` | `rgba(255,255,255,0.18)` | **Inset top 1px on every glass surface** |
| `--edge-catch-bottom` | `rgba(0,0,0,0.50)` | **Inset bottom 1px on every glass surface** |

Implemented as `box-shadow: inset 0 1px 0 var(--edge-catch-top), inset 0 -1px 0 var(--edge-catch-bottom)`. This single detail does more for perceived quality than any amount of blur.

### 2.4 Text

| Token | Value | Contrast on `--graphite-900` | Use |
|---|---|---|---|
| `--text-primary` | `#ECEEF0` | 15.8:1 | Headlines, body |
| `--text-secondary` | `#A2A9B0` | 7.9:1 | Supporting copy, descriptions |
| `--text-tertiary` | `#6E767E` | 4.1:1 | Labels, coordinates, metadata — **≥14px only** |
| `--text-disabled` | `#4A5158` | 2.3:1 | Non-informational decoration only — never conveys meaning |

Never pure `#FFFFFF` for body text. `--text-primary` is warm-neutral off-white; on a graphite ground it reads as paper, not screen glare.

### 2.5 Signal accent — one color, used at ≤5% of pixels

| Token | Value | Use |
|---|---|---|
| `--signal` | `#E8843C` | Active state, focus ring, selected object light, Experience node, live data emphasis |
| `--signal-dim` | `#A85E2B` | Pressed / secondary signal state |
| `--signal-wash` | `rgba(232,132,60,0.12)` | Focus halo, active row wash |

**Why warm amber:** it is the color of instrumentation — tungsten, machined brass, a warning lamp, a calibration LED. Against cold graphite it produces the temperature contrast that makes a dark interface feel like an object under a light rather than a dark webpage. It is also the single most direct rejection of the purple/cyan AI palette.

### 2.6 Category accents — mineral, desaturated, structural

Each accent is a **material**, not a hue. All are muted enough to sit inside glass without turning it into a colored lamp.

| Domain (from inventory) | Name | Value | Projects |
|---|---|---|---|
| AI / ML | **Oxide** | `#B4694A` | KiranaAI, Message-Notification-Router, Medivault |
| Computer Graphics | **Bone** | `#CBC3B4` | CardioTriage |
| XR / Spatial | **Aluminium** | `#8FA0AC` | 3D-Visualization-of-Gaussian-Splats |
| Systems / Distributed | **Moss** | `#6E8264` | AEGIS, MiniRAFT-DrawingBoard |
| Research | **Brass** | `#A88C4E` | Astronaut Digital Twin, VRATA |
| Product / Full-stack | **Slate** | `#7A8290` | Mock-IPL-Auction, Reality-Compiler, HCRM |
| **EXPERIENCE** | **Signal** | `#E8843C` | IMU-Reconstruction-SlimeVR *(only non-project element allowed the primary accent)* |

**Permitted uses of a category accent:** a 1–2px marker rule, a 4px dot, a label color, a faint internal tint in glass (≤8% opacity), a single hairline in the index.
**Forbidden:** background fills, gradients, glows, borders on more than one edge, colored shadows.

Note that a project sitting in two domains (e.g. Astronaut Digital Twin is Research *and* Computer Graphics) takes **one** primary accent — its lead domain. Dual-tinting objects turns the field into confetti.

---

## 3. Typography

Three families, three jobs, no overlap.

### 3.1 Display — `Instrument Serif`

High-contrast editorial serif. (The name is coincidence; the fit is not.)

- **Use for:** the hero statement, section titles, project titles in detail view, pull-quotes.
- **Sizes:** 36px minimum. Never below.
- **Tracking:** `-0.02em` at 48px, `-0.03em` at 72px+.
- **Weight:** Regular only. Never bold — the contrast is in the letterforms, not the weight.
- **Why:** it gives the site a *publication* quality. A developer portfolio that reads like a well-set journal is immediately not a template. This is the single strongest anti-generic typographic move available.
- **Fallback if serif reads wrong in review:** `PP Neue Montreal` or `Neue Haas Grotesk Display` — but then the editorial quality must be recovered through scale and spacing discipline instead.

### 3.2 Body / UI — `Geist Sans`

- **Use for:** all body copy, descriptions, buttons, navigation, index rows.
- **Sizes:** 13 / 15 / 18px.
- **Weights:** 400 body, 500 UI labels. 600 only for a single emphasized word in a paragraph.
- **Why Geist over Inter:** Inter is the default of every generated portfolio. Geist is engineered and slightly technical, pairs cleanly under a display serif, and signals developer-tool literacy without costume.

### 3.3 Mono — `Geist Mono`

This is where the developer identity lives — **as instrument labeling, not as a terminal theme.**

- **Use for:** coordinates (`AI-04 · 12.4, −3.1`), index numbers, stack lists, metrics, status chips, category labels, commit-share readouts, timestamps.
- **Never for:** body copy, headings, or any block longer than one line.
- **Treatment:** uppercase, `0.08em` tracking, `--text-tertiary`, 10–11px.
- **Why this works:** mono used as *measurement labeling* reads as precision engineering. Mono used as *body text* reads as "I themed my site like a terminal" — which the brief explicitly forbids. The distinction is strict and non-negotiable.

### 3.4 Scale

| Role | Size / Line / Tracking | Family |
|---|---|---|
| Display XL | 72 / 1.00 / −0.03em | Instrument Serif |
| Display L | 48 / 1.05 / −0.025em | Instrument Serif |
| Display M | 32 / 1.10 / −0.02em | Instrument Serif |
| Body L | 18 / 1.55 / −0.01em | Geist Sans |
| Body M | 15 / 1.60 / 0 | Geist Sans |
| Body S | 13 / 1.50 / 0 | Geist Sans |
| Label | 11 / 1.20 / 0.08em, uppercase | Geist Mono |
| Micro | 10 / 1.20 / 0.12em, uppercase | Geist Mono |

Measure: **68 characters maximum** for any paragraph. In the detail panel, 58.

---

## 4. Glass & material system

Glass is a **material with physical behavior**, not a decorative panel style.

### 4.1 The four tiers

| Tier | Composition | Where |
|---|---|---|
| **Normal glass** | `--glass-regular`, blur 20px, saturate 1.1, hairline edge + light-catch, radius 14px | Dock, top rail, tooltips, tag chips |
| **Deep glass** | `--glass-deep`, blur 32px, saturate 1.05, soft edge + light-catch, radius 18px, shadow `0 24px 60px rgba(0,0,0,0.55)` | Project detail panel, any surface that must dominate content behind it |
| **Highlighted glass** | Normal glass + `--edge-active` + `--signal-wash` inner top glow ≤10% + 1px signal hairline on the **left edge only** | Active nav item, focused card, selected index row |
| **Liquid glass** | WebGL only. `MeshTransmissionMaterial`: transmission 0.85–1.0, thickness 0.4–1.2, roughness 0.05–0.35, ior 1.35, chromaticAberration ≤0.02, distortion ≤0.15, anisotropy 0.1 | **Project objects in the 3D field only.** Nowhere else. |

### 4.2 The clarity rule — the core idea of this system

**Transmission and roughness encode importance.**

| Rank | Transmission | Roughness | Reads as |
|---|---|---|---|
| Experience (anchor) | 0.92 | 0.08 | Machined optical glass — you can see straight through it |
| Tier 1 featured | 0.88 | 0.12 | Clear, resolved |
| Tier 2 featured | 0.80 | 0.20 | Slightly veiled |
| Tier 3 secondary | 0.62 | 0.34 | Frosted — present, legible, not yet resolved |

So: **the more significant the work, the more clearly you can see into it.** Hovering a frosted secondary object *clarifies* it (roughness animates 0.34 → 0.18) — the interaction is literally "bringing it into focus." Depth, scale, and clarity all say the same thing, which is what makes the hierarchy feel authored rather than decorated.

### 4.3 Refraction & distortion

Glass objects refract **the reference grid and the objects behind them** — real content, physically displaced. This is what the brief means by "subtle refraction/distortion," and it only works if there is something behind the glass worth distorting. That is the reason the field has a grid floor at all.

Limits: chromatic aberration ≤0.02 (a hint of edge color, never a rainbow fringe). Distortion ≤0.15. Anything higher reads as a filter effect.

### 4.4 Shadow

| Token | Value |
|---|---|
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.40)` |
| `--shadow-md` | `0 12px 32px rgba(0,0,0,0.48)` |
| `--shadow-lg` | `0 24px 60px rgba(0,0,0,0.55)` |
| `--shadow-contact` | `0 1px 2px rgba(0,0,0,0.7)` — tight, under objects near the floor plane |

Shadows are **always neutral black**. Never colored, never signal-tinted. A colored shadow is the fastest way to look like a template.

### 4.5 When NOT to use glass

Hard list. Glass on all of these is a defect:

1. **Long-form reading surfaces.** The About layer and any paragraph over three lines sit on opaque `--graphite-800`.
2. **The Index.** The complete project list is opaque, editorial, type-on-graphite. It is the accessible spine of the site and must never depend on a blur.
3. **Nested inside other glass.** Glass on glass is never permitted. If a panel is glass, its children are flat.
4. **Small elements under 32px.** Blur on a 20px chip is invisible cost. Use `--graphite-600` instead.
5. **The grid, horizon, or any structural rule.**
6. **When `prefers-reduced-transparency` is set.** Every glass token has an opaque fallback (`--graphite-700` / `--graphite-800`).
7. **Anything that scrolls fast.** Blur repaint during momentum scroll is the main mobile jank source.

> **Ceiling: at most 2 glass surfaces visible at once in any viewport, excluding 3D objects.** If a third is needed, the composition is wrong.

---

## 5. Lighting philosophy

**One studio, physically consistent, no self-illumination.**

The field is lit like a product photograph of a machined object — because that is what the projects are being presented as.

| Light | Type | Color | Intensity | Position |
|---|---|---|---|---|
| **Key** | Directional | `#C8D4DC` (cool, ~5200K) | 1.0 | Upper-left, 35° elevation |
| **Fill** | Hemisphere | sky `#1A1E22` / ground `#0A0B0C` | 0.35 | — |
| **Bounce** | Point, large radius | `--signal` `#E8843C` | 0.18 | Lower-right, below horizon |
| **Rim** | Directional | `#DDE4E8` | 0.25 | Behind, high, defines object silhouettes |
| **Environment** | HDRI (studio, neutral) | — | 0.4 | Required for glass refraction to read |

### Rules

1. **Objects do not emit light.** The only exception: the *currently selected* object gets an internal emissive at ≤0.20 intensity in its category accent. One object, one time.
2. **The warm bounce is the whole trick.** A cool key with a low warm bounce from below is what separates "premium industrial" from "dark website." Do not remove it to save a light.
3. **Bloom:** threshold ≥0.9, intensity ≤0.25, radius small. It should only catch the top edge of glass and the signal accent. If bloom is visible on flat surfaces, it is too strong.
4. **No god rays, no volumetric fog beams, no lens flares, no light streaks.**
5. **Depth cueing instead of glow:** distant objects lose contrast and gain a slight atmospheric desaturation (fog color `#0E1011`, near 12, far 60). Distance is communicated by *loss*, not by dimming a glow.
6. **Vignette:** ≤0.25, soft. It frames the instrument. Anything stronger is a filter.
7. **Grain:** a static 2–3% film grain over the whole canvas. This is important — grain unifies WebGL and DOM layers into one image and is the strongest single cue that a dark site was art-directed rather than generated.

---

## 6. Motion language

**Motion is physics, not decoration.** Every animation answers "what moved, how heavy was it, and why."

### 6.1 The mass principle

Objects have mass proportional to their importance. Featured projects are heavy: they respond slower, with more inertia and a longer settle. Secondary projects are light: quick, crisp, less overshoot.

| Rank | Spring (stiffness / damping / mass) | Feel |
|---|---|---|
| Experience anchor | 120 / 26 / 1.6 | Massive, deliberate |
| Tier 1 | 150 / 24 / 1.3 | Weighty |
| Tier 2 | 180 / 22 / 1.1 | Responsive |
| Tier 3 | 220 / 20 / 0.9 | Light, quick |
| UI chrome | 300 / 30 / 1.0 | Immediate |

**This is how motion communicates hierarchy without a single label.** A user feels which projects matter before reading anything.

### 6.2 Timing & easing

| Category | Duration | Easing |
|---|---|---|
| Micro (hover, chip, icon) | 120–180ms | `cubic-bezier(0.32, 0.72, 0, 1)` |
| Standard (panel, reveal) | 280–420ms | `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out) |
| Spatial (camera, object approach) | 600–900ms | Spring, per table above |
| Page / view transition | 700ms | expo-out, matched to the reveal mask |

Never `linear`. Never `ease-in-out` on anything spatial — it reads as a slideshow.

### 6.3 Per-interaction specification

**Hover (project object)** — the object *approaches* rather than scales in place. Translate +1.2 units toward camera, scale 1.0 → 1.06, roughness drops (clarity rule §4.2), category accent hairline fades in, label block resolves (opacity 0 → 1, blur 6px → 0, y +6 → 0, staggered 40ms). Cursor readout picks up the coordinate. **No glow. No border pulse. No shadow bloom.**

**Hover (UI chrome)** — background steps one graphite level, edge steps `--edge-hairline` → `--edge-soft`, 140ms. That is all.

**Entrance** — the site *calibrates*: grid draws from horizon outward (700ms), objects settle into position from +3 depth with a stagger ordered **by importance** (Experience first, then Tier 1, then 2, then 3, 60ms apart), type resolves last. This is a boot sequence for an instrument, not a splash animation. Total ≤1.8s, skippable on any input.

**Scroll** — Lenis smooth scroll, lerp 0.09. Scroll drives **camera dolly**, not object animation. Objects hold their positions; the observer moves. Section transitions are camera moves with a defined start and end, never continuous drift.

**Camera** — dolly and pan only. **No orbiting, no auto-rotation, no bobbing idle.** A hovering camera that never settles is the single most common tell of an amateur WebGL portfolio. The camera is a tripod that moves deliberately between marked positions and then holds perfectly still.

**Project expansion (click)** — the deep experience opens with a **masked circular reveal expanding from the click point**, with a blur ramp (8px → 0) during the wipe — the View Transitions technique read from `skiper26.tsx`. Simultaneously the field camera pushes 2 units toward the object and the object's transmission goes to 1.0. Duration 700ms, expo-out. The transition *originates at the thing you clicked*, which is what makes it feel spatial instead of navigational.

**Return** — exact inverse, 520ms. The camera returns to the *same* marked position it left, never a new one. Losing your place in the field breaks the map.

**Reduced motion (`prefers-reduced-motion: reduce`)** — this is a **different composition, not a disabled one**:
- Camera moves become instant cuts between marked positions.
- Object approach becomes an opacity/border state change.
- Entrance calibration is skipped; the field renders settled.
- The circular reveal becomes a 120ms cross-fade.
- Grain stays (static), parallax is removed entirely, Lenis is disabled in favor of native scroll.
- Nothing loops, ever.

---

## 7. Spatial language

### 7.1 Depth bands

The field is measured. Objects sit in defined z-bands — never at arbitrary depths.

| Band | z-range | Contents | Scale |
|---|---|---|---|
| **Anchor plane** | `z = +2` | Experience node — forward of everything, mounted to the floor | 1.35× |
| **Near** | `z = 0 to −8` | Tier 1 featured (5) | 1.00× |
| **Mid** | `z = −10 to −16` | Tier 2 featured (1) | 0.78× |
| **Far** | `z = −18 to −30` | Tier 3 secondary (6) | 0.50× |
| **Ground** | `y = −2` | Reference grid plane | — |
| **Horizon** | fixed screen y ≈ 0.62 | Hairline, present in every view | — |

**Depth means importance. Nothing is placed at a depth for visual variety.**

### 7.2 Placement logic

Objects cluster by **domain** along the x-axis, so the field is legible as a map rather than a scatter:

```
        ← RESEARCH ──── AI/ML ──── GRAPHICS ──── XR ──── SYSTEMS ──── PRODUCT →
 near   Astronaut      KiranaAI    CardioTriage  Splats  AEGIS
 mid                   Msg-Router
 far    VRATA          Medivault                         MiniRAFT   IPL·RC·HCRM

 anchor plane ▸ [ IMU-RECONSTRUCTION-SLIMEVR ] — offset left, tethered to ground
```

Small deterministic jitter (±0.6 units, seeded — identical on every load) prevents a mechanical row without breaking the reading. **Positions are fixed constants in the codebase, never randomized at runtime**, because each project's coordinate is part of its identity (§9).

### 7.3 Coordinates as identity

Every object carries a printed coordinate: `SYS-01 · −8.2, 0.0, −4.1`. It appears in the object label, in the index row, in the detail panel header, and in the URL hash. This is the graphic device that makes "map" literal, gives the mono type a real job, and makes deep links feel like locations rather than routes.

### 7.4 Parallax

Three layers only, all subtle:

| Layer | Factor |
|---|---|
| Grid / horizon | 0.02 |
| Far band | 0.05 |
| Near band + anchor | 0.12 |
| Type overlay | 0.00 — **the typographic layer never parallaxes** |

Pointer-driven parallax is capped at ±8px total and eased at 0.06 lerp. Anything more turns the page into a fishbowl.

### 7.5 Interaction distances

| Threshold | Distance | Behavior |
|---|---|---|
| **Ambient** | > 320px from cursor | Resting state |
| **Proximity** | ≤ 320px | Label fades in at 40%, object begins slow drift toward cursor plane (≤0.3 units) |
| **Hover** | Cursor within object bounds | Full approach, clarity resolve, full label, cursor becomes ring |
| **Focus** | Click / Enter | Expansion transition |

Far-band (secondary) objects have a **larger** proximity radius (420px) so they are easier to acquire despite being smaller. Hierarchy governs presentation, never discoverability.

---

## 8. UI chrome

### 8.1 Navigation — a rail and a dock, not a navbar

**Top rail** (fixed, 56px, `--glass-regular`, hairline bottom edge): name at left in Instrument Serif 18px; center holds the live coordinate readout in mono; right holds a single `INDEX` link. That's it. No logo mark, no CTA button, no menu.

**Bottom dock** (`--glass-regular`, radius 16px, 8px padding, centered, 24px from bottom): the field's view controls — `FIELD` · `EXPERIENCE` · `INDEX` · `ABOUT` · `CONTACT`. Icon + micro-label. Active item uses highlighted glass with a signal hairline on its left edge. Dock items get a **magnetic pull of ≤4px** toward the cursor — the effect exists to make the dock feel physical, not to be noticed.

The dock is the right metaphor here: a dock is how an *operating environment* is navigated, which reinforces spatial computing without costume. It is also the only navigation pattern that survives the transition to mobile intact.

### 8.2 Cursor — an instrument reticle

Custom cursor, three states, all built from hairlines:

| State | Form |
|---|---|
| Default | 6px dot, `--text-secondary`, 60% opacity |
| Over interactive | 28px ring, 1px `--edge-active`, dot shrinks to 3px, 140ms spring |
| Over project object | 36px ring + mono coordinate readout trailing 12px below-right, category accent hairline on the ring |
| Dragging / panning | Ring collapses to a 2px horizontal bar |

Trails at lerp 0.22 — enough lag to feel like a physical instrument, little enough to stay accurate. **Hidden entirely on touch devices and when `prefers-reduced-motion` is set** (native cursor returns).

### 8.3 Buttons

| Variant | Spec |
|---|---|
| **Primary** | `--graphite-600` fill, `--edge-soft`, `--text-primary`, radius 8px, 40px height. Hover: `--graphite-500` + `--edge-active`. **No signal fill** — the accent is reserved for state, not for CTAs. |
| **Secondary** | Transparent, `--edge-hairline`, `--text-secondary`. Hover: `--graphite-700`. |
| **Ghost / inline** | Text + animated underline (Skiper `Link001`), arrow glyph nudges +2px on hover. |

Every button: `:focus-visible` → 2px `--signal` ring at 2px offset. Non-negotiable.

### 8.4 Tags (technology chips)

`--graphite-700` fill, `--edge-hairline`, mono 10px uppercase `--text-tertiary`, radius 4px, 20px height, 6px horizontal padding. **No color, no icons, no logos.** Vendor logos in tech chips are the single fastest way to look like a template. Maximum 6 shown, then `+4` in `--text-disabled`.

### 8.5 Status indicators — the honesty system

This is a signature component of the site, derived directly from the inventory's caveats.

| Status | Dot | Label | Applies to |
|---|---|---|---|
| **Live** | `--signal`, 4px, slow 2s pulse (opacity 1 → 0.55) | `LIVE DEMO` | Mock-IPL-Auction, Gaussian Splats |
| **Prototype** | Hollow ring, `--text-tertiary` | `PROTOTYPE · BACKEND STUBBED` | Reality-Compiler |
| **Research** | `Brass` filled | `RESEARCH · PAPER IN PREPARATION` | VRATA |
| **Team** | Half-filled | `TEAM PROJECT` | All collaborative projects. Commit counts are never displayed — the useful signal is that the work was collaborative, and a raw ratio implies a precision it does not carry. |
| **Coursework** | Hollow, `--graphite-400` | `ACADEMIC PROJECT` | HCRM, Medivault |

The pulse on `LIVE` is the **only looping animation permitted anywhere on the site** (see §13, rule 9). One heartbeat in the whole instrument, and it means something.

### 8.6 Links

Skiper `Link001` pattern: 0.05em rule under the text, origin-right scale-x 0 → 1 on hover from the left, 300ms, plus a diagonal arrow that fades and lifts. External links only get the arrow. Inline body links: `--text-primary` with a persistent `--graphite-400` underline that brightens to `--signal` on hover.

### 8.7 Tooltips

`--glass-regular`, radius 8px, mono 11px, 6/10px padding, 8px offset, 120ms delay-in / 0 delay-out, fade + 4px rise. Used for coordinates, full tech names, and commit-share explanations. Never for anything essential — tooltips are unavailable on touch.

### 8.8 Optional: ambient audio

If used at all: **off by default**, a single mute control in the dock using the Skiper `VolumeIcon` micro-interaction, ambient room tone only (no music), ≤ −28dB. Defaulting audio on is disqualifying.

---

## 9. Project visual hierarchy

Mapped directly from `PROJECT_INVENTORY.md`.

### 9.1 EXPERIENCE — structurally distinct, not just bigger

**IMU-Reconstruction-SlimeVR** is not a project bubble and must never read as one. It is differentiated on **five independent axes** so the distinction survives any single one being missed:

1. **Form.** Projects are glass *lenses* (convex, floating). The Experience is a **tethered vertical monolith with a visible stem to the ground plane and a base plate.** It is the only object in the field connected to the floor. Everything else floats; this one is *installed*.
2. **Position.** Alone on the anchor plane at `z = +2`, offset left, outside the domain clusters. It is never in a row with projects.
3. **Scale.** 1.35× — largest silhouette in the field.
4. **Color.** The only object permitted `--signal`. Its base plate carries a signal hairline; the key light picks it up warmer than everything else.
5. **Label.** A different typographic block: `EXPERIENCE` in Instrument Serif above a mono rule, with the role, the timeframe, and `TEAM`, versus projects' single-line mono coordinate label.

Its detail view is also structured differently — a **timeline layout** (hardware → firmware → transport → server IK → 3D viewer), tracing the pipeline as a sequence, rather than the project detail's problem/architecture/outcome structure. Experience is a *narrative*; projects are *artifacts*.

### 9.2 Tier 1 — Featured (5)

Scale 1.00 · Near band · transmission 0.88 · always-visible label · full detail experience.

| Project | Domain accent | Object character | Detail hero |
|---|---|---|---|
| **3D-Visualization-of-Gaussian-Splats** | Aluminium | Clearest lens in the field | **Live embedded splat viewer** — the single strongest exhibit on the site |
| **Astronaut Digital Twin** | Brass | Tall lens, faint internal layering (coupled models) | Coupled-ODE diagram + 3D dashboard capture |
| **AEGIS** | Moss | Faceted block (modular monolith) | Transaction-network graph, animated + 4 real screenshots |
| **CardioTriage** | Bone | Rounded, softly pulsing internal density | 3D heart model, physiology-driven |
| **KiranaAI** | Oxide | Wide lens, three internal strata (3 microservices) | Multilingual ingestion pipeline diagram |

**Object silhouettes differ per project.** Five identical spheres with different labels is a component demo. Each object's geometry should reference what the system *is* — layered, faceted, stratified, dense. This is the difference between a map and a chart.

### 9.3 Tier 2 — Featured, technical (1)

**Message-Notification-Router** — Oxide, scale 0.78, mid band. Its object is a **decision lattice**: visibly structured, non-organic — appropriate for a project whose entire thesis is that a deterministic scorecard, not an LLM, makes the final call. Detail view leads with the decision-engine diagram and the 244-test count.

### 9.4 Tier 3 — Secondary (6)

Scale 0.50 · far band · frosted (roughness 0.34) · label on proximity · lighter detail treatment (a panel, not a full experience).

Mock-IPL-Auction · MiniRAFT-DrawingBoard · VRATA · Reality-Compiler · Healthcare Records (HCRM) · Medivault

**Requirement met explicitly:** secondary projects are **never hidden behind a "show more" control.** They are always physically present in the field — visible, positioned, hoverable, keyboard-reachable — and they appear in full in the Index (§10.5) with the same metadata depth as featured work. They are *further away*, not *fewer*. That is the entire point of using depth as the hierarchy device: it lets everything exist at once without flattening importance.

### 9.5 Never rendered

The 9 excluded repositories appear nowhere — not in the field, not in the index, not in a footer list, not in a source comment.

---

## 10. Homepage composition

Not a page stack. **A single continuous survey in six movements**, driven by camera position. Scroll advances the camera between marked positions; the dock jumps between them directly.

### 10.0 Calibration (0–1.8s)
The instrument boots. Grid draws from the horizon outward, objects settle into place ordered by importance, type resolves last, a mono readout counts up the field census (`14 SYSTEMS · 6 DOMAINS · 1 EXPERIENCE`). Skippable by any input. **Not a loading spinner** — a spinner says "wait"; this says "the instrument is coming online."

### 10.1 Approach — the hero
Camera sits back from the field. The whole map is visible but unresolved (slight depth-of-field, far band soft). Overlaid, left-aligned, not centered:

> **Instrument Serif 72px** — *"I build systems that observe, reconstruct, and simulate the real world."*
> **Geist Sans 18px, `--text-secondary`** — one sentence of context.
> **Mono micro** — `SCROLL TO ENTER THE FIELD ↓`

No portrait photo, no "Hi, I'm…", no social icon row, no scroll-teaser mouse graphic. The field behind the type *is* the introduction.

### 10.2 The Field — the spatial map
The core. Camera settles into the field; depth-of-field resolves. Free exploration: hover to approach, click to open, drag to pan laterally (±12 units, clamped — you can survey the field, you cannot fly away from it). Domain labels sit on the ground plane in mono, anchored to their clusters. This is where the majority of session time should be spent, and it must be genuinely pleasant to just move around in.

### 10.3 The Anchor — Experience
The camera **travels to** the Experience monolith rather than the page scrolling to a section. It is the only movement in the site where the camera translates significantly along x. The monolith fills the left third; the timeline layout resolves on the right. The moment of *arriving somewhere specific* is what makes the internship read as structurally different — the site treats it as a **place**, not a card.

### 10.4 Specimen — project detail
Opened from any object via the circular reveal (§6.3). Structure:
- **Header:** coordinate · category · status chip(s) · title in Instrument Serif.
- **The artifact:** live embed (Splats), animated diagram (AEGIS, KiranaAI, Msg-Router), or real screenshots with scroll-dissolve (AEGIS's four captures, CardioTriage).
- **The problem** — two paragraphs, opaque surface, 58ch measure.
- **The build** — architecture, honestly scoped, with the inventory's caveats surfaced rather than buried.
- **Stack** — mono chips.
- **Links** — repo, live demo where one exists.
- **Adjacent work** — 2–3 related projects by domain, as small objects; clicking one moves the camera through the field rather than reloading a page.

Background: the field stays live and blurred behind `--glass-deep` at 30% opacity. **You never leave the map.**

### 10.5 The Index — the accessible spine
A complete, opaque, editorial list of all 12 projects + 1 experience. No WebGL, no glass, no motion beyond hover underlines. Columns: index number · coordinate · title · domain · status · year. Hovering a row shows a floating preview thumbnail near the cursor (Vengeance *Cursor Card*).

**This view is the site's accessibility guarantee and its content parity route.** Everything obtainable in 3D is obtainable here, and it is reachable from the dock, from the top rail, by keyboard, and at `/index` as a real URL. It should also be the fastest, calmest screen on the site — for the reader who wants the information and not the experience.

### 10.6 About & Contact — the colophon
A single quiet layer. Short bio (drawn from the profile README's own framing), a plain-text email with a Skiper underline link, GitHub, and a **colophon** naming the stack, the type, and the fact that the field's coordinates are hand-placed. The colophon is a developer-identity move that costs nothing and is impossible to fake.

---

## 11. Mobile strategy

**Do not shrink the field.** A 3D scene designed for lateral survey does not survive a 390px portrait viewport — the depth cues collapse, the type overlaps the objects, and the frame budget disappears.

### The transform: the field becomes a core sample

Rotate the concept 90°. On desktop the observer moves *through* a horizontal field. On mobile the observer descends *through a vertical stratum* — a core sample, drilled down through the same measured space.

```
   ── HORIZON ──────────────────
   ┃ +2   [ EXPERIENCE ]  ◀ anchored, full-bleed, signal
   ┃ ─────────────────────────
   ┃  0   [ Gaussian Splats ]
   ┃ −2   [ Astronaut Twin  ]     depth ruler runs down
   ┃ −4   [ AEGIS           ]     the left edge, ticked
   ┃ −6   [ CardioTriage    ]     and labeled in mono
   ┃ −8   [ KiranaAI        ]
   ┃ ─────────────────────────
   ┃ −12  [ Msg-Router      ]
   ┃ ─────────────────────────
   ┃ −18  [ secondary ×6 — paired, smaller ]
```

What carries over — the whole conceptual language survives intact:
- **Depth still means importance.** It is now vertical position + card scale.
- **The measured field survives** as a depth ruler with real tick marks down the left edge.
- **Coordinates survive** — same values, same mono treatment.
- **The clarity rule survives** — featured cards are crisp, secondary cards are lower-contrast until tapped.
- **Scale survives:** featured cards are full-bleed (100% width, 62vh); Tier 2 is 88% width; secondary projects are paired two-up at 44% width. **Featured work still physically occupies more of the screen.**
- **The Experience is still structurally different:** full-bleed, pinned at the top of the stratum, with the anchor rule and the signal accent.

What changes:
- **WebGL is limited to one canvas**, containing only the Experience object and, on capable devices, the hero. Everything else is a static render or a poster image. Below the "capable" threshold, zero WebGL.
- **Custom cursor removed** (no pointer). Hover-approach becomes **tap-to-expand in place** (the Skiper `HoverExpand` mechanic), then tap-again to open.
- **Parallax reduced to ≤4px**, driven by scroll only. No device-orientation motion — it causes nausea and drains battery.
- **The dock becomes a 4-item bottom bar**, thumb-height, with the Skiper hamburger morph for the overflow.
- **Detail views are full-screen routes**, not overlays.

The result is a mobile experience that is *the same idea in a different apparatus* — which is the requirement — rather than a degraded copy of the desktop scene.

---

## 12. Accessibility & performance constraints

### 12.1 WebGL containment

1. **WebGL is one layer of the site, never the site.** All text, navigation, and content live in the DOM. **No text is ever rendered into a WebGL texture** — it must be selectable, translatable, and searchable.
2. **Maximum one `<canvas>` per route.** The field canvas persists across in-site navigation rather than being torn down and recreated.
3. **Canvas pauses when out of view** (`IntersectionObserver`) and when the tab is hidden.
4. **Frame budget:** 60fps desktop, 30fps floor on mobile. Auto-degrade tiers:
   - **T0 (full):** transmission materials, bloom, grain, DOF.
   - **T1 (< 45fps for 2s):** DOF off, bloom off, transmission → physical material with an env map.
   - **T2 (< 30fps for 2s):** far band → sprites, grid simplified, shadows off.
   - **T3 (WebGL unavailable / `prefers-reduced-motion` / save-data):** **static composed poster image + the DOM Index.** The site remains complete.
5. **Asset budget:** ≤ 900KB total 3D payload, all geometry procedural or ≤ 20k triangles, textures ≤ 1024², KTX2/Draco compressed. No downloaded HDRIs over 1MB — bake a small studio env.
6. **Initial JS budget:** ≤ 180KB gzipped for first paint; the 3D bundle is lazy-loaded *after* content is interactive.

### 12.2 Content parity — the hard rule

**Every piece of project information is reachable without 3D, without hover, and without motion.** The Index (§10.5) and the detail routes are server-rendered, real URLs, fully readable with WebGL disabled. If a fact exists only inside the field, it does not exist.

### 12.3 Text & contrast

- Body ≥ 15px; mono labels ≥ 10px but only for non-essential metadata that is repeated in accessible text elsewhere.
- All body/UI text ≥ 4.5:1; large display ≥ 3:1. `--text-tertiary` is only permitted at ≥ 14px.
- **Text never sits directly on the 3D scene without a substrate** — either an opaque plate, a `--glass-deep` panel, or a scrim gradient. A headline over a moving field with nothing behind it will fail contrast at some camera position, and "usually readable" is not a standard.
- Never convey meaning by color alone — every category accent is paired with a text label; every status dot has its mono caption.

### 12.4 Keyboard & screen reader

- The field is a proper `role="list"` of focusable objects in **importance order** (Experience → T1 → T2 → T3). `Tab` traverses, `Enter` opens, `Escape` returns to the field at the same camera position.
- Focus moves the camera to frame the focused object — keyboard users get the same spatial feedback pointer users get.
- Visible focus ring (2px `--signal`, 2px offset) on every interactive element, never removed.
- The canvas is `aria-hidden="true"` with a parallel semantic DOM list; decorative motion is invisible to assistive tech.
- Skip link to the Index as the first focusable element.

### 12.5 Motion & transparency preferences

- `prefers-reduced-motion: reduce` → §6.3's reduced composition. **This is a designed state, not a broken one** — it must be reviewed as its own deliverable.
- `prefers-reduced-transparency: reduce` → all glass tokens fall back to opaque graphite. The design must still work; verify before shipping.
- `Save-Data: on` → T3 static tier.

---

## 13. Component map

### 13.1 Vengeance UI — pattern-by-pattern evaluation

Each candidate assessed on: **where**, **why it fits**, **direct or customized**, **generic risk**. Not all should be used — 7 of 18 are rejected outright.

| Pattern | Where | Why it fits | Direct / Custom | Generic risk | Verdict |
|---|---|---|---|---|---|
| **Glass Dock** | Primary navigation, all viewports | A dock reads as an *operating environment*, reinforcing spatial computing without costume; it's also the only nav pattern that survives mobile intact | **Custom** — strip vibrancy and icon glow, apply §4.1 normal glass + light-catch, mono micro-labels, ≤4px magnetic pull | Medium — stock docks are everywhere | **USE** |
| **Perspective Grid** | The field's ground plane and the mobile depth ruler | This is the backbone of the whole concept: a measured reference plane is what makes depth *mean* something, and what the glass refracts | **Custom** — thin `--graphite-500` lines at ≤8% opacity, no glow, no animation except the calibration draw-in | High if left neon (Tron) — **must be monochrome and nearly subliminal** | **USE — core motif** |
| **Light Lines** | Faint connective lines between projects sharing a domain | Makes relationships in the field visible; supports "map of systems" literally | **Custom** — 1px, ≤12% opacity, category accent, slow and sparse; a maximum of 6 lines on screen | High — gradient "data flow" lines are an AI-template staple | **USE — sparingly** |
| **Cursor Card** | Index rows (§10.5) | Hover a project name, get a floating preview near the cursor — editorial, precise, exactly right for a text-first index | **Light custom** — dark glass card, 4:3 thumbnail, mono caption | Low | **USE** |
| **Morph Text** | Hero sub-line: rotating domain words (`AI · GRAPHICS · XR · SYSTEMS`) | Blur-morph is a quiet alternative to the typewriter cliché; one small kinetic moment in an otherwise still hero | **Custom** — slow (2.4s hold), `--text-secondary`, blur ≤4px, no scale bounce | Medium | **USE — one instance only** |
| **Liquid Text** | The hero headline, once | Delivers the brief's "restrained liquid-glass" as a *single signature moment* rather than a texture applied everywhere | **Heavy custom** — amplitude ≤25% of default, monochrome, triggered on entry then still; **never idles** | **High** — liquid text on every heading is peak generic | **USE — exactly once, or drop** |
| **Scroll Dissolve Reveal** | Project detail image sequences (AEGIS's 4 screenshots; CardioTriage) | Dissolving between real captures as you scroll is a calm way to show a multi-screen product | **Light custom** — slower, no scale, no color shift | Low | **USE** |
| **Perspective Carousel** | Screenshot galleries *inside* a project detail only | Spring-driven depth carousel suits a small set of captures; must not compete with the field as a browsing metaphor | **Custom** — matte, no reflections, restrained rotation | Medium — becomes generic if used for project browsing | **USE — detail views only** |
| **Circular Gallery** | Optional "focus a domain" mode: spin through one cluster's projects | A ring is a legitimate second reading of a cluster and could serve the mobile domain filter | **Heavy custom** | Medium | **MAYBE — build only if the field alone proves hard to navigate; do not build speculatively** |
| **Staggered Grid** | The Index's optional card view; mobile secondary pairs | Offset/asymmetric composition is editorial in a way a uniform grid is not | **Custom** — graphite cards, hairline edges, no shadows-on-color | Medium | **MAYBE** |
| **Magnetic Spotlight** | Dock icons and primary buttons — the magnetic *pull* only | A ≤4px magnetic pull makes chrome feel physical; this is the premium-site detail (Linear, Vercel) done quietly | **Heavy custom** — take the magnetism, **discard the spotlight glow entirely** | **High** — the spotlight glow itself is a template signature | **USE the magnetism; REJECT the spotlight** |
| **3D Books Showcase** | — | The Three.js interactive-object technique is exactly what project objects need, but the *book* metaphor collides with the map metaphor | Technique only | — | **REJECT the metaphor, borrow the technique** (goes to custom R3F objects) |
| **Spotlight Navbar** | — | A cursor-following radial glow is precisely the "excessive glowing" the brief forbids, and adds nothing the rail + dock don't cover | — | **High** | **REJECT** |
| **Image Trail** | — | Cursor trails read as flashy-portfolio, not premium instrument; competes with the custom reticle | — | **High** | **REJECT** |
| **Expandable Bento Grid** | — | The brief explicitly rules out bento-grid portfolios. The expand-in-place *behavior* is already covered by the field's approach + reveal | — | **Very high** | **REJECT** |
| **Fluid Morph Background** | — | Organic morphing blobs are the visual core of the generic AI-gradient template | — | **Very high** | **REJECT** |
| **Liquid Ocean** | — | Wave fields are organic and blue; the palette and concept are machined and graphite. Wrong material, wrong metaphor | — | **High** | **REJECT** |
| **Animated Rays** | — | Light-ray heroes are SaaS-template shorthand. §5's single key light already provides directional light, physically motivated | — | **High** | **REJECT** — if a light shaft is ever wanted, author it in the 3D lighting rig, not as a background component |

**Net: 7 use, 2 maybe, 1 technique-only, 8 reject.** Restraint is the design.

### 13.2 Skiper UI — read from source, categorized

All 13 files were read. Categories per the brief:

#### Definitely use

| File | What it actually is | Use here | Customization |
|---|---|---|---|
| `skiper26.tsx` | View Transitions API reveal — circle/rectangle/polygon clip-path wipe from a chosen origin, with optional blur ramp | **The project-open transition** (§6.3). The single most valuable file in the set: a masked reveal originating at the click point is exactly what makes opening a project feel spatial | Heavy — discard the theme-toggle UI and options panel entirely; keep `createAnimation`, the circle variant, the blur ramp, 700ms expo-out |
| `skiper52.tsx` | `HoverExpand_001` — a row of narrow strips that expand into a wide panel on hover, revealing overlay metadata | **The mobile project stack** and the Index's optional card view. Directly implements "hover causes a project to expand and reveal more information" in 2D, no WebGL | Medium — dark glass, category hairline, real metadata (coordinate, status, stack) instead of an image code |
| `skiper40.tsx` | Five animated underline link variants (origin-swap sweeps, mix-blend reveal) + arrow glyph | **All links** — nav, index, footer, inline, external | Light — `Link001` as the standard; recolor to `--signal` on hover; keep the `motion-reduce` guards it already ships with |
| `skiper99.tsx` | Micro icon interactions: chevron nudge, hamburger↔close morph, mute toggle with a drawn slash | **Mobile menu, link arrows, optional audio control.** Exactly the restrained micro-motion quality this design needs | Light — recolor only |
| `skiper17.tsx` | `StickyCard_002` — GSAP ScrollTrigger pinned card stack; cards scale/rotate as the next slides over | **Project detail screenshot sequences**, as an alternative to Scroll Dissolve where captures should stack rather than cross-fade | Medium — reduce rotation from 5° to ≤2°, scale 0.7 → 0.88; keep Lenis |

#### Potentially use

| File | What it is | Where it might go | Condition |
|---|---|---|---|
| `skiper28.tsx` | Perspective text scroll — a `rotateX` tilted text wall scrolling within a sticky, perspective container | The About/manifesto layer — spatial type that reinforces physical depth | Only if it doesn't collide with the field's own perspective; must not be a second competing 3D idea on screen |
| `skiper87.tsx` | Scroll area with masked fade edges | Utility: the Index's long list, tech-chip overflow, detail-panel scroll | Pure utility, adopt silently |
| `skiper62.tsx` | `useLoop` hook + vertical text cycling | Backing hook for the rotating domain word in the hero — may be simpler than pulling Vengeance's Morph Text | Pick **one** of this or Morph Text, never both |
| `skiper102.tsx` | Draggable mono debug panel showing live values (mouse, count, keypress) | A hidden "instrument readout" easter egg — toggled by `~`, showing real camera coordinates and FPS | Only as a deliberate, discoverable detail that fits the instrument concept. Ship it hidden or not at all |
| `skiper19.tsx` | Scroll-progress-driven SVG path drawing (`pathLength` transform) | **Technique only** — the mechanism for drawing the domain connection lines (§13.1 Light Lines) as scroll progresses | Take the technique; the demo's cream/navy poster styling is irrelevant here |

#### Do not use

| File | What it is | Why not |
|---|---|---|
| `skiper64.tsx` | SVG gooey filter — blobs merging via `feGaussianBlur` + `feColorMatrix` | Gooey blob merging is the exact "liquid soup" aesthetic the brief rules out. The design's liquid quality comes from *refraction through glass*, not from surface tension. Rejecting this is what keeps "restrained" honest |
| `skiper50.tsx` | Swiper.js creative-effect 3D carousel | Redundant with Vengeance's Perspective Carousel, and adds a heavy dependency for a pattern already covered. Pick one carousel implementation; don't ship two |
| `skiper4.tsx` | Five animated light/dark theme toggle buttons | **The site is dark-only.** A theme toggle would require designing an entire second palette that contradicts the graphite identity. The animation craft is a useful quality bar; the component has no job here |
| `skiper26.tsx`'s options panel | Draggable variant/blur/gif configurator | Demo scaffolding. Extract the animation factory, delete the UI |

### 13.3 Custom components — the identity lives here

These cannot come from a library, and they are what make the site *this* site.

| Component | Purpose |
|---|---|
| `<SurveyField>` | The R3F scene root: camera rig, marked positions, depth bands, fog, post-processing chain |
| `<ProjectObject>` | A single glass specimen — per-project geometry, tier-driven material (clarity rule §4.2), tier-driven spring mass, proximity/hover/focus states |
| `<ExperienceAnchor>` | The tethered monolith: stem, base plate, signal light, its own label block. Deliberately a separate component from `ProjectObject` so the two can never drift toward looking alike |
| `<ReferenceGrid>` | Ground plane + horizon hairline + ground-plane domain labels + calibration draw-in |
| `<CoordinateLabel>` | The mono identity block (index · coordinate · category) used in the field, index, and detail header |
| `<StatusChip>` | The honesty system (§8.5) — the site's most content-specific component |
| `<InstrumentCursor>` | Three-state reticle with coordinate readout |
| `<FieldIndex>` | The opaque editorial list — the accessibility spine and content-parity route |
| `<SpecimenPanel>` | Project detail shell: header, artifact slot, scoped prose, stack, links, adjacent work |
| `<CalibrationSequence>` | The boot sequence (§10.0) |
| `<DegradeProvider>` | FPS sampling → T0–T3 tier switching (§12.1) |

### 13.4 React Three Fiber / Three.js

| Component | Purpose | Notes |
|---|---|---|
| `<Canvas>` (R3F) | Single persistent canvas | `dpr={[1, 1.75]}`, `powerPreference: high-performance`, capped |
| `MeshTransmissionMaterial` (drei) | Liquid glass on project objects | The clarity rule's implementation surface |
| `<Environment>` (drei) | Baked studio HDRI, ≤1MB | Required for refraction to read |
| `<AccumulativeShadows>` / contact shadows | Grounds objects to the plane | Critical for the Experience anchor — a tethered object with no contact shadow reads as floating anyway |
| `EffectComposer` — Bloom, DoF, Noise, Vignette | Post chain, in that order | All within §5's limits; the entire chain drops at T1 |
| `<Html>` (drei) | **Only** for object labels anchored in 3D | Everything else is regular DOM; labels use `occlude` and stay real text |
| Custom shader — grid | Reference plane with distance fade | Cheaper and cleaner than geometry lines |
| Lenis | Smooth scroll driving camera dolly | Disabled under reduced motion |

### 13.5 Priority

| Priority | Scope |
|---|---|
| **P0 — the site exists** | `SurveyField`, `ProjectObject`, `ExperienceAnchor`, `ReferenceGrid`, `FieldIndex`, `SpecimenPanel`, `StatusChip`, `CoordinateLabel`, Glass Dock, Skiper links, `DegradeProvider`, reduced-motion composition |
| **P1 — the site is good** | `skiper26` reveal transition, `InstrumentCursor`, `CalibrationSequence`, Cursor Card, Scroll Dissolve, mobile core-sample layout, Light Lines |
| **P2 — the site is polished** | Morph Text hero word, magnetic dock pull, Perspective Carousel in details, `skiper17` stacks, `skiper28` about layer |
| **P3 — only if everything above is excellent** | Circular Gallery domain mode, Staggered Grid index view, debug-panel easter egg, ambient audio, Liquid Text hero |

**P3 items are permitted to be cut permanently.** A finished P0–P1 beats a half-built P0–P3.

---

## 14. Design principles — hard rules for implementation

These are constraints, not aspirations. If a decision during implementation conflicts with one of these, the rule wins.

1. **Glass is a material, not a decoration.** It must refract, catch light on one edge, and shadow on the other. If a surface would look the same as a flat panel, make it a flat panel.

2. **Depth must have meaning.** Every z-position encodes importance. No object is placed at a depth for visual variety, and no object drifts through depth for atmosphere.

3. **Motion must communicate hierarchy.** Heavy things move slowly. If a Tier-3 project animates with the same spring as a Tier-1 project, the hierarchy is broken regardless of what the labels say.

4. **Important projects occupy more spatial volume.** Featured work is physically larger, nearer, and clearer. This is measurable in pixels, not implied by placement in a list.

5. **Secondary work is further away, never hidden.** No "show more" control, no truncated list, no collapsed section. Everything exists at once; distance does the ranking.

6. **The Experience is a place, not a card.** It is tethered to the ground, alone on its own plane, larger than everything, the only object permitted the signal accent, and it is reached by traveling to it.

7. **Do not animate something simply because it can be animated.** Every animation must answer: what moved, how heavy was it, and what did that tell the user? "It looked nice" is not an answer.

8. **One accent color, under 5% of pixels.** Amber means *active* or *live* or *experience*. When everything is signal-colored, nothing is.

9. **Exactly one looping animation on the entire site** — the `LIVE DEMO` status pulse. Nothing else may idle, breathe, drift, orbit, or shimmer at rest. A still interface is a confident one.

10. **Never sacrifice readability for a visual effect.** No text without a substrate over the 3D scene, ever. If a headline is beautiful but fails contrast at some camera position, the headline is wrong — not the contrast requirement.

11. **Do not use five different animation styles on one screen.** Maximum two motion idioms in any viewport: the spatial spring system, plus one supporting idiom (scroll-linked reveal *or* the masked wipe — not both).

12. **Maximum two glass surfaces on screen at once**, excluding 3D objects. Reading surfaces, the Index, and structural rules are always opaque.

13. **Mono type labels instruments; it never becomes prose.** Coordinates, metrics, tags, status. Never a paragraph, never a heading. The moment mono carries body copy, the site becomes a terminal theme.

14. **The camera is a tripod, not a drone.** Deliberate moves between marked positions, then complete stillness. No idle drift, no auto-rotation, no bobbing.

15. **Content parity is absolute.** Every fact about every project is reachable with WebGL disabled, motion reduced, transparency reduced, and keyboard only. If information lives only inside the 3D field, it does not exist.

16. **The honesty system ships.** Prototype, in-preparation research, team-project commit shares, and coursework status are displayed as designed components — never softened, never omitted to make the work look bigger. The audit's candor is a feature of the design, not a liability to style around.
