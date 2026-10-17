import {test,expect} from '@playwright/test';
const preview='/artifacts/library-preview.html';
test.describe('Library interactions',()=>{
 test.beforeEach(async({page})=>{await page.goto(preview);});
 test('responsive layout, long titles, missing art, and dates',async({page})=>{
  for(const viewport of [{width:390,height:844},{width:320,height:640},{width:844,height:390},{width:1440,height:1000}]){
   await page.setViewportSize(viewport);
   await expect(page.getByRole('heading',{name:'Your library'})).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await expect(page.getByRole('heading',{name:'A song with a wonderfully long title that should stay readable'})).toBeVisible();
  }
  await expect(page.locator('.artwork-fallback')).toHaveCount(2);
  await expect(page.getByText('Date unavailable')).toBeVisible();
  await expect(page.getByRole('button',{name:'6 Stashed. Open statistics'})).toBeVisible();
 });
 test('search, source filter, sorting, and no results',async({page})=>{
  await page.getByRole('textbox',{name:'Search your stash'}).fill('company');
  await expect(page.locator('.st-track-row')).toHaveCount(1);
  await expect(page.getByRole('heading',{name:'Slow Sunday'})).toBeVisible();
  await page.getByRole('button',{name:'Clear search'}).click();
  await page.getByRole('button',{name:'Reels',exact:true}).click();
  await expect(page.locator('.st-track-row')).toHaveCount(3);
  await page.getByRole('combobox',{name:'Sort stash'}).selectOption('title');
  await expect(page.locator('.st-track-row h3').first()).toHaveText('Golden Hour');
  await page.getByRole('textbox',{name:'Search your stash'}).fill('nothing matches this');
  await expect(page.getByRole('heading',{name:'No songs found.'})).toBeVisible();
  await page.getByRole('button',{name:'Clear filters'}).click();
  await expect(page.locator('.st-track-row')).toHaveCount(6);
 });
 test('delete requires confirmation and cancel restores focus',async({page})=>{
  const remove=page.getByRole('button',{name:'Remove Night Drive from stash'});
  await remove.click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.getByRole('button',{name:'Keep it'}).click();
  await expect(remove).toBeFocused();
  await expect(page.locator('.st-track-row')).toHaveCount(6);
  await remove.click();
  await page.getByRole('button',{name:'Remove',exact:true}).click();
  await expect(page.locator('.st-track-row')).toHaveCount(5);
  await expect(page.getByRole('heading',{name:'Night Drive',exact:true})).toHaveCount(0);
 });
 test('capture draft and library filters survive view changes',async({page})=>{
  await page.getByRole('textbox',{name:'Search your stash'}).fill('night');
  await page.getByRole('button',{name:'Capture',exact:true}).first().click();
  await page.getByRole('textbox',{name:'Music source URL'}).fill('https://youtu.be/draft');
  await page.getByRole('button',{name:'Library',exact:true}).first().click();
  await expect(page.getByRole('textbox',{name:'Search your stash'})).toHaveValue('night');
  await expect(page.locator('.st-track-row')).toHaveCount(1);
  await page.getByRole('button',{name:'Capture',exact:true}).first().click();
  await expect(page.getByRole('textbox',{name:'Music source URL'})).toHaveValue('https://youtu.be/draft');
 });
 test('empty, loading, and error states with real refresh action',async({page})=>{
  await page.goto(preview+'?state=empty');
  await expect(page.getByRole('heading',{name:'Your best finds are still ahead.'})).toBeVisible();
  await page.getByRole('button',{name:'Find your first song'}).click();
  await expect(page.getByRole('textbox',{name:'Music source URL'})).toBeVisible();
  await page.goto(preview+'?state=loading');
  await expect(page.locator('.st-track-skeleton')).toHaveCount(6);
  await expect(page.getByRole('button',{name:'Loading Stashed'})).toBeDisabled();
  await page.goto(preview+'?state=error');
  await expect(page.getByRole('alert')).toContainText('Your stash couldn’t load.');
  await expect(page.getByText('Collection unavailable')).toBeAttached();
  await expect(page.getByRole('button',{name:'Stashed unavailable'})).toBeDisabled();
  await expect(page.getByRole('heading',{name:'Your best finds are still ahead.'})).toHaveCount(0);
  await page.getByRole('button',{name:'Try again'}).click();
  await expect(page.getByTestId('refresh-count')).toHaveText('Refreshes: 1');
  await expect(page.locator('.st-track-row')).toHaveCount(6);
  await expect(page.getByRole('alert')).toHaveCount(0);
 });
 test('pull refresh triggers once and horizontal gestures do not refresh',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const gesture=async(dx:number,dy:number)=>page.locator('.history-library').evaluate((el,{dx,dy})=>{
   const touch=(x:number,y:number)=>new Touch({identifier:1,target:el,clientX:x,clientY:y});
   el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[touch(150,400)]}));
   el.dispatchEvent(new TouchEvent('touchmove',{bubbles:true,cancelable:true,touches:[touch(150+dx,400+dy)]}));
   el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[]}));
  },{dx,dy});
  await gesture(180,40);await expect(page.getByTestId('refresh-count')).toHaveText('Refreshes: 0');
  await gesture(0,180);await gesture(0,180);
  await expect(page.getByTestId('refresh-count')).toHaveText('Refreshes: 1');
  await expect(page.getByRole('button',{name:'Refresh stash'})).toBeEnabled();
 });
 test('reduced motion disables sleeve parallax, reveals, and shimmer',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.locator('.record-sleeve')).toBeVisible();
  expect(await page.locator('.record-package').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  await page.goto(preview+'?state=loading');
  expect(await page.locator('.capture-shimmer').first().evaluate(el=>getComputedStyle(el,'::after').animationName)).toBe('none');
  expect(await page.locator('.st-shell').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 });
});
