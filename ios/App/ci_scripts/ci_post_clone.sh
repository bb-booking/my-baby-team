#!/bin/sh

# Xcode Cloud: runs after repo clone, before build
# Needed because node_modules/ is in .gitignore

set -e

# Navigate to repo root (ci_scripts is at ios/App/ci_scripts/)
cd "$CI_PRIMARY_REPOSITORY_PATH"

# Install Node dependencies
echo "Installing npm dependencies..."
npm install

# Sync Capacitor iOS (copies web assets + generates Package.swift with correct paths)
echo "Running cap sync ios..."
npx cap sync ios

echo "ci_post_clone.sh done"
