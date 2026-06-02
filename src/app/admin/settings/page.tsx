import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Key, Database, Globe, Bell, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  const envVars = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", desc: "URL do projeto Supabase", set: !!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_project_url" },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", desc: "Chave anônima do Supabase", set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your_supabase_anon_key" },
    { key: "SUPABASE_SERVICE_ROLE_KEY", desc: "Chave de serviço do Supabase (admin)", set: !!process.env.SUPABASE_SERVICE_ROLE_KEY },
    { key: "GEMINI_API_KEY", desc: "Chave da API Google Gemini", set: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key" },
    { key: "NEXT_PUBLIC_APP_URL", desc: "URL pública da aplicação", set: !!process.env.NEXT_PUBLIC_APP_URL },
  ];

  const allConfigured = envVars.every((v) => v.set);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
          Configurações
        </h1>
        <p className="text-wolf-muted text-sm mt-1">Sistema e integrações</p>
      </div>

      {/* Status geral */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${allConfigured ? "bg-emerald-500/10 border-emerald-500/30" : "bg-wolf-amber/10 border-wolf-amber/30"}`}>
        <Shield className={`size-5 shrink-0 ${allConfigured ? "text-emerald-400" : "text-wolf-amber"}`} />
        <div>
          <p className={`text-sm font-[family-name:var(--font-rajdhani)] font-bold ${allConfigured ? "text-emerald-400" : "text-wolf-amber"}`}>
            {allConfigured ? "Sistema totalmente configurado" : "Configuração incompleta — veja variáveis abaixo"}
          </p>
          <p className="text-xs text-wolf-muted">Edite o arquivo .env.local na raiz do projeto</p>
        </div>
      </div>

      {/* Variáveis de ambiente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="size-4" />
            Variáveis de Ambiente
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 p-5 pt-0">
          {envVars.map(({ key, desc, set }) => (
            <div key={key} className="flex items-center justify-between py-2.5 border-b border-wolf-blue/10 last:border-0">
              <div>
                <p className="text-xs font-mono text-wolf-white">{key}</p>
                <p className="text-xs text-wolf-muted">{desc}</p>
              </div>
              <span className={`text-xs font-[family-name:var(--font-rajdhani)] font-bold tracking-wide px-2 py-0.5 rounded-full border ${set ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-wolf-red bg-wolf-red/10 border-wolf-red/20"}`}>
                {set ? "✓ OK" : "✗ Ausente"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Informações do sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-4" />
            Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 p-5 pt-0">
          {[
            { label: "Framework", value: "Next.js 16.2.6" },
            { label: "Runtime", value: "Node.js (App Router)" },
            { label: "Banco de dados", value: "Supabase (PostgreSQL)" },
            { label: "Autenticação", value: "Supabase Auth" },
            { label: "IA", value: "Google Gemini 2.0 Flash" },
            { label: "Deploy", value: "Netlify" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-wolf-blue/10 last:border-0">
              <span className="text-sm text-wolf-muted">{label}</span>
              <span className="text-sm font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-white">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
