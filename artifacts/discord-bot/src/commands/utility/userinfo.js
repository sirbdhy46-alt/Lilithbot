import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER_FANCY, DIVIDER_STARS, EMOJI } from '../../utils/embedBuilder.js';

const STATUS_MAP = {
  online:  { icon: '🟢', label: 'Online' },
  idle:    { icon: '🟡', label: 'Idle' },
  dnd:     { icon: '🔴', label: 'Do Not Disturb' },
  offline: { icon: '⚫', label: 'Offline' },
};

const BADGE_ICONS = {
  ActiveDeveloper:          '🧑‍💻 Active Developer',
  BugHunterLevel1:          '🐛 Bug Hunter',
  BugHunterLevel2:          '🐛 Bug Hunter Gold',
  CertifiedModerator:       '🛡️ Certified Moderator',
  HypeSquadOnlineHouse1:    '🏠 HypeSquad Bravery',
  HypeSquadOnlineHouse2:    '🏠 HypeSquad Brilliance',
  HypeSquadOnlineHouse3:    '🏠 HypeSquad Balance',
  HypeSquadEvents:          '🎉 HypeSquad Events',
  Partner:                  '🤝 Partnered Server Owner',
  PremiumEarlySupporter:    '💜 Early Supporter',
  Staff:                    '⚒️ Discord Staff',
  TeamPseudoUser:           '👥 Team User',
  VerifiedBot:              '✅ Verified Bot',
  VerifiedDeveloper:        '🏅 Verified Bot Developer',
};

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Get detailed information about a user')
  .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(false));

export async function execute(interaction) {
  const target = interaction.options.getUser('user') ?? interaction.user;
  const member = interaction.guild?.members.cache.get(target.id);
  await member?.fetch().catch(() => {});

  const status = member?.presence?.status ?? 'offline';
  const statusInfo = STATUS_MAP[status] ?? STATUS_MAP.offline;

  // Roles (exclude @everyone, sorted by position)
  const roleList = member?.roles.cache
    .filter(r => r.id !== interaction.guild?.id)
    .sort((a, b) => b.position - a.position)
    .map(r => r.toString())
    .slice(0, 12) ?? [];
  const rolesDisplay = roleList.length ? roleList.join(' ') : '`No roles`';
  const roleCount = (member?.roles.cache.size ?? 1) - 1;

  // Badges
  const flags = target.flags?.toArray() ?? [];
  const badgeDisplay = flags.length
    ? flags.map(f => BADGE_ICONS[f] ?? `\`${f}\``).join('\n')
    : '`No badges`';

  // Activity (game/streaming)
  const activity = member?.presence?.activities?.[0];
  const activityDisplay = activity
    ? `${activity.type === 1 ? '📡 Streaming' : activity.type === 0 ? '🎮 Playing' : activity.type === 2 ? '🎵 Listening to' : '▶️'} **${activity.name}**`
    : `\`Idle\``;

  const topRole = member?.roles.highest?.id !== interaction.guild?.id
    ? member?.roles.highest?.toString()
    : '`No roles`';

  const isOwner = interaction.guild?.ownerId === target.id;
  const embedColor = member?.displayHexColor && member.displayHexColor !== '#000000'
    ? parseInt(member.displayHexColor.replace('#', ''), 16)
    : THEME.primary;

  // Account age label
  const msOld = Date.now() - target.createdTimestamp;
  const years = Math.floor(msOld / (365.25 * 86400000));
  const months = Math.floor((msOld % (365.25 * 86400000)) / (30.44 * 86400000));
  const ageLabel = years > 0 ? `${years}y ${months}mo old` : `${months} months old`;

  const accountType = target.bot
    ? `${EMOJI.bot} Bot Account`
    : isOwner
      ? `${EMOJI.king} Server Owner`
      : `${EMOJI.blobcool2} Member`;

  await interaction.reply({
    embeds: [createEmbed({
      color: embedColor,
      author: {
        name: `${member?.displayName ?? target.username}  •  User Profile`,
        iconURL: target.displayAvatarURL({ dynamic: true }),
      },
      title: null,
      description: [
        `${accountType}  ${statusInfo.icon} **${statusInfo.label}**`,
        ``,
        DIVIDER_FANCY,
      ].join('\n'),
      fields: [
        // Row 1
        {
          name: `${EMOJI.user} Username`,
          value: `**${target.username}**`,
          inline: true,
        },
        {
          name: `🆔 User ID`,
          value: `\`${target.id}\``,
          inline: true,
        },
        {
          name: `🎯 Highest Role`,
          value: topRole ?? '`None`',
          inline: true,
        },
        // Row 2
        {
          name: `${EMOJI.calendar} Account Created`,
          value: `<t:${Math.floor(target.createdTimestamp / 1000)}:D>\n<t:${Math.floor(target.createdTimestamp / 1000)}:R> *(${ageLabel})*`,
          inline: true,
        },
        {
          name: `${EMOJI.join} Joined Server`,
          value: member
            ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>\n<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
            : '`Not in server`',
          inline: true,
        },
        {
          name: `🎮 Activity`,
          value: activityDisplay,
          inline: true,
        },
        // Badges row
        {
          name: `${EMOJI.frostellite} Badges`,
          value: badgeDisplay,
          inline: flags.length > 2 ? false : true,
        },
        // Roles row
        {
          name: `${EMOJI.role} Roles [${roleCount}]`,
          value: rolesDisplay,
          inline: false,
        },
      ],
      thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
      image: (await target.fetch(true).catch(() => null))?.bannerURL?.({ size: 512 }) ?? null,
      footer: { text: `${EMOJI.sparkle} Lilith Protector  •  ${target.bot ? 'Bot' : 'User'} Profile` },
    })],
  });
}
