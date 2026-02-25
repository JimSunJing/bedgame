Original prompt: 好的现在开始做成网站吧

- Initialized static web app scaffold (`index.html`, `styles.css`, `app.js`) in this repo.
- Implemented flow screens: gate -> setup slider (one option per page with auto-advance) -> draw (3 cards) -> task modal -> aftercare.
- Implemented editable nicknames with random fill buttons.
- Implemented task modal requirements:
  - task title
  - start task button
  - running timer after start
  - stop task button that advances to next draw
- Implemented draw refresh after task stop, round progression, and duo current-player logic.
- Implemented neon dark style with gradient-heavy panels and static left-side glow button style.
- Exposed `window.render_game_to_text()` and `window.advanceTime(ms)` for deterministic test stepping.
- TODO: run Playwright client loop, inspect screenshots and console, fix issues.

## Validation updates

- Ran required client script (`web_game_playwright_client.js`) against `http://127.0.0.1:5173`.
  - Artifact dir: `output/web-game/client-run-http-1`
  - `errors-0.json`: not present (no errors)
  - `state-0.json`: generated, `render_game_to_text` available
- Ran full multi-step Playwright flow from skill environment dependency.
  - Artifact dir: `output/web-game/custom-run-2`
  - Covered flow:
    1) consent + start
    2) setup step auto-advance (mode/intensity/turn)
    3) nickname input
    4) draw page
    5) task modal open/start timer/stop task
    6) draw refresh + round increment
    7) end game -> aftercare
  - `errors.json`: `[]`
  - state assertions:
    - `state-running.json`: modal `open=true`, `running=true`, timer advanced
    - `state-refreshed.json`: modal closed, round incremented, cards refreshed

## Notes

- Added slider math fix (`translateX(-step*100%)`) and updated track sizing (`setup-step` as `flex: 0 0 100%`).
- Visual side-glow slivers remain intentionally visible on some buttons as part of static neon side-light treatment.

## 2026-02-25 Static Side-Light Button Refresh

- Refactored `.neon-side-btn` in `styles.css` to mirror "Scheme 2: static side-light":
  - uses dual background layers with `padding-box` + `border-box`
  - keeps fixed left-to-right border gradient (`var(--btn-accent)` -> transparent)
  - adds hover/focus outer glow via pseudo element (`box-shadow: -15px 0 30px ...`, opacity transition)
  - removed always-on left sliver pseudo decoration from previous style
- Validation:
  - Ran required Playwright client script on HTTP URL.
  - Artifacts: `output/web-game/static-neon-btn-http/shot-0.png`, `output/web-game/static-neon-btn-http/state-0.json`
  - `errors-0.json` absent (no runtime errors in this run)
  - Captured extra hover-state screenshot: `output/web-game/static-neon-btn-http/shot-hover.png` to verify glow appears on hover.

## 2026-02-25 Wheel Plan Task Sync

- Updated `app.js` task pool to follow `wheel-options-plan.md`:
  - duo light: 10 items
  - duo intimate: 16 items
  - duo playful: 16 items
  - solo: 10 items
- Added normalized task shape via `createTask(...)`:
  - fields now include `title`, `duration`, `intensity`, `notes` (and compatibility `durationSec`).
- Existing settings already aligned and kept:
  - weighted random for `random` intensity: light `0.4`, intimate `0.4`, playful `0.2`
  - cooldown limit: `2` (no immediate repeat from last two task IDs)
- Validation:
  - `node --check app.js` passed
  - Required Playwright client run completed:
    - artifacts: `output/web-game/tasks-plan-sync/shot-0.png`, `output/web-game/tasks-plan-sync/state-0.json`
    - `errors-0.json` absent
  - Additional draw-flow verification:
    - artifacts: `output/web-game/tasks-plan-sync/shot-draw.png`, `output/web-game/tasks-plan-sync/state-draw.json`
    - confirmed drawn cards are from synced wheel plan task pool.

## 2026-02-25 Motion + Flip Card UX

- Added Motion library integration in `app.js` using dynamic ESM import:
  - `https://cdn.jsdelivr.net/npm/motion@12.23.24/+esm`
  - graceful fallback: if loading fails, game remains functional without animation.
- Implemented hidden-to-reveal draw cards:
  - draw cards now render as front/back 3D faces
  - initial state only shows card front (`点击翻牌`)
  - on click, selected card flips (`rotateY`) then opens task modal
  - closing modal without completing task resets to hidden cards.
- Added site-wide UI animation hooks (Motion-driven):
  - screen enter transitions
  - app shell startup + ambient orb motion
  - button/card hover feedback
  - draw-card staggered entrance
  - modal open/close transitions.
