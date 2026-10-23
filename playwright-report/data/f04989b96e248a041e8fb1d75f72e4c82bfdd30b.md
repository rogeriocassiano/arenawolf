# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-full.spec.ts >> Painel Admin — Gerenciamento de Máquinas >> lista de máquinas carrega com status
- Location: e2e\admin-full.spec.ts:54:7

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
                - row "Wolf 01 bf6f7745-6e0a-4acd-8ebd-e5a5940efd54 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e27]:
                  - cell "Wolf 01" [ref=e28]
                  - cell "bf6f7745-6e0a-4acd-8ebd-e5a5940efd54" [ref=e29]:
                    - button "bf6f7745-6e0a-4acd-8ebd-e5a5940efd54" [ref=e30]:
                      - generic [ref=e31]: bf6f7745-6e0a-4acd-8ebd-e5a5940efd54
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
                - row "Wolf 02 e6fa23c9-c0b4-4786-9e63-9dd1ef179acd Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e57]:
                  - cell "Wolf 02" [ref=e58]
                  - cell "e6fa23c9-c0b4-4786-9e63-9dd1ef179acd" [ref=e59]:
                    - button "e6fa23c9-c0b4-4786-9e63-9dd1ef179acd" [ref=e60]:
                      - generic [ref=e61]: e6fa23c9-c0b4-4786-9e63-9dd1ef179acd
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
                - row "Wolf 03 4fb2ef5a-3318-470d-aa51-6cf09c1f8483 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e87]:
                  - cell "Wolf 03" [ref=e88]
                  - cell "4fb2ef5a-3318-470d-aa51-6cf09c1f8483" [ref=e89]:
                    - button "4fb2ef5a-3318-470d-aa51-6cf09c1f8483" [ref=e90]:
                      - generic [ref=e91]: 4fb2ef5a-3318-470d-aa51-6cf09c1f8483
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
                - row "Wolf 04 0d346890-011c-4fe0-ba40-cb440e745989 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e117]:
                  - cell "Wolf 04" [ref=e118]
                  - cell "0d346890-011c-4fe0-ba40-cb440e745989" [ref=e119]:
                    - button "0d346890-011c-4fe0-ba40-cb440e745989" [ref=e120]:
                      - generic [ref=e121]: 0d346890-011c-4fe0-ba40-cb440e745989
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
                - row "Wolf 05 5ef5de10-ed49-4288-90e6-032b819d6e4b Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e147]:
                  - cell "Wolf 05" [ref=e148]
                  - cell "5ef5de10-ed49-4288-90e6-032b819d6e4b" [ref=e149]:
                    - button "5ef5de10-ed49-4288-90e6-032b819d6e4b" [ref=e150]:
                      - generic [ref=e151]: 5ef5de10-ed49-4288-90e6-032b819d6e4b
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
                - row "Wolf 06 76fd64dc-503f-4831-ab45-b732c459f21d Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e177]:
                  - cell "Wolf 06" [ref=e178]
                  - cell "76fd64dc-503f-4831-ab45-b732c459f21d" [ref=e179]:
                    - button "76fd64dc-503f-4831-ab45-b732c459f21d" [ref=e180]:
                      - generic [ref=e181]: 76fd64dc-503f-4831-ab45-b732c459f21d
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
                - row "Wolf 07 5ecdce89-1a5d-4880-8641-022511667cb2 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e207]:
                  - cell "Wolf 07" [ref=e208]
                  - cell "5ecdce89-1a5d-4880-8641-022511667cb2" [ref=e209]:
                    - button "5ecdce89-1a5d-4880-8641-022511667cb2" [ref=e210]:
                      - generic [ref=e211]: 5ecdce89-1a5d-4880-8641-022511667cb2
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
                - row "Wolf 08 a7fef2e4-a9f0-4598-9d82-fcbdbf0bae8b Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e237]:
                  - cell "Wolf 08" [ref=e238]
                  - cell "a7fef2e4-a9f0-4598-9d82-fcbdbf0bae8b" [ref=e239]:
                    - button "a7fef2e4-a9f0-4598-9d82-fcbdbf0bae8b" [ref=e240]:
                      - generic [ref=e241]: a7fef2e4-a9f0-4598-9d82-fcbdbf0bae8b
                      - img [ref=e242]
                  - cell "Não cadastrado" [ref=e245]:
                    - button "Não cadastrado" [ref=e246]:
                      - generic [ref=e247]: Não cadastrado
                      - img [ref=e248]
                  - cell "Livre" [ref=e251]:
                    - generic [ref=e252]: Livre
                  - cell "R$ 10,00" [ref=e254]
                  - cell "Livre" [ref=e255]:
                    - combobox [ref=e256]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e257]:
                    - generic [ref=e258]:
                      - button "Ligar" [ref=e259]:
                        - img [ref=e260]
                        - text: Ligar
                      - button "Desligar" [ref=e262]:
                        - img [ref=e263]
                        - text: Desligar
                - row "Wolf 09 5dd39452-b848-4458-9175-e40a7e9cc6ce Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e267]:
                  - cell "Wolf 09" [ref=e268]
                  - cell "5dd39452-b848-4458-9175-e40a7e9cc6ce" [ref=e269]:
                    - button "5dd39452-b848-4458-9175-e40a7e9cc6ce" [ref=e270]:
                      - generic [ref=e271]: 5dd39452-b848-4458-9175-e40a7e9cc6ce
                      - img [ref=e272]
                  - cell "Não cadastrado" [ref=e275]:
                    - button "Não cadastrado" [ref=e276]:
                      - generic [ref=e277]: Não cadastrado
                      - img [ref=e278]
                  - cell "Livre" [ref=e281]:
                    - generic [ref=e282]: Livre
                  - cell "R$ 10,00" [ref=e284]
                  - cell "Livre" [ref=e285]:
                    - combobox [ref=e286]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e287]:
                    - generic [ref=e288]:
                      - button "Ligar" [ref=e289]:
                        - img [ref=e290]
                        - text: Ligar
                      - button "Desligar" [ref=e292]:
                        - img [ref=e293]
                        - text: Desligar
                - row "Wolf 10 8cde252a-a598-4a13-be33-6c941b79ec76 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e297]:
                  - cell "Wolf 10" [ref=e298]
                  - cell "8cde252a-a598-4a13-be33-6c941b79ec76" [ref=e299]:
                    - button "8cde252a-a598-4a13-be33-6c941b79ec76" [ref=e300]:
                      - generic [ref=e301]: 8cde252a-a598-4a13-be33-6c941b79ec76
                      - img [ref=e302]
                  - cell "Não cadastrado" [ref=e305]:
                    - button "Não cadastrado" [ref=e306]:
                      - generic [ref=e307]: Não cadastrado
                      - img [ref=e308]
                  - cell "Livre" [ref=e311]:
                    - generic [ref=e312]: Livre
                  - cell "R$ 10,00" [ref=e314]
                  - cell "Livre" [ref=e315]:
                    - combobox [ref=e316]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e317]:
                    - generic [ref=e318]:
                      - button "Ligar" [ref=e319]:
                        - img [ref=e320]
                        - text: Ligar
                      - button "Desligar" [ref=e322]:
                        - img [ref=e323]
                        - text: Desligar
          - generic [ref=e327]:
            - heading "PlayStation 5" [level=2] [ref=e328]:
              - img [ref=e329]
              - text: PlayStation 5
            - table [ref=e332]:
              - rowgroup [ref=e333]:
                - row "Máquina ID (UUID) MAC Address Status Preço/h Alterar Status Energia" [ref=e334]:
                  - columnheader "Máquina" [ref=e335]
                  - columnheader "ID (UUID)" [ref=e336]
                  - columnheader "MAC Address" [ref=e337]
                  - columnheader "Status" [ref=e338]
                  - columnheader "Preço/h" [ref=e339]
                  - columnheader "Alterar Status" [ref=e340]
                  - columnheader "Energia" [ref=e341]
              - rowgroup [ref=e342]:
                - row "PS5 01 cd8f4ec0-716a-4d0b-aee3-d2537fdeb25e Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e343]:
                  - cell "PS5 01" [ref=e344]
                  - cell "cd8f4ec0-716a-4d0b-aee3-d2537fdeb25e" [ref=e345]:
                    - button "cd8f4ec0-716a-4d0b-aee3-d2537fdeb25e" [ref=e346]:
                      - generic [ref=e347]: cd8f4ec0-716a-4d0b-aee3-d2537fdeb25e
                      - img [ref=e348]
                  - cell "Não cadastrado" [ref=e351]:
                    - button "Não cadastrado" [ref=e352]:
                      - generic [ref=e353]: Não cadastrado
                      - img [ref=e354]
                  - cell "Livre" [ref=e357]:
                    - generic [ref=e358]: Livre
                  - cell "R$ 10,00" [ref=e360]
                  - cell "Livre" [ref=e361]:
                    - combobox [ref=e362]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e363]:
                    - generic [ref=e364]:
                      - button "Ligar" [ref=e365]:
                        - img [ref=e366]
                        - text: Ligar
                      - button "Desligar" [ref=e368]:
                        - img [ref=e369]
                        - text: Desligar
                - row "PS5 02 cfd1cc18-98b4-4e6e-9a26-f7e9ef2f70f8 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e373]:
                  - cell "PS5 02" [ref=e374]
                  - cell "cfd1cc18-98b4-4e6e-9a26-f7e9ef2f70f8" [ref=e375]:
                    - button "cfd1cc18-98b4-4e6e-9a26-f7e9ef2f70f8" [ref=e376]:
                      - generic [ref=e377]: cfd1cc18-98b4-4e6e-9a26-f7e9ef2f70f8
                      - img [ref=e378]
                  - cell "Não cadastrado" [ref=e381]:
                    - button "Não cadastrado" [ref=e382]:
                      - generic [ref=e383]: Não cadastrado
                      - img [ref=e384]
                  - cell "Livre" [ref=e387]:
                    - generic [ref=e388]: Livre
                  - cell "R$ 10,00" [ref=e390]
                  - cell "Livre" [ref=e391]:
                    - combobox [ref=e392]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e393]:
                    - generic [ref=e394]:
                      - button "Ligar" [ref=e395]:
                        - img [ref=e396]
                        - text: Ligar
                      - button "Desligar" [ref=e398]:
                        - img [ref=e399]
                        - text: Desligar
                - row "PS5 03 f32204e7-eca8-4e59-98be-a7fe0b038806 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e403]:
                  - cell "PS5 03" [ref=e404]
                  - cell "f32204e7-eca8-4e59-98be-a7fe0b038806" [ref=e405]:
                    - button "f32204e7-eca8-4e59-98be-a7fe0b038806" [ref=e406]:
                      - generic [ref=e407]: f32204e7-eca8-4e59-98be-a7fe0b038806
                      - img [ref=e408]
                  - cell "Não cadastrado" [ref=e411]:
                    - button "Não cadastrado" [ref=e412]:
                      - generic [ref=e413]: Não cadastrado
                      - img [ref=e414]
                  - cell "Livre" [ref=e417]:
                    - generic [ref=e418]: Livre
                  - cell "R$ 10,00" [ref=e420]
                  - cell "Livre" [ref=e421]:
                    - combobox [ref=e422]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e423]:
                    - generic [ref=e424]:
                      - button "Ligar" [ref=e425]:
                        - img [ref=e426]
                        - text: Ligar
                      - button "Desligar" [ref=e428]:
                        - img [ref=e429]
                        - text: Desligar
    - region "Notifications alt+T"
  - region "Notifications alt+T"
  - alert [ref=e433]
