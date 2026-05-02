const serverThemes = new Map();

const DEFAULT_THEME = {
  primary: 0xE53E3E,
  success: 0x48BB78,
  error: 0xE53E3E,
  warning: 0xECC94B,
  info: 0x4299E1,
};

export function getTheme(guildId) {
  return serverThemes.get(guildId) ?? { ...DEFAULT_THEME };
}

export function setThemeColor(guildId, key, hexColor) {
  const current = getTheme(guildId);
  current[key] = hexColor;
  serverThemes.set(guildId, current);
}

export function resetTheme(guildId) {
  serverThemes.delete(guildId);
}

export function getPrimaryColor(guildId) {
  return getTheme(guildId).primary;
}

export function parseHex(str) {
  const hex = str.replace('#', '');
  const num = parseInt(hex, 16);
  if (isNaN(num)) return null;
  return num;
}
