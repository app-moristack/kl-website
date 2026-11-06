#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
backup_dir="${BACKUP_DIR:?Set BACKUP_DIR to a protected directory outside the checkout}"
umask 077
mkdir -p "$backup_dir"
name="kl-$(date -u +%Y%m%dT%H%M%SZ)"
docker compose exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" exec mysqldump --single-transaction --no-tablespaces -u "$MYSQL_USER" "$MYSQL_DATABASE"' | gzip > "$backup_dir/$name.sql.gz"
docker compose exec -T app tar -czf - -C storage/app public > "$backup_dir/$name.uploads.tar.gz"
echo "Backup completed. Encrypt and copy both files to off-server storage."
