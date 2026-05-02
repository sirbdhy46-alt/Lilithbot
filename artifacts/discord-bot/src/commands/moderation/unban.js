import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Unban a user by their ID')
  .addStringOption(opt => opt.setName('userid').setDescription('The user ID to unban').setRequired(true))
  .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

export async function execute(interaction) {
  const userId = interaction.options.getString('userid');
  const reason = interaction.options.getString('reason') ?? 'No reason provided';

  try {
    const ban = await interaction.guild.bans.fetch(userId);
    await interaction.guild.members.unban(userId, reason);
    await interaction.reply({
      embeds: [successEmbed('User Unbanned', [
        `${EMOJI.public} **${ban.user.tag}** has been unbanned.`,
        ``,
        `${EMOJI.arrow} **Reason:** ${reason}`,
        `${EMOJI.arrow} **Moderator:** ${interaction.user.tag}`,
      ].join('\n'))],
    });
  } catch {
    await interaction.reply({ embeds: [errorEmbed('Not Banned', `No ban found for ID \`${userId}\`.`)], ephemeral: true });
  }
}
