#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v docker >/dev/null || { echo 'Install Docker Engine and Docker Compose in Ubuntu first.'; exit 1; }
if [[ ! -f .env ]]; then
  umask 077
  cp .env.example .env
  app_key="$(openssl rand -base64 32)"
  db_password="$(openssl rand -hex 24)"
  root_password="$(openssl rand -hex 24)"
  sed -i "s|^APP_KEY=.*|APP_KEY=base64:$app_key|; s|^DB_PASSWORD=.*|DB_PASSWORD=$db_password|; s|^MYSQL_ROOT_PASSWORD=.*|MYSQL_ROOT_PASSWORD=$root_password|" .env
fi
docker compose build --pull
docker compose up -d mysql
docker compose run --rm app php artisan migrate --force
docker compose up -d
printf '\nWebsite: http://localhost:8080\nAdmin: http://localhost:8080/admin\nCreate an admin: docker compose exec app php artisan admin:create your-email@example.com\n'
