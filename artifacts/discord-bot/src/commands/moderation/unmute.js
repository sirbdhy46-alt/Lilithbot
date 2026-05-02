import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('unmute')
  .setDescription('Remove timeout (unmute) from a member')
  .addUserOption(opt => opt.setName('user').setDescription('Member to unmute').setRequired(true))
  .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction) {
  const target = interaction.options.getMember('user');
  const reason = interaction.options.getString('reason') ?? 'No reason provided';

  if (!target) {
    return interaction.reply({ embeds: [errorEmbed('Not Found', 'That member is not in this server.')], ephemeral: true });
  }

  if (!target.communicationDisabledUntil) {
    return interaction.reply({ embeds: [errorEmbed('Not Muted', `**${target.user.tag}** is not currently timed out.`)], ephemeral: true });
  }

  try {
    await target.timeout(null, reason);
    await interaction.reply({
      embeds: [successEmbed('Member Unmuted', [
        `${EMOJI.unmute} **${target.user.tag}** has been unmuted.`,
        ``,
        `${EMOJI.arrow} **Reason:** ${reason}`,
        `${EMOJI.arrow} **Moderator:** ${interaction.user.tag}`,
      ].join('\n'))],
    });

    // DM the unmuted user
    try {
      await target.user.send({
        embeds: [successEmbed('You Have Been Unmuted', [
          `Your timeout in **${interaction.guild.name}** has been lifted.`,
          `${EMOJI.arrow} **Reason:** ${reason}`,
        ].join('\n'))],
      });
    } catch {}
  } catch (err) {
    await interaction.reply({ embeds: [errorEmbed('Unmute Failed', err.message)], ephemeral: true });
  }
}
