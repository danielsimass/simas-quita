# Especificação Técnica

## Resumo Executivo

A solução será um monorepo **pnpm + Nx** com dois aplicativos: API **NestJS** (`apps/backends/controle-financiamentos-api`) e SPA **Vite + React** (`apps/frontends/controle-financiamentos-web`). A persistência usa **Prisma** com SQLite em desenvolvimento e PostgreSQL em produção. Autenticação via **JWT access + refresh** transportados em cookies **HttpOnly/Secure/SameSite**, com rotação de refresh token e revogação no banco.

O diferencial técnico é um **motor de cálculos financeiros** isolado no backend (PRICE/SAC, amortizações conforme CDC art. 52 §2º, calibração por valor bancário), garantindo determinismo e recálculo consistente a cada mutação de parcela ou amortização. O frontend consome a API via React Query, renderiza dashboard com **Recharts** e adota **Tailwind + shadcn/ui** para o visual fintech do PRD. Deploy ficará a cargo do usuário no homeserver; a stack será **containerizada (Docker Compose)** para facilitar essa etapa posterior.

## Arquitetura do Sistema

### Visão Geral dos Componentes

| Componente | Responsabilidade |
|---|---|
| **controle-financiamentos-web** | SPA Vite/React: auth, wizard, dashboard, parcelas, amortizações, tema claro/escuro, PWA, layout responsivo |
| **controle-financiamentos-api** | API REST NestJS: auth, CRUD de financiamentos/parcelas/amortizações, orquestração de recálculos |
| **FinancialCalculatorModule** | Domínio puro PRICE/SAC: geração de grade, inferência de taxa, impacto de amortização, métricas de dashboard |
| **PrismaModule** | ORM, migrations, repositórios tipados, isolamento por `userId` |
| **AuthModule** | Registro, login, logout, refresh, guards JWT, hash bcrypt, cookies |
| **FinancingsModule** | CRUD de financiamentos, seleção de foco, valor de antecipação bancária base |
| **InstallmentsModule** | Listagem, filtros, marcar paga, editar/excluir parcela com recálculo |
| **PrepaymentsModule** | CRUD de amortizações (redução de prazo/parcela), valor bancário opcional por operação |
| **DashboardModule** | Agregação de KPIs e séries temporais para gráficos (saldo, pagamentos, amortizações) |
| **shared-financing-types** (`libs/`) | DTOs, enums e tipos compartilhados entre API e web (sem lógica de domínio) |
| **controle-financiamentos-e2e** | Testes Playwright cobrindo fluxos críticos front + API |

**Fluxo de dados principal:** o web envia mutações autenticadas (cookie) → NestJS valida JWT → use case persiste evento (parcela/amortização) → `FinancialCalculatorService` recalcula grade e métricas → resposta JSON → React Query invalida cache → UI atualiza cards/gráficos.

```
[Browser SPA] --cookies JWT--> [NestJS API] --> [Prisma/PostgreSQL]
                                    |
                                    v
                         [FinancialCalculatorModule]
```

## Design de Implementação

### Interfaces Principais

```typescript
interface FinancialCalculatorService {
  inferMonthlyRate(input: InferRateInput): number;
  buildSchedule(input: ScheduleInput): InstallmentDraft[];
  applyPrepayment(input: PrepaymentImpactInput): PrepaymentImpactResult;
  computeMetrics(input: MetricsInput): FinancingMetrics;
}

interface AuthService {
  register(input: RegisterInput): AuthTokens;
  login(input: LoginInput): AuthTokens;
  refresh(refreshToken: string): AuthTokens;
  logout(userId: string, refreshToken: string): void;
}

interface FinancingRepository {
  findByUser(userId: string): Promise<Financing[]>;
  findByIdForUser(id: string, userId: string): Promise<Financing | null>;
  save(financing: Financing): Promise<Financing>;
}
```

`FinancialCalculatorService` permanece **sem dependência de Prisma** — recebe snapshots (financing + installments + prepayments) e retorna projeções. Use cases no NestJS coordenam persistência + recálculo em transação.

