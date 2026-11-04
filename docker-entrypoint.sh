#!/bin/sh
set -e

echo "[Docker Entrypoint] PasokMataram Container Starting..."

# Run database migrations before starting the application
echo "[Docker Entrypoint] Running auto-migration..."
npm run db:migrate || {
  echo "[Docker Entrypoint] WARNING: Migration failed, app will continue"
}

echo "[Docker Entrypoint] Starting application..."
exec "$@"
