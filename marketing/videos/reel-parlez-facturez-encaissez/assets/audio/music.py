"""Original 120 BPM house bed for the Robi ad, cut to the scene grid (36 s)."""
import numpy as np
from scipy.signal import butter, sosfilt, sosfilt_zi
from scipy.io import wavfile

SR = 44100
BPM = 120
BEAT = 60 / BPM
DUR = 36.0
N = int(SR * DUR)
rng = np.random.default_rng(7)

L = np.zeros(N)
R = np.zeros(N)
duck = np.ones(N)  # sidechain envelope


def put(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i : i + len(sig)] += sig * (1 - max(pan, 0))
    R[i : i + len(sig)] += sig * (1 + min(pan, 0))


def env(n, a, d):
    t = np.arange(n) / SR
    e = np.exp(-t / d)
    na = int(a * SR)
    if na > 0:
        e[:na] *= np.linspace(0, 1, na)
    return e


def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output="sos")
    return sosfilt(sos, x)


def saw(freq, n, detune=0.0):
    t = np.arange(n) / SR
    ph = (freq * (1 + detune)) * t + rng.random()
    return 2 * (ph % 1) - 1


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---- instruments -----------------------------------------------------------
def kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.22)
    s[: int(0.004 * SR)] += rng.standard_normal(int(0.004 * SR)) * 0.4
    return np.tanh(s * 1.6)


def clap():
    n = int(0.3 * SR)
    s = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        i = int(off * SR)
        b = rng.standard_normal(n - i) * env(n - i, 0, 0.012 if k < 2 else 0.12)
        s[i:] += b
    return filt(s, "bandpass", [900, 3200]) * 1.4


def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR)
    s = rng.standard_normal(n) * env(n, 0, 0.09 if open_ else 0.018)
    return filt(s, "highpass", 7500)


def bass(m, length):
    n = int(length * SR)
    f = note(m)
    s = saw(f, n) + 0.5 * np.sin(2 * np.pi * f / 2 * np.arange(n) / SR)
    s = filt(s, "lowpass", 380) * env(n, 0.004, length * 0.6)
    return np.tanh(s * 1.5) * 0.9


def pad(chord, length, bright=1800):
    n = int(length * SR)
    s = np.zeros(n)
    for m in chord:
        for d in (-0.006, 0, 0.007):
            s += saw(note(m), n, d)
    s = filt(s, "lowpass", bright) / (len(chord) * 3)
    a = np.minimum(1, np.arange(n) / (0.25 * SR))
    r = np.minimum(1, (n - np.arange(n)) / (0.3 * SR))
    return s * a * r


def stab(chord, length=0.22):
    n = int(length * SR)
    s = np.zeros(n)
    for m in chord:
        for d in (-0.01, 0.01):
            s += saw(note(m + 12), n, d)
    return filt(s, "lowpass", 3200) / (len(chord) * 2) * env(n, 0.002, 0.08)


def noise_sweep(length, f0, f1, rise=True):
    n = int(length * SR)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 512
    zi = None
    for i in range(0, n, blk):
        p = i / n
        f = f0 + (f1 - f0) * p
        sos = butter(2, f, btype="lowpass", fs=SR, output="sos")
        if zi is None:
            zi = sosfilt_zi(sos) * 0
        out[i : i + blk], zi = sosfilt(sos, x[i : i + blk], zi=zi)
    g = np.linspace(0, 1, n) ** 2 if rise else np.linspace(1, 0, n) ** 2
    return out * g


# ---- arrangement -------------------------------------------------------------
# F minor: Fm - Db - Ab - Eb, one chord per bar (2 s)
CHORDS = [[53, 56, 60], [49, 53, 56], [56, 60, 63], [51, 55, 58]]
ROOTS = [29, 25, 32, 27]

K = kick()
C = clap()
H = hat()
OH = hat(True)

pad_bus = np.zeros(N)
bass_bus = np.zeros(N)


