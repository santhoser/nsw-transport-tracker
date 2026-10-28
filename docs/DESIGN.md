# Design (Hallmark "Wayfind", app-screen scope)

Genre modern-minimal, screen type: app (a tool, not a marketing page). Reference: Trip View screenshots (departure board, route detail with live bus map).

- Material: cool grey paper, blue-black ink, Chivo Mono throughout, square 2px ink borders, cobalt for what is live and primary actions, amber for figures on ink. Tokens live in `app/src/ui/theme.ts`; never use literal colours or fonts in screens.
- Signature: the departure board row, with a minutes plate in the line's colour on the left (as in Trip View), planned times in bold, a status square (green on time, blue early, red late, grey unavailable).
- Header is ink with paper text. Line colours appear only as small squares, plate fills and mode bars.
- Labels are sentence case, untracked. No emoji icons (MaterialCommunityIcons only). No gradients, no rounded cards, no soft shadows.
- Every data region has loading, empty and error states (`kit.tsx`). Controls are at least 48px high with a visible pressed state.
- Motion is state only; no decorative animation.
- Icon/splash: to do (Wayline NSW wordmark on ink).
