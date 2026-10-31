# Piada de Deploy — front-end

Aplicação Next.js + React + TypeScript, mantida em um repositório separado da API.

## Desenvolvimento local

Requer Bun e Node.js 20.9 ou superior. Rode `bun install`, copie `.env.example` para `.env` e configure `NEXT_PUBLIC_API_URL` para a URL da API (por padrão, `http://127.0.0.1:3001`). Inicie com `bun run dev`; o front abre em `http://127.0.0.1:3005`.

## Deploy (Vercel ou Render)

Na Vercel, o `vercel.json` declara o framework Next.js e os comandos de instalação/build. Configure `NEXT_PUBLIC_API_URL` como a URL pública da API, sem barra no final. Se essa variável não estiver cadastrada, o front usa a API publicada deste projeto (`https://jokesback-imrn.onrender.com`). A variável é incorporada no build porque o browser precisa saber a URL da API.

O serviço Docker do `render.yaml` publica a aplicação Next standalone. Configure também `NEXT_PUBLIC_API_URL` no serviço do front com a URL pública da API.

Build local: `docker build --build-arg NEXT_PUBLIC_API_URL=http://host.docker.internal:3001 -t piada-deploy-frontend .`. Execute com `docker run --rm -p 3000:3000 -e PORT=3000 piada-deploy-frontend`.

## Recursos

- Geração própria de piadas por categoria e tom; a geração não salva automaticamente.
- Cadastro e login para manter um mural pessoal no PostgreSQL do back-end.
- Edição do texto antes de salvar e operações de leitura, edição e exclusão no histórico.
- Copiar a piada para a área de transferência.