```

# Test source

```ts
  1   | /**
  2   |  * E2E Tests — Painel Admin Completo
  3   |  * Operator, Machines, Users, Apps, Financial, Support, Settings
  4   |  */
  5   | 
  6   | import { test, expect } from "@playwright/test";
  7   | import { ADMIN_FILE } from "./auth-files";
  8   | 
  9   | test.use({ storageState: ADMIN_FILE });
  10  | 
  11  | test.describe("Painel Admin — Painel Operador", () => {
  12  |   test.beforeEach(async ({ page }) => {
  13  | 
  14  |     await page.goto("/admin/operator");
  15  |   });
  16  | 
  17  |   test("painel operador carrega com grid de máquinas", async ({ page }) => {
  18  |     await expect(page.getByRole("heading", { name: /painel operador/i })).toBeVisible({ timeout: 10000 });
  19  |     // Grid de máquinas
  20  |     await expect(page.getByText(/wolf \d+|ps5 \d+/i).first()).toBeVisible({ timeout: 20000 });
  21  |   });
  22  | 
  23  |   test("KPIs visíveis no painel operador", async ({ page }) => {
  24  |     await page.waitForLoadState("domcontentloaded");
  25  |     await expect(page.locator("text=/em uso|disponíveis|sessões ativas/i").first()).toBeVisible({ timeout: 10000 });
  26  |   });
  27  | 
  28  |   test("botão Iniciar Sessão abre modal", async ({ page }) => {
  29  |     const startBtn = page.getByRole("button", { name: /iniciar sess/i }).first();
  30  |     await expect(startBtn).toBeVisible({ timeout: 10000 });
  31  |     await startBtn.click();
  32  |     // Modal com formulário
  33  |     await expect(page.getByText(/selecionar usuário|minutos|iniciar/i).nth(1)).toBeVisible({ timeout: 8000 });
  34  |   });
  35  | 
  36  |   test("adicionar tempo em máquina ocupada", async ({ page }) => {
  37  |     // Procura máquina ocupada
  38  |     const machineCard = page.locator("[data-testid='machine-card']").filter({ hasText: /em uso|ocupada/i }).first();
  39  |     if (await machineCard.isVisible().catch(() => false)) {
  40  |       await machineCard.getByRole("button", { name: /adicionar tempo/i }).click();
  41  |       await expect(page.getByText(/adicionar tempo|minutos/i)).toBeVisible({ timeout: 5000 });
  42  |     } else {
  43  |       test.skip(true, "Nenhuma máquina ocupada no momento");
  44  |     }
  45  |   });
  46  | });
  47  | 
  48  | test.describe("Painel Admin — Gerenciamento de Máquinas", () => {
  49  |   test.beforeEach(async ({ page }) => {
  50  | 
  51  |     await page.goto("/admin/machines");
  52  |   });
  53  | 
  54  |   test("lista de máquinas carrega com status", async ({ page }) => {
> 55  |     await expect(page.getByRole("heading", { name: /máquinas|pcs/i })).toBeVisible({ timeout: 10000 });
      |                                                                        ^ Error: expect(locator).toBeVisible() failed
  56  |     await expect(page.getByText(/wolf \d+|ps5 \d+/i).first()).toBeVisible({ timeout: 10000 });
  57  |   });
  58  | 
  59  |   test("campo MAC address editável", async ({ page }) => {
  60  |     // Primeira máquina PC (não PS5)
  61  |     const macInput = page.locator('input[name*="mac"]').first();
  62  |     await expect(macInput).toBeVisible({ timeout: 10000 });
  63  |     await macInput.fill("AA:BB:CC:DD:EE:FF");
  64  |     await expect(macInput).toHaveValue("AA:BB:CC:DD:EE:FF");
  65  |   });
  66  | 
  67  |   test("botões Ligar/Desligar visíveis para PCs", async ({ page }) => {
  68  |     const ligarBtn = page.getByRole("button", { name: /ligar|wakeup/i }).first();
  69  |     const desligarBtn = page.getByRole("button", { name: /desligar|shutdown/i }).first();
  70  |     // Pelo menos um dos dois deve existir para PCs
  71  |     await expect(ligarBtn.or(desligarBtn)).toBeVisible({ timeout: 10000 });
  72  |   });
  73  | 
  74  |   test("copiar ID da máquina", async ({ page }) => {
  75  |     const copyBtn = page.getByRole("button", { name: /copiar id/i }).first();
  76  |     if (await copyBtn.isVisible().catch(() => false)) {
  77  |       await copyBtn.click();
  78  |       // Toast de sucesso
  79  |       await expect(page.getByText(/copiado|clipboard/i)).toBeVisible({ timeout: 3000 });
  80  |     } else {
  81  |       test.skip(true, "Botão de copiar não encontrado");
  82  |     }
  83  |   });
  84  | });
  85  | 
  86  | test.describe("Painel Admin — Usuários", () => {
  87  |   test.beforeEach(async ({ page }) => {
  88  | 
  89  |     await page.goto("/admin/users");
  90  |   });
  91  | 
  92  |   test("lista de usuários carrega", async ({ page }) => {
  93  |     await expect(page.getByRole("heading", { name: /usuários|clientes/i })).toBeVisible({ timeout: 10000 });
  94  |     // Tabela ou cards de usuários
  95  |     await expect(page.locator("table, [data-testid='user-card']").first()).toBeVisible({ timeout: 10000 });
  96  |   });
  97  | 
  98  |   test("busca de usuários funciona", async ({ page }) => {
  99  |     const searchInput = page.getByPlaceholder(/buscar|pesquisar|search/i);
  100 |     if (await searchInput.isVisible().catch(() => false)) {
  101 |       await searchInput.fill("test");
  102 |       await page.waitForTimeout(500); // debounce
  103 |       // Resultados devem filtrar
  104 |       await expect(page.locator("text=/test|sem resultados/i").first()).toBeVisible({ timeout: 5000 });
  105 |     } else {
  106 |       test.skip(true, "Campo de busca não encontrado");
  107 |     }
  108 |   });
  109 | 
  110 |   test("ações de usuário disponíveis", async ({ page }) => {
  111 |     // Botões de ação na primeira linha
  112 |     const actionsBtn = page.getByRole("button", { name: /ações|menu/i }).first();
  113 |     if (await actionsBtn.isVisible().catch(() => false)) {
  114 |       await actionsBtn.click();
  115 |       await expect(page.getByText(/adicionar créditos|banir|editar/i).first()).toBeVisible({ timeout: 3000 });
  116 |     } else {
  117 |       test.skip(true, "Menu de ações não encontrado");
  118 |     }
  119 |   });
  120 | });
  121 | 
  122 | test.describe("Painel Admin — Apps", () => {
  123 |   test.beforeEach(async ({ page }) => {
  124 | 
  125 |     await page.goto("/admin/apps");
  126 |   });
  127 | 
  128 |   test("catálogo de apps carrega", async ({ page }) => {
  129 |     await expect(page.getByRole("heading", { name: /aplicativos|apps/i })).toBeVisible({ timeout: 10000 });
  130 |     // Tabs ou lista
  131 |     await expect(page.getByRole("tab").or(page.locator("[data-testid='app-card']")).first()).toBeVisible({ timeout: 10000 });
  132 |   });
  133 | 
  134 |   test("aba 'Por Máquina' mostra toggles", async ({ page }) => {
  135 |     const porMaquinaTab = page.getByRole("tab", { name: /por máquina|por pc/i });
  136 |     if (await porMaquinaTab.isVisible().catch(() => false)) {
  137 |       await porMaquinaTab.click();
  138 |       await expect(page.getByRole("switch").or(page.locator("input[type='checkbox']")).first()).toBeVisible({ timeout: 5000 });
  139 |     } else {
  140 |       test.skip(true, "Aba 'Por Máquina' não encontrada");
  141 |     }
  142 |   });
  143 | });
  144 | 
  145 | test.describe("Painel Admin — Financeiro", () => {
  146 |   test.beforeEach(async ({ page }) => {
  147 | 
  148 |     await page.goto("/admin/financial");
  149 |   });
  150 | 
  151 |   test("dashboard financeiro carrega", async ({ page }) => {
  152 |     await expect(page.getByRole("heading", { name: /financeiro|faturamento/i })).toBeVisible({ timeout: 10000 });
  153 |     // KPIs de receita
  154 |     await expect(page.getByText(/receita|vendas|transações/i).first()).toBeVisible({ timeout: 10000 });
  155 |   });
```