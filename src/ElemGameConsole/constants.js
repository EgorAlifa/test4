export const PLATFORMS = [
    {
        id: 'nes',
        name: 'NES / Денди',
        short: 'NES',
        color: '#e60012',
        emoji: '🎮',
        extensions: ['.nes']
    },
    {
        id: 'segaMD',
        name: 'Sega Mega Drive',
        short: 'SEGA MD',
        color: '#1a6dd5',
        emoji: '🔵',
        extensions: ['.md', '.gen', '.smd']
    },
    {
        id: 'segaMS',
        name: 'Sega Master System',
        short: 'SEGA SMS',
        color: '#0047ab',
        emoji: '🎯',
        extensions: ['.sms']
    },
    {
        id: 'segaGG',
        name: 'Sega Game Gear',
        short: 'GAME GEAR',
        color: '#e8b84b',
        emoji: '📟',
        extensions: ['.gg']
    },
    {
        id: 'snes',
        name: 'SNES',
        short: 'SNES',
        color: '#7b5ea7',
        emoji: '🟣',
        extensions: ['.sfc', '.smc']
    },
    {
        id: 'gb',
        name: 'Game Boy',
        short: 'GB',
        color: '#8bac0f',
        emoji: '🟢',
        extensions: ['.gb']
    },
    {
        id: 'gbc',
        name: 'Game Boy Color',
        short: 'GBC',
        color: '#00a1e8',
        emoji: '🌈',
        extensions: ['.gbc']
    },
    {
        id: 'gba',
        name: 'Game Boy Advance',
        short: 'GBA',
        color: '#9b2335',
        emoji: '🔴',
        extensions: ['.gba']
    },
    {
        id: 'n64',
        name: 'Nintendo 64',
        short: 'N64',
        color: '#00a550',
        emoji: '🟩',
        extensions: ['.n64', '.z64', '.v64']
    },
    {
        id: 'psx',
        name: 'PlayStation',
        short: 'PS1',
        color: '#003087',
        emoji: '🎲',
        extensions: ['.bin', '.iso', '.cue', '.pbp', '.chd']
    }
];

export const EXT_TO_PLATFORM = PLATFORMS.reduce((acc, platform) => {
    platform.extensions.forEach((ext) => {
        acc[ext] = platform;
    });
    return acc;
}, {});

export const PLATFORM_MAP = PLATFORMS.reduce((acc, platform) => {
    acc[platform.id] = platform;
    return acc;
}, {});

export const UNKNOWN_PLATFORM = {
    id: 'unknown',
    name: 'Unknown',
    short: '???',
    color: '#555',
    emoji: '🕹',
    extensions: []
};
