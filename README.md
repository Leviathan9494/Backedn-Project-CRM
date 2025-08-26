Deno Product Management API

- Start: deno run --allow-net --allow-read --allow-write --allow-env mod.ts
- Swagger UI: http://localhost:8000/swagger

This project uses lowdb (via esm.sh) to persist data to `data.json` in the project root.

Tests:
- deno test --allow-net --allow-read --allow-write --allow-env
