import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed, warningEmbed, infoEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';
import { getAntinuke, setAntinuke, addAntinukeWhitelist, removeAntinukeWhitelist } from '../../utils/guildConfig.js';

export const data = new SlashCommandBuilder()
  .setName('antinuke')
  .setDescription('Antinuke security system — protect your server')
  .addSubcommand(sub => sub.setName('enable').setDescription('Enable antinuke protection'))
  .addSubcommand(sub => sub.setName('disable').setDescription('Disable antinuke protection'))
  .addSubcommand(sub => sub.setName('status').setDescription('View antinuke configuration'))
  .addSubcommand(sub =>
    sub.setName('whitelist')
      .setDescription('Add a user to the antinuke whitelist (trusted)')
      .addUserOption(o => o.setName('user').setDescription('User to whitelist').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('unwhitelist')
      .setDescription('Remove a user from the antinuke whitelist')
      .addUserOption(o => o.setName('user').setDescription('User to remove').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('punishment')
      .setDescription('Set punishment for nukers (ban/kick/strip)')
      .addStringOption(o => o.setName('type').setDescription('Punishment type').setRequired(true)
        .addChoices({ name: 'Ban', value: 'ban' }, { name: 'Kick', value: 'kick' }, { name: 'Strip Roles', value: 'strip' }))
  )
  .addSubcommand(sub =>
    sub.setName('limits')
      .setDescription('Set action limits before antinuke triggers')
      .addIntegerOption(o => o.setName('bans').setDescription('Max bans before trigger (default: 3)').setMinValue(1).setMaxValue(20))
      .addIntegerOption(o => o.setName('kicks').setDescription('Max kicks before trigger (default: 5)').setMinValue(1).setMaxValue(20))
      .addIntegerOption(o => o.setName('channels').setDescription('Max channel deletes (default: 3)').setMinValue(1).setMaxValue(20))
      .addIntegerOption(o => o.setName('roles').setDescription('Max role deletes (default: 5)').setMinValue(1).setMaxValue(20))
  )
  .addSubcommand(sub =>
    sub.setName('logchannel')
      .setDescription('Set channel for antinuke alerts')
      .addChannelOption(o => o.setName('channel').setDescription('Log channel').setRequired(true))
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guild.id;
  const cfg = getAntinuke(guildId);

  if (sub === 'enable') {
    setAntinuke(guildId, { enabled: true });
    await interaction.reply({
      embeds: [successEmbed('Antinuke Enabled', [
        `${EMOJI.shield} **Antinuke protection is now ACTIVE.**`,
        ``,
        `${EMOJI.arrow} **Ban limit:** \`${cfg.banLimit}\` bans/10s`,
        `${EMOJI.arrow} **Kick limit:** \`${cfg.kickLimit}\` kicks/10s`,
        `${EMOJI.arrow} **Channel delete limit:** \`${cfg.channelLimit}\`/10s`,
        `${EMOJI.arrow} **Role delete limit:** \`${cfg.roleLimit}\`/10s`,
        `${EMOJI.arrow} **Punishment:** \`${cfg.punishment}\``,
        ``,
        `Use \`/antinuke whitelist\` to trust admins.`,
      ].join('\n'))],
    });
  }

  else if (sub === 'disable') {
    setAntinuke(guildId, { enabled: false });
    await interaction.reply({ embeds: [warningEmbed('Antinuke Disabled', `${EMOJI.unlock} Antinuke protection has been **disabled**.\n\nYour server is no longer protected from nuke attacks.`)] });
  }

  else if (sub === 'status') {
    const fresh = getAntinuke(guildId);
    const wlMentions = fresh.whitelist.length
      ? fresh.whitelist.map(id => `<@${id}>`).join(', ')
      : 'None';
    const embed = createEmbed({
      color: fresh.enabled ? THEME.success : THEME.error,
      title: `${EMOJI.shield} Antinuke Status — ${interaction.guild.name}`,
      description: DIVIDER,
      fields: [
        { name: `${EMOJI.check} Status`, value: fresh.enabled ? '`✅ ENABLED`' : '`❌ DISABLED`', inline: true },
        { name: `${EMOJI.warn} Punishment`, value: `\`${fresh.punishment}\``, inline: true },
        { name: `${EMOJI.arrow} Ban Limit`, value: `\`${fresh.banLimit}/10s\``, inline: true },
        { name: `${EMOJI.arrow} Kick Limit`, value: `\`${fresh.kickLimit}/10s\``, inline: true },
        { name: `${EMOJI.arrow} Channel Limit`, value: `\`${fresh.channelLimit}/10s\``, inline: true },
        { name: `${EMOJI.arrow} Role Limit`, value: `\`${fresh.roleLimit}/10s\``, inline: true },
        { name: `${EMOJI.crown} Whitelist (${fresh.whitelist.length})`, value: wlMentions, inline: false },
      ],
    });
    await interaction.reply({ embeds: [embed] });
  }

  else if (sub === 'whitelist') {
    const user = interaction.options.getUser('user');
    if (user.id === interaction.guild.ownerId) {
      return interaction.reply({ embeds: [errorEmbed('Already Trusted', 'Server owner is always trusted.')], ephemeral: true });
    }
    addAntinukeWhitelist(guildId, user.id);
    await interaction.reply({
      embeds: [successEmbed('Whitelisted', [
        `${EMOJI.check} **${user.tag}** is now on the antinuke whitelist.`,
        `${EMOJI.arrow} They are trusted and will not be flagged.`,
      ].join('\n'))],
    });
  }

  else if (sub === 'unwhitelist') {
    const user = interaction.options.getUser('user');
    removeAntinukeWhitelist(guildId, user.id);
    await interaction.reply({
      embeds: [successEmbed('Removed from Whitelist', `${EMOJI.check} **${user.tag}** removed from antinuke whitelist.`)],
    });
  }

  else if (sub === 'punishment') {
    const type = interaction.options.getString('type');
    setAntinuke(guildId, { punishment: type });
    await interaction.reply({
      embeds: [successEmbed('Punishment Set', [
        `${EMOJI.ban} Antinuke punishment set to: \`${type}\``,
        ``,
        `${EMOJI.arrow} Nukers will be **${type === 'ban' ? 'permanently banned' : type === 'kick' ? 'kicked' : 'stripped of all roles'}** automatically.`,
      ].join('\n'))],
    });
  }

  else if (sub === 'limits') {
    const bans = interaction.options.getInteger('bans');
    const kicks = interaction.options.getInteger('kicks');
    const channels = interaction.options.getInteger('channels');
    const roles = interaction.options.getInteger('roles');

    const update = {};
    if (bans !== null) update.banLimit = bans;
    if (kicks !== null) update.kickLimit = kicks;
    if (channels !== null) update.channelLimit = channels;
    if (roles !== null) update.roleLimit = roles;

    setAntinuke(guildId, update);
    const fresh = getAntinuke(guildId);

    await interaction.reply({
      embeds: [successEmbed('Limits Updated', [
        `${EMOJI.settings} Antinuke limits configured:`,
        ``,
        `${EMOJI.arrow} **Bans:** \`${fresh.banLimit}/10s\``,
        `${EMOJI.arrow} **Kicks:** \`${fresh.kickLimit}/10s\``,
        `${EMOJI.arrow} **Channel deletes:** \`${fresh.channelLimit}/10s\``,
        `${EMOJI.arrow} **Role deletes:** \`${fresh.roleLimit}/10s\``,
      ].join('\n'))],
    });
  }

  else if (sub === 'logchannel') {
    const channel = interaction.options.getChannel('channel');
    setAntinuke(guildId, { logChannelId: channel.id });
    await interaction.reply({
      embeds: [successEmbed('Log Channel Set', `${EMOJI.channel} Antinuke alerts will be sent to ${channel}.`)],
    });
  }
}
