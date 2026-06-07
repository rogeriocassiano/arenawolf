# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-full.spec.ts >> Painel Admin — Gerenciamento de Máquinas >> lista de máquinas carrega com status
- Location: e2e/admin-full.spec.ts:64:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /máquinas|pcs/i })
Expected: visible
Error: strict mode violation: getByRole('heading', { name: /máquinas|pcs/i }) resolved to 2 elements:
    1) <h1 class="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">Máquinas</h1> aka getByRole('heading', { name: 'Máquinas' })
    2) <h2 class="font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted text-xs tracking-widest uppercase flex items-center gap-2">…</h2> aka getByRole('heading', { name: 'PCs Gamer' })

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: /máquinas|pcs/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - main [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - heading "Máquinas" [level=1] [ref=e6]
          - paragraph [ref=e7]: Gerencie status e configurações das máquinas
        - generic [ref=e8]:
          - generic [ref=e9]:
            - text: "Wake-on-LAN: Para ligar PCs remotamente, cadastre o MAC address de cada PC e configure o servidor WoL local. O MAC é encontrado no Windows com"
            - code [ref=e10]: ipconfig /all
            - text: .
          - generic [ref=e11]:
            - heading "PCs Gamer" [level=2] [ref=e12]:
              - img [ref=e13]
              - text: PCs Gamer
            - table [ref=e16]:
              - rowgroup [ref=e17]:
                - row "Máquina ID (UUID) MAC Address Status Preço/h Alterar Status Energia" [ref=e18]:
                  - columnheader "Máquina" [ref=e19]
                  - columnheader "ID (UUID)" [ref=e20]
                  - columnheader "MAC Address" [ref=e21]
                  - columnheader "Status" [ref=e22]
                  - columnheader "Preço/h" [ref=e23]
                  - columnheader "Alterar Status" [ref=e24]
                  - columnheader "Energia" [ref=e25]
              - rowgroup [ref=e26]:
                - row "Wolf 01 924203e1-7976-474a-9db2-4e35e0379f59 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e27]:
                  - cell "Wolf 01" [ref=e28]
                  - cell "924203e1-7976-474a-9db2-4e35e0379f59" [ref=e29]:
                    - button "924203e1-7976-474a-9db2-4e35e0379f59" [ref=e30]:
                      - generic [ref=e31]: 924203e1-7976-474a-9db2-4e35e0379f59
                      - img [ref=e32]
                  - cell "Não cadastrado" [ref=e35]:
                    - button "Não cadastrado" [ref=e36]:
                      - generic [ref=e37]: Não cadastrado
                      - img [ref=e38]
                  - cell "Livre" [ref=e41]:
                    - generic [ref=e42]: Livre
                  - cell "R$ 10,00" [ref=e44]
                  - cell "Livre" [ref=e45]:
                    - combobox [ref=e46]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e47]:
                    - generic [ref=e48]:
                      - button "Ligar" [ref=e49]:
                        - img [ref=e50]
                        - text: Ligar
                      - button "Desligar" [ref=e52]:
                        - img [ref=e53]
                        - text: Desligar
                - row "Wolf 02 2cb107c9-b272-4d01-bc33-a30a438579fd Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e57]:
                  - cell "Wolf 02" [ref=e58]
                  - cell "2cb107c9-b272-4d01-bc33-a30a438579fd" [ref=e59]:
                    - button "2cb107c9-b272-4d01-bc33-a30a438579fd" [ref=e60]:
                      - generic [ref=e61]: 2cb107c9-b272-4d01-bc33-a30a438579fd
                      - img [ref=e62]
                  - cell "Não cadastrado" [ref=e65]:
                    - button "Não cadastrado" [ref=e66]:
                      - generic [ref=e67]: Não cadastrado
                      - img [ref=e68]
                  - cell "Livre" [ref=e71]:
                    - generic [ref=e72]: Livre
                  - cell "R$ 10,00" [ref=e74]
                  - cell "Livre" [ref=e75]:
                    - combobox [ref=e76]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e77]:
                    - generic [ref=e78]:
                      - button "Ligar" [ref=e79]:
                        - img [ref=e80]
                        - text: Ligar
                      - button "Desligar" [ref=e82]:
                        - img [ref=e83]
                        - text: Desligar
                - row "Wolf 03 42ef4686-b58e-4fe5-b7b5-a29a4d38d462 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e87]:
                  - cell "Wolf 03" [ref=e88]
                  - cell "42ef4686-b58e-4fe5-b7b5-a29a4d38d462" [ref=e89]:
                    - button "42ef4686-b58e-4fe5-b7b5-a29a4d38d462" [ref=e90]:
                      - generic [ref=e91]: 42ef4686-b58e-4fe5-b7b5-a29a4d38d462
                      - img [ref=e92]
                  - cell "Não cadastrado" [ref=e95]:
                    - button "Não cadastrado" [ref=e96]:
                      - generic [ref=e97]: Não cadastrado
                      - img [ref=e98]
                  - cell "Livre" [ref=e101]:
                    - generic [ref=e102]: Livre
                  - cell "R$ 10,00" [ref=e104]
                  - cell "Livre" [ref=e105]:
                    - combobox [ref=e106]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e107]:
                    - generic [ref=e108]:
                      - button "Ligar" [ref=e109]:
                        - img [ref=e110]
                        - text: Ligar
                      - button "Desligar" [ref=e112]:
                        - img [ref=e113]
                        - text: Desligar
                - row "Wolf 04 3ff2b4ce-1312-4c0d-9404-6931a044925e Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e117]:
                  - cell "Wolf 04" [ref=e118]
                  - cell "3ff2b4ce-1312-4c0d-9404-6931a044925e" [ref=e119]:
                    - button "3ff2b4ce-1312-4c0d-9404-6931a044925e" [ref=e120]:
                      - generic [ref=e121]: 3ff2b4ce-1312-4c0d-9404-6931a044925e
                      - img [ref=e122]
                  - cell "Não cadastrado" [ref=e125]:
                    - button "Não cadastrado" [ref=e126]:
                      - generic [ref=e127]: Não cadastrado
                      - img [ref=e128]
                  - cell "Livre" [ref=e131]:
                    - generic [ref=e132]: Livre
                  - cell "R$ 10,00" [ref=e134]
                  - cell "Livre" [ref=e135]:
                    - combobox [ref=e136]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e137]:
                    - generic [ref=e138]:
                      - button "Ligar" [ref=e139]:
                        - img [ref=e140]
                        - text: Ligar
                      - button "Desligar" [ref=e142]:
                        - img [ref=e143]
                        - text: Desligar
                - row "Wolf 05 cf041b09-bcde-4de0-a5ce-4f6f60a9f9be Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e147]:
                  - cell "Wolf 05" [ref=e148]
                  - cell "cf041b09-bcde-4de0-a5ce-4f6f60a9f9be" [ref=e149]:
                    - button "cf041b09-bcde-4de0-a5ce-4f6f60a9f9be" [ref=e150]:
                      - generic [ref=e151]: cf041b09-bcde-4de0-a5ce-4f6f60a9f9be
                      - img [ref=e152]
                  - cell "Não cadastrado" [ref=e155]:
                    - button "Não cadastrado" [ref=e156]:
                      - generic [ref=e157]: Não cadastrado
                      - img [ref=e158]
                  - cell "Livre" [ref=e161]:
                    - generic [ref=e162]: Livre
                  - cell "R$ 10,00" [ref=e164]
                  - cell "Livre" [ref=e165]:
                    - combobox [ref=e166]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e167]:
                    - generic [ref=e168]:
                      - button "Ligar" [ref=e169]:
                        - img [ref=e170]
                        - text: Ligar
                      - button "Desligar" [ref=e172]:
                        - img [ref=e173]
                        - text: Desligar
                - row "Wolf 06 f0999b04-a9d0-4942-b370-c3328ddffb14 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e177]:
                  - cell "Wolf 06" [ref=e178]
                  - cell "f0999b04-a9d0-4942-b370-c3328ddffb14" [ref=e179]:
                    - button "f0999b04-a9d0-4942-b370-c3328ddffb14" [ref=e180]:
                      - generic [ref=e181]: f0999b04-a9d0-4942-b370-c3328ddffb14
                      - img [ref=e182]
                  - cell "Não cadastrado" [ref=e185]:
                    - button "Não cadastrado" [ref=e186]:
                      - generic [ref=e187]: Não cadastrado
                      - img [ref=e188]
                  - cell "Livre" [ref=e191]:
                    - generic [ref=e192]: Livre
                  - cell "R$ 10,00" [ref=e194]
                  - cell "Livre" [ref=e195]:
                    - combobox [ref=e196]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e197]:
                    - generic [ref=e198]:
                      - button "Ligar" [ref=e199]:
                        - img [ref=e200]
                        - text: Ligar
                      - button "Desligar" [ref=e202]:
                        - img [ref=e203]
                        - text: Desligar
                - row "Wolf 07 e06feb73-d8e6-4914-befd-9c91a98e4204 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e207]:
                  - cell "Wolf 07" [ref=e208]
                  - cell "e06feb73-d8e6-4914-befd-9c91a98e4204" [ref=e209]:
                    - button "e06feb73-d8e6-4914-befd-9c91a98e4204" [ref=e210]:
                      - generic [ref=e211]: e06feb73-d8e6-4914-befd-9c91a98e4204
                      - img [ref=e212]
                  - cell "Não cadastrado" [ref=e215]:
                    - button "Não cadastrado" [ref=e216]:
                      - generic [ref=e217]: Não cadastrado
                      - img [ref=e218]
                  - cell "Livre" [ref=e221]:
                    - generic [ref=e222]: Livre
                  - cell "R$ 10,00" [ref=e224]
                  - cell "Livre" [ref=e225]:
                    - combobox [ref=e226]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e227]:
                    - generic [ref=e228]:
                      - button "Ligar" [ref=e229]:
                        - img [ref=e230]
                        - text: Ligar
                      - button "Desligar" [ref=e232]:
                        - img [ref=e233]
                        - text: Desligar
                - row "Wolf 08 fbf71f8d-9d9c-4c04-a8dd-c88178aa50de Não cadastrado Ocupado R$ 10,00 Ocupado Ligar Desligar" [ref=e237]:
                  - cell "Wolf 08" [ref=e238]
                  - cell "fbf71f8d-9d9c-4c04-a8dd-c88178aa50de" [ref=e239]:
                    - button "fbf71f8d-9d9c-4c04-a8dd-c88178aa50de" [ref=e240]:
                      - generic [ref=e241]: fbf71f8d-9d9c-4c04-a8dd-c88178aa50de
                      - img [ref=e242]
                  - cell "Não cadastrado" [ref=e245]:
                    - button "Não cadastrado" [ref=e246]:
                      - generic [ref=e247]: Não cadastrado
                      - img [ref=e248]
                  - cell "Ocupado" [ref=e251]:
                    - generic [ref=e252]: Ocupado
                  - cell "R$ 10,00" [ref=e253]
                  - cell "Ocupado" [ref=e254]:
                    - combobox [ref=e255]:
                      - option "Livre"
                      - option "Ocupado" [selected]
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e256]:
                    - generic [ref=e257]:
                      - button "Ligar" [ref=e258]:
                        - img [ref=e259]
                        - text: Ligar
                      - button "Desligar" [ref=e261]:
                        - img [ref=e262]
                        - text: Desligar
                - row "Wolf 09 3b853f5d-71c2-4d43-b5ff-a2dc0641f387 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e266]:
                  - cell "Wolf 09" [ref=e267]
                  - cell "3b853f5d-71c2-4d43-b5ff-a2dc0641f387" [ref=e268]:
                    - button "3b853f5d-71c2-4d43-b5ff-a2dc0641f387" [ref=e269]:
                      - generic [ref=e270]: 3b853f5d-71c2-4d43-b5ff-a2dc0641f387
                      - img [ref=e271]
                  - cell "Não cadastrado" [ref=e274]:
                    - button "Não cadastrado" [ref=e275]:
                      - generic [ref=e276]: Não cadastrado
                      - img [ref=e277]
                  - cell "Livre" [ref=e280]:
                    - generic [ref=e281]: Livre
                  - cell "R$ 10,00" [ref=e283]
                  - cell "Livre" [ref=e284]:
                    - combobox [ref=e285]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e286]:
                    - generic [ref=e287]:
                      - button "Ligar" [ref=e288]:
                        - img [ref=e289]
                        - text: Ligar
                      - button "Desligar" [ref=e291]:
                        - img [ref=e292]
                        - text: Desligar
                - row "Wolf 10 17eb8405-dedb-445a-be77-02da4e47bcc8 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e296]:
                  - cell "Wolf 10" [ref=e297]
                  - cell "17eb8405-dedb-445a-be77-02da4e47bcc8" [ref=e298]:
                    - button "17eb8405-dedb-445a-be77-02da4e47bcc8" [ref=e299]:
                      - generic [ref=e300]: 17eb8405-dedb-445a-be77-02da4e47bcc8
                      - img [ref=e301]
                  - cell "Não cadastrado" [ref=e304]:
                    - button "Não cadastrado" [ref=e305]:
                      - generic [ref=e306]: Não cadastrado
                      - img [ref=e307]
                  - cell "Livre" [ref=e310]:
                    - generic [ref=e311]: Livre
                  - cell "R$ 10,00" [ref=e313]
                  - cell "Livre" [ref=e314]:
                    - combobox [ref=e315]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e316]:
                    - generic [ref=e317]:
                      - button "Ligar" [ref=e318]:
                        - img [ref=e319]
                        - text: Ligar
                      - button "Desligar" [ref=e321]:
                        - img [ref=e322]
                        - text: Desligar
          - generic [ref=e326]:
            - heading "PlayStation 5" [level=2] [ref=e327]:
              - img [ref=e328]
              - text: PlayStation 5
            - table [ref=e331]:
              - rowgroup [ref=e332]:
                - row "Máquina ID (UUID) MAC Address Status Preço/h Alterar Status Energia" [ref=e333]:
                  - columnheader "Máquina" [ref=e334]
                  - columnheader "ID (UUID)" [ref=e335]
                  - columnheader "MAC Address" [ref=e336]
                  - columnheader "Status" [ref=e337]
                  - columnheader "Preço/h" [ref=e338]
                  - columnheader "Alterar Status" [ref=e339]
                  - columnheader "Energia" [ref=e340]
              - rowgroup [ref=e341]:
                - row "PS5 01 98fd0b46-876d-4d7c-b2de-7af050fc3892 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e342]:
                  - cell "PS5 01" [ref=e343]
                  - cell "98fd0b46-876d-4d7c-b2de-7af050fc3892" [ref=e344]:
                    - button "98fd0b46-876d-4d7c-b2de-7af050fc3892" [ref=e345]:
                      - generic [ref=e346]: 98fd0b46-876d-4d7c-b2de-7af050fc3892
                      - img [ref=e347]
                  - cell "Não cadastrado" [ref=e350]:
                    - button "Não cadastrado" [ref=e351]:
                      - generic [ref=e352]: Não cadastrado
                      - img [ref=e353]
                  - cell "Livre" [ref=e356]:
                    - generic [ref=e357]: Livre
                  - cell "R$ 10,00" [ref=e359]
                  - cell "Livre" [ref=e360]:
                    - combobox [ref=e361]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e362]:
                    - generic [ref=e363]:
                      - button "Ligar" [ref=e364]:
                        - img [ref=e365]
                        - text: Ligar
                      - button "Desligar" [ref=e367]:
                        - img [ref=e368]
                        - text: Desligar
                - row "PS5 02 130b63d0-92ae-4dec-8294-99dc82a9207f Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e372]:
                  - cell "PS5 02" [ref=e373]
                  - cell "130b63d0-92ae-4dec-8294-99dc82a9207f" [ref=e374]:
                    - button "130b63d0-92ae-4dec-8294-99dc82a9207f" [ref=e375]:
                      - generic [ref=e376]: 130b63d0-92ae-4dec-8294-99dc82a9207f
                      - img [ref=e377]
                  - cell "Não cadastrado" [ref=e380]:
                    - button "Não cadastrado" [ref=e381]:
                      - generic [ref=e382]: Não cadastrado
                      - img [ref=e383]
                  - cell "Livre" [ref=e386]:
                    - generic [ref=e387]: Livre
                  - cell "R$ 10,00" [ref=e389]
                  - cell "Livre" [ref=e390]:
                    - combobox [ref=e391]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e392]:
                    - generic [ref=e393]:
                      - button "Ligar" [ref=e394]:
                        - img [ref=e395]
                        - text: Ligar
                      - button "Desligar" [ref=e397]:
                        - img [ref=e398]
                        - text: Desligar
                - row "PS5 03 a71b9d59-a53b-4a36-aa1f-1b2d41780edc Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e402]:
                  - cell "PS5 03" [ref=e403]
                  - cell "a71b9d59-a53b-4a36-aa1f-1b2d41780edc" [ref=e404]:
                    - button "a71b9d59-a53b-4a36-aa1f-1b2d41780edc" [ref=e405]:
                      - generic [ref=e406]: a71b9d59-a53b-4a36-aa1f-1b2d41780edc
                      - img [ref=e407]
                  - cell "Não cadastrado" [ref=e410]:
                    - button "Não cadastrado" [ref=e411]:
                      - generic [ref=e412]: Não cadastrado
                      - img [ref=e413]
                  - cell "Livre" [ref=e416]:
                    - generic [ref=e417]: Livre
                  - cell "R$ 10,00" [ref=e419]
                  - cell "Livre" [ref=e420]:
                    - combobox [ref=e421]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e422]:
                    - generic [ref=e423]:
                      - button "Ligar" [ref=e424]:
                        - img [ref=e425]
                        - text: Ligar
                      - button "Desligar" [ref=e427]:
                        - img [ref=e428]
                        - text: Desligar
    - region "Notifications alt+T"
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e437] [cursor=pointer]:
    - img [ref=e438]
  - alert [ref=e441]
