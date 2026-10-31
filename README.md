# Piada de Deploy — Front-end

Aplicação React + TypeScript criada com Vite. Este diretório é um repositório independente do back-end.

## Desenvolvimento

Requer Bun. Execute `bun install`, copie `.env.example` para `.env`, ajuste `VITE_API_URL` para a URL da API e rode `bun run dev`. Por padrão, a API local usa `http://localhost:3000`.

## Build e Render

`bun run build` gera a pasta `dist`. O `Dockerfile` empacota o site com Nginx e o `render.yaml` configura um serviço Docker no Render. Publique primeiro a API, então defina `VITE_API_URL` no serviço com a URL pública dela (sem barra no final). O Render disponibiliza essa variável também durante o build da imagem.

Para executar a imagem localmente, passe a URL da API que o navegador consegue acessar: `docker build --build-arg VITE_API_URL=http://localhost:3000 -t piada-deploy-frontend .` e depois `docker run --rm -p 8080:8080 piada-deploy-frontend`.

## Stack

- Vite
- React
- TypeScript

Geração pública de piadas, escolha de categoria e tom, cadastro e login, histórico pessoal e cópia da piada.
