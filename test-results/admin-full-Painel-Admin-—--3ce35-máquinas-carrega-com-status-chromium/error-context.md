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
                - row "Wolf 01 924203e1-7976-474a-9db2-4e35e0379f59 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e127]:
                  - cell "Wolf 01" [ref=e128]
                  - cell "924203e1-7976-474a-9db2-4e35e0379f59" [ref=e129]:
                    - button "924203e1-7976-474a-9db2-4e35e0379f59" [ref=e130]:
                      - generic [ref=e131]: 924203e1-7976-474a-9db2-4e35e0379f59
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
                - row "Wolf 02 2cb107c9-b272-4d01-bc33-a30a438579fd Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e157]:
                  - cell "Wolf 02" [ref=e158]
                  - cell "2cb107c9-b272-4d01-bc33-a30a438579fd" [ref=e159]:
                    - button "2cb107c9-b272-4d01-bc33-a30a438579fd" [ref=e160]:
                      - generic [ref=e161]: 2cb107c9-b272-4d01-bc33-a30a438579fd
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
                - row "Wolf 03 42ef4686-b58e-4fe5-b7b5-a29a4d38d462 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e187]:
                  - cell "Wolf 03" [ref=e188]
                  - cell "42ef4686-b58e-4fe5-b7b5-a29a4d38d462" [ref=e189]:
                    - button "42ef4686-b58e-4fe5-b7b5-a29a4d38d462" [ref=e190]:
                      - generic [ref=e191]: 42ef4686-b58e-4fe5-b7b5-a29a4d38d462
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
                - row "Wolf 04 3ff2b4ce-1312-4c0d-9404-6931a044925e Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e217]:
                  - cell "Wolf 04" [ref=e218]
                  - cell "3ff2b4ce-1312-4c0d-9404-6931a044925e" [ref=e219]:
                    - button "3ff2b4ce-1312-4c0d-9404-6931a044925e" [ref=e220]:
                      - generic [ref=e221]: 3ff2b4ce-1312-4c0d-9404-6931a044925e
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
                - row "Wolf 05 cf041b09-bcde-4de0-a5ce-4f6f60a9f9be Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e247]:
                  - cell "Wolf 05" [ref=e248]
                  - cell "cf041b09-bcde-4de0-a5ce-4f6f60a9f9be" [ref=e249]:
                    - button "cf041b09-bcde-4de0-a5ce-4f6f60a9f9be" [ref=e250]:
                      - generic [ref=e251]: cf041b09-bcde-4de0-a5ce-4f6f60a9f9be
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
                - row "Wolf 06 f0999b04-a9d0-4942-b370-c3328ddffb14 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e277]:
                  - cell "Wolf 06" [ref=e278]
                  - cell "f0999b04-a9d0-4942-b370-c3328ddffb14" [ref=e279]:
                    - button "f0999b04-a9d0-4942-b370-c3328ddffb14" [ref=e280]:
                      - generic [ref=e281]: f0999b04-a9d0-4942-b370-c3328ddffb14
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
                - row "Wolf 07 e06feb73-d8e6-4914-befd-9c91a98e4204 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e307]:
                  - cell "Wolf 07" [ref=e308]
                  - cell "e06feb73-d8e6-4914-befd-9c91a98e4204" [ref=e309]:
                    - button "e06feb73-d8e6-4914-befd-9c91a98e4204" [ref=e310]:
                      - generic [ref=e311]: e06feb73-d8e6-4914-befd-9c91a98e4204
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
                - row "Wolf 08 fbf71f8d-9d9c-4c04-a8dd-c88178aa50de Não cadastrado Ocupado R$ 10,00 Ocupado Ligar Desligar" [ref=e337]:
                  - cell "Wolf 08" [ref=e338]
                  - cell "fbf71f8d-9d9c-4c04-a8dd-c88178aa50de" [ref=e339]:
                    - button "fbf71f8d-9d9c-4c04-a8dd-c88178aa50de" [ref=e340]:
                      - generic [ref=e341]: fbf71f8d-9d9c-4c04-a8dd-c88178aa50de
                      - img [ref=e342]
                  - cell "Não cadastrado" [ref=e345]:
                    - button "Não cadastrado" [ref=e346]:
                      - generic [ref=e347]: Não cadastrado
                      - img [ref=e348]
                  - cell "Ocupado" [ref=e351]:
                    - generic [ref=e352]: Ocupado
                  - cell "R$ 10,00" [ref=e353]
                  - cell "Ocupado" [ref=e354]:
                    - combobox [ref=e355]:
                      - option "Livre"
                      - option "Ocupado" [selected]
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e356]:
                    - generic [ref=e357]:
                      - button "Ligar" [ref=e358]:
                        - img [ref=e359]
                        - text: Ligar
                      - button "Desligar" [ref=e361]:
                        - img [ref=e362]
                        - text: Desligar
                - row "Wolf 09 3b853f5d-71c2-4d43-b5ff-a2dc0641f387 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e366]:
                  - cell "Wolf 09" [ref=e367]
                  - cell "3b853f5d-71c2-4d43-b5ff-a2dc0641f387" [ref=e368]:
                    - button "3b853f5d-71c2-4d43-b5ff-a2dc0641f387" [ref=e369]:
                      - generic [ref=e370]: 3b853f5d-71c2-4d43-b5ff-a2dc0641f387
                      - img [ref=e371]
                  - cell "Não cadastrado" [ref=e374]:
                    - button "Não cadastrado" [ref=e375]:
                      - generic [ref=e376]: Não cadastrado
                      - img [ref=e377]
                  - cell "Livre" [ref=e380]:
                    - generic [ref=e381]: Livre
                  - cell "R$ 10,00" [ref=e383]
                  - cell "Livre" [ref=e384]:
                    - combobox [ref=e385]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e386]:
                    - generic [ref=e387]:
                      - button "Ligar" [ref=e388]:
                        - img [ref=e389]
                        - text: Ligar
                      - button "Desligar" [ref=e391]:
                        - img [ref=e392]
                        - text: Desligar
                - row "Wolf 10 17eb8405-dedb-445a-be77-02da4e47bcc8 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e396]:
                  - cell "Wolf 10" [ref=e397]
                  - cell "17eb8405-dedb-445a-be77-02da4e47bcc8" [ref=e398]:
                    - button "17eb8405-dedb-445a-be77-02da4e47bcc8" [ref=e399]:
                      - generic [ref=e400]: 17eb8405-dedb-445a-be77-02da4e47bcc8
                      - img [ref=e401]
                  - cell "Não cadastrado" [ref=e404]:
                    - button "Não cadastrado" [ref=e405]:
                      - generic [ref=e406]: Não cadastrado
                      - img [ref=e407]
                  - cell "Livre" [ref=e410]:
                    - generic [ref=e411]: Livre
                  - cell "R$ 10,00" [ref=e413]
                  - cell "Livre" [ref=e414]:
                    - combobox [ref=e415]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e416]:
                    - generic [ref=e417]:
                      - button "Ligar" [ref=e418]:
                        - img [ref=e419]
                        - text: Ligar
                      - button "Desligar" [ref=e421]:
                        - img [ref=e422]
                        - text: Desligar
          - generic [ref=e426]:
            - heading "PlayStation 5" [level=2] [ref=e427]:
              - img [ref=e428]
              - text: PlayStation 5
            - table [ref=e431]:
              - rowgroup [ref=e432]:
                - row "Máquina ID (UUID) MAC Address Status Preço/h Alterar Status Energia" [ref=e433]:
                  - columnheader "Máquina" [ref=e434]
                  - columnheader "ID (UUID)" [ref=e435]
                  - columnheader "MAC Address" [ref=e436]
                  - columnheader "Status" [ref=e437]
                  - columnheader "Preço/h" [ref=e438]
                  - columnheader "Alterar Status" [ref=e439]
                  - columnheader "Energia" [ref=e440]
              - rowgroup [ref=e441]:
                - row "PS5 01 98fd0b46-876d-4d7c-b2de-7af050fc3892 Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e442]:
                  - cell "PS5 01" [ref=e443]
                  - cell "98fd0b46-876d-4d7c-b2de-7af050fc3892" [ref=e444]:
                    - button "98fd0b46-876d-4d7c-b2de-7af050fc3892" [ref=e445]:
                      - generic [ref=e446]: 98fd0b46-876d-4d7c-b2de-7af050fc3892
                      - img [ref=e447]
                  - cell "Não cadastrado" [ref=e450]:
                    - button "Não cadastrado" [ref=e451]:
                      - generic [ref=e452]: Não cadastrado
                      - img [ref=e453]
                  - cell "Livre" [ref=e456]:
                    - generic [ref=e457]: Livre
                  - cell "R$ 10,00" [ref=e459]
                  - cell "Livre" [ref=e460]:
                    - combobox [ref=e461]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e462]:
                    - generic [ref=e463]:
                      - button "Ligar" [ref=e464]:
                        - img [ref=e465]
                        - text: Ligar
                      - button "Desligar" [ref=e467]:
                        - img [ref=e468]
                        - text: Desligar
                - row "PS5 02 130b63d0-92ae-4dec-8294-99dc82a9207f Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e472]:
                  - cell "PS5 02" [ref=e473]
                  - cell "130b63d0-92ae-4dec-8294-99dc82a9207f" [ref=e474]:
                    - button "130b63d0-92ae-4dec-8294-99dc82a9207f" [ref=e475]:
                      - generic [ref=e476]: 130b63d0-92ae-4dec-8294-99dc82a9207f
                      - img [ref=e477]
                  - cell "Não cadastrado" [ref=e480]:
                    - button "Não cadastrado" [ref=e481]:
                      - generic [ref=e482]: Não cadastrado
                      - img [ref=e483]
                  - cell "Livre" [ref=e486]:
                    - generic [ref=e487]: Livre
                  - cell "R$ 10,00" [ref=e489]
                  - cell "Livre" [ref=e490]:
                    - combobox [ref=e491]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e492]:
                    - generic [ref=e493]:
                      - button "Ligar" [ref=e494]:
                        - img [ref=e495]
                        - text: Ligar
                      - button "Desligar" [ref=e497]:
                        - img [ref=e498]
                        - text: Desligar
                - row "PS5 03 a71b9d59-a53b-4a36-aa1f-1b2d41780edc Não cadastrado Livre R$ 10,00 Livre Ligar Desligar" [ref=e502]:
                  - cell "PS5 03" [ref=e503]
                  - cell "a71b9d59-a53b-4a36-aa1f-1b2d41780edc" [ref=e504]:
                    - button "a71b9d59-a53b-4a36-aa1f-1b2d41780edc" [ref=e505]:
                      - generic [ref=e506]: a71b9d59-a53b-4a36-aa1f-1b2d41780edc
                      - img [ref=e507]
                  - cell "Não cadastrado" [ref=e510]:
                    - button "Não cadastrado" [ref=e511]:
                      - generic [ref=e512]: Não cadastrado
                      - img [ref=e513]
                  - cell "Livre" [ref=e516]:
                    - generic [ref=e517]: Livre
                  - cell "R$ 10,00" [ref=e519]
                  - cell "Livre" [ref=e520]:
                    - combobox [ref=e521]:
                      - option "Livre" [selected]
                      - option "Ocupado"
                      - option "Reservado"
                      - option "Manutenção"
                  - cell "Ligar Desligar" [ref=e522]:
                    - generic [ref=e523]:
                      - button "Ligar" [ref=e524]:
                        - img [ref=e525]
                        - text: Ligar
                      - button "Desligar" [ref=e527]:
                        - img [ref=e528]
                        - text: Desligar
    - region "Notifications alt+T"
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e537] [cursor=pointer]:
    - img [ref=e538]
  - alert [ref=e541]
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