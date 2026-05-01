#!/bin/sh

# Xcode Cloud: runs after repo clone, before build
# Node.js is not pre-installed on Xcode Cloud — install via Homebrew

set -e

echo "=== ci_post_clone.sh start ==="

# Install Node.js (Homebrew is available on Xcode Cloud)
echo "Installing Node.js..."
brew install node

# Verify
node --version
npm --version

# Navigate to repo root (ci_scripts is at ios/App/ci_scripts/)
cd "$CI_PRIMARY_REPOSITORY_PATH"

# Install Node dependencies
echo "Running npm install..."
npm install

# Sync Capacitor iOS (copies web assets + generates Package.swift with correct paths)
echo "Running cap sync ios..."
npx cap sync ios

echo "=== ci_post_clone.sh done ==="
