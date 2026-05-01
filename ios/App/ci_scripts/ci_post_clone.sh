#!/bin/sh

# Xcode Cloud post-clone script
# Web assets (ios/App/App/public/) and Capacitor Swift packages
# are now committed directly to git, so this script is a safety net only.

echo "=== ci_post_clone.sh: checking environment ==="

# Set up Homebrew PATH (Apple Silicon + Intel)
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:$PATH"
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_INSTALL_CLEANUP=1

if command -v node >/dev/null 2>&1; then
  echo "Node.js found: $(node --version)"
  cd "$CI_PRIMARY_REPOSITORY_PATH"
  npm install --prefer-offline || npm install
  npx cap sync ios || echo "cap sync failed — using committed assets"
else
  echo "Node.js not found — using committed web assets and Swift packages"
fi

echo "=== ci_post_clone.sh done ==="
