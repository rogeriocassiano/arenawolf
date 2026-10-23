# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-full.spec.ts >> Painel Admin — Gerenciamento de Máquinas >> botões Ligar/Desligar visíveis para PCs
- Location: e2e\admin-full.spec.ts:67:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /ligar|wakeup/i }).first().or(getByRole('button', { name: /desligar|shutdown/i }).first())
Expected: visible
Error: strict mode violation: getByRole('button', { name: /ligar|wakeup/i }).first().or(getByRole('button', { name: /desligar|shutdown/i }).first()) resolved to 2 elements:
    1) <button title="Cadastre o MAC para ligar remotamente" class="flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-[family-name:var(--font-rajdhani)] font-bold transition-all border-wolf-muted/20 text-wolf-muted cursor-not-allowed opacity-40">…</button> aka getByRole('button', { name: 'Ligar' }).first()
    2) <button title="Desligar Wolf 01 remotamente" class="flex items-center gap-1 px-2 py-1 rounded-lg border border-wolf-red/30 text-wolf-red hover:bg-wolf-red/15 text-xs font-[family-name:var(--font-rajdhani)] font-bold transition-all disabled:opacity-40">…</button> aka getByRole('button', { name: 'Desligar', description: 'Desligar Wolf 01 remotamente', exact: true })

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('button', { name: /ligar|wakeup/i }).first().or(getByRole('button', { name: /desligar|shutdown/i }).first())

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - navigation [ref=e4]:
        - generic [ref=e5]:
          - img "Arena Wolf" [ref=e6]
          - generic [ref=e7]:
            - paragraph [ref=e8]: Arena Wolf
            - paragraph [ref=e9]: Admin
        - generic [ref=e10]:
          - generic [ref=e11]:
            - paragraph [ref=e12]: Operacional
            - link "Dashboard" [ref=e13] [cursor=pointer]:
              - /url: /admin
              - img [ref=e14]
              - generic [ref=e19]: Dashboard
            - link "Painel Operador" [ref=e20] [cursor=pointer]:
              - /url: /admin/operator
              - img [ref=e21]
              - generic [ref=e23]: Painel Operador
            - link "Launcher de Apps" [ref=e24] [cursor=pointer]:
              - /url: /admin/apps
              - img [ref=e25]
              - generic [ref=e27]: Launcher de Apps
            - link "Máquinas" [ref=e28] [cursor=pointer]:
              - /url: /admin/machines
              - img [ref=e29]
              - generic [ref=e31]: Máquinas
              - img [ref=e32]
            - link "Reservas" [ref=e34] [cursor=pointer]:
              - /url: /admin/reservations
              - img [ref=e35]
              - generic [ref=e39]: Reservas
            - link "Usuários" [ref=e40] [cursor=pointer]:
              - /url: /admin/users
              - img [ref=e41]
              - generic [ref=e46]: Usuários
          - generic [ref=e47]:
            - paragraph [ref=e48]: Negócio
            - link "Produtos" [ref=e49] [cursor=pointer]:
              - /url: /admin/products
              - img [ref=e50]
              - generic [ref=e53]: Produtos
            - link "Promoções" [ref=e54] [cursor=pointer]:
              - /url: /admin/marketing/promotions
              - img [ref=e55]
              - generic [ref=e58]: Promoções
            - link "Eventos" [ref=e59] [cursor=pointer]:
              - /url: /admin/events
              - img [ref=e60]
              - generic [ref=e65]: Eventos
            - link "Campeonatos" [ref=e66] [cursor=pointer]:
              - /url: /admin/tournaments
              - img [ref=e67]
              - generic [ref=e73]: Campeonatos
            - link "Financeiro" [ref=e74] [cursor=pointer]:
              - /url: /admin/financial
              - img [ref=e75]
              - generic [ref=e77]: Financeiro
          - generic [ref=e78]:
            - paragraph [ref=e79]: Marketing
            - link "Marketing Hub" [ref=e80] [cursor=pointer]:
              - /url: /admin/marketing
              - img [ref=e81]
              - generic [ref=e84]: Marketing Hub
          - generic [ref=e85]:
            - paragraph [ref=e86]: Suporte
            - link "Tickets" [ref=e87] [cursor=pointer]:
              - /url: /admin/support
              - img [ref=e88]
              - generic [ref=e90]: Tickets
            - link "Configurações" [ref=e91] [cursor=pointer]:
              - /url: /admin/settings
              - img [ref=e92]
              - generic [ref=e95]: Configurações
        - button "Sair" [ref=e98]:
          - img [ref=e99]
          - generic [ref=e102]: Sair
    - main [ref=e103]:
      - generic [ref=e104]:
        - generic [ref=e105]:
          - heading "Máquinas" [level=1] [ref=e106]
          - paragraph [ref=e107]: Gerencie status e configurações das máquinas
        - generic [ref=e108]:
          - generic [ref=e109]:
            - text: "Wake-on-LAN: Para ligar PCs remotamente, cadastre o MAC address de cada PC e configure o servidor WoL local. O MAC é encontrado no Windows com"
            - code [ref=e110]: ipconfig /all
            - text: .
          - generic [ref=e111]:
            - heading "PCs Gamer" [level=2] [ref=e112]:
              - img [ref=e113]
              - text: PCs Gamer
            - table [ref=e116]:
              - rowgroup [ref=e117]:
                - row "Máquina ID (UUID) MAC Address Status Preço/h Alterar Status Energia" [ref=e118]:
                  - columnheader "Máquina" [ref=e119]
                  - columnheader "ID (UUID)" [ref=e120]
                  - columnheader "MAC Address" [ref=e121]
                  - columnheader "Status" [ref=e122]
                  - columnheader "Preço/h" [ref=e123]
                  - columnheader "Alterar Status" [ref=e124]
                  - columnheader "Energia" [ref=e125]
              - rowgroup [ref=e126]:
                - row "Wolf 01 bf6f7745-6e0a-4acd-8ebd-e5a5940efd54 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e127]:
                  - cell "Wolf 01" [ref=e128]
                  - cell "bf6f7745-6e0a-4acd-8ebd-e5a5940efd54" [ref=e129]:
                    - button "bf6f7745-6e0a-4acd-8ebd-e5a5940efd54" [ref=e130]:
                      - generic [ref=e131]: bf6f7745-6e0a-4acd-8ebd-e5a5940efd54
                      - img [ref=e132]
                  - cell "Não cadastrado" [ref=e135]:
                    - button "Não cadastrado" [ref=e136]:
                      - generic [ref=e137]: Não cadastrado
                      - img [ref=e138]
                  - cell "Livre" [ref=e141]:
                    - generic [ref=e142]: Livre
                  - cell "R$ 10,00" [ref=e144]
                  - cell "Livre" [ref=e145]:
                    - combobox [ref=e146]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e147]:
                    - generic [ref=e148]:
                      - button "Ligar" [ref=e149]:
                        - img [ref=e150]
                        - text: Ligar
                      - button "Desligar" [ref=e152]:
                        - img [ref=e153]
                        - text: Desligar
                - row "Wolf 02 e6fa23c9-c0b4-4786-9e63-9dd1ef179acd Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e157]:
                  - cell "Wolf 02" [ref=e158]
                  - cell "e6fa23c9-c0b4-4786-9e63-9dd1ef179acd" [ref=e159]:
                    - button "e6fa23c9-c0b4-4786-9e63-9dd1ef179acd" [ref=e160]:
                      - generic [ref=e161]: e6fa23c9-c0b4-4786-9e63-9dd1ef179acd
                      - img [ref=e162]
                  - cell "Não cadastrado" [ref=e165]:
                    - button "Não cadastrado" [ref=e166]:
                      - generic [ref=e167]: Não cadastrado
                      - img [ref=e168]
                  - cell "Livre" [ref=e171]:
                    - generic [ref=e172]: Livre
                  - cell "R$ 10,00" [ref=e174]
                  - cell "Livre" [ref=e175]:
                    - combobox [ref=e176]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e177]:
                    - generic [ref=e178]:
                      - button "Ligar" [ref=e179]:
                        - img [ref=e180]
                        - text: Ligar
                      - button "Desligar" [ref=e182]:
                        - img [ref=e183]
                        - text: Desligar
                - row "Wolf 03 4fb2ef5a-3318-470d-aa51-6cf09c1f8483 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e187]:
                  - cell "Wolf 03" [ref=e188]
                  - cell "4fb2ef5a-3318-470d-aa51-6cf09c1f8483" [ref=e189]:
                    - button "4fb2ef5a-3318-470d-aa51-6cf09c1f8483" [ref=e190]:
                      - generic [ref=e191]: 4fb2ef5a-3318-470d-aa51-6cf09c1f8483
                      - img [ref=e192]
                  - cell "Não cadastrado" [ref=e195]:
                    - button "Não cadastrado" [ref=e196]:
                      - generic [ref=e197]: Não cadastrado
                      - img [ref=e198]
                  - cell "Livre" [ref=e201]:
                    - generic [ref=e202]: Livre
                  - cell "R$ 10,00" [ref=e204]
                  - cell "Livre" [ref=e205]:
                    - combobox [ref=e206]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e207]:
                    - generic [ref=e208]:
                      - button "Ligar" [ref=e209]:
                        - img [ref=e210]
                        - text: Ligar
                      - button "Desligar" [ref=e212]:
                        - img [ref=e213]
                        - text: Desligar
                - row "Wolf 04 0d346890-011c-4fe0-ba40-cb440e745989 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e217]:
                  - cell "Wolf 04" [ref=e218]
                  - cell "0d346890-011c-4fe0-ba40-cb440e745989" [ref=e219]:
                    - button "0d346890-011c-4fe0-ba40-cb440e745989" [ref=e220]:
                      - generic [ref=e221]: 0d346890-011c-4fe0-ba40-cb440e745989
                      - img [ref=e222]
                  - cell "Não cadastrado" [ref=e225]:
                    - button "Não cadastrado" [ref=e226]:
                      - generic [ref=e227]: Não cadastrado
                      - img [ref=e228]
                  - cell "Livre" [ref=e231]:
                    - generic [ref=e232]: Livre
                  - cell "R$ 10,00" [ref=e234]
                  - cell "Livre" [ref=e235]:
                    - combobox [ref=e236]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e237]:
                    - generic [ref=e238]:
                      - button "Ligar" [ref=e239]:
                        - img [ref=e240]
                        - text: Ligar
                      - button "Desligar" [ref=e242]:
                        - img [ref=e243]
                        - text: Desligar
                - row "Wolf 05 5ef5de10-ed49-4288-90e6-032b819d6e4b Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e247]:
                  - cell "Wolf 05" [ref=e248]
                  - cell "5ef5de10-ed49-4288-90e6-032b819d6e4b" [ref=e249]:
                    - button "5ef5de10-ed49-4288-90e6-032b819d6e4b" [ref=e250]:
                      - generic [ref=e251]: 5ef5de10-ed49-4288-90e6-032b819d6e4b
                      - img [ref=e252]
                  - cell "Não cadastrado" [ref=e255]:
                    - button "Não cadastrado" [ref=e256]:
                      - generic [ref=e257]: Não cadastrado
                      - img [ref=e258]
                  - cell "Livre" [ref=e261]:
                    - generic [ref=e262]: Livre
                  - cell "R$ 10,00" [ref=e264]
                  - cell "Livre" [ref=e265]:
                    - combobox [ref=e266]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e267]:
                    - generic [ref=e268]:
                      - button "Ligar" [ref=e269]:
                        - img [ref=e270]
                        - text: Ligar
                      - button "Desligar" [ref=e272]:
                        - img [ref=e273]
                        - text: Desligar
                - row "Wolf 06 76fd64dc-503f-4831-ab45-b732c459f21d Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e277]:
                  - cell "Wolf 06" [ref=e278]
                  - cell "76fd64dc-503f-4831-ab45-b732c459f21d" [ref=e279]:
                    - button "76fd64dc-503f-4831-ab45-b732c459f21d" [ref=e280]:
                      - generic [ref=e281]: 76fd64dc-503f-4831-ab45-b732c459f21d
                      - img [ref=e282]
                  - cell "Não cadastrado" [ref=e285]:
                    - button "Não cadastrado" [ref=e286]:
                      - generic [ref=e287]: Não cadastrado
                      - img [ref=e288]
                  - cell "Livre" [ref=e291]:
                    - generic [ref=e292]: Livre
                  - cell "R$ 10,00" [ref=e294]
                  - cell "Livre" [ref=e295]:
                    - combobox [ref=e296]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e297]:
                    - generic [ref=e298]:
                      - button "Ligar" [ref=e299]:
                        - img [ref=e300]
                        - text: Ligar
                      - button "Desligar" [ref=e302]:
                        - img [ref=e303]
                        - text: Desligar
                - row "Wolf 07 5ecdce89-1a5d-4880-8641-022511667cb2 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e307]:
                  - cell "Wolf 07" [ref=e308]
                  - cell "5ecdce89-1a5d-4880-8641-022511667cb2" [ref=e309]:
                    - button "5ecdce89-1a5d-4880-8641-022511667cb2" [ref=e310]:
                      - generic [ref=e311]: 5ecdce89-1a5d-4880-8641-022511667cb2
                      - img [ref=e312]
                  - cell "Não cadastrado" [ref=e315]:
                    - button "Não cadastrado" [ref=e316]:
                      - generic [ref=e317]: Não cadastrado
                      - img [ref=e318]
                  - cell "Livre" [ref=e321]:
                    - generic [ref=e322]: Livre
                  - cell "R$ 10,00" [ref=e324]
                  - cell "Livre" [ref=e325]:
                    - combobox [ref=e326]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e327]:
                    - generic [ref=e328]:
                      - button "Ligar" [ref=e329]:
                        - img [ref=e330]
                        - text: Ligar
                      - button "Desligar" [ref=e332]:
                        - img [ref=e333]
                        - text: Desligar
                - row "Wolf 08 a7fef2e4-a9f0-4598-9d82-fcbdbf0bae8b Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e337]:
                  - cell "Wolf 08" [ref=e338]
                  - cell "a7fef2e4-a9f0-4598-9d82-fcbdbf0bae8b" [ref=e339]:
                    - button "a7fef2e4-a9f0-4598-9d82-fcbdbf0bae8b" [ref=e340]:
                      - generic [ref=e341]: a7fef2e4-a9f0-4598-9d82-fcbdbf0bae8b
                      - img [ref=e342]
                  - cell "Não cadastrado" [ref=e345]:
                    - button "Não cadastrado" [ref=e346]:
                      - generic [ref=e347]: Não cadastrado
                      - img [ref=e348]
                  - cell "Livre" [ref=e351]:
                    - generic [ref=e352]: Livre
                  - cell "R$ 10,00" [ref=e354]
                  - cell "Livre" [ref=e355]:
                    - combobox [ref=e356]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e357]:
                    - generic [ref=e358]:
                      - button "Ligar" [ref=e359]:
                        - img [ref=e360]
                        - text: Ligar
                      - button "Desligar" [ref=e362]:
                        - img [ref=e363]
                        - text: Desligar
                - row "Wolf 09 5dd39452-b848-4458-9175-e40a7e9cc6ce Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e367]:
                  - cell "Wolf 09" [ref=e368]
                  - cell "5dd39452-b848-4458-9175-e40a7e9cc6ce" [ref=e369]:
                    - button "5dd39452-b848-4458-9175-e40a7e9cc6ce" [ref=e370]:
                      - generic [ref=e371]: 5dd39452-b848-4458-9175-e40a7e9cc6ce
                      - img [ref=e372]
                  - cell "Não cadastrado" [ref=e375]:
                    - button "Não cadastrado" [ref=e376]:
                      - generic [ref=e377]: Não cadastrado
                      - img [ref=e378]
                  - cell "Livre" [ref=e381]:
                    - generic [ref=e382]: Livre
                  - cell "R$ 10,00" [ref=e384]
                  - cell "Livre" [ref=e385]:
                    - combobox [ref=e386]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e387]:
                    - generic [ref=e388]:
                      - button "Ligar" [ref=e389]:
                        - img [ref=e390]
                        - text: Ligar
                      - button "Desligar" [ref=e392]:
                        - img [ref=e393]
                        - text: Desligar
                - row "Wolf 10 8cde252a-a598-4a13-be33-6c941b79ec76 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e397]:
                  - cell "Wolf 10" [ref=e398]
                  - cell "8cde252a-a598-4a13-be33-6c941b79ec76" [ref=e399]:
                    - button "8cde252a-a598-4a13-be33-6c941b79ec76" [ref=e400]:
                      - generic [ref=e401]: 8cde252a-a598-4a13-be33-6c941b79ec76
                      - img [ref=e402]
                  - cell "Não cadastrado" [ref=e405]:
                    - button "Não cadastrado" [ref=e406]:
                      - generic [ref=e407]: Não cadastrado
                      - img [ref=e408]
                  - cell "Livre" [ref=e411]:
                    - generic [ref=e412]: Livre
                  - cell "R$ 10,00" [ref=e414]
                  - cell "Livre" [ref=e415]:
                    - combobox [ref=e416]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e417]:
                    - generic [ref=e418]:
                      - button "Ligar" [ref=e419]:
                        - img [ref=e420]
                        - text: Ligar
                      - button "Desligar" [ref=e422]:
                        - img [ref=e423]
                        - text: Desligar
          - generic [ref=e427]:
            - heading "PlayStation 5" [level=2] [ref=e428]:
              - img [ref=e429]
              - text: PlayStation 5
            - table [ref=e432]:
              - rowgroup [ref=e433]:
                - row "Máquina ID (UUID) MAC Address Status Preço/h Alterar Status Energia" [ref=e434]:
                  - columnheader "Máquina" [ref=e435]
                  - columnheader "ID (UUID)" [ref=e436]
                  - columnheader "MAC Address" [ref=e437]
                  - columnheader "Status" [ref=e438]
                  - columnheader "Preço/h" [ref=e439]
                  - columnheader "Alterar Status" [ref=e440]
                  - columnheader "Energia" [ref=e441]
              - rowgroup [ref=e442]:
                - row "PS5 01 cd8f4ec0-716a-4d0b-aee3-d2537fdeb25e Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e443]:
                  - cell "PS5 01" [ref=e444]
                  - cell "cd8f4ec0-716a-4d0b-aee3-d2537fdeb25e" [ref=e445]:
                    - button "cd8f4ec0-716a-4d0b-aee3-d2537fdeb25e" [ref=e446]:
                      - generic [ref=e447]: cd8f4ec0-716a-4d0b-aee3-d2537fdeb25e
                      - img [ref=e448]
                  - cell "Não cadastrado" [ref=e451]:
                    - button "Não cadastrado" [ref=e452]:
                      - generic [ref=e453]: Não cadastrado
                      - img [ref=e454]
                  - cell "Livre" [ref=e457]:
                    - generic [ref=e458]: Livre
                  - cell "R$ 10,00" [ref=e460]
                  - cell "Livre" [ref=e461]:
                    - combobox [ref=e462]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e463]:
                    - generic [ref=e464]:
                      - button "Ligar" [ref=e465]:
                        - img [ref=e466]
                        - text: Ligar
                      - button "Desligar" [ref=e468]:
                        - img [ref=e469]
                        - text: Desligar
                - row "PS5 02 cfd1cc18-98b4-4e6e-9a26-f7e9ef2f70f8 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e473]:
                  - cell "PS5 02" [ref=e474]
                  - cell "cfd1cc18-98b4-4e6e-9a26-f7e9ef2f70f8" [ref=e475]:
                    - button "cfd1cc18-98b4-4e6e-9a26-f7e9ef2f70f8" [ref=e476]:
                      - generic [ref=e477]: cfd1cc18-98b4-4e6e-9a26-f7e9ef2f70f8
                      - img [ref=e478]
                  - cell "Não cadastrado" [ref=e481]:
                    - button "Não cadastrado" [ref=e482]:
                      - generic [ref=e483]: Não cadastrado
                      - img [ref=e484]
                  - cell "Livre" [ref=e487]:
                    - generic [ref=e488]: Livre
                  - cell "R$ 10,00" [ref=e490]
                  - cell "Livre" [ref=e491]:
                    - combobox [ref=e492]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e493]:
                    - generic [ref=e494]:
                      - button "Ligar" [ref=e495]:
                        - img [ref=e496]
                        - text: Ligar
                      - button "Desligar" [ref=e498]:
                        - img [ref=e499]
                        - text: Desligar
                - row "PS5 03 f32204e7-eca8-4e59-98be-a7fe0b038806 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e503]:
                  - cell "PS5 03" [ref=e504]
                  - cell "f32204e7-eca8-4e59-98be-a7fe0b038806" [ref=e505]:
                    - button "f32204e7-eca8-4e59-98be-a7fe0b038806" [ref=e506]:
                      - generic [ref=e507]: f32204e7-eca8-4e59-98be-a7fe0b038806
                      - img [ref=e508]
                  - cell "Não cadastrado" [ref=e511]:
                    - button "Não cadastrado" [ref=e512]:
                      - generic [ref=e513]: Não cadastrado
                      - img [ref=e514]
                  - cell "Livre" [ref=e517]:
                    - generic [ref=e518]: Livre
                  - cell "R$ 10,00" [ref=e520]
                  - cell "Livre" [ref=e521]:
                    - combobox [ref=e522]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e523]:
                    - generic [ref=e524]:
                      - button "Ligar" [ref=e525]:
                        - img [ref=e526]
                        - text: Ligar
                      - button "Desligar" [ref=e528]:
                        - img [ref=e529]
                        - text: Desligar
    - region "Notifications alt+T"
  - region "Notifications alt+T"
  - alert [ref=e533]
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
  55  |     await expect(page.getByRole("heading", { name: /máquinas|pcs/i })).toBeVisible({ timeout: 10000 });
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
> 71  |     await expect(ligarBtn.or(desligarBtn)).toBeVisible({ timeout: 10000 });
      |                                            ^ Error: expect(locator).toBeVisible() failed
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
  156 | 
  157 |   test("filtro de período funciona", async ({ page }) => {
  158 |     const dateInput = page.locator("input[type='date']").first();
  159 |     if (await dateInput.isVisible().catch(() => false)) {
  160 |       await dateInput.fill(new Date().toISOString().split("T")[0]);
  161 |       await page.waitForTimeout(500);
  162 |       // Dados devem atualizar
  163 |       await expect(page.locator("text=/R\\$|0,00|carregando/i").first()).toBeVisible({ timeout: 5000 });
  164 |     } else {
  165 |       test.skip(true, "Filtro de data não encontrado");
  166 |     }
  167 |   });
  168 | });
  169 | 
  170 | test.describe("Painel Admin — Suporte", () => {
  171 |   test.beforeEach(async ({ page }) => {
```