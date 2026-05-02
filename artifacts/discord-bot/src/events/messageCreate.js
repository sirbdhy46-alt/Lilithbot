import { parsePrefixMessage, PrefixContext } from '../utils/prefixHandler.js';
import { errorEmbed, infoEmbed, EMOJI } from '../utils/embedBuilder.js';
import { getPrefix, getAfk, clearAfk, getAutomod } from '../utils/guildConfig.js';

export const name = 'messageCreate';
export const once = false;

// Anti-spam tracking: userId → { count, resetAt }
const spamTracker = new Map();
// Anti-link regex
const LINK_REGEX = /https?:\/\/|discord\.gg\/|\.gg\//i;

export async function execute(message) {
  if (!message.guild) return;
  if (message.author.bot) return;

  const guildId = message.guild.id;

  // ── AFK: check if user is returning from AFK ──────────────────────────────
  const afk = getAfk(guildId, message.author.id);
  if (afk) {
    clearAfk(guildId, message.author.id);
    const mins = Math.floor((Date.now() - afk.timestamp) / 60000);
    try {
      const reply = await message.reply({
        embeds: [infoEmbed('Welcome Back!', `${EMOJI.check} AFK removed. You were away for **${mins} min**.`)],
      });
      setTimeout(() => reply.delete().catch(() => {}), 8000);
    } catch {}
  }

  // ── AFK: notify sender if they ping an AFK user ───────────────────────────
  if (message.mentions.users.size) {
    for (const [userId] of message.mentions.users) {
      const targetAfk = getAfk(guildId, userId);
      if (targetAfk) {
        const since = Math.floor((Date.now() - targetAfk.timestamp) / 60000);
        try {
          const reply = await message.reply({
            embeds: [infoEmbed('User is AFK', `${EMOJI.bell} <@${userId}> is AFK: **${targetAfk.reason}** *(${since}m ago)*`)],
          });
          setTimeout(() => reply.delete().catch(() => {}), 10000);
        } catch {}
      }
    }
  }

  // ── Automod ────────────────────────────────────────────────────────────────
  const automod = getAutomod(guildId);
  if (automod.enabled) {
    const member = message.member;
    const isStaff = member?.permissions?.has('ManageMessages') || member?.permissions?.has('Administrator');

    if (!isStaff) {
      // Anti-links
      if (automod.antiLinks && LINK_REGEX.test(message.content)) {
        await message.delete().catch(() => {});
        const warn = await message.channel.send({
          embeds: [errorEmbed('Link Blocked', `${EMOJI.warn} ${message.author}, links are not allowed in this server.`)],
        });
        setTimeout(() => warn.delete().catch(() => {}), 6000);
        return;
      }

      // Anti-caps (>70% caps in messages longer than 10 chars)
      if (automod.antiCaps && message.content.length > 10) {
        const upper = message.content.replace(/[^A-Za-z]/g, '');
        if (upper.length > 0 && (message.content.replace(/[^A-Z]/g, '').length / upper.length) > 0.7) {
          await message.delete().catch(() => {});
          const warn = await message.channel.send({
            embeds: [errorEmbed('Caps Blocked', `${EMOJI.warn} ${message.author}, please don't use excessive CAPS.`)],
          });
          setTimeout(() => warn.delete().catch(() => {}), 6000);
          return;
        }
      }

      // Anti-mentions
      if (automod.antiMentions && message.mentions.users.size >= (automod.mentionLimit ?? 5)) {
        await message.delete().catch(() => {});
        const warn = await message.channel.send({
          embeds: [errorEmbed('Mass Mention Blocked', `${EMOJI.warn} ${message.author}, too many mentions at once!`)],
        });
        setTimeout(() => warn.delete().catch(() => {}), 6000);
        return;
      }

      // Anti-spam (5 messages in 5 seconds)
      if (automod.antiSpam) {
        const key = `${guildId}:${message.author.id}`;
        const now = Date.now();
        const track = spamTracker.get(key) ?? { count: 0, resetAt: now + 5000 };
        if (now > track.resetAt) { track.count = 0; track.resetAt = now + 5000; }
        track.count++;
        spamTracker.set(key, track);

        if (track.count >= 5) {
          await message.delete().catch(() => {});
          if (track.count === 5) {
            try {
              await member.timeout(60000, 'Automod: Spam detected');
              const warn = await message.channel.send({
                embeds: [errorEmbed('Spam Detected', `${EMOJI.mute} ${message.author} has been timed out for **1 minute** for spamming.`)],
              });
              setTimeout(() => warn.delete().catch(() => {}), 8000);
            } catch {}
          }
          return;
        }
      }
    }
  }

  // ── Prefix command handler ─────────────────────────────────────────────────
  const prefix = getPrefix(guildId);
  const parsed = parsePrefixMessage(message.content, prefix);
  if (!parsed) return;

  const { commandName, args } = parsed;
  const command = message.client.commands.get(commandName);
  if (!command) return;

  const ctx = new PrefixContext(message, args, commandName);

  try {
    await command.execute(ctx);
  } catch (error) {
    console.error(`Prefix error in ${prefix}${commandName}:`, error);
    try {
      await message.reply({ embeds: [errorEmbed('Command Error', `${error.message}`)] });
    } catch {}
  }
}
