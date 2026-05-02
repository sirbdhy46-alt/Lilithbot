import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { createEmbed, errorEmbed, THEME, DIVIDER_FANCY, DIVIDER_STARS, EMOJI } from '../../utils/embedBuilder.js';
import { generateStatsImage } from '../../utils/statsCanvas.js';

export const data = new SlashCommandBuilder()
  .setName('serverstats')
  .setDescription('Generate a beautiful server statistics image');

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const guild = interaction.guild;
    await guild.fetch();

    // Try to get online member count
    let onlineCount = 0;
    try {
      await guild.members.fetch({ withPresences: true });
      onlineCount = guild.members.cache.filter(m => m.presence?.status !== 'offline' && m.presence?.status != null).size;
    } catch {}

    const imgBuffer = await generateStatsImage(guild, onlineCount);
    const attachment = new AttachmentBuilder(imgBuffer, { name: 'server-stats.png' });

    const channels = guild.channels.cache;
    const textCh = channels.filter(c => c.type === 0).size;
    const voiceCh = channels.filter(c => c.type === 2).size;
    const boosts = guild.premiumSubscriptionCount ?? 0;
    const tierMap = ['No Tier', 'Tier 1', 'Tier 2', 'Tier 3'];
    const createdRel = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;

    await interaction.editReply({
      embeds: [createEmbed({
        color: THEME.primary,
        title: `${EMOJI.sparkle} ${guild.name} — Server Statistics`,
        description: [
          DIVIDER_FANCY, ``,
          `${EMOJI.zap} **Members** ─── \`${guild.memberCount.toLocaleString()}\` total  •  \`${onlineCount}\` online`,
          `${EMOJI.channel} **Channels** ─── \`${textCh}\` text  •  \`${voiceCh}\` voice`,
          `${EMOJI.role} **Roles** ─── \`${guild.roles.cache.size}\``,
          `${EMOJI.boost} **Boosts** ─── \`${boosts}\` — ${tierMap[guild.premiumTier] ?? 'No Tier'}`,
          `${EMOJI.calendar} **Created** ─── ${createdRel}`,
          ``,
          DIVIDER_FANCY,
        ].join('\n'),
        image: 'attachment://server-stats.png',
        footer: { text: `${EMOJI.sparkle} Lilith Protector  •  Requested by ${interaction.user.username}` },
      })],
      files: [attachment],
    });
  } catch (err) {
    console.error('[serverstats]', err);
    await interaction.editReply({
      embeds: [errorEmbed('Stats Error', `${EMOJI.triggered} Failed to generate stats image: ${err.message}`)],
    });
  }
}