def bar_of(t):
    return int(t // (4 * BEAT))


def add_bus(bus, sig, t, g=1.0):
    i = int(t * SR)
    sig = sig[: N - i]
    bus[i : i + len(sig)] += sig * g


# intro 0-4 s: dark filtered pad + ticking hats (clock) + subtle pulse
for b in range(2):
    add_bus(pad_bus, pad(CHORDS[b % 4], 2.0, bright=700), b * 2.0, 0.55)
for k in range(16):
    put(H, k * 0.25, 0.18 if k % 2 else 0.28, pan=0.3 if k % 2 else -0.3)
put(noise_sweep(1.5, 400, 6000), 2.5, 0.12)

# 4-8 s: groove enters, filtered, building
for k in range(8):
    t = 4 + k * BEAT
    if t < 7.5:
        put(K, t, 0.8)
for k in range(16):
    put(H, 4 + k * 0.25, 0.25)
for b in range(2, 4):
    add_bus(pad_bus, pad(CHORDS[b % 4], 2.0, bright=1200), b * 2.0, 0.6)
    for k in range(4):
        t = b * 2.0 + k * BEAT + BEAT / 2
        if t < 7.5:
            add_bus(bass_bus, bass(ROOTS[b % 4] + 12, BEAT * 0.45), t, 0.7)
put(noise_sweep(1.5, 500, 9000), 6.0, 0.22)

# 8-30 s: full drop
for k in range(int((30 - 8) / BEAT)):
    t = 8 + k * BEAT
    put(K, t, 1.0)
    if k % 2 == 1:
        put(C, t, 0.55, pan=0.05)
    put(OH, t + BEAT / 2, 0.22, pan=0.2)
    put(H, t + BEAT / 4, 0.12, pan=-0.25)
    put(H, t + 3 * BEAT / 4, 0.12, pan=-0.25)
for b in range(4, 15):
    ch = CHORDS[b % 4]
    add_bus(pad_bus, pad(ch, 2.0, bright=2200), b * 2.0, 0.55)
    for k in range(4):
        t = b * 2.0 + k * BEAT + BEAT / 2
        add_bus(bass_bus, bass(ROOTS[b % 4] + 12, BEAT * 0.45), t, 0.85)
    for off in (0.75, 2.25, 3.25):
        put(stab(ch), b * 2.0 + off * BEAT, 0.35, pan=-0.2 if off < 2 else 0.2)
# crash-ish accents on scene changes
for t in (8.0, 12.0, 18.0, 24.0):
    put(noise_sweep(1.2, 12000, 3000, rise=False), t, 0.18)
    put(filt(rng.standard_normal(int(1.2 * SR)), "highpass", 5000) * env(int(1.2 * SR), 0, 0.35), t, 0.1)
put(noise_sweep(2.0, 600, 10000), 28.0, 0.22)

# 30-33 s: breakdown, pad + clap roll
add_bus(pad_bus, pad(CHORDS[3], 3.0, bright=1500), 30.0, 0.7)
for k in range(12):
    put(H, 30 + k * 0.25, 0.18)
for k in range(8):
    put(C, 32 + k * 0.125, 0.15 + 0.05 * k)

# 33-36 s: final hit + tail
put(K, 33.0, 1.1)
put(stab(CHORDS[0], 0.6), 33.0, 0.7)
add_bus(pad_bus, pad(CHORDS[0], 3.0, bright=2400), 33.0, 0.75)
put(noise_sweep(1.6, 12000, 2000, rise=False), 33.0, 0.2)
for k in range(4):
    put(K, 33.0 + (k + 1) * BEAT, 0.5 - 0.1 * k)

# sidechain from kick positions
kick_times = [4 + k * BEAT for k in range(7)] + [8 + k * BEAT for k in range(44)] + [33.0]
for t in kick_times:
    i = int(t * SR)
    n = int(0.3 * SR)
    e = 1 - 0.7 * np.exp(-np.arange(n) / (0.09 * SR))
    duck[i : i + n] = np.minimum(duck[i : i + n], e[: N - i])

pad_bus *= duck
bass_bus *= duck
L += pad_bus * 0.9 + bass_bus
R += pad_bus * 0.9 + bass_bus

# tape-stop feel before the drop: fade 7.5-8
i0, i1 = int(7.45 * SR), int(8.0 * SR)
fade = np.linspace(1, 0, i1 - i0) ** 2
L[i0:i1] *= fade
R[i0:i1] *= fade

# master
mix = np.stack([L, R], axis=1)
mix = np.tanh(mix * 0.9)
mix[-int(0.8 * SR):] *= np.linspace(1, 0, int(0.8 * SR))[:, None]
mix /= np.max(np.abs(mix)) / 0.89
wavfile.write("music.wav", SR, (mix * 32767).astype(np.int16))
print("ok", mix.shape[0] / SR)
