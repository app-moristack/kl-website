# KL Website

Laravel 12 + React 19 editorial website for Khushal Lobine. Docker Engine and Compose run directly inside Ubuntu on WSL 2; Docker Desktop is not required.

## Current implementation

- Responsive navy/red public website based on the supplied references, with original supplied portraits.
- Home, About, Parliament, Constituency No. 15, Perspectives, Media, Contact, article detail, interim privacy and terms pages.
- English and French interface; Kreol uses `mfe` in HTML language/SEO metadata (with `/km` as its internal URL key). The Kreol interface is explicitly marked as a draft and excluded from indexing pending human review.
- Content studio: articles, parliamentary records, media links, community updates and page records; categories, source/video URL, event date, feature priority and scheduled publication.
- Independent EN/FR/KM title, summary, plain text body, SEO description and editorial status. No automatic translation or external AI API is used.
- Unreviewed Kreol records cannot be published through the API. Missing translations do not silently fall back to English.
- Admin/editor permissions, private session authentication, encrypted authenticator secrets, TOTP replay protection, login throttling, audit events and safe photo upload.
- Enquiries/concerns/appointment requests with staff status tracking, validation, consent checkbox and spam controls. These are requests, not confirmed calendar bookings.
- Dashboard: page views, approximate daily unique visitors, daily chart, popular pages and recent editorial activity; device totals are available through the dashboard API. Signed-in staff, obvious bots and Do Not Track requests are excluded.
- Per-page metadata, canonical and language links, social previews, structured data, sitemap, robots exclusions and escaped server-rendered article text in a no-JavaScript fallback.
- Docker Compose with PHP-FPM, Caddy and MySQL. MySQL has no published host port. Caddy provides automatic HTTPS once production DNS and ports are configured.
- CI checks and a disabled-until-configured production SSH workflow.

## First run on Ubuntu / WSL 2

Prerequisites: Docker Engine, Docker Compose plugin, Git, Bash and OpenSSL. Keep the checkout under `/home/irfaan/local/kl-website`, not `/mnt/c`, for Linux filesystem performance.

```bash
git clone https://github.com/app-moristack/kl-website.git /home/irfaan/local/kl-website
cd /home/irfaan/local/kl-website
bash scripts/setup.sh
```

If the folder already contains this repository, use `git pull --ff-only` instead of cloning over it. GitHub access is required for this private repository. Authenticate through your credential manager, GitHub CLI or SSH; never place a token in a remote URL or tracked file.

Setup generates missing application/database keys in a private `.env`, builds the images, starts MySQL, runs migrations and seeds the editable layouts. If `ADMIN_INITIAL_PASSWORD` is set, the migration creates `admin@nd.com`; otherwise no bootstrap account is created. No invented news or parliamentary claims are seeded.

- Website: http://localhost:8080/en
- Admin: http://localhost:8080/admin

Create an administrator:

```bash
docker compose exec app php artisan admin:create your-email@example.com
```

Enter a password of at least 12 characters and your display name. Add the generated secret to an authenticator app. Save that secret in your password manager; enter the current six-digit code at each login. Do not share the terminal output. To create an editor, append `--editor`.

Production requires an enrolled authenticator. There is no public registration or hardcoded password. Staff invitations, permissions and access recovery are available in the dashboard. The environment bootstrap administrator enrols an authenticator on first sign-in.

## Development

The container images contain the source and compiled React assets. After changes, rebuild:

```bash
docker compose up -d --build app web scheduler
```

Named volumes retain MySQL data and uploads. **Do not run `docker compose down -v` unless you intend to erase that data.**

For faster frontend development you may install Composer/PHP 8.4 and Node 22 in WSL, run `composer install` and `npm ci`, then use `npm run dev` (Laravel on port 3000, built assets) and `npm run hot` (Vite in another terminal). Set database connectivity for host PHP appropriately, or use a separate local SQLite database. The normal Docker setup uses MySQL and needs none of those runtimes installed on the host.

```bash
npm run build
php artisan test
composer audit
npm audit --omit=dev
```

The automated feature suite uses an isolated in-memory SQLite database. MySQL integration and full container startup must also be verified on the target Docker host before release.

## Publishing content

1. Sign into `/admin`, open Publications and create a record.
2. Set a unique slug, type, category, photo and optional official source.
3. Enter each available language. Leave absent translations blank.
4. Select the translation status. For Kreol, a human reviewer must check the translation and explicitly confirm review before setting Published.
5. Set a publication date/time (Mauritius time). Future dates schedule visibility.
6. Feature and order records as needed. Featured records sort before others.

Changing translation text removes its review confirmation and returns a published translation to draft. Body text is intentionally plain text with preserved line breaks. Video players, PDF attachments and localized galleries are supported; raw HTML is not accepted.

## Security and PHP updates

The container currently selects `php:8.4.27-fpm-bookworm`, with a build-time minimum-version check for the October 2026 PHP fixes. `scripts/check-runtime.php` checks the security floors for supported 8.2–8.5 branches. Recheck current PHP advisories at each release and update the image and policy together; a minimum baseline is not a substitute for future patching.

