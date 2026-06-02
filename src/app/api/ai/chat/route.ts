import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Você é o Agente de Marketing da Arena Wolf, uma lan house premium em Belo Horizonte (Av. Ivaí, 1178 · Dom Bosco).

SOBRE A ARENA WOLF:
- 10 PCs Gamer (Wolf 01-10) com monitores 180Hz
- 3 PlayStation 5 (PS5 01-03)
- Funcionamento: todos os dias 08h às 22h
- Corujão: Sex→Sáb e Sáb→Dom das 22h às 06h
- Preço: R$ 10/hora (PC e PS5)
- Eventos: campeonatos de CS2, Valorant, FC25, LoL, GTA V

SEU PAPEL:
- Estrategista de marketing digital especializado em lan houses
- Crie campanhas, copies e conteúdo para Meta Ads, Google Ads, Instagram, Facebook
- Sugira estratégias de tráfego pago com base em dados e tendências
- Use Google Search Grounding quando relevante para pesquisa de mercado
- Seja objetivo, criativo e focado em conversão

Responda sempre em português brasileiro de forma profissional mas dinâmica.`;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();

    // Support both formats: {messages:[]} and legacy {message, history}
    let userMessage: string;
    let history: { role: string; content: string }[];
    if (body.messages) {
      const msgs = body.messages as { role: string; content: string }[];
      const last = msgs[msgs.length - 1];
      userMessage = last?.content ?? "";
      history = msgs.slice(0, -1);
    } else {
      userMessage = body.message ?? "";
      history = body.history ?? [];
    }

    if (!userMessage.trim()) return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        content: "⚠️ **API de IA não configurada.** Adicione `GEMINI_API_KEY` no `.env.local`.\n\nObtua sua chave em: https://aistudio.google.com/app/apikey",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history: history.map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessage(userMessage);
    const content = result.response.text();

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ error: "Erro ao processar mensagem." }, { status: 500 });
  }
}
