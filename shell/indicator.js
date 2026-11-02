import St from 'gi://St';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { buildMenuContent } from './menu.js';
import { abbreviateName } from './utils.js';

export const F1Indicator = GObject.registerClass(
class F1Indicator extends PanelMenu.Button {
    _init(settings, dataManager, openPrefsCallback) {
        super._init(0.0, 'F1 Dash', false);
        this._settings    = settings;
        this._dataManager = dataManager;
        this._openPrefs   = openPrefsCallback;

        this._buildPanelButton();
        this._buildMenu();
    }

    _buildPanelButton() {
        const box = new St.BoxLayout({ style: 'spacing: 5px; padding: 0 4px;' });

        this._panelIcon = new St.Icon({
            text:    '🏁',
            y_align: Clutter.ActorAlign.CENTER,
            style:     'font-size: 16px;',
        });
        box.add_child(this._panelIcon);

        this._panelLabel = new St.Label({
            text:    'F1',
            y_align: Clutter.ActorAlign.CENTER,
            style:   'font-size: 12px; font-weight: bold; color: #ffffff;',
        });
        box.add_child(this._panelLabel);

        this.add_child(box);
    }

    _buildMenu() {
        buildMenuContent(
            this.menu,
            this._dataManager.getData(),
            () => this._dataManager.forceRefresh(),
            () => {
                this.menu.close({ animate: false });
                this._openPrefs();
            }
        );
    }

    update(data, isLoading) {
        if (isLoading) {
            this._panelLabel.text = 'F1 …';
        } else {
            this._updatePanelLabel(data);
            this._buildMenu();
        }
    }

    _updatePanelLabel(data) {
        if (data.drivers?.length) {
            const leader = data.drivers[0];
            const abbr   = abbreviateName(leader?.Driver?.familyName ?? '');
            const pts    = leader?.points ?? '';
            this._panelLabel.text = `${abbr} ${pts}pts`;
        } else {
            this._panelLabel.text = 'F1';
        }
    }
});
