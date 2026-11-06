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
- Dashboard: page views, approximate daily unique visitors, daily chart, popular pages, devices and recent editorial activity. Signed-in staff, obvious bots and Do Not Track requests are excluded.
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

Setup generates a private `.env` with random application/database keys, builds the images, starts MySQL, runs migrations and starts the website. It does not create a staff account or publish example political claims.

- Website: http://localhost:8080/en
- Admin: http://localhost:8080/admin

Create an administrator:

```bash
docker compose exec app php artisan admin:create your-email@example.com
```

Enter a password of at least 12 characters and your display name. Add the generated secret to an authenticator app. Save that secret in your password manager; enter the current six-digit code at each login. Do not share the terminal output. To create an editor, append `--editor`.

Production requires an enrolled authenticator. No public registration or default administrator exists. User administration is currently through the CLI; recovery/rotation and a user-management dashboard are follow-up work.

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

Changing translation text in the editor removes its review confirmation and returns a published translation to draft. The initial body editor intentionally accepts plain text, not HTML. Browser rendering escapes the text. Embedded video players, PDF attachments, gallery albums and a rich text editor remain planned extensions.

## Security and PHP updates

The container currently selects `php:8.4.27-fpm-bookworm`, with a build-time minimum-version check for the October 2026 PHP fixes. `scripts/check-runtime.php` checks the security floors for supported 8.2–8.5 branches. Recheck current PHP advisories at each release and update the image and policy together; a minimum baseline is not a substitute for future patching.

References: https://www.php.net/archive/2026.php and https://www.php.net/releases/8_4_27.php

- Credentials, `.env`, dependencies, generated assets and local databases are ignored by Git.
- CSRF protection applies to state-changing same-origin web/API routes.
- Production adds CSP, HSTS, secure encrypted session cookies, frame restrictions and MIME-sniffing protection.
- Uploaded SVGs and executables are disallowed; photos are limited to JPEG/PNG/WebP and 5 MiB. Full image decoding/re-encoding, malware scanning and PDF support remain follow-up work.
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
7. Configure real outgoing email and implement enquiry notification jobs/password recovery. Mail currently uses the log transport; saving an enquiry does not email anyone.
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

## Remaining roadmap

- Final design/content review; remaining template details, mobile QA and original logo integration.
- Human review of French/Kreol copy and removal of Kreol draft/noindex state.
- Editable hero/navigation/biography blocks (page records currently display as article-style content).
- Media albums, PDF attachments, embedded interviews and advanced parliamentary filtering.
- Revision history with restore, staff management/recovery UI and notifications.
- Server-specific automatic deployment, rollback and encrypted off-site backup/restore drill.
- MySQL/Docker integration verification and a production security review.

## Verification of initial development

- React production build passed.
- PHP feature tests passed (17 tests / 77 assertions).
- Composer and production npm dependency audits reported no advisories.
- Browser verified public pages, French navigation, admin login screen and successful enquiry submission.
- Cloud tests used a temporary isolated PHP 8.4.23 CLI runtime and SQLite because Docker was unavailable. That runtime is **not** the production image and fails the production security-floor check. No Docker build, MySQL integration, HTTPS or production deployment is claimed as verified here. GitHub CI and the WSL Docker run must confirm those before release.
