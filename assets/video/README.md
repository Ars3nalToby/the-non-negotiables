# Video slots

Drop real footage in here using these exact filenames — `index.html`
already points at them, so nothing else needs to change once they exist.

| File | Used for |
|---|---|
| `hero-desktop.webm` | Desktop/tablet hero loop, WebM (VP9/AV1) — tried first |
| `hero-desktop.mp4` | Desktop/tablet hero loop, H.264 — fallback |
| `hero-mobile.webm` | Full-bleed 9:16 mobile hero loop, WebM |
| `hero-mobile.mp4` | Full-bleed 9:16 mobile hero loop, H.264 |
| `hero-poster.jpg` | Poster frame shown before the video plays, and permanently for reduced-motion / Save-Data / slow connections |

`index.html` already picks the mobile pair under 768px viewports via
`<source media="(max-width:767px)">`, evaluated once when the video
starts loading (a later resize/rotate won't re-pick — that's normal
`<video>` behaviour, not a bug).

Until any of these exist, the hero shows the CSS placeholder (gradient
+ grain + light sweep) automatically — that's intentional, see
`index.html`'s `cinema()` script and `.cinema__placeholder` in
`styles.css`.

See `../../SHOTLIST.md` for what to shoot/generate and
`../../ENCODING.md` for exact export settings.