### Modelos de Dados

**Entidades Prisma (PostgreSQL / SQLite):**

| Tabela | Campos principais |
|---|---|
| `users` | `id` (UUID), `name`, `email` (unique), `password_hash`, `created_at` |
| `refresh_tokens` | `id`, `user_id`, `token_hash`, `expires_at`, `revoked_at` |
| `financings` | `id`, `user_id`, `name`, `institution`, `financed_amount`, `installment_count`, `installment_amount`, `first_due_date`, `system` (PRICE \| SAC), `monthly_rate` (nullable), `bank_prepayment_value` (nullable), `notes`, `created_at` |
| `installments` | `id`, `financing_id`, `number`, `amount`, `interest`, `amortization`, `balance`, `due_date`, `status` (PENDING \| PAID), `paid_at` (nullable) |
| `prepayments` | `id`, `financing_id`, `date`, `amount`, `type` (TERM_REDUCTION \| INSTALLMENT_REDUCTION), `bank_charged_value` (nullable), `estimated_savings`, `real_savings` (nullable), `eliminated_installments` |

**Enums compartilhados** (`libs/shared-financing-types`): `AmortizationSystem`, `InstallmentStatus`, `PrepaymentType`, `SavingsSource` (ESTIMATED \| BANK_CALIBRATED).

**Regras de domínio no cálculo:**

- **PRICE:** `PMT = PV × [i(1+i)^n] / [(1+i)^n - 1]`; juros decrescentes, amortização crescente.
- **SAC:** amortização constante `A = PV/n`; parcela = `A + i × saldo`.
- **Taxa mensal:** campo opcional no wizard; se ausente, inferir por bissecção/Newton-Raphson a partir de `financed_amount`, `installment_amount`, `installment_count` e `system`.
- **Amortização antecipada (CDC art. 52 §2º):** redução proporcional de juros futuros; tipos `TERM_REDUCTION` (elimina parcelas finais) e `INSTALLMENT_REDUCTION` (reduz PMT no PRICE ou amortização no SAC).
- **Valor bancário:** quando `bank_prepayment_value` ou `bank_charged_value` existir, `real_savings = projected_remaining_interest - bank_value`; caso contrário, `SavingsSource = ESTIMATED` com badge visual no front.

Valores monetários armazenados como **Decimal** (Prisma `Decimal` / string no JSON) com arredondamento **half-up** em 2 casas na camada de apresentação.

### Endpoints de API

Prefixo: `/api/v1`. Autenticação via cookies (exceto rotas `@Public()`).

**Auth**

| Método | Caminho | Descrição |
|---|---|---|
| POST | `/auth/register` | Body: `{ name, email, password }` → 201 + cookies |
| POST | `/auth/login` | Body: `{ email, password }` → 200 + cookies |
| POST | `/auth/logout` | Revoga refresh token → 204 |
| POST | `/auth/refresh` | Rotaciona par access/refresh → 200 |
| GET | `/auth/me` | Retorna usuário autenticado → 200 |

**Financings**

| Método | Caminho | Descrição |
|---|---|---|
| GET | `/financings` | Lista financiamentos do usuário |
| POST | `/financings` | Cria financiamento + gera grade inicial |
| GET | `/financings/:id` | Detalhe com resumo |
| PATCH | `/financings/:id` | Atualiza metadados e `bank_prepayment_value` |
| DELETE | `/financings/:id` | Exclusão com confirmação (204) |
| GET | `/financings/:id/dashboard` | KPIs + séries para gráficos |
| POST | `/financings/:id/seed-demo` | Opcional: dados de exemplo PRICE (onboarding) |

**Installments**

| Método | Caminho | Descrição |
|---|---|---|
| GET | `/financings/:financingId/installments?status=` | Lista com filtro |
| PATCH | `/installments/:id` | Marcar paga (`paidAt`), editar valor/data |
| DELETE | `/installments/:id` | Excluir + recálculo |

**Prepayments**

