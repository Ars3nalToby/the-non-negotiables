# Ambient sound slot

Drop a loopable ambient track here under these exact filenames —
`index.html` already points at them, so nothing else needs to change:

| File | Format |
|---|---|
| `ambient.mp3` | MP3, tried first |
| `ambient.ogg` | Ogg Vorbis, fallback |

This is the sound toggle in the top-right of the cinema hero (a small
circle icon over the video). It is **never** the video's own audio —
the `<video>` stays `muted` unconditionally — this only ever plays
whatever ambient track you supply here (crowd murmur, rain, room
tone; whatever fits "The 4am Kick-off"). Off by default, opt-in only,
and the toggle button itself stays hidden entirely until this file
exists and loads successfully, so there's nothing broken-looking in
the meantime.

Keep it short and seamlessly loopable (the `<audio>` element loops),
and keep the file small — under ~1-2MB is plenty for a background loop
at a reasonable bitrate (128kbps MP3 is fine for ambience, no need for
higher).
