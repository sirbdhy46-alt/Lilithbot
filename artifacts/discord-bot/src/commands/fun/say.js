import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('say')
  .setDescription('Make the bot say something')
  .addStringOption(o => o.setName('message').setDescription('What to say').setRequired(true))
  .addChannelOption(o => o.setName('channel').setDescription('Channel to say it in (defaults to current)').setRequired(false))
  .addBooleanOption(o => o.setName('embed').setDescription('Send as embed (default: false)').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction) {
  const message = interaction.options?.getString?.('message') ?? '';
  const channel = interaction.options?.getChannel?.('channel') ?? interaction.channel;
  const asEmbed = interaction.options?.getBoolean?.('embed') ?? false;

  if (asEmbed) {
    await channel.send({
      embeds: [createEmbed({ color: THEME.primary, description: `${DIVIDER}\n\n${message}\n\n${DIVIDER}`, timestamp: false })],
    });
  } else {
    await channel.send({ content: message });
  }

  await interaction.reply({ content: `${EMOJI.check} Message sent to ${channel}.`, ephemeral: true });
}
