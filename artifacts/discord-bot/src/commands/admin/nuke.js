import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createEmbed, errorEmbed, warningEmbed, successEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('nuke')
  .setDescription('Nuke a channel — deletes and recreates it with identical settings')
  .addChannelOption(opt => opt.setName('channel').setDescription('Channel to nuke (defaults to current)').setRequired(false))
  .addStringOption(opt => opt.setName('reason').setDescription('Reason for nuking').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  const channel = interaction.options?.getChannel?.('channel') ?? interaction.channel;
  const reason = interaction.options?.getString?.('reason') ?? 'No reason provided';

  // Confirmation step
  const confirmEmbed = warningEmbed('Confirm Nuke', [
    `${EMOJI.warning} You are about to **nuke** ${channel}.`,
    ``,
    `This will **delete and recreate** the channel, erasing all messages.`,
    `${EMOJI.arrow} **Reason:** ${reason}`,
    `${EMOJI.arrow} **Moderator:** ${interaction.user.tag}`,
    ``,
    `*This action is irreversible. Confirm below.*`,
  ].join('\n'));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`nuke_confirm_${channel.id}`)
      .setLabel('Nuke It')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('💣'),
    new ButtonBuilder()
      .setCustomId('nuke_cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('❌'),
  );

  const confirmMsg = await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: false });

  const collector = confirmMsg.createMessageComponentCollector({
    filter: i => i.user.id === interaction.user.id,
    time: 30_000,
    max: 1,
  });

  collector.on('collect', async i => {
    if (i.customId === 'nuke_cancel') {
      await i.update({ embeds: [errorEmbed('Nuke Cancelled', 'The nuke was cancelled.')], components: [] });
      return;
    }

    if (i.customId === `nuke_confirm_${channel.id}`) {
      await i.deferUpdate();

      try {
        // Clone the channel
        const position = channel.position;
        const newChannel = await channel.clone({ reason: `Nuke by ${interaction.user.tag}: ${reason}` });
        await newChannel.setPosition(position);
        await channel.delete(`Nuke by ${interaction.user.tag}: ${reason}`);

        // Send nuke message in new channel
        const nukeEmbed = createEmbed({
          color: THEME.error,
          title: `💣 Channel Nuked`,
          description: [
            DIVIDER,
            ``,
            `This channel has been **nuked** and recreated.`,
            ``,
            `${EMOJI.arrow} **Reason:** ${reason}`,
            `${EMOJI.arrow} **Moderator:** ${interaction.user}`,
            ``,
            DIVIDER,
          ].join('\n'),
        });

        await newChannel.send({ embeds: [nukeEmbed] });
      } catch (err) {
        await interaction.followUp({ embeds: [errorEmbed('Nuke Failed', err.message)], ephemeral: true });
      }
    }
  });

  collector.on('end', (collected) => {
    if (collected.size === 0) {
      interaction.editReply({ embeds: [errorEmbed('Timed Out', 'Nuke confirmation timed out.')], components: [] }).catch(() => {});
    }
  });
}
