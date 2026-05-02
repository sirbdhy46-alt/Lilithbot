/**
 * Central per-guild configuration store
 * Persists to data/guild_config.json
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const CONFIG_FILE = join(DATA_DIR, 'guild_config.json');

function load() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(CONFIG_FILE)) return {};
  try { return JSON.parse(readFileSync(CONFIG_FILE, 'utf8')); } catch { return {}; }
}

function save(data) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}

function getGuild(guildId) {
  const data = load();
  if (!data[guildId]) data[guildId] = {};
  return { data, guild: data[guildId] };
}

// ─── Prefix ───────────────────────────────────────────────────
export function getPrefix(guildId) {
  const { guild } = getGuild(guildId);
  return guild.prefix ?? '!';
}

export function setPrefix(guildId, prefix) {
  const { data, guild } = getGuild(guildId);
  guild.prefix = prefix;
  data[guildId] = guild;
  save(data);
}

export function resetPrefix(guildId) {
  setPrefix(guildId, '!');
}

// ─── Log channel ──────────────────────────────────────────────
export function getLogChannel(guildId) {
  const { guild } = getGuild(guildId);
  return guild.logChannelId ?? null;
}

export function setLogChannel(guildId, channelId) {
  const { data, guild } = getGuild(guildId);
  guild.logChannelId = channelId;
  data[guildId] = guild;
  save(data);
}

// ─── Mod role ─────────────────────────────────────────────────
export function getModRole(guildId) {
  const { guild } = getGuild(guildId);
  return guild.modRoleId ?? null;
}

export function setModRole(guildId, roleId) {
  const { data, guild } = getGuild(guildId);
  guild.modRoleId = roleId;
  data[guildId] = guild;
  save(data);
}

// ─── Admin role ───────────────────────────────────────────────
export function getAdminRole(guildId) {
  const { guild } = getGuild(guildId);
  return guild.adminRoleId ?? null;
}

export function setAdminRole(guildId, roleId) {
  const { data, guild } = getGuild(guildId);
  guild.adminRoleId = roleId;
  data[guildId] = guild;
  save(data);
}

// ─── Autorole ─────────────────────────────────────────────────
export function getAutoroles(guildId) {
  const { guild } = getGuild(guildId);
  return guild.autoroles ?? { humans: [], bots: [] };
}

export function addAutorole(guildId, roleId, type = 'humans') {
  const { data, guild } = getGuild(guildId);
  if (!guild.autoroles) guild.autoroles = { humans: [], bots: [] };
  if (!guild.autoroles[type].includes(roleId)) guild.autoroles[type].push(roleId);
  data[guildId] = guild;
  save(data);
}

export function removeAutorole(guildId, roleId) {
  const { data, guild } = getGuild(guildId);
  if (!guild.autoroles) return;
  guild.autoroles.humans = guild.autoroles.humans.filter(r => r !== roleId);
  guild.autoroles.bots = guild.autoroles.bots.filter(r => r !== roleId);
  data[guildId] = guild;
  save(data);
}

// ─── Welcome / Greet ─────────────────────────────────────────
export function getGreet(guildId) {
  const { guild } = getGuild(guildId);
  return guild.greet ?? null;
}

export function setGreet(guildId, config) {
  const { data, guild } = getGuild(guildId);
  guild.greet = { ...guild.greet, ...config };
  data[guildId] = guild;
  save(data);
}

export function resetGreet(guildId) {
  const { data, guild } = getGuild(guildId);
  delete guild.greet;
  data[guildId] = guild;
  save(data);
}

// ─── Goodbye ─────────────────────────────────────────────────
export function getGoodbye(guildId) {
  const { guild } = getGuild(guildId);
  return guild.goodbye ?? null;
}

export function setGoodbye(guildId, config) {
  const { data, guild } = getGuild(guildId);
  guild.goodbye = { ...guild.goodbye, ...config };
  data[guildId] = guild;
  save(data);
}

// ─── Automod ──────────────────────────────────────────────────
export function getAutomod(guildId) {
  const { guild } = getGuild(guildId);
  return guild.automod ?? { enabled: false, antiLinks: false, antiSpam: false, antiCaps: false, antiMentions: false, mentionLimit: 5, logChannelId: null, ignoredRoles: [], ignoredChannels: [] };
}

export function setAutomod(guildId, config) {
  const { data, guild } = getGuild(guildId);
  guild.automod = { ...getAutomod(guildId), ...config };
  data[guildId] = guild;
  save(data);
}

// ─── Antinuke ─────────────────────────────────────────────────
export function getAntinuke(guildId) {
  const { guild } = getGuild(guildId);
  return guild.antinuke ?? { enabled: false, whitelist: [], punishment: 'ban', banLimit: 3, kickLimit: 5, channelLimit: 3, roleLimit: 5, webhookLimit: 3, logChannelId: null };
}

export function setAntinuke(guildId, config) {
  const { data, guild } = getGuild(guildId);
  guild.antinuke = { ...getAntinuke(guildId), ...config };
  data[guildId] = guild;
  save(data);
}

export function addAntinukeWhitelist(guildId, userId) {
  const { data, guild } = getGuild(guildId);
  const an = getAntinuke(guildId);
  if (!an.whitelist.includes(userId)) an.whitelist.push(userId);
  guild.antinuke = an;
  data[guildId] = guild;
  save(data);
}

export function removeAntinukeWhitelist(guildId, userId) {
  const { data, guild } = getGuild(guildId);
  const an = getAntinuke(guildId);
  an.whitelist = an.whitelist.filter(id => id !== userId);
  guild.antinuke = an;
  data[guildId] = guild;
  save(data);
}

// ─── Ignore system ───────────────────────────────────────────
export function getIgnore(guildId) {
  const { guild } = getGuild(guildId);
  return guild.ignore ?? { channels: [], roles: [] };
}

export function addIgnore(guildId, id, type = 'channels') {
  const { data, guild } = getGuild(guildId);
  if (!guild.ignore) guild.ignore = { channels: [], roles: [] };
  if (!guild.ignore[type].includes(id)) guild.ignore[type].push(id);
  data[guildId] = guild;
  save(data);
}

export function removeIgnore(guildId, id) {
  const { data, guild } = getGuild(guildId);
  if (!guild.ignore) return;
  guild.ignore.channels = guild.ignore.channels.filter(x => x !== id);
  guild.ignore.roles = guild.ignore.roles.filter(x => x !== id);
  data[guildId] = guild;
  save(data);
}

export function resetIgnore(guildId) {
  const { data, guild } = getGuild(guildId);
  delete guild.ignore;
  data[guildId] = guild;
  save(data);
}

// ─── AFK ─────────────────────────────────────────────────────
export function getAfk(guildId, userId) {
  const { guild } = getGuild(guildId);
  return guild.afk?.[userId] ?? null;
}

export function setAfk(guildId, userId, reason) {
  const { data, guild } = getGuild(guildId);
  if (!guild.afk) guild.afk = {};
  guild.afk[userId] = { reason, timestamp: Date.now() };
  data[guildId] = guild;
  save(data);
}

export function clearAfk(guildId, userId) {
  const { data, guild } = getGuild(guildId);
  if (guild.afk) delete guild.afk[userId];
  data[guildId] = guild;
  save(data);
}

// ─── VC Roles ─────────────────────────────────────────────────
/**
 * Each entry: { roleId: string, channelId: string|null }
 * channelId null = triggers on joining ANY voice channel
 */
