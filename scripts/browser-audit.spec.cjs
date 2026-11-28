const {test,expect}=require('@playwright/test');
const {spawn}=require('node:child_process');
let server;
test.beforeAll(async()=>{server=spawn('python3',['-m','http.server','8765']);await new Promise(r=>setTimeout(r,1200));});
test.afterAll(()=>server?.kill());
for(const width of [360,768,1440]) test('pages at '+width,async({page})=>{
 await page.setViewportSize({width,height:900});
 for(const name of ['index','usluge','profili','katalog','radovi','o-nama','kontakt','okolna-sela']){
  const response=await page.goto('http://localhost:8765/'+name+'.html');
  expect(response.status()).toBe(200);
  await expect(page.locator('h1')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 }
});
test('contact edit delete and validation',async({page})=>{
 await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
 await page.goto('http://localhost:8765/kontakt.html');
 await expect(page.locator('.konf-draw')).toBeVisible();
 await page.locator('#kW').fill('10');
 await page.locator('#kDodaj').click();
 await expect(page.locator('#kList li')).toHaveCount(0);
 await page.locator('#kW').fill('140');
 await page.locator('#kDodaj').click();
 await expect(page.locator('#kList li')).toHaveCount(1);
 await page.getByRole('button',{name:'Izmeni',exact:true}).click();
 await page.locator('#kW').fill('160');
 await page.locator('#kDodaj').click();
 await expect(page.locator('#kList li')).toContainText('160');
 await page.locator('#kAdd').click();
 await expect(page.locator('textarea[name=poruka]')).toHaveValue(/160/);
 await page.getByRole('button',{name:'Obriši',exact:true}).click();
 await expect(page.locator('#kList li')).toHaveCount(0);
 await expect(page.locator('textarea[name=poruka]')).toHaveValue('');
});
