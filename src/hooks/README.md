# Global Hooks (`src/hooks`)

Cross-cutting React client hooks.

## Modules
- `use-geolocation.ts`: Browser Geolocation wrapper requesting high-accuracy coordinates, managing permission states (granted/prompt/denied), timeouts (10s), and insecure context detection.
- `use-polling.ts`: Configurable polling hook with window focus detection and backoff for live feeds (e.g. today's live attendance).
- `use-media-query.ts`: Breakpoint detection hook for responsive layout logic (desktop sidebar vs mobile bottom nav/sheet).