References: https://www.php.net/archive/2026.php and https://www.php.net/releases/8_4_27.php

- Credentials, `.env`, dependencies, generated assets and local databases are ignored by Git.
- CSRF protection applies to state-changing same-origin web/API routes.
- Production adds CSP, HSTS, secure encrypted session cookies, frame restrictions and MIME-sniffing protection.
- Uploaded SVGs and executables are disallowed. Photos are decoded/re-encoded and limited to JPEG/PNG/WebP at 5 MiB; PDFs use private storage and are limited to 15 MiB. Document uploads are for trusted staff; malware-free certification is not implied.
- Daily visitor identifiers are HMACs of the session and date; raw IP addresses are not stored in analytics records. Laravel database sessions may separately retain IP/user-agent data for session security; include that in the final privacy/retention review. The dashboard total is a sum of daily unique visitors, not a monthly unique-person count. Session cookies are used and analytics are retained for 90 days by the scheduler.
- Enquiries are restricted to staff but not yet encrypted at the application field level. Configure encrypted disks/backups and a retention policy before launch.
- Staff should never put private constituent details in public content.

## Production preparation (not deployed)

Before exposing the app:

1. Provide the server/domain details; review the host firewall and existing websites. Install Docker Engine and Compose >= 2.24.4.
2. Configure an unprivileged SSH deployment account and repository read access. Place pinned SSH host keys in GitHub secrets; do not disable host-key verification.
3. Use a production `.env`: `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://your-domain`, `APP_DOMAIN=your-domain`, `SESSION_SECURE_COOKIE=true`, unique DB secrets and a stable `APP_KEY`.
4. Point DNS at the server and allow inbound 80/443 for Caddy certificate issuance/renewal. Keep MySQL/PHP-FPM private. Account for Docker's firewall behavior when reviewing the host rules.
5. Run `docker compose -f compose.yaml -f compose.production.yaml up -d --build`, migrations and administrator setup. Check `https://your-domain/up`, login, uploads, enquiries and certificate renewal.
6. Configure off-server encrypted backups; test a restore of both MySQL and uploads. Retain the application key securely for encrypted data recovery.
7. Configure real outgoing email when ready. Queued enquiry alerts, staff invitations and secure access recovery are implemented. Mail currently uses the log transport; it does not deliver external emails without provider settings.
8. Finalise the legal text, privacy/retention policy, reviewed copy, official logo and verified contact details. The current brand wordmark is typographic, not a supplied vector logo.

### GitHub workflows

`ci.yml` builds React, runs PHP tests, audits dependencies and attempts the PHP application Docker build. It runs on pushes to `main`/`dev` and pull requests. Runtime minimums intentionally fail if the available PHP build is below the security floor.

`deploy.yml` is inactive unless repository variable `PRODUCTION_ENABLED=true` is set. It targets the protected GitHub environment `production`, deploys only after successful main-branch CI (or an explicit manual run), and expects these secrets:

- `PROD_HOST`, `PROD_USER`, optional `PROD_PORT`
- `PROD_SSH_KEY` (dedicated deployment key)
- `PROD_KNOWN_HOSTS` (host keys verified out of band)

The server-side entry point `/opt/kl-website-ops/deploy <verified-commit-sha>` must still be implemented with the real server paths, backup destination, migration strategy, health checks and rollback policy. Do not enable production automation until that preparation is complete. No SSH credentials or production service have been configured in this repository.

### Backups

```bash
BACKUP_DIR=/path/outside/repository/backups bash scripts/backup.sh
```

This creates a consistent SQL dump and uploaded-files archive; it does not yet encrypt them, transfer them off-server or schedule a job. Restore the SQL into an isolated database first and restore uploads into a fresh volume, then test the app with the correct key. Snapshotting and external backup automation are deployment work.

## Owner reviews and deferred work

- Human approval of Kreol translations and final voice/branding/assets.
- Owner/legal approval of privacy and terms after confirming operator details and retention/provider decisions.
- Actual source material for news, parliamentary contributions and community/event galleries.
- External mail-provider delivery configuration, when provided.
- Item 6 is excluded: no production server, domain, HTTPS, deployment, backup or rollback configuration has been performed in this phase.

## Verification of initial development

- React production build passed.
- PHP feature tests passed (17 tests / 77 assertions).
- Composer and production npm dependency audits reported no advisories.
- Browser verified public pages, French navigation, admin login screen and successful enquiry submission.
- Cloud tests used a temporary isolated PHP 8.4.23 CLI runtime and SQLite because Docker was unavailable. That runtime is **not** the production image and fails the production security-floor check. No Docker build, MySQL integration, HTTPS or production deployment is claimed as verified here. GitHub CI and the WSL Docker run must confirm those before release.

## Expanded editorial workspace (items 1–5)

This phase adds the public reference layouts and mobile styles, page section editing, galleries, safe video players, private PDF attachments, parliamentary filters, revision restoration, staff invitations/permissions and queued email alerts. Item 6 — production server/domain/HTTPS/deployment/backups/rollback configuration — is explicitly excluded and has not been performed.

