import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('roleinfo')
  .setDescription('Get detailed information about a role')
  .addRoleOption(o => o.setName('role').setDescription('The role to inspect').setRequired(true));

export async function execute(interaction) {
  const role = interaction.options?.getRole?.('role') ?? interaction.options.getRole('role');
  if (!role) return;

  const memberCount = interaction.guild.members.cache.filter(m => m.roles.cache.has(role.id)).size;
  const perms = role.permissions.toArray().map(p =>
    p.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  ).slice(0, 12).join(', ') || 'None';
  const hexColor = role.hexColor === '#000000' ? 'None (default)' : role.hexColor;

  await interaction.reply({
    embeds: [createEmbed({
      color: role.color || THEME.primary,
      title: `${EMOJI.role} Role Info — ${role.name}`,
      description: DIVIDER,
      fields: [
        { name: '🆔 Role ID', value: `\`${role.id}\``, inline: true },
        { name: `${EMOJI.settings} Color`, value: `\`${hexColor}\``, inline: true },
        { name: `${EMOJI.user} Members`, value: `\`${memberCount}\``, inline: true },
        { name: `${EMOJI.calendar} Created`, value: `<t:${Math.floor(role.createdTimestamp / 1000)}:D>`, inline: true },
        { name: `${EMOJI.crown} Position`, value: `\`#${role.position}\` of ${interaction.guild.roles.cache.size}`, inline: true },
        { name: `${EMOJI.check} Mentionable`, value: role.mentionable ? '`Yes`' : '`No`', inline: true },
        { name: `${EMOJI.check} Hoisted`, value: role.hoist ? '`Yes (shown separately)`' : '`No`', inline: true },
        { name: `${EMOJI.bot} Managed (Bot)`, value: role.managed ? '`Yes`' : '`No`', inline: true },
        { name: `${EMOJI.settings} Key Permissions`, value: perms, inline: false },
      ],
    })],
  });
}
