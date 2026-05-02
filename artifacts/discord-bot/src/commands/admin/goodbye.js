import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed, THEME, DIVIDER_FANCY, EMOJI } from '../../utils/embedBuilder.js';
import { getGoodbye, setGoodbye } from '../../utils/guildConfig.js';

export const data = new SlashCommandBuilder()
  .setName('goodbye')
  .setDescription('Configure the leave message (auto-deletes after 23 seconds)')
  .addSubcommand(sub =>
    sub.setName('channel')
      .setDescription('Set the channel for leave messages')
      .addChannelOption(o => o.setName('channel').setDescription('Leave message channel').setRequired(true))
  )
  .addSubcommand(sub => sub.setName('config').setDescription('View current goodbye configuration'))
  .addSubcommand(sub => sub.setName('reset').setDescription('Revert to system channel for leave messages'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guild.id;

  if (sub === 'channel') {
    const channel = interaction.options.getChannel('channel');
    setGoodbye(guildId, { channelId: channel.id });
    await interaction.reply({
      embeds: [successEmbed('Goodbye Channel Set', [
        `${EMOJI.leave2} Leave messages will be sent to ${channel}.`,
        `${EMOJI.bullet} They will **auto-delete after 23 seconds**.`,
      ].join('\n'))],
    });
  }

  else if (sub === 'config') {
    const cfg = getGoodbye(guildId);
    await interaction.reply({
      embeds: [createEmbed({
        color: THEME.info,
        title: `${EMOJI.leave2} Goodbye Configuration`,
        description: [
          DIVIDER_FANCY, ``,
          `${EMOJI.bullet} **Channel:** ${cfg?.channelId ? `<#${cfg.channelId}>` : 'System channel (default)'}`,
          `${EMOJI.bullet} **Auto-delete:** \`23 seconds\``,
          ``,
          DIVIDER_FANCY,
        ].join('\n'),
      })],
    });
  }

  else if (sub === 'reset') {
    setGoodbye(guildId, { channelId: null });
    await interaction.reply({
      embeds: [successEmbed('Goodbye Reset', `${EMOJI.cross} Goodbye channel cleared — will use the server system channel.`)],
    });
  }
}
