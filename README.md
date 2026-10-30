# VIRAL SALES AI

Painel pessoal de inteligência de marketing, produtos, campanhas e rastreamento.

## Primeira versão

- Interface responsiva em português.
- Modo local para testar produtos e campanhas sem configurar backend.
- Cadastro de produtos e campanhas.
- Geração de links rastreáveis por produto.
- Painel inicial com indicadores.
- Radar de pesquisa com atalhos para fontes públicas.
- Exportação de backup JSON.
- Estrutura SQL isolada com prefixo `vsa_` e políticas RLS por usuário.

## Tecnologias

- HTML, CSS e JavaScript (sem etapa de build).
- Supabase Auth e PostgreSQL.
- GitHub para versionamento e Cloudflare Pages (ou hospedagem estática equivalente).

## Executar

Abra `index.html` localmente ou use um servidor estático, por exemplo:

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000`.

## Configurar Supabase

1. Selecione um projeto Supabase dedicado ou explicitamente aprovado para o VIRAL SALES AI.
2. Revise `supabase/migrations/20261030_vsa_initial_schema.sql`.
3. Execute a migração no SQL Editor do projeto escolhido.
4. Em **Configurações** no app, informe Project URL e Publishable key.
5. Ative confirmação de e-mail e configure URLs de redirecionamento do Auth para o endereço publicado.
6. Teste com uma conta própria antes de inserir dados reais.

**Importante:** a migração cria apenas tabelas com prefixo `vsa_`. Ela não altera tabelas existentes. A chave publicável pode ser usada no navegador somente com RLS e políticas corretas. Nunca exponha `service_role`, chaves secretas, senhas ou tokens privados.

## Limitações desta versão

- O modo local guarda dados apenas no navegador e dispositivo atual.
- O link de rastreamento desta versão registra uma demonstração local; rastreamento centralizado entre visitantes/dispositivos requer endpoint server-side/Edge Function.
- Integrações sociais e publicação automática ainda não estão conectadas.
- Dados demográficos e métricas de plataformas dependem de APIs oficiais, permissões e disponibilidade.
- Não há promessa de viralização nem de alcance garantido.
