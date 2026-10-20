# ADR-001: Arquitetura da Fundação

**Status**: Aceito  
**Data**: 2026-10-20

## Contexto

A primeira entrega precisa sustentar acesso, configuração, auditoria e as próximas features em uma única loja, continuar operando sem internet e permanecer simples de instalar, testar e recuperar. A constituição fixa monólito modular, Java/Spring, React/TypeScript, MySQL/Flyway e servidor local.

## Decisão

- Um repositório com backend monolítico modular, frontend SPA e artefatos de implantação.
- API e frontend na mesma origem por Caddy; MySQL e API não são expostos à LAN.
- MySQL único; Flyway separado do startup normal; contas de banco por responsabilidade.
- Sessão server-side na memória da única instância, expirada em reinício; sem JWT, Redis ou serviço externo.
- OpenAPI contrato-first e comandos explícitos para bootstrap, migração, retenção e recuperação.
- Implantação de referência em Ubuntu Server 24.04 LTS com Compose e pacote offline.

## Alternativas consideradas

- **Microsserviços ou broker**: rejeitados por não haver escala ou independência que justifique operação distribuída.
- **JWT no navegador**: rejeitado por revogação, exposição e conflito com a preferência constitucional por sessão/cookie.
- **Sessão JDBC/Redis**: adiada; não existe requisito de sobreviver reinício nem múltiplas instâncias.
- **Migração automática no startup**: rejeitada para retirar DDL da credencial operacional e tornar atualização explícita.
- **Servidor Windows**: não integra a referência inicial; exige feature/ADR e ensaio operacional equivalente.
- **Frontend SSR**: rejeitado; a aplicação é interna, autenticada e não precisa SEO nem processo Node em produção.

## Consequências

- Reiniciar a API encerra sessões e exige novo login.
- Atualização requer backup, comando de migração e smoke antes de liberar prontidão.
- Terminais precisam confiar na CA local/corporativa e usar hostname estável.
- A aplicação permanece simples, mas a única instância é ponto de indisponibilidade; recuperação atende RTO, não alta disponibilidade.
- Dependências recentes ficam travadas por versão/digest e só avançam após build, integração e E2E.

## Condições de revisão

Revisar quando houver múltiplas lojas, mais de uma instância, exigência de sessão após reinício, servidor Windows obrigatório, banco acima de 50 GB, mais de 20 sessões simultâneas ou necessidade medida de RTO inferior a 2 horas.
