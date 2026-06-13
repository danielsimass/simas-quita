# Tarefa 11.0: E2E, PWA e hardening

## Visão Geral

Finalizar MVP com testes Playwright dos fluxos críticos, PWA básico (manifest, ícones), hardening da API (CORS, helmet, rate limit auth), logs estruturados com pino e validação do deploy containerizado.

<skills>
### Conformidade com Skills

Nenhuma skill específica se aplica a esta tarefa.
</skills>

<rules>
### Conformidade com Rules

- `folder-structure.mdc` — e2e em `apps/controle-financiamentos-e2e`
- `code-standards.mdc` — código de teste legível e focado
- `api-rest-http.mdc` — segurança HTTP, health checks
- `react.mdc` — PWA no frontend
- `tests.mdc` — Playwright para E2E
</rules>

<requirements>
- PRD RF 41: PWA básico (manifesto, ícones, shell offline)
- Tech spec E2E: 5 fluxos Playwright críticos
- Hardening: CORS, helmet, rate limit em rotas auth
- Logs estruturados: pino (JSON prod, pretty dev) com `requestId`, `userId`, duração
- Health check `/health` para Docker HEALTHCHECK
- Métricas Prometheus opcionais (`/metrics`) — não bloqueante
</requirements>

## Subtarefas

- [ ] 11.1 Configurar Playwright e fixtures (auth, seed demo)
- [ ] 11.2 E2E: cadastro → wizard → dashboard com skeleton resolvido
- [ ] 11.3 E2E: marcar parcela paga → KPIs atualizados
- [ ] 11.4 E2E: amortização com valor bancário → badge "economia real"
- [ ] 11.5 E2E: tema escuro persistido após reload
- [ ] 11.6 E2E: layout mobile com nav inferior
- [ ] 11.7 Implementar PWA (manifest, ícones, service worker básico)
- [ ] 11.8 Hardening API: helmet, rate limit auth, validar CORS
- [ ] 11.9 Configurar logs pino e health check Docker
- [ ] 11.10 Validar `docker compose up` end-to-end (api + postgres + web)

## Detalhes de Implementação

Ver seções **Testes de E2E**, **Monitoramento e Observabilidade**, **Sequenciamento (item 10)**, **Pontos de Integração (proxy reverso)** e **Considerações Técnicas (Riscos)** em `techspec.md`.

## Critérios de Sucesso

- Suite Playwright passa nos 5 fluxos definidos na tech spec
- PWA instalável com manifest e ícones válidos
- Rate limit bloqueia brute force básico em `/auth/login`
- Docker Compose sobe stack completa; health check passa
- Logs incluem `requestId` e `userId` em requests autenticados

## Testes da Tarefa

- [ ] Testes de unidade — não aplicável (foco em E2E e infra)
- [ ] Testes de integração — health check; rate limit auth; CORS preflight
- [ ] Testes E2E — 5 fluxos Playwright listados acima

## Arquivos relevantes

- `apps/controle-financiamentos-e2e/`
- `apps/frontends/controle-financiamentos-web/` (manifest, PWA)
- `apps/backends/controle-financiamentos-api/` (helmet, rate limit, pino)
- `docker-compose.yml`
