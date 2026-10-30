import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return json({
      error: "AI_NOT_CONFIGURED",
      message: "Configure OPENAI_API_KEY nos Secrets das Edge Functions do Supabase para ativar a geração por IA.",
    }, 503);
  }

  let input: Record<string, unknown>;
  try {
    input = await req.json();
  } catch {
    return json({ error: "INVALID_JSON", message: "Envie um corpo JSON válido." }, 400);
  }

  const fields = ["niche", "product", "audience", "pain_point", "offer", "channel", "tone"] as const;
  const values: Record<string, string> = {};
  for (const field of fields) {
    const value = input[field] == null ? "" : String(input[field]).trim();
    if (value.length > 500) return json({ error: "FIELD_TOO_LONG", message: "Cada campo deve ter no máximo 500 caracteres." }, 400);
    values[field] = value;
  }
  if (!values.audience || !values.pain_point || !values.channel) {
    return json({ error: "MISSING_FIELDS", message: "Público, necessidade e canal são obrigatórios." }, 400);
  }

  const systemPrompt = `Você é estrategista de marketing responsável para pequenos negócios brasileiros. Gere uma campanha em português brasileiro, específica e útil. Não invente estatísticas, depoimentos, certificações ou resultados. Não prometa renda, viralização, cura, emagrecimento garantido ou resultados certos. Para saúde, peso, educação e desenvolvimento infantil, evite alegações clínicas sem evidência e linguagem que explore vulnerabilidades. Não recomende spam, compra de seguidores, coleta de dados sem consentimento ou automação que viole regras das plataformas. Responda SOMENTE JSON válido com as chaves: hook, caption, cta, creative_brief, keywords (array de strings), hashtags (array de strings), content_plan (array de 3 objetos com format, angle, opening). `;
  const userPrompt = `Crie uma campanha. Nicho: ${values.niche || "não informado"}. Produto/serviço: ${values.product || "não informado"}. Público: ${values.audience}. Dor/necessidade: ${values.pain_point}. Oferta: ${values.offer || "não informada"}. Canal: ${values.channel}. Tom: ${values.tone || "claro, humano e persuasivo"}. Inclua uma proposta de valor honesta e CTA simples.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return json({ error: "AI_PROVIDER_ERROR", message: "O provedor de IA não conseguiu gerar a campanha.", status: response.status }, 502);
    }
    const content = data.choices?.[0]?.message?.content;
    if (!content) return json({ error: "EMPTY_AI_RESPONSE", message: "A IA retornou uma resposta vazia." }, 502);
    const campaign = JSON.parse(content);
    return json({ campaign, model: "gpt-4o-mini" });
  } catch {
    return json({ error: "GENERATION_FAILED", message: "Falha ao gerar campanha. Tente novamente." }, 502);
  }
});
