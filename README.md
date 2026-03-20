# Maverick

React + Vite frontend with Supabase-backed intel pipelines and AI-assisted analysis.

## Development

```bash
npm install
npm run dev
```

App runs at [http://localhost:8080](http://localhost:8080) by default.

## Scripts

- `npm run build` — production build
- `npm run lint` — ESLint
- `npm test` — Vitest

Configure Supabase URL and keys via your environment (see `.env` or hosting provider secrets).

Chat streaming calls the `maverick-ai` Edge Function. Deploy it with the Supabase CLI (`supabase functions deploy maverick-ai`). Remove older `vertex-ai` or `nexus-ai` deployments when you are done migrating.
