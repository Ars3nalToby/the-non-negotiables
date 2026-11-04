const {chromium}=require('playwright');const {spawn}=require('child_process');const fs=require('fs');
const [lang,out,frames]=process.argv.slice(2);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(`http://localhost:8766/hype2.html?lang=${lang}`);await p.evaluate(()=>window.ready);
if(frames){for(const s of frames.split(','))fs.writeFileSync(`${__dirname}/h-${lang}-${s}.jpg`,Buffer.from(await p.evaluate(t=>frame(t),+s),'base64'));await b.close();return}
const T=await p.evaluate(()=>TOTAL),N=Math.round(T*30);
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',out+'.tmp.mp4']);
for(let k=0;k<N;k++){const buf=Buffer.from(await p.evaluate(t=>frame(t),k/30),'base64');if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
ff.stdin.end();ff.on('close',c=>{if(c===0)fs.renameSync(out+'.tmp.mp4',out);console.log('done',lang,N,c);b.close()})})()
