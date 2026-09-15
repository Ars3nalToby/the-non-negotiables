# Ambient sound

Two original tracks (AI-generated, user-supplied — not stock, not
copyrighted), played as a playlist by the sound toggle in the
top-right of the cinema hero:

| File | Plays | Length |
|---|---|---|
| `dawn-on-the-hallowed-turf.mp3` | First | ~3:01 |
| `crown-of-the-pitch.mp3` | Second, then loops back to Dawn | ~3:01 |

`index.html`'s `cinema()` script sets these as the `<audio>` element's
`src` directly (there's no `<source>` child list — a two-track
playlist needs to be driven from JS, switching `src` on the `ended`
event, not something a static `<source>` list can express).

This is **never** the video's own audio — the `<video>` stays `muted`
unconditionally — this only ever plays these two tracks, and only
after a visitor opts in. Off by default, and the toggle button itself
stays hidden entirely until the first track proves it can load, so
there's nothing broken-looking if these files are ever missing.

To swap a track: replace the file at the same path (same filename), or
change the two paths in `AMBIENT_TRACKS` in `index.html`'s `cinema()`
script. To add a third track, add it to the `AMBIENT_TRACKS` array —
the `ended` handler already cycles through however many are in there.
