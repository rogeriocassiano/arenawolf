# Arena Wolf Agent - Guia de Instalação

> Agente cliente para Windows das máquinas da lan house Arena Wolf

---

## 📋 Pré-requisitos

### Hardware (por PC)
- **Windows 10/11** (64-bit)
- **4GB RAM** mínimo
- **Conexão de rede** (cabo ou WiFi)
- **Privilégios de Administrador** na instalação

### Rede
- Todos os PCs na **mesma rede local**
- **1 PC fixo ligado 24h** (para Wake-on-LAN - opcional)
- Acesso à internet para comunicação com Supabase

### Conta/Configuração
- Conta no [Supabase](https://supabase.com) com projeto configurado
- Variáveis de ambiente configuradas no dashboard

---

## 🚀 Instalação Rápida (por PC)

### 1. Download

Baixe o instalador:
```
https://github.com/rogeriocassiano/arenawolf/releases/download/v1.0.0/Arena.Wolf.Agent.Setup.1.0.0.exe
```

Ou direto do repositório:
```
packages/agent/release/Arena Wolf Agent Setup 1.0.0.exe
```

### 2. Executar Instalador

1. **Clique direito** no arquivo `.exe`
2. Selecione **"Executar como administrador"**
3. No wizard, clique **"Avançar"**
4. Escolha o diretório de instalação (padrão: `C:\Program Files\Arena Wolf Agent`)
5. Clique **"Instalar"**
6. Após concluir, marque **"Executar Arena Wolf Agent"**
7. Clique **"Concluir"**

### 3. Configuração Inicial

Ao abrir pela primeira vez:

1. Clique no **ícone na bandeja do sistema** (🔒)
2. Selecione **"Configurar"**
3. Preencha os campos:

| Campo | Valor | Exemplo |
|-------|-------|---------|
| **ID da Máquina** | ID único no Supabase | `wolf-pc-01` |
| **Supabase URL** | URL do projeto | `https://uxxuspwortgwqaftcfrw.supabase.co` |
| **Supabase Key** | Chave anon/public | `eyJhbGciOiJIUzI1NiIs...` |
| **API Base URL** | URL do site | `https://arenawdolf.netlify.app` |

4. Clique **"Salvar"**
5. **Reinicie o PC**

---

## ⚙️ Configuração de Wake-on-LAN (Opcional)

Para ligar PCs remotamente via painel admin:

### No PC "servidor" (ligado 24h)

1. Instale o agente normalmente
2. Configure variável de ambiente:
   ```powershell
   [Environment]::SetEnvironmentVariable("WOL_SERVER_KEY", "sua_chave_secreta", "Machine")
   ```
3. O agente iniciará automaticamente o servidor WoL na porta 3001

### No dashboard Netlify

Adicione as variáveis:
```
WOL_SERVER_URL=http://IP_DO_SERVIDOR:3001
WOL_SERVER_KEY=sua_chave_secreta
```

### Configurar BIOS/UEFI dos PCs clientes

1. Entre na BIOS (geralmente `F2`, `Del` ou `F10`)
2. Ative **"Wake on LAN"** ou **"PCI-E Wake"**
3. Salve e saia

---

## 🧪 Validação Pós-Instalação

### Teste em cada PC

| # | Teste | Resultado Esperado |
|---|-------|-------------------|
| 1 | **Iniciar PC** | Tela de bloqueio aparece automaticamente |
| 2 | **Login** | Usuário entra com email/senha do site |
| 3 | **Sessão ativa** | Overlay aparece no canto superior direito |
| 4 | **Apps** | Grid de jogos carrega ao clicar em "Apps" |
| 5 | **Desligar remoto** | Via painel admin, PC desliga em ~10s |

### Comandos de diagnóstico

Verificar se o agente está rodando:
```powershell
# No PowerShell (como admin)
Get-Process *arena* -ErrorAction SilentlyContinue
Get-Process *electron* -ErrorAction SilentlyContinue
```

Ver logs:
```
%APPDATA%\arena-wolf-agent\logs\main.log
```

---

## 🔧 Troubleshooting

### Tela de bloqueio não aparece

1. Verifique se o agente está rodando (ícone na bandeja)
2. Reinicie o serviço:
   ```powershell
   taskkill /f /im "Arena Wolf Agent.exe"
   & "C:\Program Files\Arena Wolf Agent\Arena Wolf Agent.exe"
   ```

### Login não funciona

1. Verifique `machineId` na configuração
2. Confirme se a máquina existe na tabela `machines` do Supabase
3. Verifique conexão de rede

### WoL não funciona

1. Verifique se BIOS tem WoL ativado
2. Confirme IP do servidor WoL está correto
3. Teste comando manual:
   ```powershell
   # Do PC do admin
   wakeonlan AA:BB:CC:DD:EE:FF  # MAC do PC alvo
   ```

---

## 📦 Atualização

Para atualizar para nova versão:

1. Baixe o novo instalador
2. Execute normalmente (mantém configurações)
3. Reinicie os PCs

---

## 📞 Suporte

- **Email:** suporte@arenawolf.com
- **Issues:** https://github.com/rogeriocassiano/arenawolf/issues

---

**Versão:** 1.0.0  
**Última atualização:** Junho 2026
