# Design Brief — Enterprise Portal | Innovation System

## Direction

**Neo-Glass Innovator** — Dark sci-fi enterprise portal with frosted glass cards, animated gradient blobs, and violet/indigo neon accents. Maximalist but refined, balancing atmospheric decoration with functional clarity across all six modules: Login, Dashboard, Ideas Lab, Incubator, Daily Mission Log, Deployment Hub, Settings.

## Tone

Maximalist tech-forward glassmorphism. Every pixel serves function (information clarity) or mood (animated blobs, neon accents, blurred surfaces). Inspired by Linear, Stripe, Figma — premium SaaS design with sci-fi atmosphere.

## Differentiation

Animated gradient blobs (indigo + pink) respond to mouse movement with parallax parallax. Frosted glass card surfaces with backdrop blur 25px + 1px frosted borders. Neon sidebar active states. Creates memorable, interactive atmosphere while maintaining information hierarchy and CRUD clarity across all module workflows.

## Color Palette

| Token        | OKLCH             | Role                          |
|:-------------|:------------------|:------------------------------|
| background   | 0.065 0.04 260    | Ultra-dark navy, space-like   |
| foreground   | 0.95 0.01 260     | Near-white, max contrast      |
| card         | 0.12 0.05 260     | Glass surface, slightly raised |
| primary      | 0.65 0.25 270     | Vivid indigo, interactive accents |
| secondary    | 0.75 0.15 270     | Pale indigo, lighter states   |
| accent       | 0.62 0.22 320     | Pink, hover/active/alert      |
| muted        | 0.22 0.05 260     | Subdued text, tertiary        |
| destructive  | 0.55 0.22 25      | Red, delete/danger            |
| chart-1      | 0.65 0.25 270     | Primary chart color           |
| chart-2      | 0.6 0.18 150      | Green/success bars            |
| chart-3      | 0.72 0.15 85      | Yellow/warning               |
| chart-4      | 0.62 0.22 320     | Pink/accent stacks            |
| chart-5      | 0.55 0.2 25       | Red/destructive               |

## Typography

- **Display:** Plus Jakarta Sans — geometric, modern, all headings + module titles + labels
- **Body:** Plus Jakarta Sans — consistent sans-serif, all UI text, paragraphs, descriptions
- **Mono:** Geist Mono — compact monospace for technical data, URLs, timestamps, deployment logs
- **Scale:** Hero `text-3xl font-bold tracking-tight`, h2 `text-2xl font-bold`, h3 `text-lg font-bold`, label `text-xs font-bold uppercase tracking-widest`, body `text-sm`, caption `text-xs`

## Elevation & Depth

Layered glass surfaces via CSS `backdrop-filter: blur(25px)`. Subtle 1px borders `rgba(255,255,255,0.08)`. No heavy shadows — depth via transparency, layering, border presence. Glass cards always have blur + 1px frosted border. Box-shadow reserved for elevated cards on hover: `shadow-elevated: 0 8px 16px rgba(0,0,0,0.3)`.

## Structural Zones

| Zone       | Background        | Border                    | Purpose                        |
|:-----------|:------------------|:--------------------------|:-------------------------------|
| Header     | glass card        | 1px white/8%              | Profile + portal title, top    |
| Sidebar    | glass card        | right 1px white/8%        | Fixed left, six module nav     |
| Content    | background        | —                         | Dark canvas for card grids     |
| Card       | glass card        | 1px white/8%, hover shift | Module content containers      |
| Toast      | glass card        | 1px white/8%              | Bottom-right fixed, CRUD       |
| Slide-out  | glass card        | left 1px white/8%         | Edit/update overlay panels     |

## Spacing & Rhythm

Gap `1.5rem` (24px) between cards. Section padding `40px`. Micro: inputs `10px-16px` padding. Label margin-bottom `8px`. Active nav item left border `4px thick`. No alternating backgrounds — consistency matters. Glass surfaces layer uniformly.

## Component Patterns

