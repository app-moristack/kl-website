# syntax=docker/dockerfile:1
ARG PHP_IMAGE=php:8.4.27-fpm-bookworm
FROM node:22-bookworm-slim AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY vite.config.js ./
COPY resources ./resources
RUN npm run build

FROM ${PHP_IMAGE} AS php-base
# Refuse a base image below the fixed runtime version.
RUN php -r 'if (version_compare(PHP_VERSION, "8.4.27", "<")) { exit(1); }'
RUN apt-get update && apt-get install -y --no-install-recommends libonig-dev libzip-dev libxml2-dev libpng-dev libjpeg62-turbo-dev libwebp-dev unzip \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install pdo_mysql mbstring bcmath zip dom gd \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY docker/php.ini /usr/local/etc/php/conf.d/kl.ini
WORKDIR /var/www/html

FROM php-base AS app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist --no-interaction --optimize-autoloader
COPY . .
COPY --from=frontend /app/public/build ./public/build
RUN composer dump-autoload --no-dev --optimize && php artisan package:discover \
    && mkdir -p storage/app/public storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs \
    && ln -s /var/www/html/storage/app/public public/storage \
    && chown -R www-data:www-data storage bootstrap/cache
USER www-data
EXPOSE 9000
CMD ["php-fpm"]

FROM app AS production
COPY --from=caddy:2-alpine /usr/bin/caddy /usr/local/bin/caddy
COPY docker/Caddyfile /etc/caddy/Caddyfile
ENV XDG_CONFIG_HOME=/tmp/caddy-config XDG_DATA_HOME=/tmp/caddy-data

FROM caddy:2-alpine AS web
WORKDIR /var/www/html
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=app /var/www/html/public ./public
EXPOSE 80 443
