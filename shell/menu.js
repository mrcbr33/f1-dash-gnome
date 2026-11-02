import St from 'gi://St';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { getTeamColor, getDriverFlag, getCircuitFlag, formatSessionTime, formatCountdown, abbreviateName, maxPoints } from './utils.js';

// ── Custom container menu item ──
const CustomMenuItem = GObject.registerClass(
class CustomMenuItem extends PopupMenu.PopupBaseMenuItem {
    _init(child, params = {}) {
        super._init({ reactive: false, can_focus: false, ...params });
        this.add_child(child);
    }
});

// ── Section header ──
function makeSectionHeader(text) {
    const box = new St.BoxLayout({
        style: 'padding: 10px 16px 4px 16px;',
    });
    box.add_child(new St.Label({
        text,
        style: 'font-size: 10px; font-weight: bold; letter-spacing: 1.5px; color: rgba(255,255,255,0.45);',
    }));
    return box;
}

// ── Race card ──
function buildRaceCard(race) {
    const outer = new St.BoxLayout({
        orientation: Clutter.Orientation.VERTICAL,
        style: 'background-color: rgba(255,255,255,0.06); border-radius: 16px; border: 1px solid rgba(255,255,255,0.09); margin: 4px 12px 2px 12px; padding: 14px 16px 12px 16px;',
    });

    if (!race) {
        outer.add_child(new St.Label({
            text:  'Nessuna gara disponibile',
            style: 'color: rgba(255,255,255,0.5);',
        }));
        return outer;
    }

    const circuitId = race.Circuit?.circuitId ?? '';
    const flag      = getCircuitFlag(circuitId);

    // Race name
    const titleRow = new St.BoxLayout({ style: 'margin-bottom: 2px;' });
    titleRow.add_child(new St.Label({
        text:  `${flag}  ${race.raceName}`,
        style: 'font-size: 15px; font-weight: bold; color: #ffffff;',
    }));
    outer.add_child(titleRow);

    // Circuit name
    outer.add_child(new St.Label({
        text:  race.Circuit?.circuitName ?? '',
        style: 'font-size: 11px; color: rgba(255,255,255,0.50); margin-bottom: 10px;',
    }));

    // Sessions
    const sessions = [
        { key: 'FirstPractice',    label: 'FP1',        icon: '🔧', highlight: false },
        { key: 'SecondPractice',   label: 'FP2',        icon: '🔧', highlight: false },
        { key: 'ThirdPractice',    label: 'FP3',        icon: '🔧', highlight: false },
        { key: 'Sprint',           label: 'Sprint',     icon: '⚡', highlight: false },
        { key: 'SprintQualifying', label: 'Sprint Q.',  icon: '⚡', highlight: false },
        { key: 'Qualifying',       label: 'Qualifiche', icon: '🏁', highlight: false },
        { key: null,               label: 'Gara',       icon: '🏆', highlight: true, date: race.date, time: race.time },
    ];

    sessions.forEach(s => {
        const src = s.key ? race[s.key] : { date: s.date, time: s.time };
        if (!src?.date)
            return;

        const timeStr = formatSessionTime(src.date, src.time);
        const row = new St.BoxLayout({
            style: s.highlight
                ? 'background-color: rgba(220,0,0,0.18); border-radius: 8px; padding: 5px 8px; margin: 2px 0;'
                : 'padding: 3px 8px; margin: 1px 0;',
        });

        row.add_child(new St.Label({
            text:  `${s.icon}  ${s.label}`,
            style: `font-size: 12px; color: ${s.highlight ? '#ff9090' : 'rgba(255,255,255,0.75)'}; min-width: 100px;`,
        }));

        row.add_child(new St.Widget({ x_expand: true }));

        row.add_child(new St.Label({
            text:  timeStr,
            style: `font-size: 12px; font-weight: ${s.highlight ? 'bold' : 'normal'}; color: ${s.highlight ? '#ffffff' : 'rgba(255,255,255,0.60)'};`,
        }));

        outer.add_child(row);
    });

    // Countdown
    const countdown = formatCountdown(race.date, race.time);
    if (countdown) {
        const ctRow = new St.BoxLayout({
            style: 'margin-top: 10px; padding: 6px 8px; background-color: rgba(255,255,255,0.04); border-radius: 8px;',
        });
        ctRow.add_child(new St.Label({
            text:  `🕐  ${countdown}`,
            style: 'font-size: 12px; color: rgba(255,255,255,0.55); font-style: italic;',
        }));
        outer.add_child(ctRow);
    }

    return outer;
}

