# Tarefa 3.0: Autenticação JWT (AuthModule)

## Visão Geral

Implementar autenticação completa com JWT access + refresh em cookies HttpOnly/Secure/SameSite, rotação de refresh token, revogação no banco, guards globais e endpoints `/api/v1/auth/*`.

<skills>
### Conformidade com Skills

Nenhuma skill específica se aplica a esta tarefa.
</skills>

<rules>
### Conformidade com Rules

- `folder-structure.mdc` — `AuthModule` no backend NestJS
- `code-standards.mdc` — CQS, funções ≤ 50 linhas
- `node-js-ts.mdc` — strict TS, bcrypt para hash de senha
- `api-rest-http.mdc` — paths REST, status codes padronizados (201 register, 200 login, 204 logout)
- `tests.mdc` — Vitest com mocks de repositório
</rules>

<requirements>
- PRD RF 1–5: cadastro, login, logout, acesso restrito ao proprietário
- E-mail único; senha mínima 8 caracteres
- Cookies HttpOnly para access e refresh; CORS com `credentials: true`
- Rotação de refresh token a cada `/auth/refresh`
- Revogação de refresh token no logout (`revoked_at`)
- Guard JWT global com decorator `@Public()` para rotas abertas
- Endpoints: register, login, logout, refresh, me
</requirements>

## Subtarefas

- [ ] 3.1 Implementar `AuthService` (register, login, refresh, logout) com bcrypt
- [ ] 3.2 Persistir e revogar refresh tokens (`refresh_tokens` table)
- [ ] 3.3 Configurar JWT strategy, guards e decorator `@Public()`
- [ ] 3.4 Implementar controllers com cookies HttpOnly/Secure/SameSite
- [ ] 3.5 Configurar CORS (`CORS_ORIGIN`) com credenciais habilitadas
- [ ] 3.6 Padronizar respostas de erro `{ statusCode, message, errors? }`

## Detalhes de Implementação

Ver seções **AuthModule**, **Endpoints de API (Auth)**, **Pontos de Integração (CORS)** e **Interfaces Principais (`AuthService`)** em `techspec.md`.

## Critérios de Sucesso

- Fluxo register → login → `/auth/me` → refresh → logout funciona end-to-end
- Refresh token anterior invalidado após rotação
- Rotas protegidas retornam 401 sem cookie válido
- Senha nunca retornada ou logada em texto claro

## Testes da Tarefa

- [ ] Testes de unidade — `AuthService` (hash, validação senha, geração de tokens) com `vi.fn` mocks
- [ ] Testes de integração — fluxo HTTP completo register/login/refresh/logout; e-mail duplicado → 400/422
- [ ] Testes E2E — não aplicável nesta tarefa (coberto na tarefa 11.0)

## Arquivos relevantes

- `apps/backends/controle-financiamentos-api/src/**/auth/`
- `apps/backends/controle-financiamentos-api/prisma/schema.prisma` (users, refresh_tokens)
