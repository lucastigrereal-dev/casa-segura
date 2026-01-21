#!/bin/bash
set -e

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Building web-pro app..."
npm run build --workspace=@casa-segura/web-pro

echo "Copying app structure to root..."
cp -r apps/web-pro/app . 2>/dev/null || true
cp -r apps/web-pro/.next . 2>/dev/null || true
cp -r apps/web-pro/public . 2>/dev/null || true
cp apps/web-pro/next.config.js . 2>/dev/null || true
cp apps/web-pro/tsconfig.json . 2>/dev/null || true

echo "Build complete!"
