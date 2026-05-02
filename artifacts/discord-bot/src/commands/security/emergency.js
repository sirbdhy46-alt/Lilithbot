import { SlashCommandBuilder, PermissionFlagsBits, OverwriteType, ChannelType } from 'discord.js';
import {
  createEmbed, successEmbed, errorEmbed, warningEmbed, infoEmbed,
  THEME, h2, h3, bold, code, italic, row, rowRaw,
} from '../../utils/embedBuilder.js';
import { getEmergency, setEmergency } from '../../utils/guildConfig.js';

export const data = new SlashCommandBuilder()
  .setName('emergency')
  .setDescription('🚨 Emergency lockdown controls')
  .addSubcommand(sub =>
    sub.setName('lockdown')
      .setDescription('🔒 Lock ALL channels — nobody can type except admins')
      .addStringOption(o =>
        o.setName('reason')
          .setDescription('Reason for lockdown (shown in channel topics)')
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub.setName('unlock')
      .setDescription('🔓 Unlock all channels and restore normal permissions')
  )
  .addSubcommand(sub =>
    sub.setName('status')
      .setDescription('📊 View current emergency lockdown status')
  )
  .addSubcommand(sub =>
    sub.setName('setlog')
      .setDescription('📋 Set the channel for emergency alerts')
      .addChannelOption(o =>
        o.setName('channel')
          .setDescription('Channel to send emergency alerts to')
          .setRequired(true)
      )
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

// Channels to skip (voice, categories, announcement-only)
const LOCKABLE_TYPES = [
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
  ChannelType.GuildForum,
  ChannelType.GuildStageVoice,
];

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guild = interaction.guild;
  const guildId = guild.id;

  // ── /emergency status ──────────────────────────────────────────────────────
  if (sub === 'status') {
    const em = getEmergency(guildId);
    const statusIcon = em.locked ? '🔴' : '🟢';
    const statusText = em.locked ? bold('LOCKED DOWN') : bold('Normal');
    const lockedSince = em.lockedAt ? `<t:${Math.floor(em.lockedAt / 1000)}:R>` : code('N/A');
    const lockedBy = em.lockedBy ? `<@${em.lockedBy}>` : code('N/A');

    return interaction.reply({
      embeds: [createEmbed({
        color: em.locked ? THEME.error : THEME.success,
        title: `${statusIcon}  Emergency Status`,
        description: [
          h2(`${statusIcon} Server Status`),
          `>>> ${em.locked
            ? '🔒 This server is currently in **emergency lockdown**. All channels are locked.'
            : '✅ This server is operating normally. No lockdown is active.'}`,
          ``,
          h3('📊 Details'),
          row('Status', em.locked ? 'LOCKED' : 'Normal'),
          em.locked ? rowRaw('Locked', lockedSince) : '',
          em.locked ? rowRaw('Locked by', lockedBy) : '',
          row('Log Channel', em.logChannelId ? `<#${em.logChannelId}>` : 'Not set'),
        ].filter(Boolean).join('\n'),
        footer: { text: 'Lilith Protector  •  Emergency Module' },
      })],
      ephemeral: true,
    });
  }

  // ── /emergency setlog ──────────────────────────────────────────────────────
  if (sub === 'setlog') {
    const channel = interaction.options.getChannel('channel');
    setEmergency(guildId, { logChannelId: channel.id });
    return interaction.reply({
      embeds: [successEmbed('Log Channel Set', `Emergency alerts will be sent to ${channel}.`)],
      ephemeral: true,
    });
  }

  // ── /emergency lockdown ────────────────────────────────────────────────────
  if (sub === 'lockdown') {
    const em = getEmergency(guildId);
    if (em.locked) {
      return interaction.reply({
        embeds: [warningEmbed('Already Locked', '⚠️ The server is already in emergency lockdown.\nUse `/emergency unlock` to restore access.')],
        ephemeral: true,
      });
    }

    const reason = interaction.options.getString('reason') ?? 'Emergency lockdown activated';
    await interaction.deferReply();

    const channels = guild.channels.cache.filter(c => LOCKABLE_TYPES.includes(c.type));
    let locked = 0, failed = 0;

    for (const [, channel] of channels) {
      try {
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: false,
          SendMessagesInThreads: false,
          AddReactions: false,
          Connect: false,
        }, { reason: `[Emergency] ${reason}` });
        locked++;
      } catch {
        failed++;
      }
    }

    setEmergency(guildId, {
      locked: true,
      lockedAt: Date.now(),
      lockedBy: interaction.user.id,
    });

    // Alert in log channel if configured
    const logId = em.logChannelId;
    if (logId) {
      const logCh = guild.channels.cache.get(logId);
      if (logCh) {
        await logCh.send({
          content: `@here`,
          embeds: [createEmbed({
            color: 0xFF0000,
            title: '🚨  EMERGENCY LOCKDOWN ACTIVATED',
            description: [
              h2('🔒 Server Lockdown'),
              `>>> **${guild.name}** has been placed under emergency lockdown by ${interaction.user}.`,
              ``,
              h3('📋 Details'),
              row('Reason', reason),
              row('Channels locked', String(locked)),
              row('Failed', String(failed)),
              rowRaw('Activated', `<t:${Math.floor(Date.now() / 1000)}:F>`),
            ].join('\n'),
            footer: { text: 'Lilith Protector  •  Emergency Module' },
          })],
        }).catch(() => {});
      }
    }

    return interaction.editReply({
      embeds: [createEmbed({
        color: 0xFF0000,
        title: '🚨  Server Locked Down',
        description: [
          h2('🔒 Lockdown Active'),
          `>>> ${bold(guild.name)} is now in emergency lockdown.`,
          `*Nobody can send messages until you run* \`/emergency unlock\`.`,
          ``,
          h3('📊 Results'),
          row('Channels locked', String(locked)),
          row('Failed', String(failed)),
          row('Reason', reason),
        ].join('\n'),
        footer: { text: 'Lilith Protector  •  Emergency Module  •  Run /emergency unlock to restore' },
      })],
    });
  }

  // ── /emergency unlock ──────────────────────────────────────────────────────
  if (sub === 'unlock') {
    const em = getEmergency(guildId);
    if (!em.locked) {
      return interaction.reply({
        embeds: [infoEmbed('Not Locked', 'The server is not currently in emergency lockdown.')],
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const channels = guild.channels.cache.filter(c => LOCKABLE_TYPES.includes(c.type));
    let unlocked = 0, failed = 0;

    for (const [, channel] of channels) {
      try {
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: null,
          SendMessagesInThreads: null,
          AddReactions: null,
          Connect: null,
        }, { reason: '[Emergency] Lockdown lifted' });
        unlocked++;
      } catch {
        failed++;
      }
    }

    setEmergency(guildId, { locked: false, lockedAt: null, lockedBy: null });

    const logId = em.logChannelId;
    if (logId) {
      const logCh = guild.channels.cache.get(logId);
      if (logCh) {
        await logCh.send({
          embeds: [createEmbed({
            color: THEME.success,
            title: '✅  Emergency Lockdown Lifted',
            description: [
              h2('🔓 Server Unlocked'),
              `>>> Lockdown lifted by ${interaction.user}. Normal permissions restored.`,
              ``,
              row('Channels unlocked', String(unlocked)),
            ].join('\n'),
            footer: { text: 'Lilith Protector  •  Emergency Module' },
          })],
        }).catch(() => {});
      }
    }

    return interaction.editReply({
      embeds: [successEmbed('Server Unlocked', [
        `🔓 Emergency lockdown has been **lifted** by ${interaction.user}.`,
        ``,
        row('Channels unlocked', String(unlocked)),
        row('Failed', String(failed)),
      ].join('\n'))],
    });
  }
}
