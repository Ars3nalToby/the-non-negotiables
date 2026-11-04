import sys, numpy as np
from synth import *
from compose import chord
B=60/116; NB=80; SEC=NB*B
T=Track(SEC+2)
at=lambda b:b*B
def supersaw(f,dur,cut=4200):
    tt=t(dur); x=sum(saw(f*2**(d/12),tt+rng.random()*.01,18) for d in (-.22,-.12,-.05,0,.05,.12,.22))/7
    return lp(x,cut)*adsr(dur,a=.01,d=.2,s=.85,r=.15)
def braam(f,dur):
    tt=t(dur); x=sum(saw(f*k*(1+d),tt,20) for k in (1,2,1.5) for d in (-.004,.004))/6
    cut=lp(x,300)*(1-np.minimum(1,tt/.4))+lp(x,2200)*np.minimum(1,tt/.4)
    return np.tanh(cut*2.5)*adsr(dur,a=.02,d=.5,s=.6,r=.6)
def boom(big=1.0):
    tt=t(2.2); f=30+70*np.exp(-tt*9)
    sub_=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*(1.6/big))
    nz=lp(rng.standard_normal(len(tt)),2500)*np.exp(-tt*6)*.6
    cr=hp(rng.standard_normal(len(tt)),5000)*np.exp(-tt*2.5)*.25
    return np.tanh((sub_*1.4+nz+cr)*1.3)*big
def thwack():
    tt=t(.6); body=np.sin(2*np.pi*np.cumsum(120+200*np.exp(-tt*40))/SR)*np.exp(-tt*9)
    return np.tanh((body+bp(rng.standard_normal(len(tt)),800,6000)*np.exp(-tt*22)*.9)*1.8)
def whoosh(dur):
    tt=t(dur); n=rng.standard_normal(len(tt)); env=np.sin(np.pi*tt/dur)**2
    out=np.zeros_like(n); seg_=2048
    for i in range(0,len(n),seg_):
        c=400+6000*(i/len(n))**1.5; out[i:i+seg_]=bp(n[i:i+seg_+0],c*.7,min(c*1.4,20000))[:len(out[i:i+seg_])]
    return out*env*.8
def riser(dur):
    tt=t(dur); f=110*2**(3*tt/dur); x=saw(f,tt,12)*.35+hp(rng.standard_normal(len(tt)),3000)*.5*(tt/dur)
    return x*(tt/dur)**2
def chant(f,dur):  # crowd 'ohh' vowel
    tt=t(dur); out=np.zeros_like(tt)
    for d in (-.012,-.006,0,.005,.011):
        vib=f*(1+d)*(1+.006*np.sin(2*np.pi*5*tt+rng.random()*6))
        out+=saw(vib,tt,30)
    v=bp(out,380,520)*1.0+bp(out,700,900)*.7+bp(out,2400,2800)*.15
    return v*adsr(dur,a=.07,d=.2,s=.9,r=.2)/5

prog=[('D','m'),('A#','M'),('F','M'),('C','M')]
kicks=[]
# ---------- A: dark intro (beats 0-16)
dr=sum(pad(midi(m),at(16),700) for m in (n('D',2),n('A',2),n('D',3),n('F',3)))*.35
T.add(dr,0,.8,bus='pad')
for k in range(12): T.add(mx(sub(midi(n('D',1)),.25,1)*.9,kick(.5,.6)*.5),at(k),.55)   # heartbeat
for k in range(48): T.add(hat(.5 if k%4==0 else .25),at(k/4),.35,pan=.3)           # ticking clock
for b_ in (2,7,11): T.add(braam(midi(n('D',2)),at(3)),at(b_),.55,bus='brm')
for b_ in (.5,5,6,10,13): T.add(thwack(),at(b_),.45)
T.add(riser(at(3.75)),at(12),.55,bus='fx')
for k in range(16):  # accelerating snare roll 12-15.75
    pos=12+3.75*(1-(1-k/16)**1.7); T.add(snare(.3+k/22),at(pos),.4,bus='snr')