### Administrator requested for this project

The migration `2026_11_06_000003_bootstrap_administrator.php` creates **admin@nd.com** only when it does not already exist and `ADMIN_INITIAL_PASSWORD` is configured. There is no default or committed password. The stored password is hashed. An existing account is never overwritten, even if the environment value changes.

For a new checkout, copy `.env.example` to `.env`, privately fill `ADMIN_INITIAL_PASSWORD` with a unique 12–72 byte password, then run `bash scripts/setup.sh`. The script generates missing application/database secrets while preserving your password. Use single quotes around a dotenv password containing `$` or `#`; do not paste it into chat or commit the file.

If the migration has already run before you set the password:

```bash
# Edit .env privately, then refresh the local containers' environment.
docker compose up -d --force-recreate app worker scheduler
docker compose exec app php artisan config:clear
docker compose exec app php artisan admin:bootstrap
```

On first sign-in at `/admin`, enter `admin@nd.com` and your configured password. The app displays an authenticator setup key. Add it to your authenticator app and submit its current six-digit code to finish sign-in. Store the setup key securely. After account creation, the initial password variable can be removed from `.env`; that does not change the existing hashed password. Later password changes use the staff access/reset flow, not migration reruns.

### Upgrade an existing local checkout

```bash
git pull --ff-only
docker compose build --pull
docker compose run --rm app php artisan migrate --force
docker compose run --rm app php artisan db:seed --force
docker compose up -d
```

The seeder adds missing default page layouts and the gallery of supplied portraits. It never overwrites edited pages. New staff bootstrap is optional if the environment password is blank.

### Page builder and review

Pages & sections edits each locale independently: hero titles/images/buttons, biography, approved quotes, cards, milestones, focus areas, calls to action and SEO. Home supports the editorial or classic visual treatment. Lists can be reordered. Editing a published translation returns it to draft. Kreol and legal publication have explicit review/approval gates. Stale version saves return a conflict instead of silently overwriting another editor.

History records snapshots with actor/date/version. Administrators can restore a page or publication as a **new unpublished draft**. Archiving content keeps its revision history and removes it from public listings. Staff can read history; only administrators can restore or archive records.

### Media and parliament

- Media Library accepts JPEG/PNG/WebP photos (up to 5 MiB) and PDFs (up to 15 MiB).
- Photos are decoded, resized to a maximum 2200-pixel side and re-encoded to WebP without original metadata. Very large decoded image dimensions are rejected.
- PDFs use private storage. Public download is allowed only when the PDF is attached to a currently published record in the requested language. Downloads are attachments with MIME-sniffing disabled. This is not a malware-free certification; upload only trusted documents.
- Publications can carry multiple PDFs, localized photo captions/alt text, topics and a YouTube/Vimeo HTTPS link. Video iframes are limited to those providers and are not created until the visitor chooses to load the player.
- Parliament filtering supports contribution type, session year, ministry/committee, topic, full-text term, sitting-date range, sorting and pagination.

### Staff and notifications

Staff & permissions lets administrators invite editors/administrators, manage roles, suspend accounts, opt staff into enquiry alerts and resend access links. You cannot disable or demote your own administrator account. Invitations expire after 60 minutes. New staff set their password and enrol an authenticator; password resets for enrolled staff require their existing authenticator code. Suspension takes effect on subsequent protected requests and invalidates database sessions.

The `worker` service processes encrypted queued notifications with retries. Enquiry alerts contain a dashboard link and enquiry number, not the constituent's message or private details. Staff must sign in to read it. The default `MAIL_MAILER=log` safely records test mail locally; real email delivery needs your email provider settings later. No external emails were sent during development. Use `docker compose logs worker` and `docker compose exec app php artisan queue:failed` to diagnose the queue; retry a corrected failed job with `queue:retry`.

### Content review

See [docs/content-review.md](docs/content-review.md) for the factual checks, official sources and outstanding owner decisions. English/French copy has had an automated editorial review. Kreol remains a human-review draft. Privacy/terms drafts describe the actual implementation but require the operator identity, lawful basis, retention decisions, service providers and owner/legal approval. No human approval is implied.

### Tests

Run `npm run build`, `npm run test:ui`, `php artisan test`, Composer audit and npm audit. CI additionally tests MySQL, Docker builds, Caddy configuration and full local-stack startup. Phone-width browser checks include the compact navigation, gallery keyboard behaviour and absence of horizontal overflow at 340 CSS pixels; these do not replace testing on a physical phone.

Kreol search indexing also requires the shared interface approval checkbox in Site settings. Page-level translation approval alone does not approve the common navigation/form wording.

Latest local verification of the expanded workspace: 33 backend tests (164 assertions), 7 interface tests, a successful frontend production build, valid PHP/YAML/shell syntax and clean dependency audits. GitHub CI also checks MySQL and Docker startup after each push. No production deployment is part of this phase.
