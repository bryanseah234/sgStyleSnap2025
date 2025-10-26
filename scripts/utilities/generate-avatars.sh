#!/bin/bash

# Generate Default Avatar Images for StyleSnap
# Creates 6 simple, professional default avatar images (200x200 PNG)
# Each avatar has a unique color scheme

set -e

AVATAR_DIR="$(dirname "$0")/../public/avatars"
mkdir -p "$AVATAR_DIR"

echo "Generating default avatar images..."

# Check if ImageMagick is available
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Installing..."
    sudo apt-get update && sudo apt-get install -y imagemagick
fi

# Avatar 1: Blue gradient with user icon
convert -size 200x200 \
  -define gradient:angle=135 \
  gradient:'#3B82F6'-'#1E40AF' \
  -font DejaVu-Sans-Bold -pointsize 80 -fill white \
  -gravity center -annotate +0+0 '👤' \
  "$AVATAR_DIR/default-1.png"

# Avatar 2: Purple gradient with user icon
convert -size 200x200 \
  -define gradient:angle=135 \
  gradient:'#8B5CF6'-'#6D28D9' \
  -font DejaVu-Sans-Bold -pointsize 80 -fill white \
  -gravity center -annotate +0+0 '👤' \
  "$AVATAR_DIR/default-2.png"

# Avatar 3: Green gradient with user icon
convert -size 200x200 \
  -define gradient:angle=135 \
  gradient:'#10B981'-'#059669' \
  -font DejaVu-Sans-Bold -pointsize 80 -fill white \
  -gravity center -annotate +0+0 '👤' \
  "$AVATAR_DIR/default-3.png"

# Avatar 4: Pink gradient with user icon
convert -size 200x200 \
  -define gradient:angle=135 \
  gradient:'#EC4899'-'#BE185D' \
  -font DejaVu-Sans-Bold -pointsize 80 -fill white \
  -gravity center -annotate +0+0 '👤' \
  "$AVATAR_DIR/default-4.png"

# Avatar 5: Orange gradient with user icon
convert -size 200x200 \
  -define gradient:angle=135 \
  gradient:'#F59E0B'-'#D97706' \
  -font DejaVu-Sans-Bold -pointsize 80 -fill white \
  -gravity center -annotate +0+0 '👤' \
  "$AVATAR_DIR/default-5.png"

# Avatar 6: Teal gradient with user icon
convert -size 200x200 \
  -define gradient:angle=135 \
  gradient:'#14B8A6'-'#0D9488' \
  -font DejaVu-Sans-Bold -pointsize 80 -fill white \
  -gravity center -annotate +0+0 '👤' \
  "$AVATAR_DIR/default-6.png"

echo "✓ Generated 6 default avatar images in $AVATAR_DIR"
ls -lh "$AVATAR_DIR"
