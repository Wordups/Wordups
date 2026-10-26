// Browser integration with a simulated SDK/backend; never signs into real Supabase.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {validateConfig}=require('../prototype/cloud-storage.js');
(async()=>{
  assert.throws(()=>validateConfig({url:'https://evil.example',key:'sb_publishable_test'}));
  assert.throws(()=>validateConfig({url:'https://test.supabase.co',key:'sb_secret_wrong'}));
  const records={dc_items:[],dc_outfits:[]}, photos=new Map();let fail=false;
  const server=http.createServer((req,res)=>{
    const name=req.url.split('?')[0];
    if(!['/index.html','/cloud-storage.js'].includes(name)){res.writeHead(404);return res.end();}
    res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':'text/html');res.end(fs.readFileSync(path.join(__dirname,'../prototype',name)));
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const errors=[];
  async function device(){
    const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.exposeFunction('mockBackend',({op,table,uid,id,record,data})=>{
      if(fail && op==='write')return {error:{message:'Connection lost'}};
      if(op==='read')return {data:records[table].filter(r=>r.user_id===uid).map(r=>({record:r.record})),error:null};
      if(op==='write'){records[table]=[...records[table].filter(r=>r.user_id!==uid||r.id!==record.id),record];return {error:null};}
      if(op==='delete'){records[table]=records[table].filter(r=>r.user_id!==uid||r.id!==id);return {error:null};}
      if(op==='upload'){photos.set(id,data);return {error:null};}
      if(op==='photo'){return {data:photos.get(id),error:null};}
      if(op==='remove'){photos.delete(id);return {error:null};}
    });
    await page.addInitScript(()=>{
      window.supabase={createClient:()=>{
        let listener;
        function user(){return JSON.parse(localStorage.getItem('mockSession')||'null')}
        return {
          auth:{
            signInWithPassword:async({email})=>{const u={id:email==='other@example.invalid'?'other':'owner',email};localStorage.setItem('mockSession',JSON.stringify(u));return {data:{user:u},error:null}},
            getUser:async()=>({data:{user:user()},error:null}),
            onAuthStateChange:fn=>{listener=fn;return {data:{subscription:{unsubscribe(){listener=null}}}}},
            signOut:async()=>{localStorage.removeItem('mockSession');listener?.('SIGNED_OUT',null);return {error:null}},stopAutoRefresh(){}
          },
          from:table=>{
            let uid,id;
            const q={select(){return q},eq(k,v){if(k==='user_id')uid=v;else id=v;return q},order(){return q},range:()=>mockBackend({op:'read',table,uid}),upsert:record=>mockBackend({op:'write',table,record}),delete(){q.then=(resolve,reject)=>mockBackend({op:'delete',table,uid,id}).then(resolve,reject);return q}};return q;
          },
          storage:{from:()=>({
            upload:async(id,blob)=>mockBackend({op:'upload',id,data:Array.from(new Uint8Array(await blob.arrayBuffer()))}),
            download:async id=>{const r=await mockBackend({op:'photo',id});return {data:new Blob([new Uint8Array(r.data||[])],{type:'image/jpeg'}),error:r.error}},
            remove:async([id])=>mockBackend({op:'remove',id})
          })}
        };
      }};
    });
    await page.goto(origin+'/index.html');return page;
  }
  async function connect(page,email='owner@example.invalid'){
    await page.click('#storage-settings');await page.fill('#cloud-email',email);await page.fill('#cloud-password','mock-password-only');await page.click('#cloud-connect');await page.waitForFunction(()=>cloud && loaded);
  }
  const first=await device();assert.equal(await first.evaluate(()=>items.length),1);await connect(first);assert.equal(await first.evaluate(()=>items.length),0);assert.equal(await first.evaluate(()=>local.get('items',null)),null);
  // Add a front/label record to private storage, retaining the ordinary wizard.
  await first.click('#add-btn');const png=await first.evaluate(()=>{const c=document.createElement('canvas');c.width=10;c.height=10;return c.toDataURL().split(',')[1]});
  await first.setInputFiles('#front',{name:'front.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await first.waitForFunction(()=>uploadPhotos.length===1);await first.click('#next-upload');await first.fill('[name=name]','Cloud shirt');await first.selectOption('[name=category]','shirt');await first.click('#next-upload');await first.check('[name=owner_confirmed]');await first.click('#save-upload');await first.waitForFunction(()=>items.length===1 && !document.querySelector('#dlg').open);
  assert.match(records.dc_items[0].record.photos[0],/^cloud:owner\//);assert.equal(await first.evaluate(()=>local.get('items',null)),null);
  const second=await device();await connect(second);assert.equal(await second.evaluate(()=>items[0].name),'Cloud shirt');assert.match(await second.evaluate(()=>photoSrc(items[0].photos[0])),/^blob:/);
  const other=await device();await connect(other,'other@example.invalid');assert.equal(await other.evaluate(()=>items.length),0);
  // A failed backend write must keep the previous record on screen.
  fail=true;const rejected=await first.evaluate(async()=>{try{await putItem({...items[0],name:'Unsaved change'});return false}catch{return true}});assert(rejected);assert.equal(await first.evaluate(()=>items[0].name),'Cloud shirt');fail=false;
  const downloadEvent=second.waitForEvent('download');await second.click('#export');const download=await downloadEvent;const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.match(backup[0].photos[0],/^data:image\/jpeg/);
  await second.click('#storage-settings');await second.click('#cloud-signout');await second.waitForFunction(()=>!loaded);assert.equal(await second.evaluate(()=>items.length),0);assert(await second.evaluate(async()=>{try{await putItem({id:'TOP-001'});return false}catch{return true}}));await second.reload();await second.waitForFunction(()=>document.querySelector('#sync').textContent.includes('Cloud is selected'));assert.equal(await second.evaluate(()=>items.length),0);
  await first.evaluate(async()=>{await removeItem(items[0].id)});await second.evaluate(async()=>{await connectCloud(local.get('cloud'),{email:'owner@example.invalid',password:'mock'})});assert.equal(await second.evaluate(()=>items.length),0);
  await first.screenshot({path:'/tmp/closet-cloud-mobile.png',fullPage:false});
  assert.deepEqual(errors,[]);console.log('PASS: cloud config validation, separate inventory, two-device read, account isolation, photos, failed writes, portable export, sign-out lock and deletion refresh');await browser.close();await new Promise(r=>server.close(r));
})().catch(e=>{console.error(e);process.exit(1)});
