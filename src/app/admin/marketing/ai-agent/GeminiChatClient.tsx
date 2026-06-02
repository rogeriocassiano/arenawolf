"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function GeminiChatClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou o Agente de Marketing da Arena Wolf powered by **Gemini 2.0 Flash**. Posso ajudar com:\n\n• Estratégias de tráfego pago (Meta Ads, Google Ads)\n• Criação de copies e conteúdo para redes sociais\n• Pesquisa de mercado com Google Search Grounding\n• Planejamento de campanhas e calendário editorial\n\nO que vamos criar hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-10),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content ?? data.error ?? "Erro desconhecido." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Falha na conexão com o agente IA." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^• /gm, "• ")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div className="flex flex-col h-[600px] rounded-xl bg-wolf-surface border border-wolf-blue/15 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-wolf-blue/15 bg-wolf-surface-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-emerald-400 pulse-dot" />
          <span className="text-xs font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-white tracking-wide">
            Gemini 2.0 Flash · Agente Marketing
          </span>
        </div>
        <button
          onClick={() => setMessages([messages[0]])}
          className="text-wolf-muted hover:text-wolf-red transition-colors p-1"
          title="Limpar conversa"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn("flex gap-2.5 max-w-[90%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}
          >
            <div className={cn(
              "size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
              msg.role === "assistant"
                ? "bg-purple-500/20 border border-purple-500/30"
                : "bg-wolf-blue/20 border border-wolf-blue/30"
            )}>
              {msg.role === "assistant"
                ? <Bot className="size-3.5 text-purple-400" />
                : <User className="size-3.5 text-wolf-blue-light" />
              }
            </div>
            <div className={cn(
              "rounded-xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "assistant"
                ? "bg-wolf-surface-2 border border-wolf-blue/10 text-wolf-white"
                : "bg-wolf-blue/20 border border-wolf-blue/30 text-wolf-white"
            )}>
              <div
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                className="[&_strong]:text-wolf-blue-light [&_strong]:font-bold"
              />
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="size-7 rounded-full flex items-center justify-center shrink-0 bg-purple-500/20 border border-purple-500/30">
              <Bot className="size-3.5 text-purple-400" />
            </div>
            <div className="bg-wolf-surface-2 border border-wolf-blue/10 rounded-xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="size-3.5 text-wolf-muted animate-spin" />
              <span className="text-xs text-wolf-muted">Gemini está pensando...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-wolf-blue/15 p-3 bg-wolf-surface-2">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
            rows={1}
            className="flex-1 bg-wolf-surface border border-wolf-blue/20 text-wolf-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-wolf-blue resize-none placeholder:text-wolf-muted/50 max-h-32 overflow-y-auto"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            size="icon"
            className="shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
        <p className="text-[10px] text-wolf-muted/50 mt-1.5 text-center">
          Powered by Google Gemini 2.0 Flash · Responses may vary
        </p>
      </div>
    </div>
  );
}