```

# Test source

```ts
  1   | /**
  2   |  * E2E Tests — Painel Admin Completo
  3   |  * Operator, Machines, Users, Apps, Financial, Support, Settings
  4   |  */
  5   | 
  6   | import { test, expect, Page } from "@playwright/test";
  7   | 
  8   | const TEST_ADMIN = {
  9   |   email: process.env.TEST_ADMIN_EMAIL ?? "luan@arenawolf.com",
  10  |   password: process.env.TEST_ADMIN_PASSWORD ?? "12345678",
  11  | };
  12  | 
  13  | async function loginAsAdmin(page: Page) {
  14  |   await page.goto("/login");
  15  |   await page.fill('input[type="email"]', TEST_ADMIN.email);
  16  |   await page.fill('input[type="password"]', TEST_ADMIN.password);
  17  |   await page.click('button[type="submit"]');
  18  |   await page.waitForURL(/dashboard|admin/, { timeout: 15000 });
  19  | }
  20  | 
  21  | test.describe("Painel Admin — Painel Operador", () => {
  22  |   test.beforeEach(async ({ page }) => {
  23  |     await loginAsAdmin(page);
  24  |     await page.goto("/admin/operator");
  25  |   });
  26  | 
  27  |   test("painel operador carrega com grid de máquinas", async ({ page }) => {
  28  |     await expect(page.getByRole("heading", { name: /painel operador/i })).toBeVisible({ timeout: 10000 });
  29  |     // Grid de máquinas
  30  |     await expect(page.getByText(/wolf \d+|ps5 \d+/i).first()).toBeVisible({ timeout: 20000 });
  31  |   });
  32  | 
  33  |   test("KPIs visíveis no painel operador", async ({ page }) => {
  34  |     await page.waitForLoadState("domcontentloaded");
  35  |     await expect(page.locator("text=/em uso|disponíveis|sessões ativas/i").first()).toBeVisible({ timeout: 10000 });
  36  |   });
  37  | 
  38  |   test("botão Iniciar Sessão abre modal", async ({ page }) => {
  39  |     const startBtn = page.getByRole("button", { name: /iniciar sess/i }).first();
  40  |     await expect(startBtn).toBeVisible({ timeout: 10000 });
  41  |     await startBtn.click();
  42  |     // Modal com formulário
  43  |     await expect(page.getByText(/selecionar usuário|minutos|iniciar/i).nth(1)).toBeVisible({ timeout: 8000 });
  44  |   });
  45  | 
  46  |   test("adicionar tempo em máquina ocupada", async ({ page }) => {
  47  |     // Procura máquina ocupada
  48  |     const machineCard = page.locator("[data-testid='machine-card']").filter({ hasText: /em uso|ocupada/i }).first();
  49  |     if (await machineCard.isVisible().catch(() => false)) {
  50  |       await machineCard.getByRole("button", { name: /adicionar tempo/i }).click();
  51  |       await expect(page.getByText(/adicionar tempo|minutos/i)).toBeVisible({ timeout: 5000 });
  52  |     } else {
  53  |       test.skip(true, "Nenhuma máquina ocupada no momento");
  54  |     }
  55  |   });
  56  | });
  57  | 
  58  | test.describe("Painel Admin — Gerenciamento de Máquinas", () => {
  59  |   test.beforeEach(async ({ page }) => {
  60  |     await loginAsAdmin(page);
  61  |     await page.goto("/admin/machines");
  62  |   });
  63  | 
  64  |   test("lista de máquinas carrega com status", async ({ page }) => {
> 65  |     await expect(page.getByRole("heading", { name: /máquinas|pcs/i })).toBeVisible({ timeout: 10000 });
      |                                                                        ^ Error: expect(locator).toBeVisible() failed
  66  |     await expect(page.getByText(/wolf \d+|ps5 \d+/i).first()).toBeVisible({ timeout: 10000 });
  67  |   });
  68  | 
  69  |   test("campo MAC address editável", async ({ page }) => {
  70  |     // Primeira máquina PC (não PS5)
  71  |     const macInput = page.locator('input[name*="mac"]').first();
  72  |     await expect(macInput).toBeVisible({ timeout: 10000 });
  73  |     await macInput.fill("AA:BB:CC:DD:EE:FF");
  74  |     await expect(macInput).toHaveValue("AA:BB:CC:DD:EE:FF");
  75  |   });
  76  | 
  77  |   test("botões Ligar/Desligar visíveis para PCs", async ({ page }) => {
  78  |     const ligarBtn = page.getByRole("button", { name: /ligar|wakeup/i }).first();
  79  |     const desligarBtn = page.getByRole("button", { name: /desligar|shutdown/i }).first();
  80  |     // Pelo menos um dos dois deve existir para PCs
  81  |     await expect(ligarBtn.or(desligarBtn)).toBeVisible({ timeout: 10000 });
  82  |   });
  83  | 
  84  |   test("copiar ID da máquina", async ({ page }) => {
  85  |     const copyBtn = page.getByRole("button", { name: /copiar id/i }).first();
  86  |     if (await copyBtn.isVisible().catch(() => false)) {
  87  |       await copyBtn.click();
  88  |       // Toast de sucesso
  89  |       await expect(page.getByText(/copiado|clipboard/i)).toBeVisible({ timeout: 3000 });
  90  |     } else {
  91  |       test.skip(true, "Botão de copiar não encontrado");
  92  |     }
  93  |   });
  94  | });
  95  | 
  96  | test.describe("Painel Admin — Usuários", () => {
  97  |   test.beforeEach(async ({ page }) => {
  98  |     await loginAsAdmin(page);
  99  |     await page.goto("/admin/users");
  100 |   });
  101 | 
  102 |   test("lista de usuários carrega", async ({ page }) => {
  103 |     await expect(page.getByRole("heading", { name: /usuários|clientes/i })).toBeVisible({ timeout: 10000 });
  104 |     // Tabela ou cards de usuários
  105 |     await expect(page.locator("table, [data-testid='user-card']").first()).toBeVisible({ timeout: 10000 });
  106 |   });
  107 | 
  108 |   test("busca de usuários funciona", async ({ page }) => {
  109 |     const searchInput = page.getByPlaceholder(/buscar|pesquisar|search/i);
  110 |     if (await searchInput.isVisible().catch(() => false)) {
  111 |       await searchInput.fill("test");
  112 |       await page.waitForTimeout(500); // debounce
  113 |       // Resultados devem filtrar
  114 |       await expect(page.locator("text=/test|sem resultados/i").first()).toBeVisible({ timeout: 5000 });
  115 |     } else {
  116 |       test.skip(true, "Campo de busca não encontrado");
  117 |     }
  118 |   });
  119 | 
  120 |   test("ações de usuário disponíveis", async ({ page }) => {
  121 |     // Botões de ação na primeira linha
  122 |     const actionsBtn = page.getByRole("button", { name: /ações|menu/i }).first();
  123 |     if (await actionsBtn.isVisible().catch(() => false)) {
  124 |       await actionsBtn.click();
  125 |       await expect(page.getByText(/adicionar créditos|banir|editar/i).first()).toBeVisible({ timeout: 3000 });
  126 |     } else {
  127 |       test.skip(true, "Menu de ações não encontrado");
  128 |     }
  129 |   });
  130 | });
  131 | 
  132 | test.describe("Painel Admin — Apps", () => {
  133 |   test.beforeEach(async ({ page }) => {
  134 |     await loginAsAdmin(page);
  135 |     await page.goto("/admin/apps");
  136 |   });
  137 | 
  138 |   test("catálogo de apps carrega", async ({ page }) => {
  139 |     await expect(page.getByRole("heading", { name: /aplicativos|apps/i })).toBeVisible({ timeout: 10000 });
  140 |     // Tabs ou lista
  141 |     await expect(page.getByRole("tab").or(page.locator("[data-testid='app-card']")).first()).toBeVisible({ timeout: 10000 });
  142 |   });
  143 | 
  144 |   test("aba 'Por Máquina' mostra toggles", async ({ page }) => {
  145 |     const porMaquinaTab = page.getByRole("tab", { name: /por máquina|por pc/i });
  146 |     if (await porMaquinaTab.isVisible().catch(() => false)) {
  147 |       await porMaquinaTab.click();
  148 |       await expect(page.getByRole("switch").or(page.locator("input[type='checkbox']")).first()).toBeVisible({ timeout: 5000 });
  149 |     } else {
  150 |       test.skip(true, "Aba 'Por Máquina' não encontrada");
  151 |     }
  152 |   });
  153 | });
  154 | 
  155 | test.describe("Painel Admin — Financeiro", () => {
  156 |   test.beforeEach(async ({ page }) => {
  157 |     await loginAsAdmin(page);
  158 |     await page.goto("/admin/financial");
  159 |   });
  160 | 
  161 |   test("dashboard financeiro carrega", async ({ page }) => {
  162 |     await expect(page.getByRole("heading", { name: /financeiro|faturamento/i })).toBeVisible({ timeout: 10000 });
  163 |     // KPIs de receita
  164 |     await expect(page.getByText(/receita|vendas|transações/i).first()).toBeVisible({ timeout: 10000 });
  165 |   });
```