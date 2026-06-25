#!/usr/bin/env bash
# Auto-commit script: reads version from package.json and prefixes commit message
# Usage: ./scripts/commit.sh "your commit message"

set -e

VERSION=$(node -p "require('./package.json').version")

if [ -z "$1" ]; then
  echo "Usage: ./scripts/commit.sh \"your commit message\""
  exit 1
fi

echo "Version: v${VERSION}"
echo "Message: $1"

git add -A
git commit -m "v${VERSION}: $1"
git push origin main

echo "Done. Pushed with message: v${VERSION}: $1"
