# VoronoiTitle — how it works & how to tune it

The title is a Physarum / Voronoi membrane web rendered **inside** the letters.
Everything tunable lives in the `P` object at the top of `VoronoiTitle.jsx`.

## The border (what you asked for)

- The letter shape is rasterised from the **real font outline at full device
  resolution** (`drawTitleInto` → `maskCanvas`), so the edge is vector-accurate and
  razor sharp at any size / DPR.
- The web is the Voronoi membrane field, computed from sites **inside** the letters,
  then clipped to that mask (`composite`, `destination-in`).
- The border itself is **never drawn** — it's invisible. Because the clip cuts the
  cells, any membrane that reaches the edge **terminates on it** = the web connects
  to the border at points. There is no rim/wall running parallel to the edge.
- **Colour is inverted** in `renderField` (`const inv = 255 - c`): the cell fill is
  white (so it blends into the white page → the border line is invisible white) and
  the web is dark. To go back to dark letters + white web, drop the `inv` and write
  `c` straight into the pixels.

## Smoothness (no blur)

There is **no blur filter** anywhere. Smoothness comes from:
1. high internal resolution (`simH: 300`),
2. bicubic upscaling (`imageSmoothingQuality = 'high'`),
3. zero per-pixel grain.

If you ever see faint pixelation, raise `simH` (e.g. 340) rather than adding blur.
That costs more CPU per frame, so don't go overboard.

## Mouse hover

The pointer is mapped into the simulation's coordinate space in `onPointerMove`
(`rx/ry` = fraction across the canvas → `mouse.x/y` in sim pixels). It only acts
while the pointer is over the title; otherwise it fades out.

`mouse.inf` is a smoothed 0→1 "influence" that eases in/out (see `frame`):
```
mouse.inf += ((active ? 1 : 0) - mouse.inf) * 0.12;   // 0.12 = ease speed
```
Raise `0.12` for snappier response, lower it for a lazier trail.

The cursor is a **food source / attractor** (one knob in `P`):

| Knob | Default | Range | What it does | Where |
| --- | --- | --- | --- | --- |
| `mouseFeed` | 0.8 | 0–2 | Cursor feeds the **veins** near it (the deposit is scaled by the membrane field, so cells stay clean — no glow behind the cursor) and nudges agents toward the pointer, so the web thickens & streams to the cursor. | `applyMouseFood` + steer block in `stepAgents` |

Set `mouseFeed: 0` to switch the interaction off entirely.

Other related constants:
- Feed blob size: `R = simH * 0.09` in `applyMouseFood`.
- Attraction radius / strength: `RA = simH * 0.22` and the `* 0.08` factor in the
  steer block of `stepAgents`.

Note: feeding/streaming only happens while the simulation is running (it's a sim
effect, not a post-process), so it pauses with `prefers-reduced-motion` / off-screen.

## Other useful knobs in `P`

- `sites` (226) — number of Voronoi cells. More = finer web.
- `sigma` (2.4) — membrane thickness.
- `scaffold` (1.14) / `exposure` (1.15) / `contrast` (2.9) — brightness & crispness
  of the static web vs. the moving slime.
- `agentDensity` (0.02), `speed`, `deposit`, `decay`, `blur` (slime *diffusion*, not
  an image blur) — the living motion.
- `seed` — change for a different web layout.

## "Vector lines for the font"

The clip already uses the **actual Playfair Display outline** (the browser
rasterises the real glyph vectors into `maskCanvas` at device resolution), so the
silhouette is effectively pixel-perfect today.

If you want the literal vector *path geometry* available to the simulation (e.g. to
make membranes follow the outline, or to animate the stroke), the clean way is to
load the font with **opentype.js** and read each glyph's `Path` commands. That adds
a dependency (~120 KB) and a fetch of the font file — say the word and I'll wire it
in behind the same component API.
