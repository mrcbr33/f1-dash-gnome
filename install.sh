#!/usr/bin/env bash
set -e

UUID="f1dash@extension.local"
DEST="$HOME/.local/share/gnome-shell/extensions/$UUID"

echo "📦 Installing F1 Dash GNOME extension..."

# Create dirs
mkdir -p "$DEST/shell"
mkdir -p "$DEST/schemas"

# Copy files
cp metadata.json   "$DEST/"
cp extension.js    "$DEST/"
cp prefs.js        "$DEST/"
cp stylesheet.css  "$DEST/"
cp shell/utils.js       "$DEST/shell/"
cp shell/dataManager.js "$DEST/shell/"
cp shell/menu.js        "$DEST/shell/"
cp shell/indicator.js   "$DEST/shell/"
cp schemas/org.gnome.shell.extensions.f1dash.gschema.xml "$DEST/schemas/"

# Compile GSettings schema
echo "🔧 Compiling GSettings schema..."
glib-compile-schemas "$DEST/schemas/"

# Enable extension
echo "✅ Enabling extension..."
gnome-extensions enable "$UUID" 2>/dev/null || true

echo ""
echo "🏎️  F1 Dash installed successfully!"
echo ""
echo "Test in nested Wayland session:"
echo "  dbus-run-session gnome-shell --devkit --wayland"
echo ""
echo "Then enable:"
echo "  gnome-extensions enable $UUID"
echo ""
echo "Monitor logs:"
echo "  journalctl -f -o cat /usr/bin/gnome-shell"