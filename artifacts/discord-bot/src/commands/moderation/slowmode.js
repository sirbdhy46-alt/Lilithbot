import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('slowmode')
  .setDescription('Set slowmode on a channel')
  .addIntegerOption(opt => opt.setName('seconds').setDescription('Slowmode in seconds (0 to disable)').setMinValue(0).setMaxValue(21600).setRequired(true))
  .addChannelOption(opt => opt.setName('channel').setDescription('Target channel').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  const seconds = interaction.options.getInteger('seconds');
  const channel = interaction.options.getChannel('channel') ?? interaction.channel;

  try {
    await channel.setRateLimitPerUser(seconds);
    const desc = seconds === 0
      ? `${EMOJI.unmute} Slowmode has been **disabled** in ${channel}.`
      : `${EMOJI.time} Slowmode set to **${seconds}s** in ${channel}.`;
    await interaction.reply({ embeds: [successEmbed('Slowmode Updated', desc)] });
  } catch (err) {
    await interaction.reply({ embeds: [errorEmbed('Failed', err.message)], ephemeral: true });
  }
}