- Validation:
  - required client run:
    - artifacts: `output/web-game/motion-flip-base/shot-0.png`, `output/web-game/motion-flip-base/state-0.json`
    - no errors file generated
  - focused flow run:
    - artifacts: `output/web-game/motion-flip-flow/01-draw-hidden.png`
    - artifacts: `output/web-game/motion-flip-flow/02-card-flipped.png`
    - artifacts: `output/web-game/motion-flip-flow/03-modal-open.png`
    - state: `output/web-game/motion-flip-flow/state.json`
    - errors: `output/web-game/motion-flip-flow/errors.json` -> `[]`
- Follow-up tweak:
  - removed fallback delay when Motion is unavailable so flip-reveal remains responsive.
  - reran required client script:
    - artifacts: `output/web-game/motion-flip-base-2/shot-0.png`, `output/web-game/motion-flip-base-2/state-0.json`
    - `errors-0.json` absent.

## 2026-02-25 Vite + React Migration

- Migrated app architecture from static HTML/JS to Vite + React:
  - added `package.json`, `vite.config.js`, and `src/` app structure
  - `index.html` now mounts React root (`/src/main.jsx`)
  - removed legacy root `app.js` and `styles.css`
- Reimplemented full game flow in `src/App.jsx`:
  - gate -> setup slider -> draw -> modal -> aftercare
  - wheel task pools synced with `wheel-options-plan.md`
  - static side-light button style and draw-card flip behavior preserved
  - Motion-based UI transitions preserved/ported to React components
  - kept browser test hooks: `window.render_game_to_text` and `window.advanceTime(ms)`
- Added Vite React dependencies:
  - `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `motion`
- Validation:
  - `npm run build` passed (production bundle generated in `dist/`)
  - required Playwright client run against Vite dev server:
    - artifacts: `output/web-game/vite-react-base/shot-0.png`, `output/web-game/vite-react-base/state-0.json`
    - no `errors-0.json`
  - focused interaction verification:
    - artifacts: `output/web-game/vite-react-flow-2/01-draw-hidden.png`
    - artifacts: `output/web-game/vite-react-flow-2/02-card-flipping.png`
    - artifacts: `output/web-game/vite-react-flow-2/03-modal-open.png`
    - state: `output/web-game/vite-react-flow-2/state.json`
    - errors: `output/web-game/vite-react-flow-2/errors.json` -> `[]`

## 2026-02-25 Timer Color + Card Edge Neon

- Updated React UI interactions:
  - timer digits now change color when task countdown starts (`modal.running === true`)
  - timer digits now have a subtle pulse animation while running
  - clicked card now emits neon edge glow during reveal/selected state
- Implementation notes:
  - `src/App.jsx`:
    - `DrawCard` now accepts `isGlowing` and adds `is-glowing` class
    - modal timer switched to `motion.p` with running pulse animation
  - `src/styles.css`:
    - added `.draw-card.is-glowing::after` neon border glow and keyframes
    - added `#modal-timer.timer-running` color + glow style
- Validation:
  - build check: `npm run build` passed
  - required client run:
    - artifacts: `output/web-game/vite-react-neon-base/shot-0.png`, `output/web-game/vite-react-neon-base/state-0.json`
    - no `errors-0.json`
  - focused visual verification:
    - artifacts: `output/web-game/vite-react-neon-flow/01-card-neon-edge.png`
    - artifacts: `output/web-game/vite-react-neon-flow/02-timer-running-color.png`
    - state: `output/web-game/vite-react-neon-flow/state.json`
    - errors: `output/web-game/vite-react-neon-flow/errors.json` -> `[]`

## 2026-02-25 Card Size Increase + Duration Visibility Audit

- Updated draw screen card presentation to occupy more visual space:
  - larger card height and face content sizing
  - increased draw panel/card spacing for stronger card-area presence
- Added task duration visibility in UI:
  - card back now shows per-task duration badge (e.g., `1分钟`, `30秒`)
  - task modal now explicitly shows `限时：<duration>`
  - modal timer helper text now includes target duration (`目标时长: mm:ss`)
- Duration data audit:
  - parsed all task pools in `src/App.jsx`
  - total tasks checked: `52`
  - invalid/missing/non-positive `durationSec`: `0`
- Validation:
  - `npm run build` passed
  - required client run:
    - artifacts: `output/web-game/vite-react-card-size-base/shot-0.png`, `output/web-game/vite-react-card-size-base/state-0.json`
    - no `errors-0.json`
  - focused verification:
    - artifacts: `output/web-game/vite-react-card-size-flow/01-draw-larger-cards.png`
    - artifacts: `output/web-game/vite-react-card-size-flow/02-modal-duration-visible.png`
    - state: `output/web-game/vite-react-card-size-flow/state.json`
    - errors: `output/web-game/vite-react-card-size-flow/errors.json` -> `[]`
