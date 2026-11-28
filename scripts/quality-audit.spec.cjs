const {test,expect}=require('@playwright/test');
const {AxeBuilder}=require('@axe-core/playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
test('accessibility and runtime diagnostics',async({page})=>{
 const server=spawn('python3',['-m','http.server','8767']);
 const report=[];
 try{
  await new Promise(r=>setTimeout(r,1200));
  for(const name of ['index','usluge','profili','katalog','radovi','o-nama','kontakt','okolna-sela']){
   const errors=[];const listener=e=>errors.push(e.message);page.on('pageerror',listener);
   await page.goto('http://localhost:8767/'+name+'.html');
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
   report.push({page:name,errors,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
   page.off('pageerror',listener);
  }
 }finally{server.kill();fs.writeFileSync('axe-report.json',JSON.stringify(report,null,2));}
 expect(report.flatMap(x=>x.errors)).toEqual([]);
});
