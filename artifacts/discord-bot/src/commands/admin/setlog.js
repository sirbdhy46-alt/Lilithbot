import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, infoEmbed, createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';
import { getLogChannel, setLogChannel } from '../../utils/guildConfig.js';

export const data = new SlashCommandBuilder()
  .setName('setlog')
  .setDescription('Set or view the moderation log channel')
  .addSubcommand(sub =>
    sub.setName('set')
      .setDescription('Set the log channel')
      .addChannelOption(o => o.setName('channel').setDescription('Channel to send logs to').setRequired(true))
  )
  .addSubcommand(sub => sub.setName('view').setDescription('View current log channel'))
  .addSubcommand(sub => sub.setName('disable').setDescription('Disable logging'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guild.id;

  if (sub === 'set') {
    const channel = interaction.options.getChannel('channel');
    if (channel.type !== 0) return interaction.reply({ embeds: [errorEmbed('Invalid Channel', 'Please select a text channel.')], ephemeral: true });
    setLogChannel(guildId, channel.id);
    await interaction.reply({
      embeds: [successEmbed('Log Channel Set', [
        `${EMOJI.channel} All mod actions will be logged in ${channel}.`,
        ``,
        `${EMOJI.arrow} **Logged events:** ban, kick, mute, warn, clear, lock, role changes`,
        `${EMOJI.arrow} **Set by:** ${interaction.user.tag}`,
      ].join('\n'))],
    });
  }

  else if (sub === 'view') {
    const id = getLogChannel(guildId);
    await interaction.reply({
      embeds: [createEmbed({
        color: THEME.info,
        title: `${EMOJI.channel} Log Channel`,
        description: [DIVIDER, ``, id ? `${EMOJI.check} Currently logging to: <#${id}>` : `${EMOJI.cross} No log channel set.`, ``, DIVIDER].join('\n'),
      })],
    });
  }

  else if (sub === 'disable') {
    setLogChannel(guildId, null);
    await interaction.reply({ embeds: [successEmbed('Logging Disabled', `${EMOJI.cross} Mod action logging has been disabled.`)] });
  }
}
