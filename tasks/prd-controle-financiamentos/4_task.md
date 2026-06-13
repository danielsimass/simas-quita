# Tarefa 4.0: Motor de cálculos financeiros

## Visão Geral

Implementar `FinancialCalculatorModule` como domínio puro (sem Prisma): grades PRICE/SAC, inferência de taxa mensal, impacto de amortizações (CDC art. 52 §2º), calibração por valor bancário e métricas de dashboard. Esta é a base determinística antes de expor mutações na API.

<skills>
### Conformidade com Skills

Nenhuma skill específica para domínio financeiro em `.agents/skills` ou `.cursor/skills`.
</skills>

<rules>
### Conformidade com Rules

- `code-standards.mdc` — funções puras, ≤ 50 linhas, CQS
- `node-js-ts.mdc` — strict TS, sem I/O no domínio
- `tests.mdc` — testes de domínio sem I/O; casos de referência obrigatórios
</rules>

<requirements>
- PRD RF 32–37: grades PRICE e SAC, saldo devedor, economia de juros, previsão de quitação, determinismo
- PRICE: `PMT = PV × [i(1+i)^n] / [(1+i)^n - 1]`
- SAC: amortização constante `A = PV/n`; parcela = `A + i × saldo`
- Inferência de taxa por bissecção/Newton-Raphson quando `monthly_rate` ausente
- Amortização: `TERM_REDUCTION` e `INSTALLMENT_REDUCTION` com redução proporcional de juros futuros
- Valor bancário: `real_savings = projected_remaining_interest - bank_value`; fallback `SavingsSource = ESTIMATED`
- Arredondamento half-up em 2 casas na camada de apresentação
- Módulo **sem dependência de Prisma** — recebe snapshots, retorna projeções
</requirements>

## Subtarefas

- [ ] 4.1 Implementar `buildSchedule` para PRICE e SAC
- [ ] 4.2 Implementar `inferMonthlyRate` (bissecção/Newton-Raphson)
- [ ] 4.3 Implementar `applyPrepayment` (TERM_REDUCTION e INSTALLMENT_REDUCTION)
- [ ] 4.4 Implementar `computeMetrics` (KPIs e séries para dashboard)
- [ ] 4.5 Implementar lógica de calibração bancária (`bank_prepayment_value`, `bank_charged_value`)
- [ ] 4.6 Exportar tipos de input/output alinhados a `shared-financing-types`

## Detalhes de Implementação

Ver seções **FinancialCalculatorModule**, **Interfaces Principais**, **Regras de domínio no cálculo** e **Abordagem de Testes (Testes Unidade — FinancialCalculatorModule)** em `techspec.md`.

## Critérios de Sucesso

- Caso de referência PRICE (R$ 45.000, 36× R$ 1.791,53) bate com tolerância ≤ R$ 0,01 por parcela
- Grades SAC com amortização constante e parcelas decrescentes
- Mesmos inputs produzem mesmos outputs (determinismo)
- Amortização TERM elimina parcelas finais; INSTALLMENT reduz PMT/amortização conforme sistema
- Valor bancário priorizado sobre estimativa quando informado

## Testes da Tarefa

- [ ] Testes de unidade — PRICE vs referência; SAC vs referência; inferência de taxa; TERM vs INSTALLMENT; prioridade valor bancário; edge cases (taxa zero, última parcela)
- [ ] Testes de integração — não aplicável (domínio puro)
- [ ] Testes E2E — não aplicável nesta tarefa

## Arquivos relevantes

- `apps/backends/controle-financiamentos-api/src/**/financial-calculator/`
- `libs/shared-financing-types/`