// ── Standing row ──
function buildStandingRow(pos, name, abbr, pts, maxPts, teamColor, flag) {
    const BAR_MAX = 120;

    const row = new St.BoxLayout({
        style: 'padding: 6px 8px; margin: 1px 0; border-radius: 10px;',
    });

    // Position
    row.add_child(new St.Label({
        text:  pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : String(pos),
        style: `font-size: ${pos <= 3 ? '13' : '11'}px; font-weight: bold; min-width: 22px; color: rgba(255,255,255,0.45); text-align: right; margin-right: 6px;`,
    }));

    // Team color strip
    const pill = new St.Widget({
        style: `background-color: ${teamColor}; border-radius: 3px; width: 4px; margin-right: 8px;`,
    });
    pill.set_height(32);
    row.add_child(pill);

    // Name
    const nameBox = new St.BoxLayout({
        orientation: Clutter.Orientation.VERTICAL,
        x_expand:    true,
    });
    nameBox.add_child(new St.Label({
        text:  `${flag}  ${abbr}`,
        style: 'font-size: 12px; font-weight: bold; color: #ffffff;',
    }));
    nameBox.add_child(new St.Label({
        text:  name,
        style: 'font-size: 10px; color: rgba(255,255,255,0.45);',
    }));
    row.add_child(nameBox);

    // Points + bar
    const rightBox = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
    rightBox.add_child(new St.Label({
        text:    `${pts} pts`,
        style:   'font-size: 12px; font-weight: bold; color: rgba(255,255,255,0.90);',
        x_align: Clutter.ActorAlign.END,
    }));

    const barBg = new St.Widget({
        style: 'background-color: rgba(255,255,255,0.12); border-radius: 3px; height: 4px; margin-top: 4px;',
    });
    barBg.set_width(BAR_MAX);

    const barFill = new St.Widget({
        style: `background-color: ${teamColor}; border-radius: 3px; height: 4px;`,
    });
    barFill.set_width(Math.max(Math.round((parseFloat(pts) / maxPts) * BAR_MAX), 4));
    barBg.add_child(barFill);
    rightBox.add_child(barBg);
    row.add_child(rightBox);

    return row;
}

// ── Tab switcher ──
function buildTabSwitcher(onSwitch) {
    const box = new St.BoxLayout({
        style: 'background-color: rgba(255,255,255,0.07); border-radius: 20px; padding: 3px; margin: 6px 12px 4px 12px;',
    });

    const activeStyle = 'border-radius: 18px; padding: 5px 18px; font-size: 12px; font-weight: bold; background-color: rgba(255,255,255,0.18); color: #ffffff;';
    const inactiveStyle = 'border-radius: 18px; padding: 5px 18px; font-size: 12px; color: rgba(255,255,255,0.50);';

    const tabs = {
        drivers:      new St.Button({ label: 'Piloti',       style: activeStyle,   x_expand: true }),
        constructors: new St.Button({ label: 'Costruttori',  style: inactiveStyle, x_expand: true }),
    };

    box.add_child(tabs.drivers);
    box.add_child(tabs.constructors);

    let current = 'drivers';

    const activate = (which) => {
        if (which === current)
            return;
        current = which;
        tabs.drivers.style      = which === 'drivers'      ? activeStyle : inactiveStyle;
        tabs.constructors.style = which === 'constructors' ? activeStyle : inactiveStyle;
        onSwitch(which);
    };

    tabs.drivers.connect('clicked',      () => activate('drivers'));
    tabs.constructors.connect('clicked', () => activate('constructors'));

    return box;
}

