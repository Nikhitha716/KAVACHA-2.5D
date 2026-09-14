# KAVACHA Mission-Control Application

## Goal
Build a polished, desktop-first reconnaissance console that moves through mission initialization, video acquisition, prepared processing, results, and detailed analysis without resembling a conventional dashboard.

## Experience
- Open on a cinematic KAVACHA initialization screen with the official logo, autonomous terrain sensing visual, readiness states, and one `INITIALIZE MISSION` action.
- Move into a mission acquisition screen where an operator uploads a UGV camera video and sees its real preview, filename, duration, resolution, and estimated frame count when browser metadata allows.
- Run a restrained prepared-demonstration transition showing the five supplied KAVACHA workflow stages, then move automatically to results.
- Present the uploaded input and prepared KAVACHA output as the dominant side-by-side mission feeds.
- Add an optional focused analysis view for adaptive resolution, coarsening decisions, benchmark comparison, performance readings, and the safety-preserving coarsening note.

## Visual Direction
- Use the selected **Deep Navy Sensor** palette with graphite foundations, navy surfaces, steel borders, off-white type, and restrained cyan sensing effects.
- Use **IBM Plex Sans** with **IBM Plex Mono** for instrumentation; no serif, gradients, purple, glassmorphism, or decorative military imagery.
- Use the selected **Mission Sidebar** structure: a narrow persistent command rail and full-height operational workspace.
- Build integrated engineering modules with precise 1px separators, mild corners, sensor grids, contour lines, scan sweeps, technical brackets, and restrained saffron/green status details.
- Generate one non-branded cinematic autonomous UGV terrain/sensor visual. Use the supplied official KAVACHA logo unchanged throughout the application and derive the favicon from the same asset.

## Functional Details
- Keep mission state in the frontend and support reset/new-mission flow.
- Use browser object URLs for uploaded video preview; do not persist or transmit uploaded media.
- Treat processing and output as a prepared demonstration state, with honest on-screen wording.
- If no prepared output video asset is supplied, render a clearly labeled technical 2.5D visualization rather than pretending a generated result exists.
- Use only the supplied measured values and terminology.

## Screens and Navigation
- `MISSION`: initialization and acquisition states.
- `RESULTS`: paired feeds and core performance readouts.
- `ANALYSIS`: adaptive spatial field, decision distribution, benchmark bars, and safety interpretation flow.
- `SYSTEM`: concise readiness and prepared-demonstration status, without invented hardware or certification claims.

## Verification
- Check the full workflow with a local video upload.
- Verify the 1440×900 and 1920×1080 layouts, plus a smaller fallback layout.
- Confirm uploaded metadata and playback, processing transition, navigation, labels, exact supplied values, no prohibited colors, and no overlapping content.
- Confirm every screen uses the official logo once the file is attached.

## Supplied Asset
Use the attached official KAVACHA logo exactly as provided. Do not redraw, reinterpret, simplify, regenerate, or replace it.
