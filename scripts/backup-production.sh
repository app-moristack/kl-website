#!/usr/bin/env bash
set -euo pipefail
umask 077
cd "$(dirname "$0")/.."
backup_root=/var/backups/kl-website
install -d -m 700 "$backup_root"
backup="$backup_root/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -m 700 "$backup"
compose=(docker compose --project-name kl-website --env-file .env.production -f compose.production.yaml)
"${compose[@]}" exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" exec mysqldump -u "$MYSQL_USER" --single-transaction --no-tablespaces --set-gtid-purged=OFF "$MYSQL_DATABASE"' </dev/null | gzip > "$backup/database.sql.gz"
"${compose[@]}" exec -T app tar -czf - -C /var/www/html/storage/app . </dev/null > "$backup/storage-app.tar.gz"
tar -czf "$backup/config.tar.gz" .env.production .secrets compose.production.yaml
gzip -t "$backup/database.sql.gz"
tar -tzf "$backup/storage-app.tar.gz" >/dev/null
find "$backup_root" -mindepth 1 -maxdepth 1 -type d -name '20*T*Z' -mtime +14 -exec rm -rf -- {} +
echo "Backup created: $backup"
