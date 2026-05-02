import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('nick')
  .setDescription("Change or reset a member's nickname")
  .addUserOption(opt => opt.setName('user').setDescription('Target member').setRequired(true))
  .addStringOption(opt => opt.setName('nickname').setDescription('New nickname (leave empty to reset)').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames);

export async function execute(interaction) {
  const member = interaction.options.getMember('user');
  const nick = interaction.options.getString('nickname') ?? null;

  if (!member) return interaction.reply({ embeds: [errorEmbed('Not Found', 'Member not found.')], ephemeral: true });

  try {
    const old = member.displayName;
    await member.setNickname(nick);
    await interaction.reply({
      embeds: [successEmbed('Nickname Updated', [
        `${EMOJI.user} **${member.user.tag}**`,
        ``,
        `${EMOJI.arrow} **Before:** ${old}`,
        `${EMOJI.arrow} **After:** ${nick ?? member.user.username}`,
      ].join('\n'))],
    });
  } catch (err) {
    await interaction.reply({ embeds: [errorEmbed('Failed', err.message)], ephemeral: true });
  }
}
