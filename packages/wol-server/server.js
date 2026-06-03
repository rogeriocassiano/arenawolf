/**
 * Arena Wolf — Servidor Wake-on-LAN
 *
 * Rodar em qualquer PC que fique SEMPRE ligado na lan house.
 * Recebe requisições da API Next.js e envia magic packets UDP.
 *
 * Configuração:
 *   PORT=3001          porta HTTP (padrão: 3001)
 *   WOL_KEY=sua_chave  chave secreta (deve ser igual a WOL_SERVER_KEY no .env do Next.js)
 *
 * Uso:
 *   npm install
 *   WOL_KEY=minhaChaveSecreta node server.js
 */

const express = require("express");
const wol = require("wakeonlan");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const WOL_KEY = process.env.WOL_KEY || "";

if (!WOL_KEY) {
  console.warn("[WoL] AVISO: WOL_KEY não definida — qualquer requisição será aceita!");
}

app.post("/wake", async (req, res) => {
  const key = req.headers["x-wol-key"] ?? "";
  if (WOL_KEY && key !== WOL_KEY) {
    return res.status(401).json({ error: "Chave inválida" });
  }

  const { mac } = req.body;
  if (!mac) return res.status(400).json({ error: "MAC address obrigatório" });

  const macRegex = /^([0-9A-Fa-f]{2}[:\-]){5}([0-9A-Fa-f]{2})$/;
  if (!macRegex.test(mac)) {
    return res.status(400).json({ error: `MAC address inválido: ${mac}` });
  }

  try {
    await wol(mac);
    console.log(`[WoL] Magic packet enviado para ${mac}`);
    return res.json({ success: true, mac });
  } catch (err) {
    console.error("[WoL] Erro ao enviar magic packet:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`[WoL] Servidor Arena Wolf Wake-on-LAN rodando na porta ${PORT}`);
});
