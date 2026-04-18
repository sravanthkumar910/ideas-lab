# Design Brief

## Direction

Neo-Glass Innovator — Dark sci-fi enterprise portal with frosted glass cards, animated gradient blobs, and violet/indigo neon accents. Maximalist but refined, balancing atmospheric decoration with functional clarity.

## Tone

Maximalist tech-forward glassmorphism. Not minimal, but every pixel serves either function (information clarity) or mood (animated blobs, neon accents, blurred surfaces). Inspired by Linear, Stripe, and Figma — premium SaaS design with sci-fi atmosphere.

## Differentiation

Animated gradient blobs (indigo + pink) responsive to mouse movement, paired with frosted glass card surfaces and neon sidebar active states. Creates a memorable, interactive atmosphere while maintaining information hierarchy and CRUD clarity.

## Color Palette

| Token      | OKLCH             | Role                              |
| ---------- | ----------------- | --------------------------------- |
| background | 0.065 0.04 260    | Ultra-dark navy, space-like       |
| foreground | 0.95 0.01 260     | Near-white, maximum contrast      |
| card       | 0.12 0.05 260     | Glass surface, slightly elevated  |
| primary    | 0.65 0.25 270     | Vivid indigo, tech-forward accents |
| secondary  | 0.75 0.15 270     | Pale indigo, lighter interactive states |
| accent     | 0.62 0.22 320     | Pink, hover/active/alert states   |
| muted      | 0.22 0.05 260     | Subdued text, tertiary accents    |
| destructive| 0.55 0.22 25      | Red, delete/danger actions        |

## Typography

- Display: Plus Jakarta Sans — geometric, modern, all headings and labels
- Body: Plus Jakarta Sans — consistent sans-serif, all UI text and paragraphs
- Mono: Geist Mono — compact monospace for technical data, secondary information
- Scale: Hero `text-3xl font-bold tracking-tight`, h2 `text-2xl font-bold`, label `text-xs font-bold uppercase tracking-widest`, body `text-sm`

## Elevation & Depth

Layered glass surfaces with CSS backdrop blur, subtle 1px borders (rgba(255,255,255,0.08)), and no heavy box-shadows. Depth through transparency, layering, and border presence — not shadow dominance. Glass cards have `backdrop-filter: blur(25px)` and `background: rgba(255,255,255,0.03)`.

## Structural Zones

| Zone       | Background        | Border                    | Notes                          |
| ---------- | ----------------- | ------------------------- | ------------------------------ |
| Header     | glass card        | 1px white/8% opacity      | Profile + title, top-aligned   |
| Sidebar    | glass card        | right 1px white/8%        | Fixed left, nav items w/ active state |
| Content    | background        | —                         | Dark canvas, hosts card grids  |
| Cards      | glass card        | 1px white/8% with hover   | Responsive grid auto-fill 350px+ |
| Toast      | glass card        | 1px white/8%              | Bottom-right fixed, CRUD confirmations |

## Spacing & Rhythm

Gap 1.5rem (24px) between card grid items. Section padding 10px (40px). Micro-spacing: inputs 10px-16px padding. Label margin-bottom 8px. Active nav item left border 4px (thick accent). Alternating subtle backgrounds for section hierarchy without losing cohesion.

## Component Patterns

- **Buttons**: `bg-primary` → `hover:bg-opacity-80`, `rounded-2xl`, bold font, shadow-glass-glow on hover, `transition-smooth` duration-300
- **Cards**: `rounded-3xl`, glass background, hover `-translate-y-2` + opacity shift, `transition-smooth`
- **Input fields**: `bg-opacity-5` with 1px border, `focus:border-secondary` + `focus:shadow-outline`, `rounded-2xl`, no sharp edges
- **Sidebar nav**: `active-nav` class adds left 4px indigo border + background highlight. Hover state: `glass-hover` opacity shift.
- **Toast notifications**: Fixed bottom-right, glass card, slide-in from translate-y-32 to translate-y-0, auto-hide 3s

## Motion

- **Entrance**: Cards fade-in + translateY(10px) over 400ms on render
- **Hover**: Button/card `-translate-y-2` (subtle lift), opacity+border shift on glass-hover, all 300ms smooth timing
- **Decorative**: Animated gradient blobs (indigo + pink) loop infinitely at 30s/35s offset, react to mousemove with parallax effect
- **Toggle**: Tab switches fade out/in 500ms on view change

## Constraints

- All colors use OKLCH tokens (no hex literals in components)
- Glass cards always have backdrop blur + 1px border (never flat backgrounds)
- Sidebar active state: always left indigo border + background highlight
- All interactive elements use `transition-smooth` class (cubic-bezier timing)
- No heavy shadows; depth via layering and transparency
- Toast notifications auto-hide after 3s

## Signature Detail

Animated gradient blobs (indigo 4px chroma 260h + pink 22px chroma 320h) that respond to mouse movement with parallax, creating a reactive, immersive sci-fi atmosphere while remaining functional. Blobs are fixed background, never obscuring content—pure mood and differentiation.
