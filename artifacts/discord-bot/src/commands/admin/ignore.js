import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, successEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';
import { getIgnore, addIgnore, removeIgnore, resetIgnore } from '../../utils/guildConfig.js';

export const data = new SlashCommandBuilder()
  .setName('ignore')
  .setDescription('Ignore channels or roles from bot commands')
  .addSubcommand(sub =>
    sub.setName('channel')
      .setDescription('Ignore a channel from bot commands')
      .addChannelOption(o => o.setName('channel').setDescription('Channel to ignore').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('role')
      .setDescription('Ignore a role from bot commands')
      .addRoleOption(o => o.setName('role').setDescription('Role to ignore').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('unignore')
      .setDescription('Remove a channel or role from the ignore list')
      .addStringOption(o => o.setName('id').setDescription('Channel/role ID or mention').setRequired(true))
  )
  .addSubcommand(sub => sub.setName('list').setDescription('View all ignored channels and roles'))
  .addSubcommand(sub => sub.setName('reset').setDescription('Clear all ignores'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guild.id;

  if (sub === 'channel') {
    const channel = interaction.options.getChannel('channel');
    addIgnore(guildId, channel.id, 'channels');
    await interaction.reply({ embeds: [successEmbed('Channel Ignored', `${EMOJI.channel} ${channel} will be ignored by bot commands.`)] });
  }

  else if (sub === 'role') {
    const role = interaction.options.getRole('role');
    addIgnore(guildId, role.id, 'roles');
    await interaction.reply({ embeds: [successEmbed('Role Ignored', `${EMOJI.role} Members with ${role} will be ignored by bot moderation.`)] });
  }

  else if (sub === 'unignore') {
    const raw = interaction.options.getString('id');
    const id = raw.replace(/[<#@&>]/g, '');
    removeIgnore(guildId, id);
    await interaction.reply({ embeds: [successEmbed('Unignored', `${EMOJI.check} \`${id}\` removed from the ignore list.`)] });
  }

  else if (sub === 'list') {
    const cfg = getIgnore(guildId);
    const channels = cfg.channels.map(id => `<#${id}>`).join(', ') || 'None';
    const roles = cfg.roles.map(id => `<@&${id}>`).join(', ') || 'None';

    await interaction.reply({
      embeds: [createEmbed({
        color: THEME.info,
        title: `${EMOJI.settings} Ignore List`,
        description: DIVIDER,
        fields: [
          { name: `${EMOJI.channel} Ignored Channels (${cfg.channels.length})`, value: channels, inline: false },
          { name: `${EMOJI.role} Ignored Roles (${cfg.roles.length})`, value: roles, inline: false },
        ],
      })],
    });
  }

  else if (sub === 'reset') {
    resetIgnore(guildId);
    await interaction.reply({ embeds: [successEmbed('Ignore List Cleared', `${EMOJI.cross} All ignores have been removed.`)] });
  }
}
