#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v docker >/dev/null || { echo 'Install Docker Engine and Docker Compose in Ubuntu first.'; exit 1; }
umask 077
if [[ ! -f .env ]]; then cp .env.example .env; fi
chmod 600 .env
if grep -q '^APP_KEY=$' .env; then
  app_key="$(openssl rand -base64 32)"
  sed -i "s|^APP_KEY=.*|APP_KEY=base64:$app_key|" .env
fi
if grep -q '^DB_PASSWORD=$' .env; then
  db_password="$(openssl rand -hex 24)"
  sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$db_password|" .env
fi
if grep -q '^MYSQL_ROOT_PASSWORD=$' .env; then
  root_password="$(openssl rand -hex 24)"
  sed -i "s|^MYSQL_ROOT_PASSWORD=.*|MYSQL_ROOT_PASSWORD=$root_password|" .env
fi
docker compose build --pull
docker compose up -d mysql
docker compose run --rm app php artisan migrate --force
docker compose run --rm app php artisan db:seed --force
docker compose up -d
ready=false
for attempt in $(seq 1 30); do
  if docker compose exec -T web wget -q -O /dev/null http://127.0.0.1/up; then
    ready=true
    break
  fi
  sleep 2
done
if [[ "$ready" != true ]]; then
  echo 'The web application did not become ready. Container logs follow:' >&2
  docker compose logs --tail=60 app web
  exit 1
fi
printf '\nWebsite: http://localhost:8080\nAdmin: http://localhost:8080/admin\nCreate an admin: docker compose exec app php artisan admin:create your-email@example.com\n'
