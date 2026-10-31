# Piada de Deploy — Front-end

Aplicação React + TypeScript criada com Vite. Este diretório é um repositório independente do back-end.

## Desenvolvimento

Requer Bun. Execute `bun install`, copie `.env.example` para `.env`, ajuste `VITE_API_URL` para a URL da API e rode `bun run dev`. Por padrão, a API local usa `http://localhost:3000`.

## Build e Render

`bun run build` gera a pasta `dist`. O arquivo `render.yaml` configura a publicação como Static Site. No Render, defina `VITE_API_URL` com a URL pública do serviço de API.

## Stack

- Vite
- React
- TypeScript

Geração pública de piadas, escolha de categoria e tom, cadastro e login, histórico pessoal e cópia da piada.
