# Barbearia do Lirão

Site estático (uma página) para uma barbearia clássica/vintage premium. HTML puro + CSS + JS, sem build step — abre direto no navegador ou em qualquer hospedagem de arquivos estáticos (Netlify, Vercel, GitHub Pages etc).

## Estrutura do projeto

```
index.html                  → página única com as 7 dobras do site
assets/
  css/style.css              → todo o CSS do site
  js/main.js                 → toda a lógica de interação (reveals, menu, scroll-scrubbing do vídeo)
  img/                       → fotografias usadas no site
  video/hero-scrub.mp4       → vídeo da Hero (controlado pelo scroll)
reference/                   → material de apoio, NÃO usado pelo site publicado
  templates/                 → design system de referência (design-novo.html e afins)
  raw_files/                 → vídeos e fotos originais/brutos
```

## Rodando localmente

Como é um site 100% estático, basta abrir `index.html` no navegador. Para o efeito de scroll-scrubbing do vídeo funcionar com pré-carregamento (recomendado), sirva a pasta com um servidor local, por exemplo:

```
npx serve .
```

## Dependências externas (via CDN)

- [Google Fonts](https://fonts.google.com/) — Oswald, Cormorant Garamond, Inter
- [GSAP + ScrollTrigger](https://gsap.com/) — animação de scroll da Hero

## Dados de exemplo — trocar antes de publicar

Este projeto foi construído com dados fictícios que **precisam ser substituídos** antes de qualquer publicação real:

- **Preços, endereço, telefone, Instagram e horário de funcionamento** (dobra "Agendar" e footer) são placeholders.
- **Fotos de serviços e galeria** (`assets/img/service-*.jpg`) contêm marcas d'água de banco de imagens (Dreamstime, Vecteezy, Alamy) — precisam de versões licenciadas.
- **Fotos dos barbeiros** (`assets/img/barber-*.jpg/webp`) são fotos de teste de pessoas públicas reais (usadas apenas para preencher o layout) — precisam ser substituídas por fotos reais da equipe antes de qualquer publicação.

## Seções do site

1. Hero — vídeo com scroll-scrubbing
2. Nosso Ofício — proposta de valor + foto do ambiente
3. Nossos Serviços — grid de serviços com preço
4. Galeria — mosaico editorial de fotos
5. Barbeiros — equipe
6. Avaliações — prova social
7. Agendar — CTA de contato e localização
