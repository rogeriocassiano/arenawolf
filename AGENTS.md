<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Verification and deployment

- Application unit tests: `npx jest --runInBand --roots src` (avoids scanning Electron build artifacts).
- Desktop agent verification in `packages/agent`: `npm run typecheck`, `npm test -- --runInBand`, and `npm run build:win`.
- This terminal may set `ELECTRON_RUN_AS_NODE=1`. Remove it when launching Electron for diagnostics. Use `--diagnostic` to avoid kiosk restrictions, real sessions, startup registration, or shutdown commands.
- Production site: `https://arena-wolftech-app.netlify.app`, Netlify site ID `7506d56e-2f54-4ec4-9649-bfcb2d7564fc`, team `arenwolf`, repository branch `main`.
- Local Netlify bundling on Windows can fail with a CJS/Turbopack Edge-function path error. Hosted Linux builds avoid this issue; do not disable authentication middleware to bypass it.
- A `free` machine row indicates availability, not agent connectivity. Do not test remote power commands or start real sessions without explicit confirmation.
