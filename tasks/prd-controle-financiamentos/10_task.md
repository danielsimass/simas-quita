# Tarefa 10.0: Frontend — features de negócio

## Visão Geral

Implementar wizard de financiamento, gestão de parcelas, amortizações e dashboard com Recharts — consumindo a API completa com React Query, skeleton loading, empty states e badges de economia estimada vs real.

<skills>
### Conformidade com Skills

Nenhuma skill específica se aplica a esta tarefa.
</skills>

<rules>
### Conformidade com Rules

- `folder-structure.mdc` — features sob `src/` do frontend
- `code-standards.mdc` — hooks `use*`, componentes ≤ responsabilidade única
- `react.mdc` — function components, Vitest + Testing Library
- `tests.mdc` — testes de hooks e componentes críticos
</rules>

<requirements>
- PRD RF 6–31, 16–22: wizard, múltiplos financiamentos, parcelas, amortizações, dashboard
- Wizard: nome, instituição, valor financiado, parcelas, valor parcela, 1ª parcela, PRICE/SAC, observações, taxa opcional
- Seletor de financiamento em foco no shell
- Seed demo opcional no onboarding
- Tabela de parcelas com filtros (todas/pagas/pendentes), marcar paga, editar/excluir
- CRUD amortizações com tipo TERM/INSTALLMENT e valor bancário opcional
- Dashboard: cards KPI, 3 gráficos Recharts, insights, progresso visual
- Badge visual quando economia é estimativa (`SavingsSource = ESTIMATED`)
- Skeleton loading e empty states orientativos
- Toast notifications para ações e erros (PRD RF 39)
- Confirmação antes de exclusões (PRD RF 40)
</requirements>

## Subtarefas

- [ ] 10.1 Implementar wizard multi-step de criação de financiamento
- [ ] 10.2 Implementar seletor/alternância de financiamento em foco
- [ ] 10.3 Implementar tela de parcelas (listagem, filtros, marcar paga, editar/excluir)
- [ ] 10.4 Implementar tela de amortizações (CRUD, badge estimativa vs real)
- [ ] 10.5 Implementar dashboard com cards KPI e gráficos Recharts
- [ ] 10.6 Implementar hooks React Query (`useFinancing`, `useDashboard`, `useInstallments`, `usePrepayments`)
- [ ] 10.7 Implementar skeleton loaders, empty states e toasts
- [ ] 10.8 Implementar diálogos de confirmação de exclusão

## Detalhes de Implementação

Ver seções **controle-financiamentos-web**, **Fluxo de dados principal**, **Sequenciamento (item 8)** e requisitos funcionais do `prd.md` (seções 2–6).

## Critérios de Sucesso

- Wizard completo em ≤ 3 min (meta PRD) com grade visível no dashboard após criação
- Marcar parcela paga invalida cache e atualiza KPIs
- Amortização com valor bancário exibe badge "economia real"
- Gráficos renderizam séries do endpoint dashboard
- Exclusões exigem confirmação e atualizam UI imediatamente

## Testes da Tarefa

- [ ] Testes de unidade — hooks (`useFinancing`, `useDashboard`), formatadores monetários, componentes empty/skeleton, badge de estimativa
- [ ] Testes de integração — fluxos de tela com MSW (create financing → dashboard; mark paid → KPI update)
- [ ] Testes E2E — não aplicável nesta tarefa (coberto na tarefa 11.0)

## Arquivos relevantes

- `apps/frontends/controle-financiamentos-web/src/`
- `libs/shared-financing-types/`