// ── Main exported function ──
export function buildMenuContent(menu, data, onRefresh, onPrefs) {
    menu.removeAll();

    // Header
    const headerItem = new PopupMenu.PopupBaseMenuItem({ reactive: false, can_focus: false });
    const headerBox  = new St.BoxLayout({ style: 'padding: 4px 4px 8px 4px;' });

    headerBox.add_child(new St.Icon({
        icon_name: 'media-playback-start-symbolic',
        icon_size: 16,
        style:     'color: #e10600; margin-right: 8px;',
    }));
    headerBox.add_child(new St.Label({
        text:     'F1 DASH',
        style:    'font-size: 14px; font-weight: bold; color: #ffffff; letter-spacing: 2px;',
        x_expand: true,
    }));

    const refreshBtn = new St.Button({
        style: 'border-radius: 50%; padding: 4px; color: rgba(255,255,255,0.55);',
        child: new St.Icon({ icon_name: 'view-refresh-symbolic', icon_size: 14 }),
    });
    refreshBtn.connect('clicked', () => onRefresh());

    const prefsBtn = new St.Button({
        style: 'border-radius: 50%; padding: 4px; color: rgba(255,255,255,0.55); margin-left: 4px;',
        child: new St.Icon({ icon_name: 'emblem-system-symbolic', icon_size: 14 }),
    });
    prefsBtn.connect('clicked', () => onPrefs());

    headerBox.add_child(refreshBtn);
    headerBox.add_child(prefsBtn);
    headerItem.add_child(headerBox);
    menu.addMenuItem(headerItem);

    menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

    // Next race
    menu.addMenuItem(new CustomMenuItem(makeSectionHeader('Prossima Gara')));
    menu.addMenuItem(new CustomMenuItem(buildRaceCard(data.race)));

    menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

    // Standings section label
    const sectionLabel = new St.Label({
        text:  'Classifica Piloti',
        style: 'padding: 10px 16px 4px 16px; font-size: 10px; font-weight: bold; letter-spacing: 1.5px; color: rgba(255,255,255,0.45);',
    });
    menu.addMenuItem(new CustomMenuItem(sectionLabel));

    // List container + scrollview
    const listContainer = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
    const scrollView    = new St.ScrollView({
        style:               'max-height: 280px; margin: 0 12px 4px 12px;',
        overlay_scrollbars:  true,
        hscrollbar_policy:   St.PolicyType.NEVER,
        vscrollbar_policy:   St.PolicyType.AUTOMATIC,
    });
    scrollView.set_child(listContainer);

    const renderList = (which) => {
        listContainer.destroy_all_children();

        if (which === 'drivers' && data.drivers?.length) {
            const mp = maxPoints(data.drivers);
            data.drivers.forEach((d, i) => {
                const pos   = parseInt(d.position) || (i + 1);
                const name  = d.Driver?.familyName ?? '—';
                const abbr  = abbreviateName(name);
                const pts   = d.points ?? '0';
                const flag  = getDriverFlag(d.Driver?.nationality);
                const color = getTeamColor(d.Constructors?.[0]?.constructorId ?? '');
                listContainer.add_child(buildStandingRow(pos, name, abbr, pts, mp, color, flag));
            });

        } else if (which === 'constructors' && data.constructors?.length) {
            const mp = maxPoints(data.constructors);
            data.constructors.forEach((c, i) => {
                const pos   = parseInt(c.position) || (i + 1);
                const name  = c.Constructor?.name ?? '—';
                const abbr  = name.substring(0, 3).toUpperCase();
                const pts   = c.points ?? '0';
                const flag  = getDriverFlag(c.Constructor?.nationality);
                const color = getTeamColor(c.Constructor?.constructorId ?? '');
                listContainer.add_child(buildStandingRow(pos, name, abbr, pts, mp, color, flag));
            });

        } else {
            listContainer.add_child(new St.Label({
                text:  'Nessun dato disponibile',
                style: 'color: rgba(255,255,255,0.4); padding: 12px 16px; font-size: 12px;',
            }));
        }
    };

    // Tab switcher
    const tabSwitcher = buildTabSwitcher((which) => {
        sectionLabel.text = which === 'drivers' ? 'Classifica Piloti' : 'Classifica Costruttori';
        renderList(which);
    });

    menu.addMenuItem(new CustomMenuItem(tabSwitcher));
    renderList('drivers');
    menu.addMenuItem(new CustomMenuItem(scrollView));
}