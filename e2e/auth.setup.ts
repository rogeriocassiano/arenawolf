/**
 * Setup project — autentica 1x por role e salva storageState.
 * Os specs usam test.use({ storageState }) em vez de logar via UI a cada teste.
 */
import { test as setup, expect } from "@playwright/test";
import { ADMIN_FILE, USER_FILE } from "./auth-files";

const ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL ?? "luan@arenawolf.com",
  password: process.env.TEST_ADMIN_PASSWORD ?? "12345678",
};
const USER = {
  email: process.env.TEST_USER_EMAIL ?? "user@user.com",
  password: process.env.TEST_USER_PASSWORD ?? "12345678",
};

async function uiLogin(page: import("@playwright/test").Page, creds: { email: string; password: string }) {
  await page.goto("/login", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|admin/, { waitUntil: "commit", timeout: 90_000 });
  await expect(page).toHaveURL(/dashboard|admin/);
}

async function loginWithRetry(page: import("@playwright/test").Page, creds: { email: string; password: string }) {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await uiLogin(page, creds);
      return;
    } catch (err) {
      lastErr = err;
      console.log(`[auth.setup] login attempt ${attempt}/3 failed for ${creds.email}: ${String(err).slice(0, 120)}`);
    }
  }
  throw lastErr;
}

setup.describe.configure({ mode: "serial" });

setup("authenticate admin", async ({ page }) => {
  setup.setTimeout(360_000);
  await loginWithRetry(page, ADMIN);
  await page.context().storageState({ path: ADMIN_FILE });
});

setup("authenticate user", async ({ page }) => {
  setup.setTimeout(360_000);
  await loginWithRetry(page, USER);
  await page.context().storageState({ path: USER_FILE });
});
