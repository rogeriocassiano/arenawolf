# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navegação via Sidebar — usuário >> usuário navega pelo menu lateral
- Location: e2e\navigation.spec.ts:132:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Tearing down "context" exceeded the test timeout of 90000ms.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - button "Abrir menu" [ref=e4]:
        - img [ref=e5]
      - link "Arena Wolf" [ref=e6] [cursor=pointer]:
        - /url: /dashboard
        - img "Arena Wolf" [ref=e7]
      - generic [ref=e8]:
        - img [ref=e9]
        - generic [ref=e12]: 2h
      - link "WO" [ref=e13] [cursor=pointer]:
        - /url: /profile
        - generic [ref=e15]: WO
    - complementary [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e20]: WO
          - generic [ref=e21]: WolfUser
        - button [ref=e22]:
          - img [ref=e23]
      - navigation [ref=e27]:
        - link "Dashboard" [ref=e28] [cursor=pointer]:
          - /url: /dashboard
          - img [ref=e29]
          - generic [ref=e34]: Dashboard
        - link "Usar PC" [ref=e36] [cursor=pointer]:
          - /url: /session
          - img [ref=e37]
          - generic [ref=e39]: Usar PC
        - link "Máquinas" [ref=e40] [cursor=pointer]:
          - /url: /machines
          - img [ref=e41]
          - generic [ref=e43]: Máquinas
        - link "Reservas" [ref=e44] [cursor=pointer]:
          - /url: /reservations
          - img [ref=e45]
          - generic [ref=e49]: Reservas
        - link "Loja" [ref=e50] [cursor=pointer]:
          - /url: /store
          - img [ref=e51]
          - generic [ref=e54]: Loja
        - link "Eventos" [ref=e55] [cursor=pointer]:
          - /url: /events
          - img [ref=e56]
          - generic [ref=e61]: Eventos
        - link "Promoções" [ref=e62] [cursor=pointer]:
          - /url: /promotions
          - img [ref=e63]
          - generic [ref=e66]: Promoções
        - link "Ranking" [ref=e67] [cursor=pointer]:
          - /url: /ranking
          - img [ref=e68]
          - generic [ref=e74]: Ranking
        - link "Suporte" [ref=e75] [cursor=pointer]:
          - /url: /support
          - img [ref=e76]
          - generic [ref=e78]: Suporte
        - link "Perfil" [ref=e79] [cursor=pointer]:
          - /url: /profile
          - img [ref=e80]
          - generic [ref=e83]: Perfil
        - button "Sair" [ref=e87]:
          - img [ref=e88]
          - generic [ref=e91]: Sair
    - main [ref=e93]:
      - generic [ref=e94]:
        - generic [ref=e95]:
          - heading "Olá, WolfUser 👋" [level=1] [ref=e96]
          - paragraph [ref=e97]: Bem-vindo de volta à Arena Wolf
        - generic [ref=e98]:
          - generic [ref=e100]:
            - generic [ref=e101]:
              - generic [ref=e102]: Créditos
              - img [ref=e103]
            - paragraph [ref=e106]: 2h
          - generic [ref=e108]:
            - generic [ref=e109]:
              - generic [ref=e110]: PCs Livres
              - img [ref=e111]
            - paragraph [ref=e113]:
              - text: "10"
              - generic [ref=e114]: /10
          - generic [ref=e116]:
            - generic [ref=e117]:
              - generic [ref=e118]: PS5 Livres
              - img [ref=e119]
            - paragraph [ref=e121]:
              - text: "3"
              - generic [ref=e122]: /3
          - generic [ref=e124]:
            - generic [ref=e125]:
              - generic [ref=e126]: Reservas
              - img [ref=e127]
            - paragraph [ref=e131]: "0"
        - generic [ref=e132]:
          - generic [ref=e133]:
            - generic [ref=e134]:
              - heading "Máquinas ao Vivo" [level=2] [ref=e135]
              - link "Ver todas" [ref=e136] [cursor=pointer]:
                - /url: /machines
                - button "Ver todas" [ref=e137]:
                  - text: Ver todas
                  - img [ref=e138]
            - generic [ref=e140]:
              - generic [ref=e142] [cursor=pointer]:
                - generic [ref=e143]:
                  - img [ref=e145]
                  - generic [ref=e147]:
                    - paragraph [ref=e148]: PS5 01
                    - paragraph [ref=e149]: PlayStation 5
                - generic [ref=e150]: Livre
              - generic [ref=e153] [cursor=pointer]:
                - generic [ref=e154]:
                  - img [ref=e156]
                  - generic [ref=e158]:
                    - paragraph [ref=e159]: PS5 02
                    - paragraph [ref=e160]: PlayStation 5
                - generic [ref=e161]: Livre
              - generic [ref=e164] [cursor=pointer]:
                - generic [ref=e165]:
                  - img [ref=e167]
                  - generic [ref=e169]:
                    - paragraph [ref=e170]: PS5 03
                    - paragraph [ref=e171]: PlayStation 5
                - generic [ref=e172]: Livre
              - generic [ref=e175] [cursor=pointer]:
                - generic [ref=e176]:
                  - img [ref=e178]
                  - generic [ref=e180]:
                    - paragraph [ref=e181]: Wolf 01
                    - paragraph [ref=e182]: PC Gamer
                - generic [ref=e183]: Livre
              - generic [ref=e186] [cursor=pointer]:
                - generic [ref=e187]:
                  - img [ref=e189]
                  - generic [ref=e191]:
                    - paragraph [ref=e192]: Wolf 02
                    - paragraph [ref=e193]: PC Gamer
                - generic [ref=e194]: Livre
              - generic [ref=e197] [cursor=pointer]:
                - generic [ref=e198]:
                  - img [ref=e200]
                  - generic [ref=e202]:
                    - paragraph [ref=e203]: Wolf 03
                    - paragraph [ref=e204]: PC Gamer
                - generic [ref=e205]: Livre
          - generic [ref=e207]:
            - generic [ref=e208]:
              - heading "Próximas Reservas" [level=3] [ref=e210]
              - generic [ref=e212]:
                - paragraph [ref=e213]: Nenhuma reserva ativa
                - link "Reservar agora" [ref=e214] [cursor=pointer]:
                  - /url: /machines
                  - button "Reservar agora" [ref=e215]
            - generic [ref=e216]:
              - heading "Ações Rápidas" [level=3] [ref=e218]
              - generic [ref=e219]:
                - link "Reservar máquina" [ref=e220] [cursor=pointer]:
                  - /url: /machines
                  - button "Reservar máquina" [ref=e221]:
                    - img [ref=e222]
                    - text: Reservar máquina
                - link "Comprar créditos" [ref=e226] [cursor=pointer]:
                  - /url: /store
                  - button "Comprar créditos" [ref=e227]:
                    - img [ref=e228]
                    - text: Comprar créditos
                - link "Ver ranking" [ref=e231] [cursor=pointer]:
                  - /url: /ranking
                  - button "Ver ranking" [ref=e232]:
                    - img [ref=e233]
                    - text: Ver ranking
  - region "Notifications alt+T"
  - alert [ref=e239]
```