const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,timezoneId:'Australia/Brisbane',reducedMotion:'reduce'});
await c.route(/supabase\.co/,r=>r.abort());await c.addInitScript(()=>{try{localStorage.setItem('nn-sound','off')}catch(e){}});
const p=await c.newPage();await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(1500);
const y=await p.evaluate(()=>{const e=document.getElementById('board-eyebrow');return e.getBoundingClientRect().top+scrollY});
console.log(y);await p.screenshot({path:'index.jpg',type:'jpeg',quality:92,fullPage:true,clip:{x:0,y:Math.max(0,y-150),width:390,height:2400}});await b.close()})()
