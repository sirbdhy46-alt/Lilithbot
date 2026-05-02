import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, errorEmbed, THEME, DIVIDER_FANCY, DIVIDER_STARS, EMOJI } from '../../utils/embedBuilder.js';
import { getGif } from '../../utils/getGif.js';

export const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription('Timeout (mute) a member')
  .addUserOption(opt => opt.setName('user').setDescription('User to mute').setRequired(true))
  .addIntegerOption(opt => opt.setName('minutes').setDescription('Duration in minutes (max 40320 = 28 days)').setMinValue(1).setMaxValue(40320).setRequired(true))
  .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction) {
  await interaction.deferReply();

  const target = interaction.options.getMember('user');
  const minutes = interaction.options.getInteger('minutes');
  const reason = interaction.options.getString('reason') ?? 'No reason provided';

  if (!target)
    return interaction.editReply({ embeds: [errorEmbed('Not Found', 'That user is not in this server.')] });
  if (!target.moderatable)
    return interaction.editReply({ embeds: [errorEmbed('Cannot Mute', `${EMOJI.blobangry} I cannot mute this member — they may have a higher role.`)] });

  const gifUrl = await getGif('bite');

  try {
    await target.timeout(minutes * 60 * 1000, reason);

    const d = Math.floor(minutes / 1440);
    const h = Math.floor((minutes % 1440) / 60);
    const m = minutes % 60;
    const dur = [d && `${d}d`, h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ') || `${minutes}m`;
    const expiresAt = `<t:${Math.floor((Date.now() + minutes * 60 * 1000) / 1000)}:R>`;

    await interaction.editReply({
      embeds: [createEmbed({
        color: THEME.info,
        title: `${EMOJI.mute} Member Muted`,
        description: [
          DIVIDER_FANCY, ``,
          `${EMOJI.nekopolice} **${target.user.username}** has been **timed out**.`,
          ``,
          DIVIDER_STARS,
          `${EMOJI.bullet} **User** ─── ${target.user}`,
          `${EMOJI.bullet} **Duration** ─── \`${dur}\``,
          `${EMOJI.bullet} **Expires** ─── ${expiresAt}`,
          `${EMOJI.bullet} **Reason** ─── ${reason}`,
          `${EMOJI.bullet} **Moderator** ─── ${interaction.user}`,
          ``,
          DIVIDER_FANCY,
        ].join('\n'),
        image: gifUrl,
        footer: { text: `${EMOJI.police} Muted by ${interaction.user.username}` },
      })],
    });

    try {
      await target.send({
        embeds: [createEmbed({
          color: THEME.info,
          title: `${EMOJI.mute} You were timed out`,
          description: [
            DIVIDER_FANCY, ``,
            `You were **timed out** in **${interaction.guild.name}**.`,
            ``,
            `${EMOJI.bullet} **Duration:** \`${dur}\``,
            `${EMOJI.bullet} **Reason:** ${reason}`,
            `${EMOJI.bullet} **Moderator:** ${interaction.user.username}`,
            ``,
            DIVIDER_FANCY,
          ].join('\n'),
        })],
      });
    } catch {}
  } catch (err) {
    await interaction.editReply({ embeds: [errorEmbed('Mute Failed', err.message)] });
  }
}
