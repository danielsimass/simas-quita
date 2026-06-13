# Tarefa 8.0: Módulo de dashboard (API)

## Visão Geral

Implementar `DashboardModule` com endpoint `GET /financings/:id/dashboard` retornando KPIs e séries temporais (saldo devedor, pagamentos mensais, amortizações mensais) para consumo pelo frontend Recharts.

<skills>
### Conformidade com Skills

Nenhuma skill específica se aplica a esta tarefa.
</skills>

<rules>
### Conformidade com Rules

- `folder-structure.mdc` — módulo NestJS de agregação
- `code-standards.mdc` — queries sem side effects (CQS)
- `node-js-ts.mdc` — strict TS
- `api-rest-http.mdc` — REST, resposta JSON tipada
- `tests.mdc` — Vitest; assert métricas após mutações
</rules>

<requirements>
- PRD RF 16–22: cards (valor financiado, total pago, amortizado, parcelas pagas/restantes, economia, prazos), gráficos e insights
- Endpoint `/api/v1/financings/:id/dashboard`
- Agregar via `FinancialCalculatorService.computeMetrics`
- Séries temporais: evolução da dívida, total pago por mês, amortizações por mês
- Insights: economia acumulada, meses antecipados, percentual quitado
- Performance: resposta ≤ 2 s para financiamentos até 360 parcelas (PRD)
</requirements>

## Subtarefas

- [ ] 8.1 Implementar use case de agregação de KPIs
- [ ] 8.2 Implementar séries temporais para gráficos Recharts
- [ ] 8.3 Calcular insights automáticos (economia, meses antecipados, % quitado)
- [ ] 8.4 Expor DTO de resposta alinhado ao frontend
- [ ] 8.5 Invalidar/recalcular métricas a partir do snapshot atual (financing + installments + prepayments)
- [ ] 8.6 Validar ownership do financiamento

## Detalhes de Implementação

Ver seções **DashboardModule**, **Endpoints de API (Financings — dashboard)**, **Interfaces (`computeMetrics`)** e **Abordagem de Testes (Integração — assert dashboard metrics)** em `techspec.md`.

## Critérios de Sucesso

- Dashboard reflete estado após mark paid, prepayment e delete
- KPIs batem com somatórios manuais em caso de referência PRICE demo
- Séries temporais com pontos mensais coerentes
- Usuário não autorizado recebe 403/404

## Testes da Tarefa

- [ ] Testes de unidade — `computeMetrics` agregações e formatação Decimal
- [ ] Testes de integração — fluxo register → create financing → mark paid → prepayment → assert dashboard metrics
- [ ] Testes E2E — não aplicável nesta tarefa

## Arquivos relevantes

- `apps/backends/controle-financiamentos-api/src/**/dashboard/`
- `apps/backends/controle-financiamentos-api/src/**/financial-calculator/`
- `libs/shared-financing-types/`
