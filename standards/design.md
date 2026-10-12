# Design and brand

Use this profile for Santiago-owned public websites. It does not recolor client projects or turn every product into the portfolio.

## Ownership

- `@santi020k/theme` owns shared brand tokens, locally served Montserrat, logos, typography, and site CSS.
- Lumen owns components, accessibility interactions, runtime behavior, and framework adapters. Inspect the installed package exports before selecting an API.
- The personal website's Sculpted style guide owns its page composition. The theme-family brand guide adapts that direction for developer products.
- The application owns layout, content, business rules, and contextual theme mappings.

## Visual direction

Quiet, precise, and personal. Violet provides identity and interaction accents. Favor a calm reading canvas, generous space, fine rules, open numbered rows, sentence-case headings, and real product imagery. Use one surface per content group. Avoid nested ornamental cards, page-wide glow, and continuous decorative animation.

Use shared semantic tokens instead of copied hex values. Serve the shared Montserrat font locally. The reference grid is 72rem, with 7rem desktop and 4.5rem mobile section spacing. Adapt density for actual tasks rather than forcing marketing dimensions into tools. Keep supporting text readable in both appearances.

Use Lumen buttons, dialogs, tabs, selects, and icons with their existing keyboard and focus behavior. Use Select for custom option lists and Combobox for search. Keep native fallback semantics. Mount the appropriate framework runtime once. Aim for WCAG 2.2 AA, at least 44px primary touch targets, and reduced-motion support.

Include visible Santiago attribution on owned public sites. Keep client and private application requirements intact. External new-tab links include `noopener noreferrer`.

## Verification

Capture responsive light and dark appearances using representative content. Verify keyboard focus, labels, long text, empty results, and primary interactions. Use automated accessibility checks together with rendered inspection.

## Source scope and freshness

Reviewed against local sources on 2026-10-12. Package APIs and token values must be resolved from the installed version. The personal site's broad brand guide includes transitional legacy patterns; its current Sculpted guide controls redesigned surfaces. Do not treat every historical visual pattern as current.

- https://github.com/santi020k/website/blob/main/docs/sculpted-style-guide.md
- https://github.com/santi020k/santi020k-theme/blob/main/docs/brand-guidelines.md
- https://lumen.santi020k.com/docs