for k in range(8): T.add(snare(.9),at(14+k/4),.25,bus='snr')
T.add(boom(.7),at(15),.5,bus='fx')
# ---------- B: main groove (beats 16-80)
def groove(b0,b1,chantOn,arpOn):
    for b in range(b0,b1):
        T.add(np.tanh(kick(1.1,1.2)*1.6),at(b),.9); kicks.append(b)
        if b%2==1: T.add(mx(clap(1),snare(.6)),at(b),.6,bus='snr')
        T.add(hat(.8,True),at(b+.5),.32,pan=-.2)
        for s in range(4): T.add(hat(.35),at(b+s/4),.22,pan=.25)
        root,q=prog[(b//4)%4]; ch=chord(root,q,3)
        for s in (.5,.75): T.add(bass(midi(ch[0]-12),B*.22,1,900)+sub(midi(ch[0]-12),B*.22,1)*.7,at(b+s),.6,bus='bass')
        T.add(bass(midi(ch[0]-12),B*.22,1,900)+sub(midi(ch[0]-12),B*.22,1)*.7,at(b+.25),.45,bus='bass')
        if b%4==0: T.add(sum(supersaw(midi(m+12),at(4)) for m in ch)*.22,at(b),1,bus='saw')
        if arpOn:
            arp=[ch[0]+24,ch[1]+24,ch[2]+24,ch[1]+24]
            for s in range(4): T.add(pluck(midi(arp[s]),B/4*.9,.6,3500),at(b+s/4),.3,pan=(.4 if s%2 else -.4),bus='arp')
    if chantOn:
        mel=[(n('D',4),3),(n('F',4),1),(n('E',4),2),(n('D',4),2),(n('C',4),3),(n('D',4),1),(n('A',3),4)]
        for rep in range((b1-b0)//16):
            p=b0+rep*16
            for m,l in mel:
                T.add(chant(midi(m),at(l)*.97)+chant(midi(m+12),at(l)*.97)*.5,at(p),.9,bus='chant'); p+=l
groove(16,32,True,False); groove(32,48,False,True); groove(48,64,True,True)
for k in range(16): T.add(snare(.4+k/20),at(60+3*k/16) if k<16 else 0,.25,bus='snr')
T.add(riser(at(3.5)),at(60.4),.45,bus='fx')
# C: stabs 64-68, groove 68-72
for b_ in (64,66):
    ch=chord('D','m',3); T.add(sum(supersaw(midi(m+12),at(1.6),5000) for m in ch)*.3,at(b_),1,bus='saw')
    T.add(sub(midi(n('D',1)),at(1.5),1),at(b_),.8)
groove(68,72,False,True)
# D: outro 72-80
ch=chord('D','m',3)
T.add(sum(supersaw(midi(m+12),at(8),3000) for m in ch+[n('A',4)])*.25,at(72),1,bus='saw')
T.add(sum(pad(midi(m),at(8),1600) for m in ch)*.25,at(72),1,bus='pad')
T.add(sub(midi(n('D',1)),at(6),1),at(72),.7)
mel=[(n('D',4),3),(n('F',4),1),(n('E',4),2),(n('D',4),2)]
p=72
for m,l in mel: T.add(chant(midi(m),at(l)*.97)+chant(midi(m+12),at(l)*.97)*.5,at(p),.8,bus='chant'); p+=l
# ---------- synced SFX on the video's slams and wipes
for h in (16,64,66,68,72): T.add(boom(1.2 if h in (16,72) else .9),at(h),.85,bus='fx')
for h in (17,18,20,22,23,24,26,28,32,33,34,35,36,38,40,42,44,48,52,56,74,76): T.add(thwack(),at(h),.3)
for w in (5,10,13,20,24,28,32,36,44,48,52,56,60,64,72): T.add(whoosh(at(.7)),at(w-.7),.35,pan=.2,bus='fx')
# gap of silence right before the drop
gap=np.ones(len(T.L)); i0,i1=int(at(15.72)*SR),int(at(16)*SR); gap[i0:i1]=np.linspace(1,0.05,i1-i0)
for nm in list(T.buses): T.buses[nm]=[T.buses[nm][0]*gap,T.buses[nm][1]*gap]
T.L*=gap; T.R*=gap
duck=sidechain(len(T.L),B,kicks,.7,.22)
T.mixbus('pad',1,None,.5); T.mixbus('brm',1,None,.5); T.mixbus('snr',1,None,.3)
T.mixbus('saw',1,duck,.35); T.mixbus('bass',1,duck); T.mixbus('arp',1,duck,.25,(B*.75,.3))
T.mixbus('chant',1.1,duck,.7); T.mixbus('fx',1,None,.45)
T.render(SEC+1.5,sys.argv[1],.1)