| Método | Caminho | Descrição |
|---|---|---|
| GET | `/financings/:financingId/prepayments` | Lista amortizações |
| POST | `/financings/:financingId/prepayments` | Registra amortização + recálculo |
| PATCH | `/prepayments/:id` | Editar |
| DELETE | `/prepayments/:id` | Excluir + recálculo |

**Health**

| Método | Caminho | Descrição |
|---|---|---|
| GET | `/health` | Liveness/readiness para Docker |

Respostas de erro padronizadas: `{ statusCode, message, errors? }`. Status: 400 (malformado), 401, 403, 404, 422 (regra de negócio), 500.

## Pontos de Integração

MVP **sem integrações externas** (sem Open Finance, sem e-mail transacional). Pontos previstos:

- **CORS:** API permite origem do SPA (`CORS_ORIGIN`); credenciais habilitadas para cookies.
- **Proxy reverso (homeserver):** Nginx/Caddy termina TLS, roteia `/api` → NestJS e `/` → assets estáticos do Vite build.
- **Futuro (pós-MVP):** provider de e-mail para lembretes; exportação CSV/PDF como endpoints de download.

## Abordagem de Testes

### Testes Unidade

- **FinancialCalculatorModule:** grades PRICE/SAC vs casos de referência (ex.: R$ 45.000, 36× R$ 1.791,53); inferência de taxa; amortização TERM vs INSTALLMENT; prioridade de valor bancário.
- **Use cases NestJS:** mocks de repositório com Vitest (`vi.fn`); cenários de parcela fora de ordem, exclusão, financiamento sem taxa informada.
- **Frontend:** hooks (`useFinancing`, `useDashboard`), formatadores monetários, componentes de empty/skeleton.

### Testes de Integração

- API + Prisma em SQLite in-memory ou container efêmero: fluxo register → create financing → mark installment paid → create prepayment → assert dashboard metrics.
- Validação de isolamento: usuário A não acessa financiamento de usuário B (403/404).

### Testes de E2E

- **Playwright** no projeto `controle-financiamentos-e2e`:
  1. Cadastro → wizard → dashboard com skeleton resolvido.
  2. Marcar parcela paga → KPIs atualizados.
  3. Amortização com valor bancário → badge "economia real".
  4. Tema escuro persistido.
  5. Layout mobile (nav inferior).

## Sequenciamento de Desenvolvimento

### Ordem de Construção

1. **Bootstrap Nx + apps** — workspace pnpm/Nx, ESLint, Vitest, Docker Compose (api + postgres + web build).
2. **Prisma + AuthModule** — users, refresh tokens, cookies JWT; guard global.
3. **FinancialCalculatorModule + testes unitários** — base determinística antes de expor API.
4. **FinancingsModule + geração de grade** — wizard backend + seed demo.
5. **InstallmentsModule + PrepaymentsModule** — mutações com recálculo transacional.
6. **DashboardModule** — agregações e séries temporais.
7. **Frontend: auth + layout responsivo** — rotas protegidas, React Query, shadcn shell.
8. **Frontend: wizard, parcelas, amortizações, dashboard/Recharts** — consumo da API.
9. **PWA + tema + polish UX** — manifest, toasts, confirmações de exclusão.
10. **E2E Playwright + hardening** — CORS, rate limit auth, helmet.

### Dependências Técnicas

- Node.js LTS, pnpm, Nx CLI.
- PostgreSQL (prod/homeserver) e SQLite (dev local).
- Docker/Docker Compose para empacotamento no homeserver (definido pelo usuário posteriormente).
- Geração shadcn/ui e ícones PWA.

## Monitoramento e Observabilidade

Infraestrutura inicial enxuta (homeserver); preparar extensibilidade:

- **Logs estruturados:** NestJS + `pino` (JSON em prod, pretty em dev); campos: `requestId`, `userId`, `financingId`, duração.
- **Métricas Prometheus** (endpoint `/metrics` opcional via `@willsoto/nestjs-prometheus`): `http_request_duration_seconds`, `financial_recalc_duration_seconds`, `auth_login_total`.
- **Health checks:** `/health` para Docker `HEALTHCHECK`.
- Dashboard Grafana: configurável no homeserver quando Prometheus estiver disponível; não bloqueante para MVP.

