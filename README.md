# VIRAL SALES AI

Painel pessoal de inteligência de marketing, produtos, campanhas e rastreamento.

## Estado da primeira versão

- Dashboard responsivo em português.
- Login e cadastro via Supabase Auth.
- Modo local para demonstração.
- Cadastro, listagem e exclusão de produtos no PostgreSQL.
- Cadastro e listagem de campanhas no PostgreSQL.
- Criação de links rastreáveis persistidos no banco.
- Links associados a produto/campanha e parâmetros UTM de origem.
- Edge Function v2 grava origem, mídia e campanha nos eventos de clique.
- Cadastro e gestão de leads com status e registro de consentimento.
- Registro de vendas, valores e status (manual nesta etapa).
- Dashboard com cliques reais dos últimos sete dias e receita confirmada.
- Edge Function pública `vsa-track-click` registra cliques de visitantes e devolve o destino cadastrado no banco.
- Radar inicial com atalhos de pesquisa pública.
- AI Creative Studio conectado a uma Edge Function autenticada; gera hooks, legendas, CTA, briefing, palavras-chave, hashtags e plano de conteúdo.
- Exportação de backup JSON dos dados carregados.
- Tabelas isoladas com prefixo `vsa_` e políticas RLS.

## Projeto Supabase conectado

- Project ref: `nuyzvpkvawixidotuuio`
- URL: `https://nuyzvpkvawixidotuuio.supabase.co`
- Edge Functions: `vsa-track-click` (pública, redirecionamento) e `vsa-ai-campaign` (JWT obrigatório, geração de campanha).

A chave publishable do projeto está configurada no frontend. Ela é uma chave pública de cliente, não uma chave administrativa. O acesso aos dados autenticados é limitado por RLS.

## Estrutura

- `index.html`: login e painel.
- `assets/css/app.css`: identidade visual responsiva.
- `assets/js/app.js`: autenticação, CRUD e dashboard.
- `track.html`: página pública de redirecionamento rastreável.
- `supabase/migrations/20261030_vsa_initial_schema.sql`: tabelas e políticas.
- `supabase/functions/vsa-track-click/index.ts`: fonte da Edge Function de rastreamento.
- `supabase/functions/vsa-ai-campaign/index.ts`: geração de campanhas via OpenAI, executada no servidor.
- `supabase/migrations/20261030_vsa_ai_creative_studio.sql`: histórico de criativos e políticas RLS.

## Executar localmente

```bash
python -m http.server 8000
```

Abra `http://localhost:8000`.

## Configuração de autenticação

No Supabase Dashboard, abra Authentication > URL Configuration e configure:
- Site URL: endereço final da aplicação.
- Redirect URLs: endereço final e localhost usado nos testes.

Se a confirmação de e-mail estiver habilitada, confirme o e-mail antes do primeiro login.

## Ativar geração real com IA

A função `vsa-ai-campaign` já está implantada, mas exige uma chave do provedor. No Supabase Dashboard, abra Edge Functions > Secrets e adicione `OPENAI_API_KEY` com sua chave da API OpenAI. Não coloque essa chave no GitHub, no HTML ou no JavaScript do navegador. Sem esse secret, o painel informará que a IA ainda não está configurada. A chamada exige sessão autenticada e usa o modelo `gpt-4o-mini`.

## Segurança e limitações

- Nunca exponha chaves secretas ou service role no navegador.
- A Edge Function usa credencial administrativa apenas no ambiente server-side do Supabase.
- O endpoint de clique é público por natureza; antes de campanhas de grande escala, adicionar rate limiting, proteção anti-bot e monitoramento de abuso.
- O rastreamento registra cliques em links da plataforma. Não identifica nominalmente visitantes anônimos nem substitui métricas oficiais das redes sociais.
- Integrações oficiais de publicação social, pagamentos e atribuição automática de vendas ainda serão implementadas em fases seguintes.
- A geração por IA só ficará ativa após configurar `OPENAI_API_KEY` nos Secrets do Supabase; o modo local continua sendo demonstrativo.
- Não há promessa de viralização ou alcance garantido.
