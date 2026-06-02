# Arena Wolf Agent

Agente desktop para Windows que controla as máquinas da lan house em tempo real.

## Como funciona

1. Instalado em cada PC da Arena Wolf
2. Bloqueia a tela até que um PIN válido seja inserido
3. PIN é gerado pelo usuário no site (arenawolf.netlify.app → "Usar PC")
4. Ao inserir o PIN, a sessão inicia e o tempo começa a contar
5. Overlay no canto da tela mostra o tempo restante
6. Quando o tempo acaba (ou o admin encerra), a tela bloqueia automaticamente

## Configuração inicial (por máquina)

Na primeira execução, uma tela de setup abre pedindo:

- **ID da Máquina** — copie do painel admin: /admin/machines
- **Nome da Máquina** — ex: "Wolf 01"
- **Supabase URL** — https://uxxuspwortgwqaftcfrw.supabase.co
- **Supabase Anon Key** — painel Supabase → Settings → API
- **Agent Key** — a Service Role Key do Supabase (usada para validar PINs)
- **URL do Site** — https://arenawold.netlify.app

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build para Windows (.exe)

```bash
npm run build:win
# Gera: release/Arena Wolf Agent Setup.exe
```

## Testes

```bash
npm test
```

## Estrutura

```
src/
  main.ts       — processo principal Electron
  preload.ts    — bridge segura entre main e renderer
  session.ts    — lógica de sessão + validação de PIN + Realtime
  config.ts     — configuração persistente (electron-store)
  lock.ts       — bloqueio de tela Windows

renderer/
  lock.html     — tela de bloqueio com input de PIN
  overlay.html  — widget de countdown durante sessão ativa
  setup.html    — configuração inicial da máquina
```
