#!/bin/bash
# Setup Environment Files
# Usage: ./setup-env.sh [development|production]

MODE=${1:-development}

if [ "$MODE" = "development" ]; then
  if [ ! -f .env.development ]; then
    echo "Creating .env.development from template..."
    cp .env.development.example .env.development
    echo "[OK] .env.development created. Please edit and fill in actual values."
  else
    echo "[SKIP] .env.development already exists. Skipping."
  fi
elif [ "$MODE" = "production" ]; then
  if [ ! -f .env.production ]; then
    echo "Creating .env.production from template..."
    cp .env.production.example .env.production
    echo "[OK] .env.production created. Please edit and fill in actual values."
  else
    echo "[SKIP] .env.production already exists. Skipping."
  fi
else
  echo "Usage: ./setup-env.sh [development|production]"
  exit 1
fi
