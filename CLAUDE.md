# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run build      # Minify src/propsync.js → dist/propsync.js (one-shot)
npm run watch      # Same, but re-builds on file save
npm run serve      # Static server at localhost:3000 serving dist/
```

No test suite exists. Verify changes manually via `debug.html` in a browser.

## Architecture

Single-file browser script: `src/propsync.js` → built to `dist/propsync.js` via `build.js` (Terser minification, `console.log` stripped in prod).

Deployed via jsDelivr CDN pointing at the GitHub repo (`rfmarcelino/propsync`). Pushing `dist/propsync.js` to `master` is the release mechanism — CDN updates within minutes.

The script runs entirely on `DOMContentLoaded`. No modules, no framework. All state is local to the IIFE-like closure inside the event listener.

### Mode detection (mutually exclusive)

The script auto-detects which mode to activate based on DOM classes present:

| Mode | Trigger class | What it does |
|------|--------------|--------------|
| Tab filtering | `.propsync-tabs` | Generates bedroom tabs, disables checkbox/slider filters |
| Checkbox/slider filtering | `.button-filter` or filter controls | Standard filter with optional auto-submit |
| Accordion | `.accordion_accordion` | Groups cards by bedroom, clones template per group |

Only one mode runs per page. Tab mode takes priority over checkbox mode.

### Key patterns

- **Card data lives in the DOM**: values like bedroom count and price are read from `.bedroom-card-value`, `.price-min-card-value`, etc. inside each `.card-wrapper`.
- **Sold-out detection**: price < 0 (e.g., `-1`) signals sold out; `markPriceContainerAsSoldOut()` swaps in text from `.available-sold-out` (walking up the DOM to find it).
- **Availability display**: `processAvailabilityWrapper()` handles 0 / 1-9 / 9+ counts on `.availability-wrapper`.
- **Studio label**: bedroom value `0` is displayed as "Studio"; siblings containing "Bedroom" text are hidden.
- **URL param filtering**: `?bed=N` auto-applies the matching tab or checkbox on load.
- **Finsweet conflict**: script removes all `fs-cmsfilter-*` attributes at startup to prevent Finsweet CMS Filter from interfering.
- **Cleanup tracking**: all `addEventListener`, `setInterval`, and `setTimeout` calls go through tracked wrappers (`addEventListenerWithCleanup`, etc.) so the `cleanup()` function can tear everything down on re-init.

### Accordion mode specifics

Expects a single template `.accordion_accordion` with all cards mixed inside. Script:
1. Groups `.card-wrapper` elements by bedroom count
2. Clones the template once per bedroom group
3. Replaces `{{floor_type}}` and `{{starting_price}}` placeholders in each clone
4. Hides the original template, inserts clones sorted ascending by bedroom count

Cards can sit directly in `.accordion_answer` or wrapped in `.floorplan-collection-list`.

## Build behavior notes

- `build.js` only processes `src/propsync.js` (hardcoded filter, ignores other `.js` files in `src/`)
- Terser config keeps `console.log` calls in source but marks them as `pure_funcs` (tree-shaken if unused, but present logs survive)
- No sourcemaps generated
