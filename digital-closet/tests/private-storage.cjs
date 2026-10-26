const {chromium}=require('playwright');const assert=require('node:assert/strict');const path=require('node:path');const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const seed=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../schema/inventory.seed.json'),'utf8'));
 await page.addInitScript(seed=>{
   window.records={items:structuredClone(seed),outfits:[]};window.failWrite=false;window.deletedAssets=[];
   const listeners={};
   window.claude={use:async type=>type==='db'?{collection:name=>({
      onSnapshot:fn=>{listeners[name]=fn;fn({docs:records[name].map(i=>({data:()=>i}))})},
      doc:id=>({set:async rec=>{if(window.failWrite)throw new Error('Test network failure');records[name]=[...records[name].filter(i=>i.id!==id),rec];listeners[name]({docs:records[name].map(i=>({data:()=>i}))});},delete:async()=>{records[name]=records[name].filter(i=>i.id!==id);listeners[name]({docs:records[name].map(i=>({data:()=>i}))})}})
   })}:type==='assets'?{upload:async()=>({id:'asset-'+Date.now()}),delete:async id=>deletedAssets.push(id)}:null};
 },seed);
 await page.goto('file://'+path.resolve(__dirname,'../prototype/index.html'));
 await page.waitForFunction(()=>loaded);assert.equal(await page.evaluate(()=>items.length),1);
 await page.click('[data-id=OUT-001]');await page.click('#edit');await page.click('#next-upload');await page.fill('[name=name]','Updated coat');await page.click('#next-upload');await page.check('[name=owner_confirmed]');await page.evaluate(()=>failWrite=true);await page.click('#save-upload');await page.waitForSelector('#upload-error:not([hidden])');assert.equal(await page.evaluate(()=>records.items[0].name),'Gray Textured Overcoat');
 await page.evaluate(()=>failWrite=false);await page.click('#save-upload');await page.waitForFunction(()=>!document.querySelector('#dlg').open);assert.equal(await page.evaluate(()=>records.items[0].name),'Updated coat');assert.deepEqual(await page.evaluate(()=>records.items[0].valuation.comparable_retail),seed[0].valuation.comparable_retail);assert.equal(await page.evaluate(()=>records.items[0].brand.evidence),seed[0].brand.evidence);
 // Restore a portable photo backup into private assets, retaining all existing records.
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=2;c.height=2;return c.toDataURL()});
 const restored={...seed[0],id:'OUT-002',photos:[png],photo_roles:['front']};
 await page.setInputFiles('#import',{name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify([restored]))});await page.click('#ask-yes');await page.waitForFunction(()=>records.items.length===2);assert.match(await page.evaluate(()=>records.items[1].photos[0]),/^asset-/);
 assert.deepEqual(errors,[]);console.log('PASS: private adapter read/write, failed write retry, legacy evidence/valuation preservation, portable photo restore');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
