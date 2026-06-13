# Tarefa 2.0: Schema Prisma e camada de persistência

## Visão Geral

Definir o schema Prisma com todas as entidades (`users`, `refresh_tokens`, `financings`, `installments`, `prepayments`), executar migrations, implementar `PrismaModule` e repositórios tipados com isolamento por `userId`.

<skills>
### Conformidade com Skills

Nenhuma skill específica se aplica a esta tarefa.
</skills>

<rules>
### Conformidade com Rules

- `folder-structure.mdc` — persistência no backend NestJS
- `code-standards.mdc` — CQS nos repositórios, funções focadas
- `node-js-ts.mdc` — strict TS, sem `any`
- `tests.mdc` — Vitest para testes de repositório
</rules>

<requirements>
- Schema Prisma conforme modelos da tech spec (UUIDs, Decimal para valores monetários, enums)
- Suporte SQLite (dev) e PostgreSQL (prod) via `DATABASE_URL`
- Migrations versionadas e reproduzíveis
- `PrismaModule` global no NestJS
- Repositórios com métodos `findByUser`, `findByIdForUser`, `save` (padrão da tech spec)
- Isolamento: queries sempre filtradas por `userId` do usuário autenticado
</requirements>

## Subtarefas

- [ ] 2.1 Definir schema Prisma com tabelas, relações e enums
- [ ] 2.2 Configurar providers SQLite (dev) e PostgreSQL (prod)
- [ ] 2.3 Gerar e validar migration inicial
- [ ] 2.4 Implementar `PrismaModule` e service de conexão
- [ ] 2.5 Implementar repositórios base (`User`, `Financing`) com isolamento por `userId`
- [ ] 2.6 Exportar tipos Prisma derivados para uso nos módulos de domínio

## Detalhes de Implementação

Ver seções **Modelos de Dados**, **PrismaModule** e **Interfaces Principais (`FinancingRepository`)** em `techspec.md`.

## Critérios de Sucesso

- Migration aplica sem erro em SQLite e PostgreSQL
- Repositórios retornam apenas registros do `userId` informado
- Valores monetários persistidos como `Decimal`
- Testes de integração cobrem CRUD básico e constraint de e-mail único

## Testes da Tarefa

- [ ] Testes de unidade — mappers/conversores Decimal ↔ string JSON
- [ ] Testes de integração — CRUD Prisma em SQLite in-memory; tentativa de acesso cross-user retorna vazio/404
- [ ] Testes E2E — não aplicável nesta tarefa

## Arquivos relevantes

- `apps/backends/controle-financiamentos-api/prisma/schema.prisma`
- `apps/backends/controle-financiamentos-api/src/**/prisma/`
- `libs/shared-financing-types/`
