"""Five original tracks for the site soundtrack. Run: python3 compose.py OUTDIR"""
import sys, numpy as np
from synth import *

def chord(root, q, octave=3):
    base = n(root, octave)
    iv = {'m':[0,3,7],'M':[0,4,7],'m7':[0,3,7,10],'M7':[0,4,7,11],'7':[0,4,7,10],
          'm9':[0,3,7,10,14],'M9':[0,4,7,11,14],'13':[0,4,10,14,21],'6':[0,4,7,9],'sus':[0,5,7]}[q]
    return [base+i for i in iv]

# ------------------------------------------------------------------
def red_dawn(out):
    """Synthwave, 100 bpm, A minor. Night drive to an away game."""
    bpm=100; B=60/bpm; bar=4*B; bars=64; sec=bars*bar
    T=Track(sec)
    prog=[('A','m'),('F','M'),('C','M'),('G','M')]
    kicks=[]
    lead_motif=[0,2,3,2, 0,-2,0,None]  # scale-degree steps over chord tones
    for b in range(bars):
        root,q=prog[b%4]; ch=chord(root,q,3); t0=b*bar
        sec_i=b//8   # 0 intro,1 verse,2 chorus,3 verse,4 break,5 chorus,6 chorus,7 outro
        T.add(sum(pad(midi(m),bar*1.02,1500 if sec_i in (0,4,7) else 2400) for m in ch)*.16, t0, bus='pad')
        # arpeggio 16ths
        if sec_i!=7 or b%8<4:
            arp=[ch[0]+12,ch[1]+12,ch[2]+12,ch[1]+24]
            for s in range(16):
                m=arp[s%4]; T.add(pluck(midi(m),B/4*.9,.55 if s%4==0 else .4,2600),t0+s*B/4,.5,pan=(.35 if s%2 else -.35),bus='arp')
        if sec_i in (1,2,3,5,6):
            for k in range(4): T.add(kick(.95),t0+k*B,.9); kicks.append(b*4+k)
            for k in (1,3): T.add(mx(snare(.8),clap(.5)),t0+k*B,.55,bus='snr')
            for s in range(8): T.add(hat(.7 if s%2 else .4),t0+s*B/2,.5,pan=.2)
            for s in range(8):
                f=midi(ch[0]-12+(12 if s in (3,7) else 0)); T.add(bass(f,B/2*.85,1,750),t0+s*B/2,.55,bus='bass')
        if sec_i in (2,5,6):
            for i,step in enumerate(lead_motif):
                if step is None: continue
                m=ch[step%len(ch)]+24+(12 if step<0 else 0)-(12 if step<0 else 0)
                if step<0: m=ch[0]+24-2
                T.add(brass(midi(m),B*.95,.8),t0+i*B/2,.28,bus='lead')
        if sec_i==4 and b%8==7:
            for s in range(8): T.add(tom(70+s*12,.7),t0+s*B/2,.5)
    duck=sidechain(len(T.L),B,kicks,.6,.25)
    T.mixbus('pad',1,duck,.5); T.mixbus('arp',1,duck,.2,(B*.75,.35)); T.mixbus('bass',1,duck)
    T.mixbus('snr',1,None,.4); T.mixbus('lead',1,None,.45,(B*.5,.3))
    T.render(sec,out,.12)

