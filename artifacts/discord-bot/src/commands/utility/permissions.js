import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

function formatPerm(perm) {
  return perm.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export const data = new SlashCommandBuilder()
  .setName('permissions')
  .setDescription("Check a member's permissions in this server or a channel")
  .addUserOption(o => o.setName('user').setDescription('Member to check').setRequired(false))
  .addChannelOption(o => o.setName('channel').setDescription('Check permissions in a specific channel').setRequired(false));

export async function execute(interaction) {
  const target = interaction.options?.getMember?.('user') ?? interaction.member;
  const channel = interaction.options?.getChannel?.('channel') ?? interaction.channel;

  if (!target) return interaction.reply({ content: 'Member not found.', ephemeral: true });

  const perms = channel
    ? target.permissionsIn(channel)
    : target.permissions;

  const allPerms = Object.keys(PermissionsBitField.Flags);
  const hasList = allPerms.filter(p => perms.has(p)).map(p => `✅ \`${formatPerm(p)}\``);
  const lacksKey = ['BanMembers', 'KickMembers', 'ManageGuild', 'Administrator', 'ManageMessages', 'ManageRoles'];
  const lacksDisplay = lacksKey.filter(p => !perms.has(p)).map(p => `❌ \`${formatPerm(p)}\``);

  const isAdmin = perms.has('Administrator');

  await interaction.reply({
    embeds: [createEmbed({
      color: isAdmin ? THEME.warning : THEME.primary,
      title: `${EMOJI.shield} Permissions — ${target.user.username}`,
      description: [DIVIDER, isAdmin ? `\n⚠️ **Administrator** — has ALL permissions.\n` : '', DIVIDER].join('\n'),
      fields: [
        { name: `${EMOJI.check} Has Permissions`, value: hasList.slice(0, 12).join('\n') || 'None', inline: true },
        { name: `${EMOJI.cross} Missing (Key)`, value: lacksDisplay.join('\n') || 'None missing', inline: true },
        ...(channel ? [{ name: `${EMOJI.channel} Context`, value: `Checking in ${channel}`, inline: false }] : []),
      ],
    })],
  });
}
