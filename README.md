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
- Exportação de backup JSON dos dados carregados.
- Tabelas isoladas com prefixo `vsa_` e políticas RLS.

## Projeto Supabase conectado

- Project ref: `nuyzvpkvawixidotuuio`
- URL: `https://nuyzvpkvawixidotuuio.supabase.co`
- Edge Function: `vsa-track-click`

A chave publishable do projeto está configurada no frontend. Ela é uma chave pública de cliente, não uma chave administrativa. O acesso aos dados autenticados é limitado por RLS.

## Estrutura

- `index.html`: login e painel.
- `assets/css/app.css`: identidade visual responsiva.
- `assets/js/app.js`: autenticação, CRUD e dashboard.
- `track.html`: página pública de redirecionamento rastreável.
- `supabase/migrations/20261030_vsa_initial_schema.sql`: tabelas e políticas.
- `supabase/functions/vsa-track-click/index.ts`: fonte da Edge Function (a função já foi implantada no projeto Supabase).

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

## Segurança e limitações

- Nunca exponha chaves secretas ou service role no navegador.
- A Edge Function usa credencial administrativa apenas no ambiente server-side do Supabase.
- O endpoint de clique é público por natureza; antes de campanhas de grande escala, adicionar rate limiting, proteção anti-bot e monitoramento de abuso.
- O rastreamento registra cliques em links da plataforma. Não identifica nominalmente visitantes anônimos nem substitui métricas oficiais das redes sociais.
- Integrações sociais, pagamentos, captura de leads com consentimento, relatórios por IA e análise preditiva ainda serão implementados em fases seguintes.
- Não há promessa de viralização ou alcance garantido.
