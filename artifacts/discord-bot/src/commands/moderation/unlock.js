import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('unlock')
  .setDescription('Unlock a channel — allow members to send messages again')
  .addChannelOption(opt => opt.setName('channel').setDescription('Channel to unlock').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel') ?? interaction.channel;
  try {
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
    await interaction.reply({
      embeds: [successEmbed('Channel Unlocked', [
        `${EMOJI.public} ${channel} has been **unlocked**.`,
        ``,
        `${EMOJI.arrow} **Moderator:** ${interaction.user.tag}`,
      ].join('\n'))],
    });
  } catch (err) {
    await interaction.reply({ embeds: [errorEmbed('Unlock Failed', err.message)], ephemeral: true });
  }
}
