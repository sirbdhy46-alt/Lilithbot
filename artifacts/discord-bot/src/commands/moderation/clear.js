import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, warningEmbed, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Bulk delete messages from this channel')
  .addIntegerOption(opt => opt.setName('amount').setDescription('Number of messages to delete (1-100)').setMinValue(1).setMaxValue(100).setRequired(true))
  .addUserOption(opt => opt.setName('user').setDescription('Only delete messages from this user').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction) {
  const amount = interaction.options.getInteger('amount');
  const targetUser = interaction.options.getUser('user');

  await interaction.deferReply({ ephemeral: true });

  try {
    let messages = await interaction.channel.messages.fetch({ limit: 100 });
    if (targetUser) messages = messages.filter(m => m.author.id === targetUser.id);
    messages = [...messages.values()].slice(0, amount);

    const deleted = await interaction.channel.bulkDelete(messages, true);

    await interaction.editReply({
      embeds: [successEmbed('Messages Cleared', [
        `${EMOJI.check} Deleted **${deleted.size}** message(s)${targetUser ? ` from **${targetUser.tag}**` : ''}.`,
        ``,
        `${EMOJI.arrow} **Channel:** ${interaction.channel}`,
        `${EMOJI.arrow} **Moderator:** ${interaction.user.tag}`,
      ].join('\n'))],
    });
  } catch (err) {
    await interaction.editReply({ embeds: [errorEmbed('Clear Failed', err.message)] });
  }
}
