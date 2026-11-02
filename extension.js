import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { DataManager } from './shell/dataManager.js';
import { F1Indicator } from './shell/indicator.js';

export default class F1DashExtension extends Extension {
    enable() {
        this._settings    = this.getSettings();
        this._dataManager = new DataManager(this._settings, (data, isLoading) => {
            this._indicator?.update(data, isLoading);
        });
        this._indicator = new F1Indicator(
            this._settings,
            this._dataManager,
            () => this.openPreferences()
        );
        Main.panel.addToStatusArea(this.uuid, this._indicator);
        this._dataManager.start();
    }

    disable() {
        this._dataManager.stop();
        this._dataManager = null;
        this._indicator.destroy();
        this._indicator   = null;
        this._settings    = null;
    }
}