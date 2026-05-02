import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import {
  createEmbed, successEmbed, errorEmbed, infoEmbed,
  THEME, DIVIDER_FANCY, DIVIDER_STARS, EMOJI,
} from '../../utils/embedBuilder.js';
import { getVanity, setVanity, resetVanity } from '../../utils/guildConfig.js';

export const data = new SlashCommandBuilder()
  .setName('vanity')
  .setDescription('Custom invite link + role for members who join through it')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(sub =>
    sub.setName('setup')
      .setDescription('Create a tracked vanity invite and assign a role to users who join through it')
      .addChannelOption(o =>
        o.setName('channel')
          .setDescription('Channel to create the invite in')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
      .addRoleOption(o =>
        o.setName('role')
          .setDescription('Role to assign to members who join through the vanity invite')
          .setRequired(true)
      )
      .addStringOption(o =>
        o.setName('label')
          .setDescription('Display label for the invite (cosmetic, e.g. "LilyLilith")')
          .setRequired(false)
          .setMaxLength(32)
      )
  )
  .addSubcommand(sub =>
    sub.setName('info')
      .setDescription('View current vanity invite configuration and stats')
  )
  .addSubcommand(sub =>
    sub.setName('reset')
      .setDescription('Remove the vanity invite configuration')
  );

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guild = interaction.guild;
  const me = guild.members.me;

  if (!me.permissions.has(PermissionFlagsBits.CreateInstantInvite)) {
    return interaction.reply({
      embeds: [errorEmbed('Missing Permission', `${EMOJI.blobangry} I need the **Create Invite** permission.`)],
      ephemeral: true,
    });
  }

  if (sub === 'setup') {
    const channel = interaction.options.getChannel('channel');
    const role = interaction.options.getRole('role');
    const label = interaction.options.getString('label') ?? guild.name;

    if (role.position >= me.roles.highest.position) {
      return interaction.reply({
        embeds: [errorEmbed('Role Too High', `${EMOJI.blobangry} I cannot manage **${role.name}** — it's above my highest role.`)],
        ephemeral: true,
      });
    }

    if (role.managed) {
      return interaction.reply({
        embeds: [errorEmbed('Managed Role', `${EMOJI.blobthink} **${role.name}** is a managed/integration role.`)],
        ephemeral: true,
      });
    }

    // Delete old vanity invite if exists
    const old = getVanity(guild.id);
    if (old?.inviteCode) {
      try {
        const oldInvite = await guild.invites.fetch(old.inviteCode).catch(() => null);
        if (oldInvite) await oldInvite.delete('Replaced by new vanity invite').catch(() => {});
      } catch {}
    }

    // Create new permanent invite
    let invite;
    try {
      invite = await channel.createInvite({
        maxAge: 0,       // Never expires
        maxUses: 0,      // Unlimited uses
        unique: true,
        reason: `Lilith Vanity Invite — ${label}`,
      });
    } catch (err) {
      return interaction.reply({
        embeds: [errorEmbed('Invite Failed', `${EMOJI.triggered} Could not create invite: ${err.message}`)],
        ephemeral: true,
      });
    }

    setVanity(guild.id, {
      inviteCode: invite.code,
      inviteUrl: invite.url,
      channelId: channel.id,
      roleId: role.id,
      label,
      lastUses: invite.uses ?? 0,
      createdAt: Date.now(),
    });

    // Try to set Discord's built-in vanity URL if the server is eligible
    let discordVanity = null;
    try {
      if (guild.features.includes('VANITY_URL')) {
        const safeName = label.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase().slice(0, 32);
        await guild.setVanityCode(safeName);
        discordVanity = `discord.gg/${safeName}`;
      }
    } catch {}

    await interaction.reply({
      embeds: [createEmbed({
        color: THEME.gold,
        title: `${EMOJI.crown} Vanity Invite Created`,
        description: [
          DIVIDER_FANCY, ``,
          `${EMOJI.sparkle} Your vanity invite is live! Members who join using this link will receive the **${role.name}** role automatically.`,
          ``,
          DIVIDER_STARS,
          `${EMOJI.bullet} **Label** ─── \`${label}\``,
          `${EMOJI.bullet} **Invite** ─── **discord.gg/${invite.code}**`,
          discordVanity ? `${EMOJI.bullet} **Vanity URL** ─── **${discordVanity}** ${EMOJI.vip}` : '',
          `${EMOJI.bullet} **Role** ─── ${role}`,
          `${EMOJI.bullet} **Channel** ─── ${channel}`,
          `${EMOJI.bullet} **Expires** ─── Never`,
          `${EMOJI.bullet} **Uses** ─── Unlimited`,
          ``,
          DIVIDER_STARS,
          `${EMOJI.blobjoining} Anyone who joins via this link gets **${role.name}** instantly!`,
          ``,
          DIVIDER_FANCY,
        ].filter(Boolean).join('\n'),
        footer: { text: `${EMOJI.sparkle} Lilith Protector  •  Vanity System` },
      })],
    });
  }

  else if (sub === 'info') {
    const vanity = getVanity(guild.id);

    if (!vanity) {
      return interaction.reply({
        embeds: [infoEmbed('No Vanity Set', `${EMOJI.blobthink} No vanity invite configured.\n\nUse \`/vanity setup\` to create one.`)],
        ephemeral: true,
      });
    }

    // Fetch live invite data
    let liveUses = vanity.lastUses ?? 0;
    try {
      const inv = await guild.invites.fetch(vanity.inviteCode).catch(() => null);
      if (inv) liveUses = inv.uses;
    } catch {}

    const createdRel = vanity.createdAt ? `<t:${Math.floor(vanity.createdAt / 1000)}:R>` : 'Unknown';

    await interaction.reply({
      embeds: [createEmbed({
        color: THEME.gold,
        title: `${EMOJI.crown} Vanity Invite — ${vanity.label ?? guild.name}`,
        description: [
          DIVIDER_FANCY, ``,
          `${EMOJI.sparkle} **discord.gg/${vanity.inviteCode}**`,
          ``,
          DIVIDER_STARS,
          `${EMOJI.bullet} **Label** ─── \`${vanity.label ?? 'Not set'}\``,
          `${EMOJI.bullet} **Role** ─── <@&${vanity.roleId}>`,
          `${EMOJI.bullet} **Channel** ─── <#${vanity.channelId}>`,
          `${EMOJI.bullet} **Total Uses** ─── \`${liveUses.toLocaleString()}\``,
          `${EMOJI.bullet} **Created** ─── ${createdRel}`,
          ``,
          DIVIDER_FANCY,
        ].join('\n'),
        footer: { text: `${EMOJI.sparkle} Lilith Protector  •  Vanity System` },
      })],
    });
  }

  else if (sub === 'reset') {
    const vanity = getVanity(guild.id);

    if (!vanity) {
      return interaction.reply({
        embeds: [infoEmbed('Nothing to Reset', `${EMOJI.blobthink} No vanity invite is configured.`)],
        ephemeral: true,
      });
    }

    // Delete the invite
    try {
      const inv = await guild.invites.fetch(vanity.inviteCode).catch(() => null);
      if (inv) await inv.delete('Vanity reset by admin').catch(() => {});
    } catch {}

    resetVanity(guild.id);

    await interaction.reply({
      embeds: [successEmbed('Vanity Reset', `${EMOJI.check} The vanity invite **discord.gg/${vanity.inviteCode}** has been deleted and the configuration cleared.`)],
    });
  }
}