- **Buttons:** `bg-primary` → `hover:bg-opacity-80`, `rounded-2xl`, bold font, `shadow-glass-glow` on hover, `transition-smooth` 300ms
- **Cards:** `rounded-3xl`, glass background, hover `-translate-y-1` + opacity shift, `transition-smooth` 300ms
- **Inputs:** `bg-opacity-5` + 1px border, `focus:border-secondary` + `focus:shadow`, `rounded-2xl`, no sharp edges
- **Sidebar nav:** `active-nav` class: left 4px indigo border + `bg-opacity-20` highlight. Hover: `glass-hover` opacity shift.
- **Badges:** Five status badges — active (indigo), completed (pink), pending (blue), success (green), warning (yellow). Inline-flex, `px-3 py-1`, `rounded-full`, `text-xs font-semibold`, low opacity backgrounds
- **Toast notifications:** Fixed bottom-right, glass card, slide-in 300ms from `translate-y-32`, auto-hide 3s
- **Slide-out panels:** Fixed right, width 384px (96), glass card, `translate-x-full` closed → `translate-x-0` open, -2px shadow, 300ms smooth

## Motion

- **Entrance:** Cards fade-in + translateY(10px) over 400ms on render
- **Hover:** Button/card `-translate-y-1` (subtle lift), opacity+border shift via `glass-hover`, all 300ms smooth timing
- **Decorative:** Animated gradient blobs (indigo + pink) loop 30s/35s offset, react to mousemove with parallax effect
- **Panel:** Slide-out edit panels translate-x 300ms smooth. Tab switches fade 500ms.
- **Status:** Badge pulses on active state, mild box-shadow animation

## Constraints

- All colors use OKLCH tokens — no hex/rgb in components
- Glass cards: always `backdrop-blur-xl` + 1px border (never flat)
- Sidebar active: always left indigo border + `bg-opacity-20` highlight
- All interactive elements: `transition-smooth` class (cubic-bezier timing)
- No heavy shadows — depth via layering + transparency
- Toast notifications: auto-hide after 3s
- Recharts charts: inherit text color from `foreground`, use `--chart-1` through `--chart-5` tokens

## Modules & Layout

| Module           | Cards Display | Primary UX                 | Notes                        |
|:-----------------|:--------------|:---------------------------|:-----------------------------|
| Login            | Single form   | Email + password + Internet Identity | Centered, full-height      |
| Dashboard        | Live/pending/completed counters + recharts | Bar chart (projects by status), line chart (velocity) | Refresh button, real-time |
| Ideas Lab        | Grid of idea cards | Concept title, photo, status badge, deadline, action buttons | Edit slide-out, delete modal |
| Incubator        | Grid of project cards | Project name, file uploads (PPT/docs/ZIP/images), status, tags | Edit in-place, file progress |
| Daily Mission Log| Vertical task list | Sequential tasks, timestamps, completion toggles, delete | Scroll timeline, badge colors |
| Deployment Hub   | Grid of live projects | Project URL, GitHub link, engine tags, status badge | Copy URL button, filter tags |
| Settings         | Single form + sections | Update profile, display name, email, linked platforms, photo upload | Side-by-side layout |

## Signature Detail

Animated gradient blobs (indigo chroma 0.25 hue 270 + pink chroma 0.22 hue 320) respond to mouse movement with parallax, creating reactive, immersive sci-fi atmosphere. Blobs are fixed background — never obscure content. Pure mood + differentiation.

## File Upload Handling

- File input buttons: `.file-input-button` glass card styling
- Progress indicators: Linear progress bar, indigo primary color
- Validation feedback: Red destructive color for errors, green success for completion
- File preview thumbnails: Small glass cards with `rounded-lg`, image `object-cover`
- Storage reference: All files persist in canister object-storage extension

## Accessibility

- Tab navigation with keyboard support (Enter/Space to activate)
- Focus states: `focus:ring-2 ring-offset-2` using primary color
- Color contrast: All text meets WCAG AA+ on glass backgrounds
- Motion: Respects `prefers-reduced-motion` via Tailwind defaults
- Labels: All form inputs have associated labels or aria-label

## Responsive Grid

- Mobile (`sm`): Single column, full-width cards
- Tablet (`md`): Two columns, 350px min card width
- Desktop (`lg`): Three columns, auto-fill grid
- XL (`xl`): Four columns for data-heavy dashboards

## Dark Mode Only

No light mode variant. Dark mode is the canonical design. All tokens, shadows, and glass surfaces are optimized for low-light sci-fi aesthetic.
