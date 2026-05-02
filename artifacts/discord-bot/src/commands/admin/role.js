import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed, infoEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('role')
  .setDescription('Role management commands')
  .addSubcommand(sub =>
    sub.setName('add')
      .setDescription('Give a role to a member')
      .addUserOption(opt => opt.setName('user').setDescription('Target member').setRequired(true))
      .addRoleOption(opt => opt.setName('role').setDescription('Role to give').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('remove')
      .setDescription('Remove a role from a member')
      .addUserOption(opt => opt.setName('user').setDescription('Target member').setRequired(true))
      .addRoleOption(opt => opt.setName('role').setDescription('Role to remove').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('info')
      .setDescription('Get information about a role')
      .addRoleOption(opt => opt.setName('role').setDescription('The role').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('create')
      .setDescription('Create a new role')
      .addStringOption(opt => opt.setName('name').setDescription('Role name').setRequired(true))
      .addStringOption(opt => opt.setName('color').setDescription('Role color (hex, e.g. #FF5733)').setRequired(false))
  )
  .addSubcommand(sub =>
    sub.setName('delete')
      .setDescription('Delete a role')
      .addRoleOption(opt => opt.setName('role').setDescription('Role to delete').setRequired(true))
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'add') {
    const member = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');

    if (!member) return interaction.reply({ embeds: [errorEmbed('Not Found', 'Member not found in this server.')], ephemeral: true });
    if (!role) return interaction.reply({ embeds: [errorEmbed('Not Found', 'Role not found.')], ephemeral: true });

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ embeds: [errorEmbed('Cannot Add Role', 'That role is higher than or equal to my highest role.')], ephemeral: true });
    }

    if (member.roles.cache.has(role.id)) {
      return interaction.reply({ embeds: [errorEmbed('Already Has Role', `**${member.user.tag}** already has the ${role} role.`)], ephemeral: true });
    }

    await member.roles.add(role, `Role added by ${interaction.user.tag}`);
    await interaction.reply({
      embeds: [successEmbed('Role Added', [
        `${EMOJI.role} Added ${role} to **${member.user.tag}**`,
        ``,
        `${EMOJI.arrow} **Moderator:** ${interaction.user.tag}`,
      ].join('\n'))],
    });
  }

  else if (sub === 'remove') {
    const member = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');

    if (!member) return interaction.reply({ embeds: [errorEmbed('Not Found', 'Member not found.')], ephemeral: true });
    if (!role) return interaction.reply({ embeds: [errorEmbed('Not Found', 'Role not found.')], ephemeral: true });

    if (!member.roles.cache.has(role.id)) {
      return interaction.reply({ embeds: [errorEmbed('Does Not Have Role', `**${member.user.tag}** does not have the ${role} role.`)], ephemeral: true });
    }

    await member.roles.remove(role, `Role removed by ${interaction.user.tag}`);
    await interaction.reply({
      embeds: [successEmbed('Role Removed', [
        `${EMOJI.role} Removed ${role} from **${member.user.tag}**`,
        ``,
        `${EMOJI.arrow} **Moderator:** ${interaction.user.tag}`,
      ].join('\n'))],
    });
  }

  else if (sub === 'info') {
    const role = interaction.options.getRole('role');
    if (!role) return interaction.reply({ embeds: [errorEmbed('Not Found', 'Role not found.')], ephemeral: true });

    const memberCount = interaction.guild.members.cache.filter(m => m.roles.cache.has(role.id)).size;
    const perms = role.permissions.toArray().slice(0, 8).map(p => `\`${p}\``).join(', ') || 'None';
    const hexColor = role.hexColor === '#000000' ? 'Default' : role.hexColor;
    const createdAt = `<t:${Math.floor(role.createdTimestamp / 1000)}:D>`;

    const embed = createEmbed({
      color: role.color || THEME.primary,
      title: `${EMOJI.role} Role Info — ${role.name}`,
      description: DIVIDER,
      fields: [
        { name: '🆔 Role ID', value: `\`${role.id}\``, inline: true },
        { name: `${EMOJI.settings} Color`, value: hexColor, inline: true },
        { name: `${EMOJI.user} Members`, value: `\`${memberCount}\``, inline: true },
        { name: `${EMOJI.calendar} Created`, value: createdAt, inline: true },
        { name: `${EMOJI.crown} Position`, value: `\`#${role.position}\``, inline: true },
        { name: `${EMOJI.check} Mentionable`, value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: `${EMOJI.settings} Permissions`, value: perms, inline: false },
      ],
    });

    await interaction.reply({ embeds: [embed] });
  }

  else if (sub === 'create') {
    const name = interaction.options.getString('name');
    const color = interaction.options.getString('color')?.replace('#', '') ?? null;

    try {
      const role = await interaction.guild.roles.create({
        name,
        color: color ? parseInt(color, 16) : null,
        reason: `Created by ${interaction.user.tag}`,
      });

      await interaction.reply({
        embeds: [successEmbed('Role Created', [
          `${EMOJI.role} Created ${role}`,
          ``,
          `${EMOJI.arrow} **Name:** ${name}`,
          `${EMOJI.arrow} **Color:** ${color ? `#${color}` : 'Default'}`,
          `${EMOJI.arrow} **By:** ${interaction.user.tag}`,
        ].join('\n'))],
      });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed('Creation Failed', err.message)], ephemeral: true });
    }
  }

  else if (sub === 'delete') {
    const role = interaction.options.getRole('role');
    if (!role) return interaction.reply({ embeds: [errorEmbed('Not Found', 'Role not found.')], ephemeral: true });

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ embeds: [errorEmbed('Cannot Delete', 'That role is higher than or equal to my highest role.')], ephemeral: true });
    }

    const roleName = role.name;
    await role.delete(`Deleted by ${interaction.user.tag}`);
    await interaction.reply({
      embeds: [successEmbed('Role Deleted', `${EMOJI.role} The role **${roleName}** has been deleted.`)],
    });
  }
}
