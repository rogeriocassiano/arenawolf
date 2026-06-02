"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Loader2, Trash2, Sparkles, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Crie uma copy para Instagram sobre o Corujão da Arena Wolf",
  "Sugira uma campanha para atrair jogadores de CS2 em BH",
  "Crie um calendário de posts para a próxima semana",
  "Quais promoções funcionam melhor para lan houses?",
  "Escreva um texto para Stories do Instagram com oferta de fim de semana",
];

export function AIChatClient({ hasApiKey }: { hasApiKey: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou o Agente de Marketing da Arena Wolf 🐺\n\nPosso ajudar com:\n• Copies e textos para redes sociais\n• Estratégias de campanhas\n• Planejamento de conteúdo\n• Ideias de promoções\n• Análise de público-alvo\n\nO que vamos criar hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const messageText = text ?? input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? "Erro ao chamar a IA");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `❌ ${errorMsg}\n\nVerifique se a chave de API está configurada em **Configurações**.`,
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const showSuggestions = messages.length === 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
            Agente IA de Marketing
          </h1>
          <p className="text-wolf-muted text-sm mt-1">
            Assistente inteligente para estratégia de marketing e criação de conteúdo
          </p>
        </div>
        {messages.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessages([{ role: "assistant", content: "Conversa reiniciada. Como posso ajudar?" }])}
            className="gap-2 shrink-0"
          >
            <Trash2 className="size-3.5" />
            Limpar
          </Button>
        )}
      </div>

      {!hasApiKey && (
        <div className="p-4 rounded-xl bg-wolf-amber/10 border border-wolf-amber/30 text-sm text-wolf-amber">
          ⚠️ Chave de API não configurada. Configure <strong>GEMINI_API_KEY</strong> nas{" "}
          <a href="/admin/settings" className="underline hover:text-wolf-white transition-colors">configurações</a>{" "}
          para usar o Agente IA.
        </div>
      )}

      {/* Chat */}
      <div className="flex flex-col gap-3 min-h-[400px] max-h-[500px] overflow-y-auto p-4 rounded-2xl bg-wolf-surface border border-wolf-blue/15">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("size-8 rounded-xl flex items-center justify-center shrink-0",
              msg.role === "user" ? "bg-wolf-blue" : "bg-purple-500/20 border border-purple-500/30")}>
              {msg.role === "user" ? <User className="size-4 text-white" /> : <Bot className="size-4 text-purple-400" />}
            </div>
            <div className={cn("max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
              msg.role === "user"
                ? "bg-wolf-blue text-white rounded-tr-sm"
                : "bg-wolf-surface-2 border border-wolf-blue/15 text-wolf-white rounded-tl-sm"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="size-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Bot className="size-4 text-purple-400" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-wolf-surface-2 border border-wolf-blue/15">
              <Loader2 className="size-4 text-wolf-muted animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões */}
      {showSuggestions && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-wolf-amber" />
            <p className="text-xs text-wolf-muted font-[family-name:var(--font-rajdhani)] font-semibold">SUGESTÕES</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-left text-xs text-wolf-muted hover:text-wolf-white p-3 rounded-xl bg-wolf-surface border border-wolf-blue/15 hover:border-wolf-blue/30 transition-all font-[family-name:var(--font-rajdhani)]">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: Crie uma copy para Instagram sobre Corujão..."
          rows={2}
          disabled={!hasApiKey || isLoading}
          className="flex-1 px-4 py-3 rounded-xl bg-wolf-surface border border-wolf-blue/20 text-wolf-white text-sm placeholder:text-wolf-muted focus:outline-none focus:border-wolf-blue/50 resize-none disabled:opacity-50"
        />
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isLoading || !hasApiKey}
          size="lg"
          className="shrink-0 gap-2"
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
      <p className="text-xs text-wolf-muted text-center">Enter para enviar · Shift+Enter para nova linha</p>
    </div>
  );
}
