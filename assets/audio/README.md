# Ambient sound

Two original tracks (AI-generated, user-supplied — not stock, not
copyrighted), played as a playlist by the site-wide "Soundtrack" pill in every
page's masthead (sound.js):

| File | Plays | Length |
|---|---|---|
| `dawn-on-the-hallowed-turf.mp3` | First | ~3:01 |
| `crown-of-the-pitch.mp3` | Second, then loops back to Dawn | ~3:01 |

`sound.js` drives both: it switches `src` on `ended` and carries the
track and position across page loads. Off by default; nothing is
fetched until a visitor turns it on. To swap a track, replace the file
at the same path; to add one, add it to `TRACKS` in `sound.js`.
