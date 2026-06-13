## Documento de Requisitos de Produto (PRD)

## Visão Geral

Aplicação web para controle de financiamentos veiculares no Brasil. Resolve a dificuldade de acompanhar parcelas pagas e futuras, amortizações, economia de juros e previsão de quitação sem planilhas manuais ou extratos fragmentados.

Público-alvo: pessoas físicas com um ou mais financiamentos de veículo ativos. Diferencial: combinar cálculos PRICE/SAC com valores informados pelo usuário conforme simulações bancárias, aproximando os números da realidade contratual brasileira.

## Objetivos

- Acompanhar status de cada financiamento em menos de 2 minutos após login.
- Priorizar precisão dos cálculos como métrica principal — economia real quando houver dado bancário; estimativa confiável quando não houver.
- Reduzir incerteza sobre quitação antecipada via prazo restante, economia acumulada e insights acionáveis.
- Experiência simples, rápida e intuitiva, com múltiplos financiamentos por conta.

**Métricas de sucesso:** desvio ≤ 2% na economia quando valor bancário informado; wizard do 1º financiamento ≤ 3 min; conclusão onboarding ≥ 70%; retorno semanal ≥ 40% após 30 dias.

## Histórias de Usuário

**Persona primária — Carlos, 34 anos:** financiou carro via PRICE, faz amortizações esporádicas e quer saber economia de juros e meses antecipados.

**Persona secundária — Ana, 28 anos:** possui financiamento de moto e planeja trocar de veículo; precisa alternar entre financiamentos e comparar progresso.

- Como novo usuário, quero cadastrar-me com nome, e-mail e senha para acessar meus financiamentos com segurança.
- Como usuário recorrente, quero login com e-mail e senha para retomar o acompanhamento.
- Como usuário no primeiro acesso, quero wizard guiado para cadastrar financiamento e ver dashboard imediatamente.
- Como usuário com múltiplos veículos, quero gerenciar vários financiamentos e alternar entre eles.
- Como usuário, quero visualizar parcelas pagas, pendentes e futuras.
- Como usuário, quero registrar amortizações (redução de prazo ou parcela) e ver impacto na economia e prazo.
- Como usuário, quero informar valor de antecipação do banco (ex.: "36ª parcela custa R$ 979,96") para economia real.
- Como usuário, quero insights automáticos no dashboard (percentual quitado, meses antecipados, economia acumulada).
- Como usuário mobile, quero navegação responsiva entre dashboard, parcelas e amortizações.

**Casos extremos:** sem valor bancário → estimativas com indicação visual; valor desatualizado → atualização a qualquer momento; parcela paga fora de ordem → recálculo consistente; exclusões → confirmação e recálculo imediato.

## Funcionalidades Principais

### 1. Autenticação e conta

Cadastro, login e sessão segura por e-mail e senha. Dados financeiros sensíveis exigem isolamento por usuário.

**Requisitos funcionais**

1. Cadastro com nome, e-mail e senha.
2. Validação de e-mail único e senha mínima de 8 caracteres.
3. Login com e-mail e senha.
4. Acesso restrito ao proprietário autenticado.
5. Logout encerrando sessão ativa.

### 2. Gestão de financiamentos

Criação e alternância entre múltiplos financiamentos veiculares por conta.

**Requisitos funcionais**

6. Wizard com: nome, instituição, valor financiado, parcelas, valor da parcela, data da 1ª parcela, sistema (PRICE/SAC) e observações.
7. Múltiplos financiamentos ativos por usuário.
8. Seleção de financiamento em foco no dashboard e demais telas.
9. Geração automática da grade de parcelas no cadastro.
10. Dados de exemplo opcionais (PRICE: R$ 45.000, 36× R$ 1.791,53) para demonstração/onboarding.

### 3. Antecipação bancária (diferencial de precisão)

Captura valores de simulações bancárias para calibrar economia real.

**Requisitos funcionais**

11. Configuração base no financiamento: valor de antecipação informado pelo banco.
12. Campo opcional por amortização com valor cobrado pelo banco na operação.
13. Valor bancário informado tem prioridade no cálculo de economia real.
14. Sem valor bancário → economia estimada (PRICE/SAC) com indicação visual de estimativa.
15. Atualização de valores de antecipação a qualquer momento.

