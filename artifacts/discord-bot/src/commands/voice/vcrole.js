import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import {
  createEmbed, successEmbed, errorEmbed, infoEmbed,
  THEME, DIVIDER_FANCY, DIVIDER_STARS, EMOJI,
} from '../../utils/embedBuilder.js';
import { getVcRoles, addVcRole, removeVcRole, resetVcRoles } from '../../utils/guildConfig.js';

export const data = new SlashCommandBuilder()
  .setName('vcrole')
  .setDescription('Assign roles automatically when members join voice channels')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addSubcommand(sub =>
    sub.setName('add')
      .setDescription('Add a VC role — role assigned when joining a voice channel')
      .addRoleOption(o => o.setName('role').setDescription('Role to assign').setRequired(true))
      .addChannelOption(o =>
        o.setName('channel')
          .setDescription('Specific voice channel (leave empty = ANY voice channel)')
          .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub.setName('remove')
      .setDescription('Remove a VC role configuration')
      .addRoleOption(o => o.setName('role').setDescription('Role to remove').setRequired(true))
      .addChannelOption(o =>
        o.setName('channel')
          .setDescription('Specific channel binding (leave empty = removes all bindings for this role)')
          .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub.setName('list')
      .setDescription('View all configured VC roles for this server')
  )
  .addSubcommand(sub =>
    sub.setName('reset')
      .setDescription('Remove ALL VC role configurations')
  );

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guild.id;
  const me = interaction.guild.members.me;

  if (sub === 'add') {
    const role = interaction.options.getRole('role');
    const channel = interaction.options.getChannel('channel') ?? null;

    if (role.position >= me.roles.highest.position) {
      return interaction.reply({
        embeds: [errorEmbed('Role Too High', `${EMOJI.blobangry} I cannot manage **${role.name}** — it's above my highest role.`)],
        ephemeral: true,
      });
    }

    if (role.managed) {
      return interaction.reply({
        embeds: [errorEmbed('Managed Role', `${EMOJI.blobthink} **${role.name}** is managed by an integration and cannot be used.`)],
        ephemeral: true,
      });
    }

    const existing = getVcRoles(guildId);
    if (existing.length >= 25) {
      return interaction.reply({
        embeds: [errorEmbed('Limit Reached', `${EMOJI.warning} You can only configure up to **25 VC roles** per server.`)],
        ephemeral: true,
      });
    }

    addVcRole(guildId, role.id, channel?.id ?? null);

    await interaction.reply({
      embeds: [createEmbed({
        color: THEME.success,
        title: `${EMOJI.voice} VC Role Added`,
        description: [
          DIVIDER_FANCY, ``,
          `${EMOJI.check} Members will receive **${role}** when they join a voice channel.`,
          ``,
          DIVIDER_STARS,
          `${EMOJI.bullet} **Role** ─── ${role}`,
          `${EMOJI.bullet} **Trigger** ─── ${channel ? `<#${channel.id}>` : '**Any Voice Channel**'}`,
          `${EMOJI.bullet} **Removed on** ─── Leaving voice`,
          ``,
          DIVIDER_FANCY,
        ].join('\n'),
        footer: { text: `${EMOJI.sparkle} Lilith Protector  •  VC Role System` },
      })],
    });
  }

  else if (sub === 'remove') {
    const role = interaction.options.getRole('role');
    const channel = interaction.options.getChannel('channel') ?? null;

    const before = getVcRoles(guildId).length;
    removeVcRole(guildId, role.id, channel ? channel.id : undefined);
    const after = getVcRoles(guildId).length;
    const removed = before - after;

    if (removed === 0) {
      return interaction.reply({
        embeds: [errorEmbed('Not Found', `${EMOJI.blobthink} No matching VC role config found for **${role.name}**${channel ? ` in <#${channel.id}>` : ''}.`)],
        ephemeral: true,
      });
    }

    await interaction.reply({
      embeds: [successEmbed('VC Role Removed', `${EMOJI.check} Removed **${removed}** VC role binding(s) for **${role.name}**${channel ? ` in <#${channel.id}>` : ' (all channels)'}.`)],
    });
  }

  else if (sub === 'list') {
    const vcroles = getVcRoles(guildId);

    if (vcroles.length === 0) {
      return interaction.reply({
        embeds: [infoEmbed('No VC Roles', `${EMOJI.blobthink} No VC roles are configured yet.\n\nUse \`/vcrole add\` to get started.`)],
        ephemeral: true,
      });
    }

    const lines = vcroles.map((v, i) => {
      const roleStr = `<@&${v.roleId}>`;
      const chStr = v.channelId ? `<#${v.channelId}>` : '**Any VC**';
      return `${EMOJI.zap} **${i + 1}.** ${roleStr} ─── ${chStr}`;
    }).join('\n');

    await interaction.reply({
      embeds: [createEmbed({
        color: THEME.primary,
        title: `${EMOJI.voice} VC Roles — ${interaction.guild.name}`,
        description: [
          DIVIDER_FANCY, ``,
          `${EMOJI.sparkle} **${vcroles.length}** VC role binding${vcroles.length !== 1 ? 's' : ''} configured:`,
          ``,
          lines,
          ``,
          DIVIDER_STARS,
          `${EMOJI.dbcheck} Roles are added when joining and removed when leaving voice.`,
          ``,
          DIVIDER_FANCY,
        ].join('\n'),
        footer: { text: `${EMOJI.sparkle} Lilith Protector  •  VC Role System` },
      })],
    });
  }

  else if (sub === 'reset') {
    const count = getVcRoles(guildId).length;
    if (count === 0) {
      return interaction.reply({
        embeds: [infoEmbed('Nothing to Reset', `${EMOJI.blobthink} There are no VC roles configured.`)],
        ephemeral: true,
      });
    }

    resetVcRoles(guildId);

    await interaction.reply({
      embeds: [successEmbed('VC Roles Reset', `${EMOJI.check} All **${count}** VC role binding${count !== 1 ? 's' : ''} have been removed.`)],
    });
  }
}
