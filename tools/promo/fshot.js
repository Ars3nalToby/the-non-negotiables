const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,timezoneId:'Australia/Brisbane'});
await c.route(/supabase\.co/,r=>r.abort());await c.addInitScript(()=>{try{localStorage.setItem('nn-sound','off')}catch(e){}});
for(const y of [1997,2003,2025]){const p=await c.newPage();await p.goto('http://localhost:8765/factory.html#'+y);await p.waitForTimeout(4500);
 const top=await p.evaluate(()=>{const e=document.getElementById('dsw');return e?e.getBoundingClientRect().top+scrollY:0});
 await p.evaluate(t=>scrollTo(0,t),top);await p.waitForTimeout(400);
 await p.screenshot({path:`fac${y}.jpg`,type:'jpeg',quality:92});console.log(y,top);await p.close()}
await b.close()})()
