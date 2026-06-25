#!/usr/bin/env bash
# Auto-commit script: auto-increment patch version from package.json
# Usage: ./scripts/commit.sh "your commit message"

set -e

# Read current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: v${CURRENT_VERSION}"

# Parse and increment patch version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="${MAJOR}.${MINOR}.${NEW_PATCH}"
echo "New version: v${NEW_VERSION}"

# Update package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
pkg.version = '${NEW_VERSION}';
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

if [ -z "$1" ]; then
  echo "Usage: ./scripts/commit.sh "your commit message""
  exit 1
fi

git add -A
git commit -m "v${NEW_VERSION}: $1"
git push origin main

echo "Done. Pushed: v${NEW_VERSION}: $1"
