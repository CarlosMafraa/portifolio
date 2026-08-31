# Portfólio — Carlos Mafra

Site estático (HTML + CSS + um pouco de JS), sem build, sem framework. Pensado para
publicar direto no **GitHub Pages**.

## Estrutura

```
index.html            página principal
404.html              página de erro (GitHub Pages usa automaticamente)
.nojekyll             pula o build Jekyll do GitHub Pages (deploy mais rápido, sem surpresas)
assets/
  css/style.css       todo o estilo, com tema claro/escuro por variáveis
  js/main.js          tema, menu mobile
  img/favicon.svg     ícone da aba
  img/og.svg          imagem de compartilhamento (link preview)
  cv/                 coloque aqui o carlos-fabiano-mafra-cv.pdf
design/               export original do Claude Design (ignorado no git)
```

## Publicar no GitHub Pages

1. `git add . && git commit -m "site"` e `git push` para a branch `master`.
2. No GitHub: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **master** / pasta **/ (root)** → **Save**
3. Em ~1 min o site sai em `https://<seu-usuario>.github.io/portifolio/`.

### Caminhos são relativos de propósito

Como o site fica em `.../portifolio/` (subpasta), todos os `href`/`src` usam caminho
relativo (`assets/...`, `./`). Não troque para caminho absoluto (`/assets/...`) — quebra
no Pages. Se um dia usar domínio próprio ou renomear o repo para
`<usuario>.github.io`, aí sim o site vai para a raiz e as URLs absolutas em
`<meta canonical>` / Open Graph precisam ser atualizadas.

## Antes de divulgar — pendências de conteúdo

- [ ] **CV**: adicionar `assets/cv/carlos-fabiano-mafra-cv.pdf` (o botão "Baixar CV" já aponta pra lá).
- [ ] **Imagem de link (og)**: `og.svg` funciona no Google, mas WhatsApp e LinkedIn
      preferem **PNG 1200×630**. Exporte `assets/img/og.svg` como `og.png` e troque as
      3 referências no `<head>` do `index.html`.
- [ ] **URL canônica**: confirmar `carlosmafraa.github.io/portifolio/` no `<head>` do
      `index.html` (`<link rel="canonical">` + tags Open Graph), ou trocar pelo domínio final.
- [ ] **Disponibilidade / inglês**: ajustar os chips do hero ("Aberto a propostas · CLT / PJ")
      e considerar um chip com seu nível de inglês.
- [ ] **Impacto quantificado**: nas seções Carreira e Projetos, trocar frases genéricas
      ("monitoramento contínuo", "decisões estratégicas") por números reais — cobertura
      de testes %, RPS/latência no K6, tempo de regressão, nº de fluxos, usuários.
- [ ] **GitHub**: a bio do perfil ainda diz "desenvolvedor web na Polícia Militar do
      Amazonas" — alinhar com o cargo atual. Caprichar nos READMEs de `EasyWarehouse`,
      `DashBoard` e `API_RESTFUL` (problema, stack, como rodar, o que faria diferente).
- [ ] **Projetos**: se possível, publicar 1–2 projetos pessoais com deploy + repo público.

## Rodar localmente

Qualquer servidor estático, por exemplo:

```
npx serve .
# ou
python -m http.server
```

Abrir `http://localhost:3000` (ou `:8000`).
