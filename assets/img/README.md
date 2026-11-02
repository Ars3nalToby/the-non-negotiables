# Chapter background photos (interim)

Placeholder stills for the three scroll chapters on the homepage
(`.chapter__bg` in `index.html`), used until real footage/AI-generated
clips replace them per `SHOTLIST.md`. All three are Pexels "free to
use" photos — no attribution required, but recorded here anyway:

| File | Photo | Photographer | Source |
|---|---|---|---|
| `chapter-1-phone.jpg` | Hand holding a phone in the dark | Jaroslav Maler | pexels.com/photo/19949818 |
| `chapter-2-kettle.jpg` | Steaming kettle pouring into a glass jug | Jahratreza | pexels.com/photo/35679306 |
| `chapter-3-flares.jpg` | Crowd silhouettes with red flares | Marwen Larafa | pexels.com/photo/36606989 |

Downloaded via Pexels' CDN resize params (`?auto=compress&cs=tinysrgb&w=1920`)
rather than the multi-MB originals, so these are already web-sized
(30–430KB).

None show any Arsenal branding, crest, kit, or identifiable person —
`chapter-1` and `chapter-3` show hands/silhouettes only, no faces.
Swap any of them out at will; nothing else references these files by
name except the inline `background` styles on each chapter's
`.chapter__bg` in `index.html`.

## Factory images (our own renders)

`factory-hero.jpg` (homepage hero background) and `factory-og.jpg`
(social share card) are screenshots of our own Dial Square Works scene,
2003/04 season, with every HTML panel hidden so only the 3D world shows.
Rendered with Playwright from `factory.html?debug#2003` (the debug flag
exposes the camera): target (-12, 0.5, 0), camera (-1, 19, 33), 2400x1000.
The pitch sits right of centre so the hero headline has clear floor to sit
on. Re-render the same way if the factory's look changes.
