import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'wolf-tech-brandbook.html');
const outPath = path.join(__dirname, 'WolfTech-Manual-da-Marca.pdf');

const pwDir = `${process.env.LOCALAPPDATA}/ms-playwright`;
const shellDir = fs.readdirSync(pwDir)
  .filter(d => d.startsWith('chromium_headless_shell'))
  .sort()
  .pop();
const executablePath = `${pwDir}/${shellDir}/chrome-headless-shell-win64/chrome-headless-shell.exe`;

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: outPath, format: 'A4', printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
await browser.close();
console.log('PDF gerado:', outPath);
