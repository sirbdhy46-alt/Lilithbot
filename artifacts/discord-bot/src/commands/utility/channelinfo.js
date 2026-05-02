import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

const CHANNEL_TYPES = {
  [ChannelType.GuildText]: 'Text Channel',
  [ChannelType.GuildVoice]: 'Voice Channel',
  [ChannelType.GuildCategory]: 'Category',
  [ChannelType.GuildAnnouncement]: 'Announcement',
  [ChannelType.GuildForum]: 'Forum',
  [ChannelType.GuildStageVoice]: 'Stage',
};

export const data = new SlashCommandBuilder()
  .setName('channelinfo')
  .setDescription('Get detailed information about a channel')
  .addChannelOption(o => o.setName('channel').setDescription('Channel to inspect').setRequired(false));

export async function execute(interaction) {
  const channel = interaction.options?.getChannel?.('channel') ?? interaction.channel;

  await interaction.reply({
    embeds: [createEmbed({
      color: THEME.primary,
      title: `${EMOJI.channel} Channel Info — #${channel.name}`,
      description: DIVIDER,
      fields: [
        { name: '🆔 Channel ID', value: `\`${channel.id}\``, inline: true },
        { name: `${EMOJI.settings} Type`, value: `\`${CHANNEL_TYPES[channel.type] ?? 'Unknown'}\``, inline: true },
        { name: `${EMOJI.category} Category`, value: channel.parent ? `\`${channel.parent.name}\`` : '`None`', inline: true },
        { name: `${EMOJI.calendar} Created`, value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:D>`, inline: true },
        { name: `${EMOJI.crown} Position`, value: `\`#${channel.position ?? 'N/A'}\``, inline: true },
        { name: `${EMOJI.lock} NSFW`, value: channel.nsfw ? '`Yes`' : '`No`', inline: true },
        ...(channel.topic ? [{ name: `${EMOJI.pin} Topic`, value: channel.topic.slice(0, 200), inline: false }] : []),
        ...(channel.rateLimitPerUser ? [{ name: `${EMOJI.slow} Slowmode`, value: `\`${channel.rateLimitPerUser}s\``, inline: true }] : []),
      ],
    })],
  });
}
