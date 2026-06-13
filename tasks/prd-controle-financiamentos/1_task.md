# Tarefa 1.0: Bootstrap do monorepo Nx

## Visão Geral

Configurar o workspace **pnpm + Nx** greenfield com os três projetos da solução (`controle-financiamentos-api`, `controle-financiamentos-web`, `controle-financiamentos-e2e`), a lib compartilhada `shared-financing-types`, tooling (ESLint, Vitest) e `docker-compose.yml` para api + postgres + build do web.

<skills>
### Conformidade com Skills

Nenhuma skill específica em `.agents/skills` ou `.cursor/skills` se aplica a esta tarefa de bootstrap.
</skills>

<rules>
### Conformidade com Rules

- `folder-structure.mdc` — apps em `apps/backends/` e `apps/frontends/`; lib em `libs/`
- `code-standards.mdc` — TypeScript, nomenclatura e organização de código
- `node-js-ts.mdc` — pnpm, ESM, strict TS
- `tests.mdc` — Vitest como runner padrão
</rules>

<requirements>
- Workspace Nx com pnpm configurado (`pnpm-workspace.yaml`, `nx.json`)
- App NestJS em `apps/backends/controle-financiamentos-api`
- App Vite/React em `apps/frontends/controle-financiamentos-web`
- Projeto Playwright em `apps/controle-financiamentos-e2e`
- Lib `libs/shared-financing-types` com enums base (sem lógica de domínio)
- ESLint e Vitest funcionando nos projetos aplicáveis
- `docker-compose.yml` com serviços api, postgres e web (build estático)
- Endpoint `/health` respondendo liveness no bootstrap da API
</requirements>

## Subtarefas

- [ ] 1.1 Inicializar workspace Nx + pnpm e configurar grafo de dependências
- [ ] 1.2 Gerar app NestJS `controle-financiamentos-api` com estrutura modular base
- [ ] 1.3 Gerar app Vite/React `controle-financiamentos-web`
- [ ] 1.4 Criar lib `shared-financing-types` com enums iniciais (`AmortizationSystem`, `InstallmentStatus`, `PrepaymentType`, `SavingsSource`)
- [ ] 1.5 Configurar ESLint, Vitest e scripts Nx (`build`, `test`, `lint`, `dev`)
- [ ] 1.6 Criar projeto `controle-financiamentos-e2e` (Playwright) com config mínima
- [ ] 1.7 Criar `docker-compose.yml` (api + postgres + web build) e health check básico

## Detalhes de Implementação

Ver seções **Arquitetura do Sistema**, **Sequenciamento de Desenvolvimento (item 1)** e **Dependências Técnicas** em `techspec.md`.

## Critérios de Sucesso

- `pnpm install` e `nx run-many -t build` concluem sem erro nos projetos criados
- API responde `GET /health` com status 200
- Docker Compose sobe os serviços definidos
- Lib compartilhada importável por api e web
- Vitest executa pelo menos um teste smoke por projeto

## Testes da Tarefa

- [ ] Testes de unidade — smoke test de configuração (ex.: validação de enums exportados pela lib)
- [ ] Testes de integração — `docker compose up` com health check da API passando
- [ ] Testes E2E — não aplicável nesta tarefa

## Arquivos relevantes

- `pnpm-workspace.yaml`, `nx.json`
- `apps/backends/controle-financiamentos-api/`
- `apps/frontends/controle-financiamentos-web/`
- `libs/shared-financing-types/`
- `apps/controle-financiamentos-e2e/`
- `docker-compose.yml`
