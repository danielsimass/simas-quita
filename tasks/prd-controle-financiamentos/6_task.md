# Tarefa 6.0: Módulo de parcelas

## Visão Geral

Implementar `InstallmentsModule` com listagem filtrada, marcar parcela como paga, editar valor/data e excluir parcela — cada mutação dispara recálculo transacional via `FinancialCalculatorService`.

<skills>
### Conformidade com Skills

Nenhuma skill específica se aplica a esta tarefa.
</skills>

<rules>
### Conformidade com Rules

- `folder-structure.mdc` — módulo NestJS dedicado
- `code-standards.mdc` — CQS, early returns
- `node-js-ts.mdc` — strict TS
- `api-rest-http.mdc` — REST, 422 para regras de negócio
- `tests.mdc` — Vitest; cenários de parcela fora de ordem
</rules>

<requirements>
- PRD RF 23–27: tabela de parcelas, filtros (todas/pagas/pendentes), marcar paga, editar/excluir, recálculo
- Endpoints `/financings/:financingId/installments` e `/installments/:id`
- PATCH: `paidAt` para marcar paga; editar `amount` e `dueDate` quando aplicável
- DELETE com recálculo imediato de saldo e métricas
- Parcela paga fora de ordem → recálculo consistente (caso extremo PRD)
- Status `PENDING` | `PAID` conforme enum compartilhado
</requirements>

## Subtarefas

- [ ] 6.1 Implementar listagem com query param `?status=`
- [ ] 6.2 Implementar use case marcar parcela paga (`paidAt`, status PAID)
- [ ] 6.3 Implementar use case editar parcela (valor/data) com recálculo
- [ ] 6.4 Implementar use case excluir parcela com recálculo transacional
- [ ] 6.5 Orquestrar persistência + `FinancialCalculatorService` em transação Prisma
- [ ] 6.6 Validar ownership (parcela pertence ao financiamento do usuário)

## Detalhes de Implementação

Ver seções **InstallmentsModule**, **Endpoints de API (Installments)**, **Fluxo de dados principal** e **Abordagem de Testes (Use cases — parcela fora de ordem)** em `techspec.md`.

## Critérios de Sucesso

- Marcar parcela paga atualiza status, `paidAt` e recalcula saldo das parcelas futuras
- Exclusão remove parcela e regenera projeção coerente
- Filtros retornam subconjuntos corretos (pagas/pendentes)
- Mutação em financiamento de outro usuário retorna 403/404

## Testes da Tarefa

- [ ] Testes de unidade — use cases de mark paid, edit, delete com mocks
- [ ] Testes de integração — mark installment paid → assert grade consistente; delete → recálculo; parcela fora de ordem
- [ ] Testes E2E — não aplicável nesta tarefa (coberto na tarefa 11.0)

## Arquivos relevantes

- `apps/backends/controle-financiamentos-api/src/**/installments/`
- `libs/shared-financing-types/`
