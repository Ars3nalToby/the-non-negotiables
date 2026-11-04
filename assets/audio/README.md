# Site soundtrack

Seven original tracks, played as one playlist by the "Soundtrack" pill in
every page's masthead (sound.js). The arrow next to the pill opens a track
menu; a listener's pick is remembered (localStorage `nn-sound-track`).
Off by default, and nothing is fetched until a visitor turns it on.

| File | Name | Mood | Length | Origin |
|---|---|---|---|---|
| `dawn-on-the-hallowed-turf.mp3` | Dawn on the Hallowed Turf | Anthem | ~3:01 | AI-generated, user-supplied |
| `crown-of-the-pitch.mp3` | Crown of the Pitch | Anthem | ~3:01 | AI-generated, user-supplied |
| `red-dawn.mp3` | Red Dawn | Synthwave, 100 bpm | 2:36 | Composed in code |
| `matchday-stomp.mp3` | Matchday Stomp | Terrace stomp-clap, 116 bpm | 2:31 | Composed in code |
| `clock-end.mp3` | Clock End | Cinematic build, 72 bpm | 2:29 | Composed in code |
| `north-bank-lofi.mp3` | North Bank Lo-fi | Lo-fi, 78 bpm swung | 2:24 | Composed in code |
| `kettle-4am.mp3` | 4am Kettle | Ambient piano, 62 bpm | 2:29 | Composed in code |

"Composed in code" = every note and drum is generated from oscillators and
noise by `tools/soundtrack/synth.py` + `compose.py` (numpy/scipy). No
samples, no loops, nothing from anyone else, so no licensing questions.
To re-render: `cd tools/soundtrack && python3 compose.py OUTDIR`, then
level with ffmpeg two-pass `loudnorm` (targets: -13 LUFS for the upbeat
three, -14.5 lo-fi, -15.5 ambient) and encode `libmp3lame -b:a 128k`.

The two anthems are mastered ~2 dB hotter (about -11 LUFS), so TRACKS in
sound.js plays them at gain 0.8; the rest play at 1.0. To add a track, add
`[file, name, mood, gain]` to TRACKS; the menu builds itself from it.