## Considerações Técnicas

### Decisões Principais

| Decisão | Justificativa |
|---|---|
| NestJS (vs Fastify do rule `api-rest-http`) | Escolha explícita do usuário; módulos, DI e guards aceleram auth + domínio financeiro |
| Nx + pnpm (vs Turbo puro do rule `folder-structure`) | Escolha do usuário; Nx gerencia grafo de dependências e generators Nest/React |
| Cálculos no servidor | PRD exige consistência; evita divergência client-side e protege regras de negócio |
| JWT HttpOnly cookies | Segurança XSS superior a localStorage; SPA com `credentials: 'include'` |
| Taxa opcional + inferência | UX do wizard enxuto; fallback matemático quando usuário não souber a taxa |
| Tailwind + shadcn + Recharts | Visual fintech do PRD; desvio justificado do rule `react` (MUI em outros apps) |
| Docker Compose | Deploy adiado ao homeserver; imagens prontas sem acoplar a cloud específica |
| `libs/shared-financing-types` | Contratos tipados front/back sem duplicar enums |

**Alternativas rejeitadas:** cálculo no browser (risco de inconsistência); sessão Redis (complexidade desnecessária no MVP single-user homeserver); taxa obrigatória (fricção no wizard).

### Riscos Conhecidos

| Risco | Mitigação |
|---|---|
| Inferência de taxa imprecisa quando parcela informada difere do contrato | Campo opcional de taxa; exibir aviso quando inferida; permitir ajuste posterior |
| Divergência vs banco sem valor de antecipação | Badge "estimativa"; priorizar `bank_prepayment_value` quando informado |
| Recálculo custoso em financiamentos longos | Operações O(n) aceitáveis (< 360 parcelas); cache de métricas invalidado por evento |
| Desvio PRICE/SAC real (IOF, seguro, CET) | Documentado como limitação MVP; calibração via valor bancário |
| Rule Fastify vs NestJS | Escopo limitado a este produto greenfield; não alterar backends existentes |

### Conformidade com Rules

| Rule | Aplicação |
|---|---|
| `folder-structure.mdc` | Apps em `apps/backends/` e `apps/frontends/`; lib compartilhada em `libs/` |
| `code-standards.mdc` | TypeScript, camelCase/PascalCase, CQS nos use cases, funções ≤ 50 linhas |
| `node-js-ts.mdc` | pnpm, ESM, strict TS, sem `any` |
| `api-rest-http.mdc` | Paths REST plural em inglês, kebab-case, status codes padronizados — **adaptado para NestJS** (não Fastify) |
| `react.mdc` | Function components, hooks `use*`, Vitest + Testing Library — **Tailwind/shadcn** neste app |
| `tests.mdc` | Vitest como runner; Playwright para E2E; testes de domínio sem I/O |

Pasta `.agents/rules` não existe neste repositório; rules aplicáveis estão em `.cursor/rules/`.

### Conformidade com Skills

Nenhuma skill em `.agents/skills` ou `.cursor/skills` é específica para este domínio financeiro. Skills Cursor genéricas (create-rule, create-skill) não se aplicam à implementação.

### Arquivos relevantes e dependentes

| Arquivo / caminho | Papel |
|---|---|
| `tasks/prd-controle-financiamentos/prd.md` | Requisitos de produto (fonte) |
| `tasks/prd-controle-financiamentos/techspec.md` | Este documento |
| `pnpm-workspace.yaml`, `nx.json` | Workspace monorepo |
| `apps/backends/controle-financiamentos-api/` | API NestJS |
| `apps/frontends/controle-financiamentos-web/` | SPA Vite/React |
| `libs/shared-financing-types/` | Tipos compartilhados |
| `apps/controle-financiamentos-e2e/` | Testes Playwright |
| `docker-compose.yml` | Orquestração para homeserver |
| `.cursor/rules/*.mdc` | Padrões de código e estrutura |
