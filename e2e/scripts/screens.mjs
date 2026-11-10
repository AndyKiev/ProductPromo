// Visual check helper: log in and save full-size screenshots of the given pages.
//   node scripts/screens.mjs [--theme=sand] [--size=1280x800] /admin/nomenclature/markets "/admin/promo/promo-types#open=Добавить"
// A "#open=<button name>" suffix clicks that button after load (e.g. to show a dialog or menu).
// Output: test-results/screens/<n>-<slug>.png
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const base = process.env.FRONTEND_URL ?? 'http://127.0.0.1:8013';
const args = process.argv.slice(2);
const opt = (name, dflt) => (args.find((a) => a.startsWith(`--${name}=`)) ?? `=${dflt}`).split('=')[1];
const [w, h] = opt('size', '1280x800').split('x').map(Number);
const theme = opt('theme', '');
const pages = args.filter((a) => !a.startsWith('--'));
const out = 'test-results/screens';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: w, height: h } });
if (theme) await page.addInitScript((t) => localStorage.setItem('catalog.theme', t), theme);
await page.goto(`${base}/auth/login`);
await page.locator('#username').fill(process.env.PP_USER ?? 'UKR7101004');
await page.locator('#password').fill(process.env.PP_PASSWORD ?? '111');
await page.locator('button[type=submit]').click();
await page.waitForURL(/\/admin\//);

let n = 0;
for (const target of pages) {
    const [path, hash] = target.split('#');
    await page.goto(`${base}${path}`);
    await page.waitForLoadState('networkidle');
    if (hash?.startsWith('open=')) {
        await page.getByRole('button', { name: decodeURIComponent(hash.slice(5)), exact: true }).first().click();
        await page.waitForTimeout(400);
    }
    const file = `${out}/${++n}-${(path + (hash ?? '')).replace(/[^a-z0-9]+/gi, '_')}.png`;
    await page.screenshot({ path: file });
    console.log(file);
}
await browser.close();
