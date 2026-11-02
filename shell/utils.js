import GLib from 'gi://GLib';

// ── 2026 Teams (con Audi e Cadillac!) ──
const TEAM_COLORS = {
    mercedes:     '#00D2BE',
    ferrari:      '#DC0000',
    red_bull:     '#3671C6',
    mclaren:      '#FF8000',
    alpine:       '#0093CC',
    aston_martin: '#006F62',
    williams:     '#005AFF',
    haas:         '#B6BABD',
    audi:         '#BB0000',  // ex Sauber → Audi dal 2026
    racing_bulls: '#6692FF',
    cadillac:     '#333399',  // nuovo team 2026
};

// ── Nazionalità piloti 2026 ──
const FLAG_MAP = {
    British:      '🇬🇧',  // Russell, Hamilton, Bearman, Norris, Albon
    Italian:      '🇮🇹',  // Antonelli
    Monegasque:   '🇲🇨',  // Leclerc
    Dutch:        '🇳🇱',  // Verstappen
    French:       '🇫🇷',  // Hadjar, Gasly
    New_Zealander:'🇳🇿',  // Lawson
    Swedish:      '🇸🇪',  // Lindblad
    Argentine:    '🇦🇷',  // Colapinto
    German:       '🇩🇪',  // Hulkenberg
    Brazilian:    '🇧🇷',  // Bortoleto
    Spanish:      '🇪🇸',  // Sainz, Alonso
    Finnish:      '🇫🇮',  // Bottas
    Mexican:      '🇲🇽',  // Perez
    Canadian:     '🇨🇦',  // Stroll
    Australian:   '🇦🇺',  // Piastri
    French:       '🇫🇷',
    Thai:         '🇹🇭',
    Chinese:      '🇨🇳',
    American:     '🇺🇸',
    Austrian:     '🇦🇹',
    Belgian:      '🇧🇪',
    Swiss:        '🇨🇭',
    Polish:       '🇵🇱',
    Russian:      '🇷🇺',
    Hungarian:    '🇭🇺',
    Danish:       '🇩🇰',
    Colombian:    '🇨🇴',
    Venezuelan:   '🇻🇪',
    Japanese:     '🇯🇵',
};

// ── Calendario 2026 (23 round, verificato da formula1.com) ──
const CIRCUIT_FLAG = {
    albert_park:   '🇦🇺',  // R1  Australia
    shanghai:      '🇨🇳',  // R2  Cina
    suzuka:        '🇯🇵',  // R3  Giappone
    miami:         '🇺🇸',  // R4  Miami
    villeneuve:    '🇨🇦',  // R5  Canada
    monaco:        '🇲🇨',  // R6  Monaco
    catalunya:     '🇪🇸',  // R7  Barcellona
    red_bull_ring: '🇦🇹',  // R8  Austria
    silverstone:   '🇬🇧',  // R9  Gran Bretagna
    spa:           '🇧🇪',  // R10 Belgio
    hungaroring:   '🇭🇺',  // R11 Ungheria
    zandvoort:     '🇳🇱',  // R12 Olanda
    monza:         '🇮🇹',  // R13 Italia
    barcelona:     '🇪🇸',  // R14 Spagna (2° gara)
    baku:          '🇦🇿',  // R15 Azerbaijan
    bahrain:       '🇧🇭',  // R16 Bahrain (in Malaysia)
    marina_bay:    '🇸🇬',  // R17 Singapore
    americas:      '🇺🇸',  // R18 USA Austin
    rodriguez:     '🇲🇽',  // R19 Messico
    interlagos:    '🇧🇷',  // R20 Brasile
    vegas:         '🇺🇸',  // R21 Las Vegas
    losail:        '🇶🇦',  // R22 Qatar
    yas_marina:    '🇦🇪',  // R23 Abu Dhabi
};

export function getTeamColor(constructorId) {
    return TEAM_COLORS[constructorId] ?? '#888888';
}

export function getDriverFlag(nationality) {
    const key = nationality?.replace(' ', '_');
    return FLAG_MAP[key] ?? '🏁';
}

export function getCircuitFlag(circuitId) {
    return CIRCUIT_FLAG[circuitId] ?? '🏁';
}

export function formatSessionTime(dateStr, timeStr) {
    if (!dateStr)
        return '—';
    try {
        const iso   = timeStr ? `${dateStr}T${timeStr}` : `${dateStr}T00:00:00Z`;
        const dt    = GLib.DateTime.new_from_iso8601(iso, GLib.TimeZone.new_utc());
        if (!dt)
            return dateStr;
        const local = dt.to_local();
        const day   = local.format('%a %d %b');
        const hour  = local.format('%H:%M');
        return timeStr ? `${day}  ${hour}` : day;
    } catch {
        return dateStr;
    }
}

export function formatCountdown(raceDateStr, raceTimeStr) {
    try {
        const iso    = raceTimeStr ? `${raceDateStr}T${raceTimeStr}` : `${raceDateStr}T14:00:00Z`;
        const raceDt = GLib.DateTime.new_from_iso8601(iso, GLib.TimeZone.new_utc());
        if (!raceDt)
            return '';
        const now     = GLib.DateTime.new_now_utc();
        const diffSec = raceDt.difference(now) / 1000000;
        if (diffSec <= 0)
            return 'In corso o conclusa';
        const days  = Math.floor(diffSec / 86400);
        const hours = Math.floor((diffSec % 86400) / 3600);
        const mins  = Math.floor((diffSec % 3600) / 60);
        if (days > 0)
            return `tra ${days}g ${hours}h`;
        if (hours > 0)
            return `tra ${hours}h ${mins}m`;
        return `tra ${mins} minuti`;
    } catch {
        return '';
    }
}

export function abbreviateName(familyName) {
    return (familyName ?? '').substring(0, 3).toUpperCase();
}

export function maxPoints(standings) {
    if (!standings?.length)
        return 1;
    return Math.max(...standings.map(s => parseFloat(s.points) || 0)) || 1;
}