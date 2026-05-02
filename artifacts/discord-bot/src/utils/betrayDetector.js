/**
 * Antibetray detection engine.
 * Uses an in-memory sliding-window counter to detect rapid destructive actions
 * by server staff, then punishes and alerts automatically.
 */

import { PermissionFlagsBits } from 'discord.js';
import { createEmbed, THEME, h2, h3, bold, row, italic } from './embedBuilder.js';
import { getAntibetray, getLogChannel } from './guildConfig.js';

// ── Action window store ───────────────────────────────────────────────────────
// Map<`${guildId}:${userId}:${action}`, number[]>  (timestamps in ms)
const _store = new Map();

/**
 * Record one action and return the current count within the window.
 */
export function trackAction(guildId, userId, action, windowMs = 10_000) {
  const key = `${guildId}:${userId}:${action}`;
  const now = Date.now();
  const prev = (_store.get(key) ?? []).filter(t => now - t < windowMs);
  prev.push(now);
  _store.set(key, prev);
  return prev.length;
}

export function clearTrack(guildId, userId, action) {
  _store.delete(`${guildId}:${userId}:${action}`);
}

// ── Dangerous permission bits ─────────────────────────────────────────────────
const DANGER_PERMS = [
  PermissionFlagsBits.Administrator,
  PermissionFlagsBits.BanMembers,
  PermissionFlagsBits.KickMembers,
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.ManageRoles,
  PermissionFlagsBits.ManageGuild,
  PermissionFlagsBits.ManageWebhooks,
  PermissionFlagsBits.MentionEveryone,
];

/**
 * Fetch the executor of the most recent audit log entry of a given type.
 * Returns null if unable to fetch.
 */
export async function getAuditExecutor(guild, auditType) {
  try {
    const log = await guild.fetchAuditLogs({ type: auditType, limit: 1 });
    const entry = log.entries.first();
    if (!entry) return null;
    // Only trust recent entries (within 5 seconds)
    if (Date.now() - entry.createdTimestamp > 5000) return null;
    return entry.executor;
  } catch {
    return null;
  }
}

/**
 * Punish a user who has been detected betraying the server.
 * Strips dangerous permissions from their roles, then bans/kicks.
 */
export async function punish(guild, userId, reason, punishment = 'ban') {
  const me = guild.members.me;
  let member = guild.members.cache.get(userId);
  if (!member) {
    member = await guild.members.fetch(userId).catch(() => null);
  }

  // ── 1. Strip dangerous roles ─────────────────────────────────────────────
  if (member) {
    for (const role of member.roles.cache.values()) {
      if (role.managed || role.id === guild.id) continue;
      if (!me || me.roles.highest.position <= role.position) continue;
      const hasDanger = DANGER_PERMS.some(p => role.permissions.has(p));
      if (hasDanger) {
        await member.roles.remove(role, `Antibetray: ${reason}`).catch(() => {});
      }
    }

    // Also timeout them immediately (max 28 days)
    await member.timeout(28 * 24 * 60 * 60 * 1000, `Antibetray: ${reason}`).catch(() => {});
  }

  // ── 2. Execute punishment ────────────────────────────────────────────────
  if (punishment === 'ban') {
    await guild.bans.create(userId, {
      reason: `[Antibetray] ${reason}`,
      deleteMessageSeconds: 86400,
    }).catch(() => {});
  } else if (punishment === 'kick' && member) {
    await member.kick(`[Antibetray] ${reason}`).catch(() => {});
  }
}

/**
 * Send a betrayal alert embed to the configured log channel.
 */
export async function sendBetrayalAlert(guild, { userId, username, action, count, threshold, punishment }) {
  const ab = getAntibetray(guild.id);
  const channelId = ab.logChannelId ?? getLogChannel(guild.id);
  if (!channelId) return;

  const channel = guild.channels.cache.get(channelId);
  if (!channel) return;

  const punishLabel = { ban: '🔨 Banned', kick: '👢 Kicked', timeout: '⏸️ Timed Out' }[punishment] ?? punishment;

  const embed = createEmbed({
    color: 0xFF0000,
    title: `🚨  Antibetray Triggered`,
    description: [
      h2('⚔️ Betrayal Detected'),
      `>>> A trusted member attempted to **destroy this server** and was automatically punished.`,
      ``,
      h3('👤 Offender'),
      row('User', `${username} (${userId})`),
      row('Action', action),
      row('Count', `${count} in 10s (limit: ${threshold})`),
      ``,
      h3('⚖️ Punishment'),
      `> ${bold(punishLabel)}`,
      `> ${italic('All dangerous permissions stripped before punishment.')}`,
    ].join('\n'),
    footer: { text: 'Lilith Protector  •  Antibetray Module' },
  });

  await channel.send({ content: `@here 🚨 **BETRAYAL DETECTED**`, embeds: [embed] }).catch(() => {});
}
