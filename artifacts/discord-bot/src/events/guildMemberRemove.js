import { createEmbed, THEME, DIVIDER_FANCY, DIVIDER_STARS, DIVIDER_GLOW, EMOJI } from '../utils/embedBuilder.js';
import { getGoodbye } from '../utils/guildConfig.js';

export const name = 'guildMemberRemove';
export const once = false;

const AUTO_DELETE_MS = 23_000;

export async function execute(member) {
  const guild = member.guild;
  const guildId = guild.id;

  const joinedAgo = member.joinedTimestamp
    ? Math.floor((Date.now() - member.joinedTimestamp) / 86400000)
    : null;

  const embed = createEmbed({
    color: 0x2B2D31,
    title: `👋  ${member.user.username} left the server`,
    description: [
      DIVIDER_GLOW, ``,
      `> ${member.user} has left **${guild.name}**.`,
      ``,
      DIVIDER_STARS,
      `▸ **User** ────────── ${member.user}`,
      joinedAgo !== null ? `▸ **Was here for** ── \`${joinedAgo} day${joinedAgo !== 1 ? 's' : ''}\`` : '',
      `▸ **Members now** ── \`${guild.memberCount.toLocaleString()}\``,
      ``,
      DIVIDER_GLOW,
    ].filter(Boolean).join('\n'),
    thumbnail: member.user.displayAvatarURL({ dynamic: true }),
    footer: { text: `Lilith Protector  •  Goodbye ${member.user.username}  •  Auto-deletes in 23s` },
  });

  const goodbye = getGoodbye(guildId);
  let targetChannel = null;

  if (goodbye?.channelId) {
    targetChannel = guild.channels.cache.get(goodbye.channelId);
  }
  if (!targetChannel) {
    targetChannel = guild.systemChannel;
  }
  if (!targetChannel) return;

  const msg = await targetChannel.send({ embeds: [embed] }).catch(() => null);
  if (msg) {
    setTimeout(() => msg.delete().catch(() => {}), AUTO_DELETE_MS);
  }
}
