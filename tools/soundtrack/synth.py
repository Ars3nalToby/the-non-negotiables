"""Tiny offline synth for The Non-Negotiables soundtrack.
Every sound is generated here from oscillators and noise; no samples, no
loops from anywhere else, so every track is original."""
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt

SR = 44100
rng = np.random.default_rng(7)

def t(sec): return np.arange(int(sec * SR)) / SR
def midi(n): return 440.0 * 2 ** ((n - 69) / 12)

NOTE = {'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11}
def n(name, octave): return 12 * (octave + 1) + NOTE[name]

def adsr(length, a=.01, d=.1, s=.7, r=.2):
    N = int(length * SR); env = np.ones(N) * s
    A, D, R = int(a*SR), int(d*SR), int(r*SR)
    A = min(A, N); env[:A] = np.linspace(0, 1, A, endpoint=False)
    D = min(D, max(0, N - A)); env[A:A+D] = np.linspace(1, s, D, endpoint=False)
    R = min(R, N); env[N-R:] *= np.linspace(1, 0, R)
    return env

def saw(f, tt, harm=24):
    out = np.zeros_like(tt)
    if np.ndim(f):   # changing pitch (vibrato): integrate the phase
        ph, fmax = 2*np.pi*np.cumsum(f)/SR, float(np.max(f))
    else:
        ph, fmax = 2*np.pi*f*tt, f
    for k in range(1, harm + 1):
        if fmax * k > SR / 2.2: break
        out += ((-1) ** (k + 1)) * np.sin(ph*k) / k
    return out * (2/np.pi)

def square(f, tt, harm=15):
    out = np.zeros_like(tt)
    for k in range(1, harm*2, 2):
        if f * k > SR / 2.2: break
        out += np.sin(2*np.pi*f*k*tt) / k
    return out * (4/np.pi)

def lp(x, cut, order=2):
    return sosfilt(butter(order, min(cut, SR/2.1), 'low', fs=SR, output='sos'), x)
def hp(x, cut, order=2):
    return sosfilt(butter(order, cut, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)

# ---- instruments: each returns a mono numpy array for one note ----
def pad(f, dur, bright=1800):
    tt = t(dur)
    x = sum(saw(f * (1 + d), tt + rng.random()) for d in (-.006, 0, .007)) / 3
    return lp(x, bright) * adsr(dur, a=min(.8, dur*.3), d=.5, s=.8, r=min(1.2, dur*.4))

def strings(f, dur):
    tt = t(dur)
    vib = 1 + .004 * np.sin(2*np.pi*5.2*tt)
    x = sum(saw(f * vib * (1 + d), tt) for d in (-.004, .003)) / 2
    return lp(x, 2600) * adsr(dur, a=min(.5, dur*.25), d=.3, s=.85, r=min(.8, dur*.35))

def rhodes(f, dur, vel=1.0):
    tt = t(dur)
    mod = np.sin(2*np.pi*f*14*tt) * np.exp(-tt*9) * 1.4
    x = np.sin(2*np.pi*f*tt + mod) + .25*np.sin(2*np.pi*f*2*tt) * np.exp(-tt*3)
    trem = 1 + .12*np.sin(2*np.pi*4.5*tt)
    return x * trem * np.exp(-tt*1.4) * adsr(dur, a=.004, d=.1, s=1, r=.25) * vel

def piano(f, dur, vel=1.0):
    tt = t(dur)
    x = np.zeros_like(tt)
    for k, a in enumerate([1, .45, .25, .14, .08, .05], 1):
        x += a * np.sin(2*np.pi*f*k*(1 + .0004*k*k)*tt) * np.exp(-tt*(1.2 + k*.9))
    hammer = hp(rng.standard_normal(len(tt)), 2000) * np.exp(-tt*160) * .15
    return (x + hammer) * adsr(dur, a=.002, d=.05, s=1, r=.3) * vel

def pluck(f, dur, vel=1.0, cut=3000):
    tt = t(dur)
    x = saw(f, tt, 16)
    env = np.exp(-tt * 7)
    return lp(x, cut) * env * adsr(dur, a=.003, d=.05, s=1, r=.05) * vel

def bass(f, dur, vel=1.0, cut=600):
    tt = t(dur)
    x = .7*saw(f, tt, 10) + .5*np.sin(2*np.pi*f*tt)
    return lp(x, cut) * adsr(dur, a=.005, d=.15, s=.75, r=.08) * vel

def sub(f, dur, vel=1.0):
    tt = t(dur)
    return np.sin(2*np.pi*f*tt) * adsr(dur, a=.01, d=.2, s=.8, r=.1) * vel

def brass(f, dur, vel=1.0):
    tt = t(dur)
    env = adsr(dur, a=.06, d=.2, s=.8, r=.15)
    cutoff_env = 900 + 2600 * np.minimum(1, tt / .12)
    x = sum(saw(f * (1 + d), tt) for d in (-.003, .004)) / 2
    # time-varying brightness approximated by blending two filters
    lo, hi = lp(x, 900), lp(x, 3500)
    mix = np.clip((cutoff_env - 900) / 2600, 0, 1)
    return (lo * (1 - mix) + hi * mix) * env * vel

def bell(f, dur, vel=1.0):
    tt = t(dur)
    x = np.sin(2*np.pi*f*tt + 2.2*np.sin(2*np.pi*f*3.5*tt)*np.exp(-tt*3))
    return x * np.exp(-tt*2.2) * vel

# ---- drums ----
def kick(vel=1.0, punch=1.0):
    tt = t(.45)
    f = 48 + 110 * np.exp(-tt * 28 * punch)
    ph = 2*np.pi*np.cumsum(f)/SR
    click = hp(rng.standard_normal(len(tt)), 3000) * np.exp(-tt*300) * .3
    return (np.sin(ph) * np.exp(-tt*7) + click) * vel

def snare(vel=1.0, tone=190):
    tt = t(.3)
    noise = bp(rng.standard_normal(len(tt)), 1500, 9000) * np.exp(-tt*18)
    body = np.sin(2*np.pi*tone*tt) * np.exp(-tt*25)
    return (noise*.8 + body*.6) * vel

def clap(vel=1.0):
    tt = t(.35); x = bp(rng.standard_normal(len(tt)), 900, 6000)
    env = np.zeros_like(tt)
    for o in (0, .011, .022): env += np.exp(-np.maximum(0, tt-o)*90) * (tt >= o)
    env += np.exp(-tt*14)*.5
    return x * env * .7 * vel

def hat(vel=1.0, open_=False):
    tt = t(.4 if open_ else .08)
    x = hp(rng.standard_normal(len(tt)), 7000)
    return x * np.exp(-tt*(9 if open_ else 60)) * .35 * vel

def tom(f=90, vel=1.0):
    tt = t(.8); ff = f * (1 + .6*np.exp(-tt*12))
    return np.sin(2*np.pi*np.cumsum(ff)/SR) * np.exp(-tt*4.5) * vel

def stomp(vel=1.0):
    tt = t(.35)
    body = lp(rng.standard_normal(len(tt)), 400) * np.exp(-tt*16) * 2.5
    thud = np.sin(2*np.pi*np.cumsum(70+60*np.exp(-tt*30))/SR) * np.exp(-tt*10)
    return (body + thud) * vel

def crackle(sec, density=6):
    x = np.zeros(int(sec*SR))
    idx = rng.integers(0, len(x), int(sec*density))
    x[idx] = rng.uniform(-.5, .5, len(idx))
    hiss = hp(rng.standard_normal(len(x)), 4000) * .004
    return lp(x, 6000) * .35 + hiss

# ---- mixing ----
class Track:
    def __init__(self, sec):
        self.L = np.zeros(int(sec*SR) + SR*3); self.R = np.zeros_like(self.L)
        self.buses = {}
    def bus(self, name):
        if name not in self.buses: self.buses[name] = [np.zeros_like(self.L), np.zeros_like(self.L)]
        return self.buses[name]
    def add(self, x, at, gain=1.0, pan=0.0, bus=None):
        i = int(at*SR)
        if i >= len(self.L): return
        x = x[:len(self.L)-i] * gain
        l, r = np.sqrt((1-pan)/2), np.sqrt((1+pan)/2)
        if bus is None: tl, tr = self.L, self.R
        else: tl, tr = self.bus(bus)
        tl[i:i+len(x)] += x*l*1.414; tr[i:i+len(x)] += x*r*1.414
    def mixbus(self, name, gain=1.0, duck=None, reverb=0.0, delay=None):
        bl, br = self.bus(name)
        if delay:
            d, fb = delay; k = int(d*SR)
            for _ in range(4):
                bl[k:] += bl[:-k]*fb; br[k:] += br[:-k]*fb; fb *= .6
        if reverb: bl, br = apply_reverb(bl, br, reverb)
        if duck is not None: bl, br = bl*duck, br*duck
        self.L += bl*gain; self.R += br*gain
    def render(self, sec, path_wav, reverb=0.15):
        L, R = self.L[:int(sec*SR)+SR*2], self.R[:int(sec*SR)+SR*2]
        L, R = apply_reverb(L, R, reverb, mix=True)
        x = np.stack([L, R], 1)
        x = x / max(1e-9, np.max(np.abs(x)))
        x = np.tanh(x * 1.15) / np.tanh(1.15) * .9   # gentle soft-clip, not a squash
        fade = int(2.5*SR); x[-fade:] *= np.linspace(1, 0, fade)[:, None]
        x[:int(.02*SR)] *= np.linspace(0, 1, int(.02*SR))[:, None]
        import wave
        pcm = (x * 32767).astype('<i2')
        with wave.open(path_wav, 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

_IR = {}
def ir(size):
    if size not in _IR:
        tt = t(size)
        e = np.exp(-tt * 3.2 / size)
        a, b = rng.standard_normal(len(tt))*e, rng.standard_normal(len(tt))*e
        _IR[size] = (lp(a, 7000), lp(b, 7000))
    return _IR[size]

def apply_reverb(L, R, amount, mix=False, size=2.6):
    if amount <= 0: return L, R
    a, b = ir(size)
    wl = fftconvolve(L, a)[:len(L)]; wr = fftconvolve(R, b)[:len(R)]
    s = np.max(np.abs(wl)) + 1e-9; wl, wr = wl/s*np.max(np.abs(L)+1e-9), wr/s*np.max(np.abs(R)+1e-9)
    return L + wl*amount, R + wr*amount

def sidechain(length, beat, at_beats, depth=.65, release=.22):
    env = np.ones(length)
    for b in at_beats:
        i = int(b*beat*SR); k = int(release*SR)
        if i >= length: continue
        seg = 1 - depth*np.exp(-np.arange(min(k, length-i))/(k/4))
        env[i:i+len(seg)] = np.minimum(env[i:i+len(seg)], seg)
    return env

def mx(*xs):
    """Sum sounds of different lengths."""
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
