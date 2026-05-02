import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed, warningEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';
import { getAutomod, setAutomod } from '../../utils/guildConfig.js';

export const data = new SlashCommandBuilder()
  .setName('automod')
  .setDescription('Automated content moderation system')
  .addSubcommand(sub => sub.setName('enable').setDescription('Enable automod'))
  .addSubcommand(sub => sub.setName('disable').setDescription('Disable automod'))
  .addSubcommand(sub => sub.setName('status').setDescription('View automod configuration'))
  .addSubcommand(sub =>
    sub.setName('antilinks')
      .setDescription('Toggle anti-link filter (blocks non-whitelisted URLs)')
      .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('antispam')
      .setDescription('Toggle anti-spam filter (limits rapid message sending)')
      .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('anticaps')
      .setDescription('Toggle anti-caps filter (blocks excessive CAPS LOCK)')
      .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('antimentions')
      .setDescription('Limit mass mentions in a message')
      .addIntegerOption(o => o.setName('limit').setDescription('Max mentions per message (default: 5)').setMinValue(2).setMaxValue(30).setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('logchannel')
      .setDescription('Set channel for automod alerts')
      .addChannelOption(o => o.setName('channel').setDescription('Log channel').setRequired(true))
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guild.id;
  const cfg = getAutomod(guildId);

  if (sub === 'enable') {
    setAutomod(guildId, { enabled: true });
    await interaction.reply({
      embeds: [successEmbed('Automod Enabled', [
        `${EMOJI.bot} **Automod is now active.**`,
        ``,
        `${EMOJI.arrow} **Anti-links:** ${cfg.antiLinks ? '✅' : '❌'} Use \`/automod antilinks\``,
        `${EMOJI.arrow} **Anti-spam:** ${cfg.antiSpam ? '✅' : '❌'} Use \`/automod antispam\``,
        `${EMOJI.arrow} **Anti-caps:** ${cfg.antiCaps ? '✅' : '❌'} Use \`/automod anticaps\``,
        `${EMOJI.arrow} **Anti-mentions:** Limit ${cfg.mentionLimit} Use \`/automod antimentions\``,
      ].join('\n'))],
    });
  }

  else if (sub === 'disable') {
    setAutomod(guildId, { enabled: false });
    await interaction.reply({ embeds: [warningEmbed('Automod Disabled', `${EMOJI.bot} Automod has been disabled.`)] });
  }

  else if (sub === 'status') {
    const fresh = getAutomod(guildId);
    const embed = createEmbed({
      color: fresh.enabled ? THEME.success : THEME.error,
      title: `${EMOJI.bot} Automod Status`,
      description: DIVIDER,
      fields: [
        { name: 'Status', value: fresh.enabled ? '`✅ ENABLED`' : '`❌ DISABLED`', inline: true },
        { name: 'Log Channel', value: fresh.logChannelId ? `<#${fresh.logChannelId}>` : 'Not set', inline: true },
        { name: `Anti-Links`, value: fresh.antiLinks ? '`✅`' : '`❌`', inline: true },
        { name: `Anti-Spam`, value: fresh.antiSpam ? '`✅`' : '`❌`', inline: true },
        { name: `Anti-Caps`, value: fresh.antiCaps ? '`✅`' : '`❌`', inline: true },
        { name: `Mention Limit`, value: `\`${fresh.mentionLimit}\``, inline: true },
      ],
    });
    await interaction.reply({ embeds: [embed] });
  }

  else if (sub === 'antilinks') {
    const enabled = interaction.options.getBoolean('enabled');
    setAutomod(guildId, { antiLinks: enabled });
    await interaction.reply({ embeds: [successEmbed(`Anti-Links ${enabled ? 'Enabled' : 'Disabled'}`, `${enabled ? EMOJI.lock : EMOJI.unlock} Anti-link filter is now **${enabled ? 'on' : 'off'}**.`)] });
  }

  else if (sub === 'antispam') {
    const enabled = interaction.options.getBoolean('enabled');
    setAutomod(guildId, { antiSpam: enabled });
    await interaction.reply({ embeds: [successEmbed(`Anti-Spam ${enabled ? 'Enabled' : 'Disabled'}`, `${enabled ? EMOJI.mute : EMOJI.unmute} Anti-spam filter is now **${enabled ? 'on' : 'off'}**.`)] });
  }

  else if (sub === 'anticaps') {
    const enabled = interaction.options.getBoolean('enabled');
    setAutomod(guildId, { antiCaps: enabled });
    await interaction.reply({ embeds: [successEmbed(`Anti-Caps ${enabled ? 'Enabled' : 'Disabled'}`, `${enabled ? EMOJI.warn : EMOJI.check} Anti-caps filter is now **${enabled ? 'on' : 'off'}**.`)] });
  }

  else if (sub === 'antimentions') {
    const limit = interaction.options.getInteger('limit');
    setAutomod(guildId, { antiMentions: true, mentionLimit: limit });
    await interaction.reply({ embeds: [successEmbed('Mention Limit Set', `${EMOJI.warn} Messages with more than **${limit}** mentions will be deleted.`)] });
  }

  else if (sub === 'logchannel') {
    const channel = interaction.options.getChannel('channel');
    setAutomod(guildId, { logChannelId: channel.id });
    await interaction.reply({ embeds: [successEmbed('Automod Log Set', `${EMOJI.channel} Automod alerts will appear in ${channel}.`)] });
  }
}
