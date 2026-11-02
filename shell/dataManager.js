import GLib from 'gi://GLib';
import Soup from 'gi://Soup';

const API_BASE   = 'https://api.jolpi.ca/ergast/f1';
const USER_AGENT = 'F1DashGnome/1.0';
const CACHE_TTL  = 1800; // seconds

export class DataManager {
    constructor(settings, onUpdate) {
        this._settings  = settings;
        this._onUpdate  = onUpdate;
        this._session   = null;
        this._sourceId  = null;
        this._data      = { drivers: null, constructors: null, race: null };
    }

    start() {
        this._session = new Soup.Session();
        this._session.user_agent = USER_AGENT;
        this._loadCache();
        this._scheduleRefresh(0);
    }

    stop() {
        if (this._sourceId) {
            GLib.Source.remove(this._sourceId);
            this._sourceId = null;
        }
        if (this._session) {
            this._session.abort();
            this._session = null;
        }
    }

    getData() {
        return this._data;
    }

    forceRefresh() {
        if (this._sourceId) {
            GLib.Source.remove(this._sourceId);
            this._sourceId = null;
        }
        this._fetchAll();
    }

    _loadCache() {
        try {
            const driversJson      = this._settings.get_string('cached-drivers');
            const constructorsJson = this._settings.get_string('cached-constructors');
            const raceJson         = this._settings.get_string('cached-race');
            if (driversJson)      this._data.drivers      = JSON.parse(driversJson);
            if (constructorsJson) this._data.constructors = JSON.parse(constructorsJson);
            if (raceJson)         this._data.race         = JSON.parse(raceJson);
        } catch {
            // Cache corrotta o vuota — verrà fatto un fetch fresco
        }
    }

    _saveCache() {
        try {
            if (this._data.drivers)
                this._settings.set_string('cached-drivers', JSON.stringify(this._data.drivers));
            if (this._data.constructors)
                this._settings.set_string('cached-constructors', JSON.stringify(this._data.constructors));
            if (this._data.race)
                this._settings.set_string('cached-race', JSON.stringify(this._data.race));
            const now = Math.floor(Date.now() / 1000);
            this._settings.set_int('cache-timestamp', now);
        } catch {
            // Non fatale
        }
    }

    _isCacheValid() {
        const ts  = this._settings.get_int('cache-timestamp');
        const now = Math.floor(Date.now() / 1000);
        return ts > 0 && (now - ts) < CACHE_TTL;
    }

    _scheduleRefresh(delaySeconds) {
        if (this._sourceId) {
            GLib.Source.remove(this._sourceId);
            this._sourceId = null;
        }
        this._sourceId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, delaySeconds, () => {
            this._fetchAll();
            return GLib.SOURCE_REMOVE;
        });
    }

    _fetchAll() {
        if (this._isCacheValid() && this._data.drivers && this._data.race) {
            this._onUpdate(this._data, false);
            const interval = this._settings.get_int('refresh-interval');
            this._scheduleRefresh(interval);
            return;
        }

        this._onUpdate(this._data, true);

        let done  = 0;
        const total = 3;

        const onDone = () => {
            done++;
            if (done === total) {
                this._saveCache();
                this._onUpdate(this._data, false);
                const interval = this._settings.get_int('refresh-interval');
                this._scheduleRefresh(interval);
            }
        };

        this._fetch(`${API_BASE}/current/driverstandings.json`, (parsed) => {
            if (parsed) {
                const list = parsed?.MRData?.StandingsTable?.StandingsLists?.[0];
                this._data.drivers = list?.DriverStandings ?? null;
            }
            onDone();
        });

        this._fetch(`${API_BASE}/current/constructorstandings.json`, (parsed) => {
            if (parsed) {
                const list = parsed?.MRData?.StandingsTable?.StandingsLists?.[0];
                this._data.constructors = list?.ConstructorStandings ?? null;
            }
            onDone();
        });

        this._fetch(`${API_BASE}/current/next/races.json`, (parsed) => {
            if (parsed) {
                this._data.race = parsed?.MRData?.RaceTable?.Races?.[0] ?? null;
            }
            onDone();
        });
    }

    _fetch(url, callback) {
        if (!this._session) {
            callback(null);
            return;
        }
        const message = Soup.Message.new('GET', url);
        if (!message) {
            callback(null);
            return;
        }
        this._session.send_and_read_async(
            message,
            GLib.PRIORITY_DEFAULT,
            null,
            (session, result) => {
                try {
                    const bytes  = session.send_and_read_finish(result);
                    const text   = new TextDecoder().decode(bytes.get_data());
                    const parsed = JSON.parse(text);
                    callback(parsed);
                } catch {
                    callback(null);
                }
            }
        );
    }
}