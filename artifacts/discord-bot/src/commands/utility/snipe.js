import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, errorEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('snipe')
  .setDescription('Show the last deleted message in this channel')
  .addChannelOption(opt => opt.setName('channel').setDescription('Channel to snipe from').setRequired(false));

export async function execute(interaction) {
  const channel = interaction.options?.getChannel?.('channel') ?? interaction.channel;
  const snipe = globalThis.snipeCache?.get(channel.id);

  if (!snipe) {
    return interaction.reply({
      embeds: [errorEmbed('Nothing to Snipe', `${EMOJI.search} No recently deleted messages in ${channel}.`)],
      ephemeral: true,
    });
  }

  const secondsAgo = Math.floor((Date.now() - snipe.timestamp) / 1000);
  const timeStr = secondsAgo < 60
    ? `${secondsAgo}s ago`
    : `${Math.floor(secondsAgo / 60)}m ${secondsAgo % 60}s ago`;

  const embed = createEmbed({
    color: THEME.primary,
    title: `${EMOJI.search} Sniped Message`,
    description: [
      DIVIDER,
      ``,
      snipe.content ? `*"${snipe.content}"*` : '*[No text — image only]*',
      ``,
      DIVIDER,
    ].join('\n'),
    thumbnail: snipe.author.avatar,
    image: snipe.image ?? null,
    fields: [
      { name: `${EMOJI.user} Author`, value: `<@${snipe.author.id}> \`(${snipe.author.tag})\``, inline: true },
      { name: `${EMOJI.channel} Channel`, value: `${channel}`, inline: true },
      { name: `${EMOJI.time} Deleted`, value: timeStr, inline: true },
    ],
  });

  await interaction.reply({ embeds: [embed] });
}