### 4. Dashboard principal

Consolida indicadores, gráficos e insights do financiamento selecionado.

**Requisitos funcionais**

16. Cards: valor financiado, total pago, total amortizado, parcelas pagas/restantes, economia, prazo original e estimado.
17. Gráfico de evolução da dívida (saldo devedor).
18. Gráfico de total pago por mês.
19. Gráfico de amortizações por mês.
20. Insights automáticos (economia acumulada, meses antecipados, percentual quitado).
21. Indicadores visuais de progresso do financiamento.
22. Skeleton loading e empty states orientativos.

### 5. Gestão de parcelas

Lista e gerencia ciclo de vida de cada parcela — ação mais frequente do usuário.

**Requisitos funcionais**

23. Tabela: número, valor, vencimento, status, data de pagamento.
24. Filtros: todas, pagas, pendentes.
25. Marcar como paga com data de pagamento.
26. Editar e excluir parcela (exclusão com confirmação).
27. Recálculo de saldo, métricas e insights ao alterar parcelas.

### 6. Gestão de amortizações

Registra pagamentos antecipados e calcula impacto (CDC art. 52 — redução proporcional de juros).

**Requisitos funcionais**

28. Cadastro: data, valor, tipo (redução de prazo ou parcela).
29. Tabela: data, valor, economia real/estimada, parcelas eliminadas.
30. Recálculo de saldo, prazo, economia e previsão de quitação após cada amortização.
31. Editar e excluir com confirmação.

### 7. Motor de cálculos financeiros

Cálculos PRICE e SAC isolados e consistentes — precisão é requisito crítico.

**Requisitos funcionais**

32. Grade PRICE: parcelas fixas, juros decrescentes, amortização crescente.
33. Grade SAC: amortização constante, parcelas decrescentes.
34. Saldo devedor remanescente considerando pagamentos e amortizações.
35. Economia de juros por amortização (real ou estimada).
36. Nova previsão de quitação conforme tipo de amortização.
37. Cálculos determinísticos: mesmos inputs → mesmos outputs.

### 8. Experiência transversal

**Requisitos funcionais**

38. Tema claro/escuro com preferência persistida.
39. Toast notifications para ações, erros e confirmações.
40. Confirmação antes de exclusões.
41. PWA básico (manifesto, ícones, shell offline).
42. Responsivo mobile-first: nav inferior (mobile), sidebar recolhível (tablet), sidebar completa (desktop).

## Experiência do Usuário

**Fluxos:** (1) Cadastro → Login → Wizard → Dashboard; (2) Login → Selecionar financiamento → Registrar pagamento/amortização → Ver impacto; (3) Simulação no banco → Registrar amortização com valor real → Economia atualizada.

**UI/UX:** visual fintech (Nubank, Inter, C6, Stripe): clean, espaço em branco, cards modernos, bordas suaves, sombras discretas, tipografia elegante, animações sutis, feedback imediato em ações.

**Acessibilidade:** contraste WCAG AA (temas claro/escuro), navegação por teclado, labels em formulários, alt text em gráficos, toque mínimo 44×44 px no mobile.

## Restrições Técnicas de Alto Nível

- Web app com deploy serverless (ex.: Vercel).
- Persistência relacional: SQLite (dev), PostgreSQL (prod).
- Autenticação e-mail/senha com sessão segura.
- Dados isolados por usuário; conformidade LGPD.
- Dashboard ≤ 2 s em 4G para métricas principais.
- Cálculos no servidor para consistência e integridade.
- Amortizações antecipadas alinhadas ao CDC art. 52 e normas CMN, dentro das limitações de estimativa sem dado bancário.

## Fora de Escopo

**MVP (v1):** exportação CSV; integração bancária/Open Finance; importação de extratos; contas compartilhadas; login social; push/lembretes; simulador de novos financiamentos; leasing/consórcio/refinanciamento; IOF/seguro/CET detalhado; app nativo; multi-idioma; backoffice.

**Pós-MVP:** exportação CSV/PDF, lembretes por e-mail, comparativo entre financiamentos, Open Finance, histórico de simulações bancárias.

**Limitações:** sem contrato bancário completo, cálculos são estimativos até informação de antecipação; taxa efetiva inferida dos parâmetros informados; variações contratuais entre instituições não modeladas no MVP.
