#!/bin/bash
set -euo pipefail

mkdir -p assets/photos/pages
mkdir -p assets/photos/editorial
mkdir -p assets/photos/legacy
cp public/assets/photos/pages/*.avif assets/photos/pages/
cp public/assets/photos/editorial/*.avif assets/photos/editorial/
cp public/assets/photos/legacy/*.avif assets/photos/legacy/
cp public/assets/photos/home-hero-og.jpg assets/photos/

echo "Photos copied successfully."

ls -la assets/photos/pages/ assets/photos/editorial/ assets/photos/legacy/
ls -la assets/photos/home-hero-og.jpg 2>/dev/null || echo "home-hero-og.jpg not found, checking in public..."
ls -la public/assets/photos/home-hero-og.jpg
