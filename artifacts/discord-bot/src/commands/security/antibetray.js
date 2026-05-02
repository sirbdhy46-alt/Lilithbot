import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import {
  createEmbed, successEmbed, errorEmbed, infoEmbed,
  THEME, h2, h3, bold, code, italic, row, rowRaw,
} from '../../utils/embedBuilder.js';
import {
  getAntibetray, setAntibetray,
  addAntibetrayWhitelist, removeAntibetrayWhitelist,
} from '../../utils/guildConfig.js';

export const data = new SlashCommandBuilder()
  .setName('antibetray')
  .setDescription('⚔️ Protect your server from staff who betray it')
  .addSubcommand(sub =>
    sub.setName('enable')
      .setDescription('✅ Enable the antibetray module')
  )
  .addSubcommand(sub =>
    sub.setName('disable')
      .setDescription('❌ Disable the antibetray module')
  )
  .addSubcommand(sub =>
    sub.setName('status')
      .setDescription('📊 View current antibetray configuration')
  )
  .addSubcommand(sub =>
    sub.setName('whitelist')
      .setDescription('🛡️ Add or remove a user from the antibetray whitelist (they will never be punished)')
      .addUserOption(o =>
        o.setName('user').setDescription('User to whitelist or unwhitelist').setRequired(true)
      )
      .addStringOption(o =>
        o.setName('action')
          .setDescription('Add or remove from whitelist')
          .setRequired(true)
          .addChoices(
            { name: 'Add to whitelist', value: 'add' },
            { name: 'Remove from whitelist', value: 'remove' },
          )
      )
  )
  .addSubcommand(sub =>
    sub.setName('punishment')
      .setDescription('⚖️ Set the punishment for detected betrayers')
      .addStringOption(o =>
        o.setName('type')
          .setDescription('What to do when betrayal is detected')
          .setRequired(true)
          .addChoices(
            { name: '🔨 Ban (permanent, recommended)', value: 'ban' },
            { name: '👢 Kick (remove from server)', value: 'kick' },
            { name: '⏸️ Timeout only (strip perms + timeout)', value: 'timeout' },
          )
      )
  )
  .addSubcommand(sub =>
    sub.setName('threshold')
      .setDescription('🔢 Set how many actions before a user is punished')
      .addStringOption(o =>
        o.setName('action')
          .setDescription('Which action to set a threshold for')
          .setRequired(true)
          .addChoices(
            { name: 'Ban members (rapid banning)', value: 'ban' },
            { name: 'Delete channels', value: 'channel_delete' },
            { name: 'Delete roles', value: 'role_delete' },
            { name: 'Create webhooks', value: 'webhook_create' },
          )
      )
      .addIntegerOption(o =>
        o.setName('count')
          .setDescription('Number of actions in 10s before punishment (min: 1)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(20)
      )
  )
  .addSubcommand(sub =>
    sub.setName('setlog')
      .setDescription('📋 Set the channel for antibetray alerts')
      .addChannelOption(o =>
        o.setName('channel')
          .setDescription('Channel to send betrayal alerts to')
          .setRequired(true)
      )
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guild.id;

  // ── /antibetray enable ─────────────────────────────────────────────────────
  if (sub === 'enable') {
    setAntibetray(guildId, { enabled: true });
    return interaction.reply({
      embeds: [successEmbed('Antibetray Enabled',
        `⚔️ The antibetray module is now **active**.\n` +
        `> *I will monitor staff actions and automatically punish anyone who tries to destroy this server.*\n\n` +
        `Use \`/antibetray setlog\` to set an alert channel.\n` +
        `Use \`/antibetray whitelist\` to trust specific admins.`
      )],
    });
  }

  // ── /antibetray disable ────────────────────────────────────────────────────
  if (sub === 'disable') {
    setAntibetray(guildId, { enabled: false });
    return interaction.reply({
      embeds: [infoEmbed('Antibetray Disabled', '⚠️ The antibetray module has been **disabled**.\nStaff actions will no longer be monitored.')],
      ephemeral: true,
    });
  }

  // ── /antibetray setlog ─────────────────────────────────────────────────────
  if (sub === 'setlog') {
    const channel = interaction.options.getChannel('channel');
    setAntibetray(guildId, { logChannelId: channel.id });
    return interaction.reply({
      embeds: [successEmbed('Log Channel Set', `Antibetray alerts will be sent to ${channel}.`)],
      ephemeral: true,
    });
  }

  // ── /antibetray punishment ─────────────────────────────────────────────────
  if (sub === 'punishment') {
    const type = interaction.options.getString('type');
    setAntibetray(guildId, { punishment: type });
    const labels = { ban: '🔨 Ban', kick: '👢 Kick', timeout: '⏸️ Timeout' };
    return interaction.reply({
      embeds: [successEmbed('Punishment Updated', `Betrayers will now be punished with: **${labels[type]}**`)],
      ephemeral: true,
    });
  }

  // ── /antibetray threshold ──────────────────────────────────────────────────
  if (sub === 'threshold') {
    const action = interaction.options.getString('action');
    const count = interaction.options.getInteger('count');
    const keyMap = {
      ban:            'banThreshold',
      channel_delete: 'channelDeleteThreshold',
      role_delete:    'roleDeleteThreshold',
      webhook_create: 'webhookCreateThreshold',
    };
    const labelMap = {
      ban:            'Ban members',
      channel_delete: 'Delete channels',
      role_delete:    'Delete roles',
      webhook_create: 'Create webhooks',
    };
    const key = keyMap[action];
    setAntibetray(guildId, { [key]: count });
    return interaction.reply({
      embeds: [successEmbed('Threshold Updated',
        `${bold(labelMap[action])} threshold set to ${code(String(count))} actions per 10 seconds.`
      )],
      ephemeral: true,
    });
  }

  // ── /antibetray whitelist ──────────────────────────────────────────────────
  if (sub === 'whitelist') {
    const user = interaction.options.getUser('user');
    const action = interaction.options.getString('action');

    if (action === 'add') {
      addAntibetrayWhitelist(guildId, user.id);
      return interaction.reply({
        embeds: [successEmbed('Whitelisted',
          `${user} has been added to the antibetray whitelist.\n> *They will never be automatically punished.*`
        )],
        ephemeral: true,
      });
    } else {
      removeAntibetrayWhitelist(guildId, user.id);
      return interaction.reply({
        embeds: [successEmbed('Removed from Whitelist',
          `${user} has been removed from the antibetray whitelist.\n> *Their actions will now be monitored.*`
        )],
        ephemeral: true,
      });
    }
  }

  // ── /antibetray status ─────────────────────────────────────────────────────
  if (sub === 'status') {
    const ab = getAntibetray(guildId);
    const statusIcon = ab.enabled ? '🟢' : '🔴';
    const punishLabel = { ban: '🔨 Ban', kick: '👢 Kick', timeout: '⏸️ Timeout' }[ab.punishment] ?? ab.punishment;
    const wlList = ab.whitelist.length > 0
      ? ab.whitelist.map(id => `<@${id}>`).join(', ')
      : italic('Nobody whitelisted');

    return interaction.reply({
      embeds: [createEmbed({
        color: ab.enabled ? THEME.success : THEME.error,
        title: `${statusIcon}  Antibetray Status`,
        description: [
          h2(`${statusIcon} Module ${ab.enabled ? 'Active' : 'Disabled'}`),
          `>>> ${ab.enabled
            ? '⚔️ Actively monitoring staff for destructive actions.'
            : '⚠️ Module is disabled. Staff actions are not being monitored.'}`,
          ``,
          h3('⚖️ Configuration'),
          row('Punishment', punishLabel),
          row('Ban threshold', String(ab.banThreshold) + ' bans / 10s'),
          row('Channel delete', String(ab.channelDeleteThreshold) + ' deletes / 10s'),
          row('Role delete', String(ab.roleDeleteThreshold) + ' deletes / 10s'),
          row('Webhook create', String(ab.webhookCreateThreshold) + ' creates / 10s'),
          row('Alert channel', ab.logChannelId ? `<#${ab.logChannelId}>` : 'Not set'),
          ``,
          h3('🛡️ Whitelist'),
          `> ${wlList}`,
        ].join('\n'),
        footer: { text: 'Lilith Protector  •  Antibetray Module' },
      })],
      ephemeral: true,
    });
  }
}
