import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { successEmbed, errorEmbed, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('lock')
  .setDescription('Lock a channel — prevent members from sending messages')
  .addChannelOption(opt => opt.setName('channel').setDescription('Channel to lock (defaults to current)').setRequired(false))
  .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel') ?? interaction.channel;
  const reason = interaction.options.getString('reason') ?? 'No reason provided';

  try {
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false }, { reason });
    await interaction.reply({
      embeds: [successEmbed('Channel Locked', [
        `${EMOJI.lock} ${channel} has been **locked**.`,
        ``,
        `${EMOJI.arrow} **Reason:** ${reason}`,
        `${EMOJI.arrow} **Moderator:** ${interaction.user.tag}`,
      ].join('\n'))],
    });
  } catch (err) {
    await interaction.reply({ embeds: [errorEmbed('Lock Failed', err.message)], ephemeral: true });
  }
}
