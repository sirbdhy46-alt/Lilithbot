import { createEmbed, THEME, DIVIDER_STARS, h2, bold, italic, row, rowRaw, EMOJI } from '../utils/embedBuilder.js';
import { getGreet, getAutoroles, getVanity, updateVanityUses } from '../utils/guildConfig.js';

export const name = 'guildMemberAdd';
export const once = false;

export async function execute(member) {
  const guild = member.guild;
  const guildId = guild.id;
  const client = member.client;

  // ── Vanity invite tracking ──────────────────────────────────────────────────
  try {
    const vanity = getVanity(guildId);
    if (vanity?.inviteCode) {
      const cachedInvites = client.inviteCache?.get(guildId) ?? new Map();
      const currentInvites = await guild.invites.fetch().catch(() => null);

      if (currentInvites) {
        // Find the invite whose use count increased
        let usedCode = null;
        for (const [code, invite] of currentInvites) {
          const prevUses = cachedInvites.get(code) ?? 0;
          if (invite.uses > prevUses) { usedCode = code; break; }
        }

        // Update invite cache
        client.inviteCache.set(guildId, new Map(currentInvites.map(i => [i.code, i.uses])));

        // Assign vanity role if they used the vanity invite
        if (usedCode === vanity.inviteCode) {
          updateVanityUses(guildId, currentInvites.get(usedCode)?.uses ?? 0);
          const role = guild.roles.cache.get(vanity.roleId);
          if (role && role.position < guild.members.me.roles.highest.position) {
            await member.roles.add(role, `Vanity invite: ${vanity.label ?? usedCode}`).catch(() => {});
          }
        }
      }
    }
  } catch {}

  // ── Apply autoroles ─────────────────────────────────────────────────────────
  try {
    const autoroles = getAutoroles(guildId);
    const isBot = member.user.bot;
    const roleIds = isBot ? autoroles.bots : autoroles.humans;

    for (const roleId of roleIds) {
      const role = guild.roles.cache.get(roleId);
      if (role && role.position < guild.members.me.roles.highest.position) {
        await member.roles.add(role, 'Autorole').catch(() => {});
      }
    }
  } catch {}

  // ── Send welcome message ────────────────────────────────────────────────────
  try {
    const greet = getGreet(guildId);
    const memberNumber = guild.memberCount;
    const accountAge = Math.floor((Date.now() - member.user.createdTimestamp) / 86400000);
    const joinedAt = `<t:${Math.floor(Date.now() / 1000)}:R>`;
    const newAccount = accountAge < 7;

    const buildWelcomeEmbed = (msgText) => createEmbed({
      color: THEME.success,
      title: `🎉  Welcome to ${guild.name}!`,
      description: [
        h2(`👋 Welcome, ${member.user.username}!`),
        `> *A new member has arrived in ${guild.name}.*`,
        ``,
        rowRaw('Mention', member.user),
        row('Member #', memberNumber.toLocaleString()),
        row('Account Age', `${accountAge} day${accountAge !== 1 ? 's' : ''}`) + (newAccount ? '  ⚠️ ' + italic('New Account') : ''),
        rowRaw('Joined', joinedAt),
        msgText ? `\n> ${italic(msgText)}` : '',
      ].filter(Boolean).join('\n'),
      thumbnail: member.user.displayAvatarURL({ dynamic: true, size: 256 }),
      footer: { text: `Lilith Protector  •  Member #${memberNumber.toLocaleString()}` },
    });

    if (greet?.channelId) {
      const channel = guild.channels.cache.get(greet.channelId);
      if (channel) {
        const msgText = greet.message
          ? greet.message
              .replace('{user}', member.user.toString())
              .replace('{server}', guild.name)
              .replace('{count}', memberNumber)
          : null;
        await channel.send({ embeds: [buildWelcomeEmbed(msgText)] }).catch(() => {});
        return;
      }
    }

    const systemChannel = guild.systemChannel;
    if (systemChannel) await systemChannel.send({ embeds: [buildWelcomeEmbed(null)] }).catch(() => {});
  } catch {}
}
