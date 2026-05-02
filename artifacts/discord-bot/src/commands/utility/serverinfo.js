import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER_FANCY, DIVIDER_STARS, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('Get detailed information about this server');

const VERIFY_LABELS = { 0: '🔓 None', 1: '📧 Low', 2: '⏱️ Medium', 3: '📱 High', 4: '🔒 Very High' };
const BOOST_COLORS  = [THEME.dark, 0xF47FFF, 0xE53E3E, 0xF1C40F];
const BOOST_TIERS   = ['No Tier', '✦ Tier 1', '✦✦ Tier 2', '✦✦✦ Tier 3'];
const MFA_LABELS    = { 0: 'Not Required', 1: 'Required' };

export async function execute(interaction) {
  await interaction.deferReply();
  const guild = interaction.guild;
  await guild.fetch();

  const owner = await guild.fetchOwner();
  const channels = guild.channels.cache;
  const textCh  = channels.filter(c => c.type === 0).size;
  const voiceCh = channels.filter(c => c.type === 2).size;
  const cats    = channels.filter(c => c.type === 4).size;
  const forums  = channels.filter(c => c.type === 15).size;
  const threads = channels.filter(c => [10, 11, 12].includes(c.type)).size;
  const boosts  = guild.premiumSubscriptionCount ?? 0;
  const tier    = guild.premiumTier;
  const color   = BOOST_COLORS[tier] ?? THEME.primary;

  const features = guild.features.slice(0, 5)
    .map(f => `\`${f.replace(/_/g, ' ')}\``).join(' ') || '`None`';

  await interaction.editReply({
    embeds: [createEmbed({
      color,
      author: {
        name: `${guild.name}  •  Server Info`,
        iconURL: guild.iconURL({ dynamic: true }) ?? undefined,
      },
      title: null,
      description: [
        guild.description ? `> *${guild.description}*\n` : '',
        DIVIDER_FANCY,
      ].join('\n'),
      fields: [
        {
          name: `${EMOJI.crown} Owner`,
          value: `${owner.user}\n\`${owner.user.username}\``,
          inline: true,
        },
        {
          name: `🆔 Server ID`,
          value: `\`${guild.id}\``,
          inline: true,
        },
        {
          name: `${EMOJI.calendar} Created`,
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>\n<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: `👥 Members`,
          value: `**${guild.memberCount.toLocaleString()}** total`,
          inline: true,
        },
        {
          name: `${EMOJI.role} Roles`,
          value: `**${guild.roles.cache.size}** roles`,
          inline: true,
        },
        {
          name: `😀 Emojis & Stickers`,
          value: `**${guild.emojis.cache.size}** emojis\n**${guild.stickers.cache.size}** stickers`,
          inline: true,
        },
        {
          name: `📢 Text Channels`,
          value: `**${textCh}**${forums ? ` + **${forums}** forums` : ''}${threads ? ` + **${threads}** threads` : ''}`,
          inline: true,
        },
        {
          name: `🔊 Voice Channels`,
          value: `**${voiceCh}** voice\n**${cats}** categories`,
          inline: true,
        },
        {
          name: `${EMOJI.lock} Security`,
          value: VERIFY_LABELS[guild.verificationLevel] ?? 'Unknown',
          inline: true,
        },
        {
          name: `🚀 Server Boost`,
          value: `**${boosts}** boosts\n${BOOST_TIERS[tier] ?? 'No Tier'}`,
          inline: true,
        },
        {
          name: `🔐 2FA Requirement`,
          value: MFA_LABELS[guild.mfaLevel] ?? 'Not Required',
          inline: true,
        },
        {
          name: `${EMOJI.sparkle} Features`,
          value: features,
          inline: true,
        },
      ],
      thumbnail: guild.iconURL({ dynamic: true, size: 512 }),
      image: guild.bannerURL({ size: 1024 }) ?? null,
      footer: { text: `${EMOJI.sparkle} Lilith Protector  •  Requested by ${interaction.user.username}` },
    })],
  });
}
