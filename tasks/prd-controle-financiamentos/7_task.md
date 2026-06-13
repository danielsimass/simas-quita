# Tarefa 7.0: Módulo de amortizações

## Visão Geral

Implementar `PrepaymentsModule` com CRUD de amortizações antecipadas (redução de prazo ou parcela), valor bancário opcional por operação, cálculo de economia estimada/real e recálculo transacional da grade.

<skills>
### Conformidade com Skills

Nenhuma skill específica se aplica a esta tarefa.
</skills>

<rules>
### Conformidade com Rules

- `folder-structure.mdc` — módulo NestJS dedicado
- `code-standards.mdc` — CQS nos use cases
- `node-js-ts.mdc` — strict TS, Decimal para valores
- `api-rest-http.mdc` — REST, status codes padronizados
- `tests.mdc` — Vitest; TERM vs INSTALLMENT e valor bancário
</rules>

<requirements>
- PRD RF 12–14, 28–31: cadastro amortização, tipos TERM/INSTALLMENT, valor bancário opcional, economia real/estimada, recálculo
- Endpoints `/financings/:financingId/prepayments` e `/prepayments/:id`
- Campos: `date`, `amount`, `type`, `bank_charged_value` (nullable), `estimated_savings`, `real_savings`, `eliminated_installments`
- CDC art. 52 §2º: redução proporcional de juros futuros
- Sem valor bancário → `SavingsSource = ESTIMATED`; com valor → calibração e `real_savings`
- Editar e excluir com recálculo imediato
</requirements>

## Subtarefas

- [ ] 7.1 Implementar listagem de amortizações por financiamento
- [ ] 7.2 Implementar criação com `applyPrepayment` + persistência transacional
- [ ] 7.3 Calcular `estimated_savings`, `real_savings` e `eliminated_installments`
- [ ] 7.4 Implementar PATCH e DELETE com recálculo da grade
- [ ] 7.5 Integrar `bank_charged_value` na calibração de economia
- [ ] 7.6 Validar ownership e regras de negócio (422 quando inválido)

## Detalhes de Implementação

Ver seções **PrepaymentsModule**, **Endpoints de API (Prepayments)**, **Regras de domínio (Amortização antecipada, Valor bancário)** e **Abordagem de Testes** em `techspec.md`.

## Critérios de Sucesso

- TERM_REDUCTION elimina parcelas finais e atualiza prazo estimado
- INSTALLMENT_REDUCTION reduz PMT (PRICE) ou amortização (SAC)
- Com `bank_charged_value`, economia real calculada e distinta da estimada quando aplicável
- Exclusão de amortização restaura projeção anterior de forma consistente

## Testes da Tarefa

- [ ] Testes de unidade — impacto TERM vs INSTALLMENT; prioridade valor bancário
- [ ] Testes de integração — create prepayment → assert dashboard inputs; delete → recálculo; isolamento por usuário
- [ ] Testes E2E — não aplicável nesta tarefa (coberto na tarefa 11.0)

## Arquivos relevantes

- `apps/backends/controle-financiamentos-api/src/**/prepayments/`
- `apps/backends/controle-financiamentos-api/src/**/financial-calculator/`
- `libs/shared-financing-types/`