# ------------------------------------------------------------------
def north_bank_lofi(out):
    """Lo-fi, 78 bpm swung. Reading the match reports with a coffee."""
    bpm=78; B=60/bpm; bar=4*B; bars=46; sec=bars*bar
    T=Track(sec)
    prog=[('D','m9'),('G','13'),('C','M9'),('A','m9')]
    sw=B/2*.62  # swung 8th offset
    mel=[[None,14,12,None, 10,None,7,None],[None,None,9,10, 12,None,None,None],
         [16,None,14,12, None,11,None,None],[None,12,None,10, 7,None,None,None]]
    for b in range(bars):
        root,q=prog[b%4]; ch=chord(root,q,3); t0=b*bar; part=b//8
        # rhodes comp: hits on 1 and the "and" of 2
        for h,v in ((0,.9),(B+sw,.6),(2*B+sw,.5) if b%2 else (3*B,.55)):
            T.add(sum(rhodes(midi(m),B*1.6,v) for m in ch)*.13,t0+h+rng.uniform(0,.012),bus='keys')
        T.add(sub(midi(n(root,2)),bar*.95,.8)*.5,t0,bus='bass')
        T.add(bass(midi(n(root,2)+7),B*.8,.6,400),t0+2*B+sw,.35,bus='bass')
        if part>=1 and b<bars-2:
            for k in (0, 2*B+sw): T.add(kick(.8,.7),t0+k,.75,bus='drm')
            T.add(kick(.5,.7),t0+3*B+sw,.5,bus='drm')
            for k in (B,3*B): T.add(snare(.6,170),t0+k+.012,.5,bus='drm')
            for s in range(8):
                off=(s//2)*B+(sw if s%2 else 0)
                T.add(hat(.35 if s%2 else .55),t0+off,.45,pan=.25,bus='drm')
        if part in (2,4):
            for i,m in enumerate(mel[b%4]):
                if m is None: continue
                T.add(piano(midi(ch[0]+m+12),B*1.2,.7),t0+(i//2)*B+(sw if i%2 else 0),.22,pan=-.2,bus='mel')
    T.add(crackle(sec+2)*1.0,0,.6)
    T.mixbus('keys',1,None,.35); T.mixbus('bass',1); T.mixbus('mel',1,None,.5,(B*.75,.3))
    bl,br=T.bus('drm'); T.buses['drm']=[lp(bl,5500),lp(br,5500)]; T.mixbus('drm',1,None,.15)
    T.L=lp(T.L,9000); T.R=lp(T.R,9000)
    T.render(sec,out,.1)

# ------------------------------------------------------------------
def clock_end(out):
    """Cinematic build, 72 bpm, D minor. The walk out of the tunnel."""
    bpm=72; B=60/bpm; bar=4*B; bars=44; sec=bars*bar
    T=Track(sec)
    prog=[('D','m'),('A#','M'),('F','M'),('C','M')]
    theme=[(0,2,9),(2,1,10),(3,1,12),(4,4,14), (8,2,12),(10,2,10),(12,4,9)]  # (8th, len8ths, semis above root of key D)
    for b in range(bars):
        root,q=prog[b%4]; ch=chord(root,q,3); t0=b*bar
        lvl=min(1,b/24)
        T.add(sum(strings(midi(m),bar*1.05) for m in ch)*(.12+.08*lvl),t0,bus='str')
        T.add(strings(midi(ch[0]-12),bar*1.05)*.16,t0,bus='str')
        if b>=8:
            T.add(tom(65,.9),t0,.7,bus='perc')
            if b>=16: T.add(tom(65,.6),t0+2.5*B,.5,bus='perc')
            if b>=24:
                for k in (1,3): T.add(tom(95,.5),t0+k*B,.35,bus='perc')
        if b>=24:  # ostinato
            for s in range(8):
                m=ch[[0,2,1,2][s%4]]+12; T.add(pluck(midi(m),B/2*.9,.5,2200),t0+s*B/2,.32,pan=(.3 if s%2 else -.3),bus='ost')
        if 16<=b<40 and b%4==0:
            for p,l,m in theme:
                T.add(brass(midi(n('D',4)+m),l*B/2*.98,.9),t0+p*B/2,.3,bus='lead')
        if b in (23,39):
            for s in range(16): T.add(snare(.3+s/20,160),t0+s*B/4,.3,bus='perc')
    T.add(sum(strings(midi(m),bar*2.5) for m in chord('D','m',3))*.18,bars*bar-bar*.2,bus='str')
    T.mixbus('str',1,None,.7); T.mixbus('perc',1,None,.5); T.mixbus('ost',1,None,.3,(B*.5,.25)); T.mixbus('lead',1,None,.6)
    T.render(sec,out,.2)

# ------------------------------------------------------------------
def kettle_4am(out):
    """Ambient piano, 62 bpm, C major. The alarm, the kettle, the dark."""
    bpm=62; B=60/bpm; bar=4*B; bars=38; sec=bars*bar
    T=Track(sec)
    prog=[('C','M7'),('A','m7'),('F','M7'),('G','6')]
    for b in range(bars):
        root,q=prog[b%4]; ch=chord(root,q,3); t0=b*bar
        T.add(sum(pad(midi(m+12),bar*1.1,1200) for m in ch)*.09,t0,bus='pad')
        T.add(sub(midi(n(root,2)),bar,.6)*.35,t0)
        pat=[0,2,1,3,2,1] if b%2 else [0,1,2,3,1,2]
        for i,p in enumerate(pat):
            m=ch[p%len(ch)]+12+(12 if i==3 else 0)
            T.add(piano(midi(m),B*2,.55+.2*rng.random()),t0+i*B*2/3+rng.uniform(0,.02),.3,pan=-.3+.12*i,bus='pno')
        if b>=12 and b%2==0:
            T.add(bell(midi(ch[-1]+36),B*3,.5),t0+B*2.5,.12,pan=.4,bus='bell')
    T.add(crackle(sec+2,2)*.6,0,.4)
    T.mixbus('pad',1,None,.6); T.mixbus('pno',1,None,.55,(B*1.5,.25)); T.mixbus('bell',1,None,.8,(B,.4))
    T.render(sec,out,.25)

# ------------------------------------------------------------------
def matchday_stomp(out):
    """Stomp-stomp-clap, 116 bpm, D major. The concourse, ten minutes to go."""
    bpm=116; B=60/bpm; bar=4*B; bars=72; sec=bars*bar
    T=Track(sec)
    prog=[('D','M'),('B','m'),('G','M'),('A','M')]
    riff=[(0,1,0),(1,.5,4),(1.5,.5,7),(2,1,9),(3,.5,7),(3.5,.5,4)]
    for b in range(bars):
        root,q=prog[b%4]; ch=chord(root,q,3); t0=b*bar; part=b//8
        # stomp stomp clap pattern on every bar after intro
        if part>=1 and b<bars-4:
            T.add(stomp(1),t0,.9); T.add(stomp(.9),t0+B*.5,.8); T.add(mx(clap(1),snare(.4)),t0+B,.8,bus='clp')
            T.add(stomp(1),t0+2*B,.9); T.add(stomp(.9),t0+2.5*B,.8); T.add(mx(clap(1),snare(.4)),t0+3*B,.8,bus='clp')
        if part in (0,):
            for k in range(4): T.add(clap(.6),t0+k*B,.5,bus='clp')
        if part>=2:
            for s in range(8): T.add(bass(midi(ch[0]-12),B/2*.8,1,900),t0+s*B/2,.5)
            T.add(sum(pad(midi(m+12),bar,2200) for m in ch)*.08,t0,bus='pad')
        if part in (3,4,6,7) and b<bars-4:
            for p,l,s in riff:
                T.add(brass(midi(ch[0]+12+s),l*B*.95,.9)+brass(midi(ch[0]+s),l*B*.95,.5),t0+p*B,.24,bus='brs')
        if part>=4:
            for s in range(8): T.add(hat(.6 if s%2 else .35),t0+s*B/2,.4,pan=-.2)
        if part==5:  # breakdown: just chant pad + claps
            T.add(sum(strings(midi(m+12),bar) for m in ch)*.14,t0,bus='pad')
    T.mixbus('clp',1,None,.6); T.mixbus('pad',1,None,.5); T.mixbus('brs',1,None,.35)
    T.render(sec,out,.15)

if __name__=='__main__':
    o=sys.argv[1]; which=sys.argv[2:] or ['red_dawn','north_bank_lofi','clock_end','kettle_4am','matchday_stomp']
    for w in which:
        globals()[w](f'{o}/{w}.wav'); print('done',w,flush=True)
