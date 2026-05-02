import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, errorEmbed, THEME, DIVIDER_FANCY, DIVIDER_STARS, EMOJI } from '../../utils/embedBuilder.js';
import { getGif } from '../../utils/getGif.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kick a member from the server')
  .addUserOption(opt => opt.setName('user').setDescription('User to kick').setRequired(true))
  .addStringOption(opt => opt.setName('reason').setDescription('Reason for the kick').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

export async function execute(interaction) {
  await interaction.deferReply();

  const target = interaction.options.getMember('user');
  const reason = interaction.options.getString('reason') ?? 'No reason provided';

  if (!target)
    return interaction.editReply({ embeds: [errorEmbed('Not Found', `${EMOJI.blobthink} That user is not in this server.`)] });
  if (!target.kickable)
    return interaction.editReply({ embeds: [errorEmbed('Cannot Kick', `${EMOJI.blobangry} I cannot kick **${target.user.username}** — higher role.`)] });

  const gifUrl = await getGif('kick');

  try {
    await target.kick(reason);
    await interaction.editReply({
      embeds: [createEmbed({
        color: THEME.warning,
        title: `${EMOJI.blobninja} Member Kicked`,
        description: [
          DIVIDER_FANCY, ``,
          `${EMOJI.blobsaluteban} **${target.user.username}** has been **kicked** from the server.`,
          ``,
          DIVIDER_STARS,
          `${EMOJI.bullet} **User** ─── ${target.user} (\`${target.user.id}\`)`,
          `${EMOJI.bullet} **Reason** ─── ${reason}`,
          `${EMOJI.bullet} **Moderator** ─── ${interaction.user}`,
          `${EMOJI.bullet} **Date** ─── <t:${Math.floor(Date.now() / 1000)}:F>`,
          ``,
          DIVIDER_FANCY,
        ].join('\n'),
        image: gifUrl,
        footer: { text: `${EMOJI.ninjamad} Kicked by ${interaction.user.username}` },
      })],
    });
  } catch (err) {
    await interaction.editReply({ embeds: [errorEmbed('Kick Failed', `${EMOJI.triggered} ${err.message}`)] });
  }
}
