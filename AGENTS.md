# KL Website development instructions

- Stack: Laravel, React, MySQL; Docker Engine + Compose in Ubuntu/WSL 2. Production deployment is to the user's own server, not Sites hosting.
- Public languages: English (`en`), French (`fr`), Kreol Morisien (`km`). Kreol must receive human review before publication. Keep the draft UI notice/noindex until reviewed.
- Follow the supplied navy/red front-end references and use original supplied portraits. Do not invent verified political claims, office details or content.
- Never commit tokens, `.env`, private keys, constituent submissions, databases, generated assets or dependencies. Keep Git remote URLs free of credentials.
- No public registration/default admin. Preserve CSRF, permissions, TOTP, scheduling and draft filtering.
- Use `npm run build`, `php artisan test`, dependency audits and Docker integration checks appropriate to changes. Record verification limits honestly.
- The user authorised development and GitHub pushes. Production is https://kl-website.duckdns.org on the shared server 62.83.10.197, behind the server's edge Caddy (/opt/edge). Every push to `main` that passes CI deploys automatically via `deploy.yml`; keep `main` releasable.
- Production runs from `compose.production.yaml` in /srv/apps/kl-website with server-only `.env.production` and `.secrets/`. The shared /usr/local/sbin/github-deploy script loads the image, backs up, migrates, health-checks and rolls back the image on failure. Do not add commands or secrets to the deploy SSH path.
- Bootstrap administrator is admin@nd.com, created by migration from ADMIN_INITIAL_PASSWORD only if absent. Never hardcode a password, overwrite existing credentials or bypass initial TOTP enrolment.
- Page and content snapshots must remain restorable as unpublished drafts. PDFs must remain private unless attached to a currently published locale.
- Kreol page approval and common-interface approval are separate gates. Legal pages also require owner approval. Do not mark human/legal review complete automatically.
