import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class F1DashPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        window.set_default_size(480, 420);

        const page = new Adw.PreferencesPage({
            title: 'F1 Dash',
            icon_name: 'media-playback-start-symbolic',
        });
        window.add(page);

        // ── General group ──
        const generalGroup = new Adw.PreferencesGroup({ title: 'Generale' });
        page.add(generalGroup);

        // Refresh interval
        const refreshModel = new Gtk.StringList();
        ['5 minuti', '15 minuti', '30 minuti', '1 ora'].forEach(s => refreshModel.append(s));
        const refreshValues = [300, 900, 1800, 3600];
        const curInterval   = settings.get_int('refresh-interval');
        const curIdx        = refreshValues.indexOf(curInterval) >= 0 ? refreshValues.indexOf(curInterval) : 2;

        const refreshRow = new Adw.ComboRow({
            title:    'Intervallo aggiornamento',
            subtitle: "Ogni quanto aggiornare i dati dall'API",
            model:    refreshModel,
            selected: curIdx,
        });
        refreshRow.connect('notify::selected', () => {
            settings.set_int('refresh-interval', refreshValues[refreshRow.selected] ?? 1800);
        });
        generalGroup.add(refreshRow);

        // Show constructors toggle
        const constructorsRow = new Adw.SwitchRow({
            title:    'Mostra Costruttori',
            subtitle: 'Abilita il tab classifica costruttori',
        });
        settings.bind('show-constructors', constructorsRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        generalGroup.add(constructorsRow);

        // Driver count spinrow
        const driverCountRow = new Adw.SpinRow({
            title:    'Piloti in classifica',
            subtitle: 'Quanti piloti mostrare nella lista',
            adjustment: new Gtk.Adjustment({
                lower: 3, upper: 20, step_increment: 1, value: settings.get_int('driver-count'),
            }),
        });
        driverCountRow.connect('notify::value', () => {
            settings.set_int('driver-count', driverCountRow.value);
        });
        generalGroup.add(driverCountRow);

        // ── Display group ──
        const displayGroup = new Adw.PreferencesGroup({ title: 'Visualizzazione' });
        page.add(displayGroup);

        const posModel = new Gtk.StringList();
        ['Sinistra', 'Centro', 'Destra'].forEach(s => posModel.append(s));
        const posValues  = ['left', 'center', 'right'];
        const curPos     = settings.get_string('panel-position');
        const curPosIdx  = posValues.indexOf(curPos) >= 0 ? posValues.indexOf(curPos) : 2;

        const posRow = new Adw.ComboRow({
            title:    'Posizione nella top bar',
            model:    posModel,
            selected: curPosIdx,
        });
        posRow.connect('notify::selected', () => {
            settings.set_string('panel-position', posValues[posRow.selected] ?? 'right');
        });
        displayGroup.add(posRow);

        // ── About group ──
        const aboutGroup = new Adw.PreferencesGroup({ title: 'Info' });
        page.add(aboutGroup);

        aboutGroup.add(new Adw.ActionRow({
            title:     'Dati forniti da',
            subtitle:  'Jolpica F1 API (api.jolpi.ca) — gratuita, open source',
            icon_name: 'dialog-information-symbolic',
        }));
        aboutGroup.add(new Adw.ActionRow({
            title:     'Versione',
            subtitle:  '1.0.0',
            icon_name: 'software-update-available-symbolic',
        }));
    }
}