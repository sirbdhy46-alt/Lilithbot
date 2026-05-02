import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const WARN_FILE = join(DATA_DIR, 'warnings.json');

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function load() {
  ensureDataDir();
  if (!existsSync(WARN_FILE)) return {};
  try {
    return JSON.parse(readFileSync(WARN_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function save(data) {
  ensureDataDir();
  writeFileSync(WARN_FILE, JSON.stringify(data, null, 2));
}

export function addWarning(guildId, userId, moderatorId, reason) {
  const data = load();
  const key = `${guildId}:${userId}`;
  if (!data[key]) data[key] = [];
  const warn = {
    id: Date.now(),
    moderatorId,
    reason,
    timestamp: Date.now(),
  };
  data[key].push(warn);
  save(data);
  return { warn, total: data[key].length };
}

export function getWarnings(guildId, userId) {
  const data = load();
  const key = `${guildId}:${userId}`;
  return data[key] ?? [];
}

export function removeWarning(guildId, userId, warnId) {
  const data = load();
  const key = `${guildId}:${userId}`;
  if (!data[key]) return false;
  const before = data[key].length;
  data[key] = data[key].filter(w => w.id !== parseInt(warnId));
  save(data);
  return data[key].length < before;
}

export function clearWarnings(guildId, userId) {
  const data = load();
  const key = `${guildId}:${userId}`;
  const count = data[key]?.length ?? 0;
  delete data[key];
  save(data);
  return count;
}