export function getVcRoles(guildId) {
  const { guild } = getGuild(guildId);
  return guild.vcroles ?? [];
}

export function addVcRole(guildId, roleId, channelId = null) {
  const { data, guild } = getGuild(guildId);
  if (!guild.vcroles) guild.vcroles = [];
  const exists = guild.vcroles.some(v => v.roleId === roleId && v.channelId === channelId);
  if (!exists) guild.vcroles.push({ roleId, channelId });
  data[guildId] = guild;
  save(data);
}

export function removeVcRole(guildId, roleId, channelId = undefined) {
  const { data, guild } = getGuild(guildId);
  if (!guild.vcroles) return;
  if (channelId === undefined) {
    guild.vcroles = guild.vcroles.filter(v => v.roleId !== roleId);
  } else {
    guild.vcroles = guild.vcroles.filter(v => !(v.roleId === roleId && v.channelId === channelId));
  }
  data[guildId] = guild;
  save(data);
}

export function resetVcRoles(guildId) {
  const { data, guild } = getGuild(guildId);
  delete guild.vcroles;
  data[guildId] = guild;
  save(data);
}

// ─── Vanity Role ──────────────────────────────────────────────
export function getVanity(guildId) {
  const { guild } = getGuild(guildId);
  return guild.vanity ?? null;
}

export function setVanity(guildId, config) {
  const { data, guild } = getGuild(guildId);
  guild.vanity = { ...guild.vanity, ...config };
  data[guildId] = guild;
  save(data);
}

export function resetVanity(guildId) {
  const { data, guild } = getGuild(guildId);
  delete guild.vanity;
  data[guildId] = guild;
  save(data);
}

export function updateVanityUses(guildId, uses) {
  const { data, guild } = getGuild(guildId);
  if (guild.vanity) {
    guild.vanity.lastUses = uses;
    data[guildId] = guild;
    save(data);
  }
}

// ─── Emergency Lockdown ───────────────────────────────────────
export function getEmergency(guildId) {
  const { guild } = getGuild(guildId);
  return guild.emergency ?? { locked: false, lockedAt: null, lockedBy: null, logChannelId: null };
}

export function setEmergency(guildId, config) {
  const { data, guild } = getGuild(guildId);
  guild.emergency = { ...getEmergency(guildId), ...config };
  data[guildId] = guild;
  save(data);
}

// ─── Antibetray ───────────────────────────────────────────────
export function getAntibetray(guildId) {
  const { guild } = getGuild(guildId);
  return guild.antibetray ?? {
    enabled: false,
    whitelist: [],
    punishment: 'ban',
    banThreshold: 3,
    channelDeleteThreshold: 2,
    roleDeleteThreshold: 2,
    webhookCreateThreshold: 3,
    windowMs: 10000,
    logChannelId: null,
  };
}

export function setAntibetray(guildId, config) {
  const { data, guild } = getGuild(guildId);
  guild.antibetray = { ...getAntibetray(guildId), ...config };
  data[guildId] = guild;
  save(data);
}

export function addAntibetrayWhitelist(guildId, userId) {
  const { data, guild } = getGuild(guildId);
  const ab = getAntibetray(guildId);
  if (!ab.whitelist.includes(userId)) ab.whitelist.push(userId);
  guild.antibetray = ab;
  data[guildId] = guild;
  save(data);
}

export function removeAntibetrayWhitelist(guildId, userId) {
  const { data, guild } = getGuild(guildId);
  const ab = getAntibetray(guildId);
  ab.whitelist = ab.whitelist.filter(id => id !== userId);
  guild.antibetray = ab;
  data[guildId] = guild;
  save(data);
}

// ─── Full config dump ─────────────────────────────────────────
export function getFullConfig(guildId) {
  const { guild } = getGuild(guildId);
  return guild;
}
