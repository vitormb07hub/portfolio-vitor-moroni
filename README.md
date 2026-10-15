# Vitor Moroni — Portfólio

Portfólio pessoal em HTML, CSS e JavaScript, sem dependências de execução. Visual equilibrado entre superfícies claras e azul-marinho, projetos com estudos de caso, galeria interativa e currículo para download.

[Abrir o site](https://vitormoronibarrozo.rosyloach18.chatgpt.site/) · [Código no GitHub](https://github.com/vitormb07hub/portfolio-vitor-moroni)

## Executar

Com Node.js 22 ou superior, dentro da pasta do projeto:

```sh
npm run dev
```

Abra http://127.0.0.1:4173. Encerre com Ctrl+C. Não é necessário instalar pacotes. No Windows, `Abrir portfolio.cmd` também abre o HTML diretamente; para validar todas as interações, prefira o servidor local.

```sh
npm run check
npm run build
npm run preview
```

O build verifica arquivos, sintaxe, âncoras e a camada de entrega. Gera `build/` para hospedagem estática e `dist/` para publicação em Sites com Worker. O preview serve `build/` localmente.

## Organização

- `index.html`: conteúdo e estrutura semântica.
- `styles/main.css`: identidade visual, componentes e responsividade.
- `scripts/main.js` e `scripts/privacy.js`: navegação, galeria, diálogos e preferência de privacidade.
- `scripts/check.mjs` e `scripts/check-worker.mjs`: verificações do conteúdo e da entrega.
- `scripts/build.mjs`: geração dos arquivos públicos e do Worker.
- `scripts/serve.mjs`: servidor local limitado aos arquivos públicos e à interface de loopback.
- `worker/index.js` e `security/headers.json`: rotas e cabeçalhos de segurança.
- `assets/`: retrato, telas reais, imagem de compartilhamento e documentos públicos.
- `design/social-card.svg`: fonte editável da imagem de compartilhamento.
- `.github/workflows/quality.yml`: validação automática no GitHub com Node.js 22 e 24.

## Atualizar conteúdo

Edite os textos e links em `index.html` e as cores nos tokens de `styles/main.css`. Atualize os textos alternativos ao trocar imagens. Os botões da galeria usam `data-image`, `data-alt` e `data-description`.

Os detalhes dos projetos usam HTML nativo e continuam disponíveis sem JavaScript. A galeria apresenta quatro etapas da plataforma de cursos, com descrição de cada tela e ampliação em diálogo. Há foco visível, atalho para o conteúdo, retorno do foco ao fechar diálogos, estados acessíveis e respeito ao movimento reduzido.

As seis imagens originais foram convertidas para WebP, reduzindo o tamanho combinado em aproximadamente 76%. A página inclui imagem própria de compartilhamento, metadados sociais e carregamento adiado das imagens secundárias. O Worker implementa revalidação por ETag, verificada nos testes; a hospedagem atual remove esse cabeçalho, então respostas 304 não estão disponíveis no endereço público.

## Segurança e privacidade

Não há login, banco de dados, formulários de coleta, analytics ou scripts de terceiros. O único cookie registra que o aviso de privacidade foi lido, por até 180 dias, com `SameSite=Strict` e `Secure` em HTTPS. A preferência pode ser removida pelo visitante.

A entrega em Worker aplica CSP restritiva, HSTS, proteção contra enquadramento, `nosniff`, política de referenciador e restrições de recursos do navegador. Aceita apenas GET e HEAD, redireciona HTTP para HTTPS e entrega somente arquivos explicitamente incluídos no build. Consulte `SECURITY.md` para relatar problemas.

O arquivo `_headers` de `build/` facilita a migração para provedores compatíveis. Em outra hospedagem, confirme os cabeçalhos nas respostas reais; copiar os arquivos por si só não ativa essas proteções.

## Publicação

O site atual é publicado pelo plugin Sites com a entrega de `dist/`. `.openai/hosting.json` identifica esse projeto; ao reutilizar o código em outro site, configure uma identidade de hospedagem própria. O GitHub Actions verifica cada envio e pull request; ele não publica o site automaticamente.

O currículo e a apresentação em `assets/documents/` são públicos. O repositório não inclui arquivos temporários, credenciais, históricos anteriores de conteúdo ou documentos internos de origem.

## Validação

`npm run build` verifica também HTTPS, métodos permitidos, arquivos desconhecidos, cabeçalhos, imagens, ETag e respostas sem corpo. A revisão manual cobriu teclado, foco dos diálogos, navegação móvel e árvore de acessibilidade. Não substitui uma avaliação com leitores de tela reais.
