// Bundle the optional adapter into one HTML file for copying into an artifact.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'prototype/index.html'),'utf8');
const adapter=fs.readFileSync(path.join(root,'prototype/cloud-storage.js'),'utf8');
if(adapter.includes('</script>'))throw new Error('Adapter contains a closing script tag');
let output=html.replace('<script>','<script>\n'+adapter+'\n</script>\n<script>');
const cloud=process.argv.includes('--cloud');
if(cloud)output=output.replace('<meta charset="utf-8">','<meta charset="utf-8">\n<meta name="closet-storage" content="cloud">');
const dir=path.join(root,'releases');fs.mkdirSync(dir,{recursive:true});
const target=path.join(dir,cloud?'digital-closet-cloud.html':'digital-closet.html');fs.writeFileSync(target,output);console.log(target);
