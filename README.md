# F1 Dash

A minimal Formula 1 panel extension for GNOME Shell. Shows the next race schedule, session times and championship standings — all from the top bar.

## Features

- Next race info with full session schedule (FP1, FP2, FP3, Qualifying, Sprint, Race) in local time
- Countdown to the next race
- Driver standings with team-colored point bars
- Constructor standings, switchable via tab
- Auto-refresh every 30 minutes (configurable)
- Offline cache — works without internet after first load

## Requirements

- GNOME Shell 45–51
- `glib-compile-schemas` (pre-installed on most distros)

## Installation

```bash
git clone https://github.com/YOURUSERNAME/f1-dash-gnome
cd f1-dash-gnome
glib-compile-schemas schemas/
cp -r . ~/.local/share/gnome-shell/extensions/f1dash@extension.local/
gnome-extensions enable f1dash@extension.local
```

Log out and back in to reload GNOME Shell.

## Preferences

Click the gear button in the popup, or run:

```bash
gnome-extensions prefs f1dash@extension.local
```

Options available:

- Refresh interval (5m / 15m / 30m / 1h)
- Number of drivers shown
- Show/hide constructor standings
- Panel position (left / center / right)

## Data

Powered by [Jolpica F1 API](https://github.com/jolpica/jolpica-f1) — free, open source, no API key required.

## License

GPL-2.0-or-later