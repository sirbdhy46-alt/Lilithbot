import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed, infoEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';
import { getGreet, setGreet, resetGreet } from '../../utils/guildConfig.js';

export const data = new SlashCommandBuilder()
  .setName('greet')
  .setDescription('Configure welcome messages for new members')
  .addSubcommand(sub =>
    sub.setName('channel')
      .setDescription('Set the welcome channel')
      .addChannelOption(o => o.setName('channel').setDescription('Welcome channel').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('message')
      .setDescription('Set the welcome message (use {user} {server} {count} placeholders)')
      .addStringOption(o => o.setName('text').setDescription('Welcome message text').setRequired(true))
  )
  .addSubcommand(sub => sub.setName('test').setDescription('Preview the current welcome message'))
  .addSubcommand(sub => sub.setName('config').setDescription('View current greet configuration'))
  .addSubcommand(sub => sub.setName('reset').setDescription('Disable welcome messages'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guild.id;

  if (sub === 'channel') {
    const channel = interaction.options.getChannel('channel');
    setGreet(guildId, { channelId: channel.id, enabled: true });
    await interaction.reply({
      embeds: [successEmbed('Greet Channel Set', [
        `${EMOJI.welcome} Welcome messages will be sent to ${channel}.`,
        `${EMOJI.arrow} Use \`/greet message\` to customize the message.`,
        `${EMOJI.arrow} Use \`/greet test\` to preview it.`,
      ].join('\n'))],
    });
  }

  else if (sub === 'message') {
    const text = interaction.options.getString('text');
    setGreet(guildId, { message: text, enabled: true });
    await interaction.reply({
      embeds: [successEmbed('Welcome Message Set', [
        `${EMOJI.check} Welcome message updated!`,
        ``,
        `**Preview:**`,
        text.replace('{user}', interaction.user.toString()).replace('{server}', interaction.guild.name).replace('{count}', interaction.guild.memberCount),
        ``,
        `${EMOJI.arrow} Placeholders: \`{user}\` \`{server}\` \`{count}\``,
      ].join('\n'))],
    });
  }

  else if (sub === 'test') {
    const cfg = getGreet(guildId);
    if (!cfg?.channelId) {
      return interaction.reply({ embeds: [errorEmbed('Not Configured', 'No greet channel set. Use `/greet channel` first.')], ephemeral: true });
    }
    const channel = interaction.guild.channels.cache.get(cfg.channelId);
    if (!channel) return interaction.reply({ embeds: [errorEmbed('Channel Not Found', 'The greet channel no longer exists.')], ephemeral: true });

    const message = (cfg.message ?? 'Welcome to **{server}**, {user}! You are member #{count}.')
      .replace('{user}', interaction.user.toString())
      .replace('{server}', interaction.guild.name)
      .replace('{count}', interaction.guild.memberCount);

    const welcomeEmbed = createEmbed({
      color: THEME.success,
      title: `${EMOJI.welcome} Welcome to ${interaction.guild.name}!`,
      description: `${DIVIDER}\n\n${message}\n\n${DIVIDER}`,
      thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
      footer: { text: `Member #${interaction.guild.memberCount}` },
    });

    await channel.send({ embeds: [welcomeEmbed] });
    await interaction.reply({ embeds: [successEmbed('Test Sent', `Preview sent to ${channel}.`)], ephemeral: true });
  }

  else if (sub === 'config') {
    const cfg = getGreet(guildId);
    await interaction.reply({
      embeds: [createEmbed({
        color: THEME.info,
        title: `${EMOJI.welcome} Greet Configuration`,
        description: DIVIDER,
        fields: [
          { name: 'Status', value: cfg?.enabled ? '`✅ Enabled`' : '`❌ Disabled`', inline: true },
          { name: 'Channel', value: cfg?.channelId ? `<#${cfg.channelId}>` : 'Not set', inline: true },
          { name: 'Message', value: cfg?.message ? `\`${cfg.message.slice(0, 100)}\`` : 'Default', inline: false },
        ],
      })],
    });
  }

  else if (sub === 'reset') {
    resetGreet(guildId);
    await interaction.reply({ embeds: [successEmbed('Greet Reset', `${EMOJI.cross} Welcome messages have been disabled.`)] });
  }
}
