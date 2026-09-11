# Encoding — cinema hero footage

Targets: **desktop ≤6MB**, **mobile ≤4MB**, seamless loop, muted by
default (the `<video>` has no audio track requirement — strip audio
entirely to save bytes unless you're shipping the optional ambient
sound toggle, in which case keep that as a separate audio asset, not
baked into the video).

Assumes footage/generated clips land as `raw-desktop.mp4` (or `.mov`)
at whatever the source resolution is, and `raw-mobile.mp4` for the
vertical cut. Adjust filenames as needed; the output filenames below
are the ones `index.html` already points at.

## 1. Crop/scale to the target frame

Desktop — 1920×804 (2.39:1):

```bash
ffmpeg -i raw-desktop.mp4 \
  -vf "scale=1920:804:force_original_aspect_ratio=increase,crop=1920:804" \
  -c:v libx264 -crf 0 -preset veryslow -an cropped-desktop.mp4
```

Mobile — 1080×1920 (9:16, full-bleed vertical):

```bash
ffmpeg -i raw-mobile.mp4 \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" \
  -c:v libx264 -crf 0 -preset veryslow -an cropped-mobile.mp4
```

(`-crf 0` here is a lossless intermediate — the crop/scale pass and
the final compression pass are kept separate so cropping never
compounds compression artifacts.)

## 2. Make the loop seamless (1s crossfade)

If the clip doesn't already loop cleanly, crossfade its own tail into
its own head. `$DUR` is the clip's duration in seconds (`ffprobe -v
error -show_entries format=duration -of csv=p=0 cropped-desktop.mp4`),
`$DUR-1` is that minus 1 for the fade point:

```bash
ffmpeg -i cropped-desktop.mp4 -filter_complex \
  "[0:v]split[a][b]; \
   [a]trim=0:1,setpts=PTS-STARTPTS[fadein]; \
   [b]trim=1,setpts=PTS-STARTPTS[main]; \
   [main][fadein]xfade=transition=fade:duration=1:offset=$(echo "$DUR-2" | bc)[out]" \
  -map "[out]" -an looped-desktop.mp4
```

Repeat the same for the mobile clip. If the source was shot/generated
specifically to loop (matching first/last frames per the shotlist),
skip this step.

## 3. Extract the poster frame

Pick a clean mid-shot frame (avoid mid-crossfade or mid-grain-spike
moments) — 2 seconds in works for most cuts:

```bash
ffmpeg -i looped-desktop.mp4 -ss 00:00:02 -frames:v 1 -q:v 2 hero-poster.jpg
```

Keep it under ~150KB — it's the LCP image on slow connections and the
only thing reduced-motion/Save-Data visitors ever see:

```bash
ffmpeg -i hero-poster.jpg -vf "scale=1920:-1" -q:v 4 hero-poster.jpg
```

## 4. Final encodes

Two containers per size (WebM tried first, MP4 fallback), each tuned
to hit the byte targets. Start at the CRF values below and raise CRF
(lower quality/size) if you're over budget — check with `ls -la` after
each pass.

**Desktop MP4 (H.264), target ≤6MB total for both desktop files combined,
so aim ~3MB each:**

```bash
ffmpeg -i looped-desktop.mp4 \
  -c:v libx264 -crf 26 -preset slow -profile:v high -pix_fmt yuv420p \
  -movflags +faststart -an hero-desktop.mp4
```

**Desktop WebM (VP9):**

```bash
ffmpeg -i looped-desktop.mp4 \
  -c:v libvpx-vp9 -crf 32 -b:v 0 -deadline good -cpu-used 2 \
  -an hero-desktop.webm
```

If VP9 encode time is a problem and AV1 tooling is available, AV1 at a
similar or slightly higher CRF (e.g. `-crf 34` with `libaom-av1` or
`libsvtav1`) will usually beat VP9 at the same file size — use it
instead of VP9 if `ffmpeg -codecs | grep av1` shows an encoder and the
extra encode time is acceptable:

```bash
ffmpeg -i looped-desktop.mp4 \
  -c:v libsvtav1 -crf 34 -preset 6 -an hero-desktop.webm
```

**Mobile MP4 (H.264), target ≤4MB total for both mobile files combined,
so aim ~2MB each:**

```bash
ffmpeg -i looped-mobile.mp4 \
  -c:v libx264 -crf 28 -preset slow -profile:v high -pix_fmt yuv420p \
  -movflags +faststart -an hero-mobile.mp4
```

**Mobile WebM (VP9):**

```bash
ffmpeg -i looped-mobile.mp4 \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -deadline good -cpu-used 2 \
  -an hero-mobile.webm
```

## 5. Verify before committing

```bash
ls -la assets/video/hero-*.mp4 assets/video/hero-*.webm assets/video/hero-poster.jpg
ffprobe -v error -show_entries stream=width,height,r_frame_rate,codec_name \
  -of default=noprint_wrappers=1 assets/video/hero-desktop.mp4
```

Check: desktop pair combined ≤6MB, mobile pair combined ≤4MB, desktop
is exactly 1920×804 (or another clean 2.39:1 ratio), mobile is
1080×1920, no audio stream present (`ffprobe` should show no `Stream
#0:1 Audio`), and the loop point doesn't visibly jump when played on
loop for 30+ seconds.

Then just drop the five files into `assets/video/` under the exact
names above — `index.html` already points at them, nothing else
changes.
