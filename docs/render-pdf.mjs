import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'arena-wolf-plano.html');
const outPath = path.join(__dirname, 'ArenaWolf-Plano-de-Negocio.pdf');

const browser = await chromium.launch({
  executablePath: `${process.env.LOCALAPPDATA}/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-win64/chrome-headless-shell.exe`,
});
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({
  path: outPath,
  format: 'A4',
  printBackground: true,
  margin: { top: 0, bottom: 0, left: 0, right: 0 },
});
await browser.close();
console.log('PDF gerado:', outPath);
