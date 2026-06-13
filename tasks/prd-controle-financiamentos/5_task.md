# Tarefa 5.0: Módulo de financiamentos

## Visão Geral

Implementar `FinancingsModule` com CRUD de financiamentos, geração da grade inicial via `FinancialCalculatorService`, configuração de `bank_prepayment_value`, seleção de foco e endpoint opcional de seed demo para onboarding.

<skills>
### Conformidade com Skills

Nenhuma skill específica se aplica a esta tarefa.
</skills>

<rules>
### Conformidade com Rules

- `folder-structure.mdc` — módulo NestJS em camadas (use cases + controllers)
- `code-standards.mdc` — CQS nos use cases
- `node-js-ts.mdc` — strict TS
- `api-rest-http.mdc` — REST plural, status codes (201 create, 204 delete)
- `tests.mdc` — Vitest com mocks de repositório e calculator
</rules>

<requirements>
- PRD RF 6–10: wizard backend, múltiplos financiamentos, grade automática, seed demo PRICE
- PRD RF 11, 15: `bank_prepayment_value` configurável e atualizável
- Endpoints `/api/v1/financings` conforme tech spec
- Criação persiste financiamento + installments gerados em transação
- Taxa opcional: inferir via calculator quando ausente; permitir ajuste posterior
- Isolamento: usuário acessa apenas seus financiamentos
- Seed demo: R$ 45.000, 36× R$ 1.791,53, sistema PRICE
</requirements>

## Subtarefas

- [ ] 5.1 Implementar use cases CRUD (`create`, `findByUser`, `findById`, `update`, `delete`)
- [ ] 5.2 Integrar `FinancialCalculatorService.buildSchedule` na criação
- [ ] 5.3 Persistir grade inicial de `installments` em transação Prisma
- [ ] 5.4 Implementar PATCH para metadados e `bank_prepayment_value`
- [ ] 5.5 Implementar `POST /financings/:id/seed-demo` (onboarding)
- [ ] 5.6 Expor DTOs via `shared-financing-types`

## Detalhes de Implementação

Ver seções **FinancingsModule**, **Endpoints de API (Financings)**, **Fluxo de dados principal** e **Sequenciamento (item 4)** em `techspec.md`.

## Critérios de Sucesso

- POST `/financings` cria financiamento com N parcelas consistentes com PRICE/SAC informado
- GET `/financings` lista apenas financiamentos do usuário autenticado
- PATCH atualiza `bank_prepayment_value` sem corromper grade existente
- DELETE remove financiamento e parcelas associadas (cascade)
- Seed demo retorna financiamento de exemplo pronto para dashboard

## Testes da Tarefa

- [ ] Testes de unidade — use cases com mocks (`FinancingRepository`, `FinancialCalculatorService`)
- [ ] Testes de integração — create financing → assert grade gerada; usuário B não acessa financiamento de A (403/404)
- [ ] Testes E2E — não aplicável nesta tarefa

## Arquivos relevantes

- `apps/backends/controle-financiamentos-api/src/**/financings/`
- `libs/shared-financing-types/`
