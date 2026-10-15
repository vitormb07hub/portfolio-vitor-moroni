# Segurança

Este projeto entrega páginas e arquivos de um portfólio. Não possui login, banco de dados ou API de negócio.

## Controles

- Somente os arquivos públicos incluídos no build são servidos.
- Métodos permitidos: GET e HEAD.
- HTTPS obrigatório em produção e HSTS por um ano.
- CSP restringe scripts, estilos e imagens ao próprio site; conexões programáticas externas são bloqueadas.
- Enquadramento por outros sites, uso de câmera, microfone e localização são bloqueados.
- Links externos usam `noopener` e `noreferrer`.
- O cookie de preferência não armazena identificação ou autenticação. Em HTTPS, usa Secure e SameSite=Strict.
- Não há ferramentas de anúncios ou análise de visitantes.

## Verificação

`npm run build` verifica os arquivos e testa a entrega: cabeçalhos, métodos, HTTPS, rotas internas bloqueadas e arquivos públicos.

A configuração dos cabeçalhos fica em `security/headers.json`; a entrega em produção é definida em `worker/index.js`.

## Relatar um problema

Envie os detalhes para `vitormoronib@gmail.com`. Inclua o endereço afetado e um exemplo mínimo de reprodução. Evite publicar dados pessoais ou detalhes de exploração em uma issue pública.
