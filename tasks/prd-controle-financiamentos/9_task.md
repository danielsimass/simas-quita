# Tarefa 9.0: Frontend — fundação e autenticação

## Visão Geral

Configurar SPA Vite/React com Tailwind + shadcn/ui, React Query, rotas protegidas, fluxos de auth (cadastro/login/logout), layout responsivo (nav inferior mobile, sidebar tablet/desktop) e tema claro/escuro persistido.

<skills>
### Conformidade com Skills

Nenhuma skill específica se aplica a esta tarefa.
</skills>

<rules>
### Conformidade com Rules

- `folder-structure.mdc` — app em `apps/frontends/controle-financiamentos-web`
- `code-standards.mdc` — camelCase, componentes focados
- `react.mdc` — function components, hooks `use*`, Vitest + Testing Library
- `tests.mdc` — Vitest para hooks e componentes
</rules>

<requirements>
- PRD RF 1–5, 38, 42: auth, tema, layout responsivo
- Consumo da API com `credentials: 'include'` (cookies JWT)
- Rotas públicas (login/register) e protegidas (app shell)
- React Query configurado com invalidação base
- Tema claro/escuro com preferência persistida (localStorage ou similar)
- Layout fintech: clean, cards, tipografia elegante (PRD UX)
- Nav inferior no mobile; sidebar recolhível (tablet); sidebar completa (desktop)
- Acessibilidade: contraste WCAG AA, labels, toque mínimo 44×44 px
</requirements>

## Subtarefas

- [ ] 9.1 Configurar Tailwind, shadcn/ui e tokens de tema (claro/escuro)
- [ ] 9.2 Configurar React Router com rotas públicas/protegidas
- [ ] 9.3 Implementar páginas Register e Login consumindo `/auth/*`
- [ ] 9.4 Implementar hook `useAuth` e provider com refresh automático
- [ ] 9.5 Implementar app shell responsivo (mobile nav, sidebar tablet/desktop)
- [ ] 9.6 Implementar toggle de tema com persistência
- [ ] 9.7 Configurar React Query client e interceptors de erro 401

## Detalhes de Implementação

Ver seções **controle-financiamentos-web**, **Sequenciamento (item 7)**, **Pontos de Integração (CORS)** e **Experiência do Usuário (UI/UX, Acessibilidade)** em `techspec.md` e `prd.md`.

## Critérios de Sucesso

- Usuário consegue registrar, logar e acessar rota protegida
- Logout limpa sessão e redireciona para login
- Layout adapta entre mobile/tablet/desktop conforme PRD
- Tema persiste após reload
- Refresh token renova sessão sem interação do usuário

## Testes da Tarefa

- [ ] Testes de unidade — `useAuth`, formatadores monetários base, componentes de layout
- [ ] Testes de integração — fluxo auth com MSW/mock API (register → me → logout)
- [ ] Testes E2E — não aplicável nesta tarefa (coberto na tarefa 11.0)

## Arquivos relevantes

- `apps/frontends/controle-financiamentos-web/src/`
- `libs/shared-financing-types/`
