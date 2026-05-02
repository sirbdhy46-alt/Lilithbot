import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';
import { getAutoroles, addAutorole, removeAutorole, setAntinuke } from '../../utils/guildConfig.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const data = new SlashCommandBuilder()
  .setName('autorole')
  .setDescription('Automatically give roles when members join')
  .addSubcommand(sub =>
    sub.setName('add')
      .setDescription('Add an autorole for humans or bots')
      .addRoleOption(o => o.setName('role').setDescription('Role to auto-assign').setRequired(true))
      .addStringOption(o => o.setName('type').setDescription('Apply to').setRequired(false)
        .addChoices({ name: 'Humans', value: 'humans' }, { name: 'Bots', value: 'bots' }, { name: 'All', value: 'all' }))
  )
  .addSubcommand(sub =>
    sub.setName('remove')
      .setDescription('Remove an autorole')
      .addRoleOption(o => o.setName('role').setDescription('Role to remove').setRequired(true))
  )
  .addSubcommand(sub => sub.setName('list').setDescription('List all active autoroles'))
  .addSubcommand(sub => sub.setName('reset').setDescription('Clear all autoroles'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guild.id;

  if (sub === 'add') {
    const role = interaction.options.getRole('role');
    const type = interaction.options.getString('type') ?? 'humans';

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ embeds: [errorEmbed('Too High', 'That role is higher than my highest role.')], ephemeral: true });
    }

    if (type === 'all') {
      addAutorole(guildId, role.id, 'humans');
      addAutorole(guildId, role.id, 'bots');
    } else {
      addAutorole(guildId, role.id, type);
    }

    await interaction.reply({
      embeds: [successEmbed('Autorole Added', [
        `${EMOJI.role} ${role} will now be given to **${type === 'all' ? 'everyone' : type}** who join.`,
        `${EMOJI.arrow} **Set by:** ${interaction.user.tag}`,
      ].join('\n'))],
    });
  }

  else if (sub === 'remove') {
    const role = interaction.options.getRole('role');
    removeAutorole(guildId, role.id);
    await interaction.reply({ embeds: [successEmbed('Autorole Removed', `${EMOJI.cross} ${role} removed from autoroles.`)] });
  }

  else if (sub === 'list') {
    const autoroles = getAutoroles(guildId);
    const humanRoles = autoroles.humans.map(id => `<@&${id}>`).join(', ') || 'None';
    const botRoles = autoroles.bots.map(id => `<@&${id}>`).join(', ') || 'None';

    await interaction.reply({
      embeds: [createEmbed({
        color: THEME.primary,
        title: `${EMOJI.role} Autoroles — ${interaction.guild.name}`,
        description: DIVIDER,
        fields: [
          { name: `${EMOJI.user} Human Autoroles`, value: humanRoles, inline: false },
          { name: `${EMOJI.bot} Bot Autoroles`, value: botRoles, inline: false },
        ],
      })],
    });
  }

  else if (sub === 'reset') {
    const ar = getAutoroles(guildId);
    const allIds = [...new Set([...ar.humans, ...ar.bots])];
    for (const id of allIds) removeAutorole(guildId, id);
    await interaction.reply({ embeds: [successEmbed('Autoroles Reset', `${EMOJI.cross} All autoroles have been cleared.`)] });
  }
}
