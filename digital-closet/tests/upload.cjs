// Run with Node and Playwright installed: node digital-closet/tests/upload.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async()=>{
 const browser = await chromium.launch({headless:true, executablePath:process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
 const page = await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.resolve(__dirname,'../prototype/index.html'));
 const name=page.locator('[name=name]');
 async function details(n){await page.click('#next-upload');await name.fill(n);await page.selectOption('[name=category]','shirt');await page.fill('[name=color]','Blue');await page.fill('[name=size]','M');await page.selectOption('[name=condition]','good');await page.click('#next-upload');}
 async function save(){await page.check('[name=owner_confirmed]');await page.click('#save-upload');await page.waitForFunction(()=>!document.querySelector('#dlg').open);}
 await page.click('#add-btn');await details('Blue shirt');await page.click('#save-upload');assert(await page.locator('#upload-error').isVisible());await save();
 assert.equal(await page.evaluate(()=>items.length),2);
 assert.equal(await page.evaluate(()=>items[1].brand.value),null);
 await page.reload();assert.equal(await page.evaluate(()=>items.length),2);
 await page.click('[data-id=TOP-001]');await page.click('#edit');await page.click('#next-upload');assert.equal(await name.inputValue(),'Blue shirt');await name.fill('Blue office shirt');await page.click('#next-upload');await save();
 await page.click('#add-btn');await details('Blue office shirt');assert.match(await page.locator('#review').innerText(),/Possible duplicate/);await save();
 // Simulate quota rejection; unsaved details stay open and persisted items stay unchanged.
 await page.click('#add-btn');await details('Cannot save');await page.evaluate(()=>{local.set=()=>false});await page.check('[name=owner_confirmed]');await page.click('#save-upload');await page.waitForSelector('#upload-error:not([hidden])');assert.equal(await page.evaluate(()=>items.length),3);assert(await page.locator('#dlg').isVisible());
 await page.reload();
 // Photo queue and explicit label capture; PNG fixture made locally in browser.
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=10;c.height=10;return c.toDataURL('image/png').split(',')[1]});
 const file={name:'front.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')};
 await page.click('#add-btn');await page.setInputFiles('#batch',[file,{...file,name:'second.png'}]);await page.waitForFunction(()=>uploadPhotos.length===1);await page.setInputFiles('#label-photo',file);await page.waitForFunction(()=>uploadPhotos.length===2);await details('Photo shirt');await page.check('[name=owner_confirmed]');await page.click('#save-upload');await page.waitForFunction(()=>items.length===4 && uploadPhotos.length===1);
 assert.equal(await page.evaluate(()=>items.length),4);assert.equal(await page.evaluate(()=>items[3].photos.length),2);assert.deepEqual(await page.evaluate(()=>items[3].photo_roles),['front','label']);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'/tmp/closet-mobile.png',fullPage:true});
 await page.reload();await page.click('[data-id=TOP-001]');await page.click('#del');await page.click('#ask-yes');await page.waitForFunction(()=>items.length===3);assert.equal(await page.evaluate(()=>items.length),3);
 const downloadPromise=page.waitForEvent('download');await page.click('#export');const download=await downloadPromise;const fs=require('node:fs');const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(backup.length,3);assert(backup.some(i=>i.photos?.[0]?.startsWith('data:')));
 assert.deepEqual(errors,[]);console.log('PASS: mobile add/review/confirmation, persistence, edit, duplicates, quota failure, photo batch, delete, portable export');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
