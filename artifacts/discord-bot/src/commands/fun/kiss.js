import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, DIVIDER_FANCY, DIVIDER_STARS, EMOJI } from '../../utils/embedBuilder.js';
import { getGif } from '../../utils/getGif.js';

const MSGS = [
  (a, b) => `${EMOJI.love} **${a}** plants a kiss on **${b}**! 💋`,
  (a, b) => `${EMOJI.heartbeat} **${a}** gives **${b}** a sweet kiss! 💕`,
  (a, b) => `${EMOJI.nekosparkle} **${a}** kisses **${b}** on the cheek! 😘`,
  (a, b) => `${EMOJI.heart} **${a}** and **${b}** share a moment! 💖`,
];

export const data = new SlashCommandBuilder()
  .setName('kiss')
  .setDescription('Send a kiss to someone 💋')
  .addUserOption(o => o.setName('user').setDescription('Who to kiss').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();
  const target = interaction.options.getUser('user');
  const isSelf = target.id === interaction.user.id;
  const msg = isSelf
    ? `${EMOJI.blobthink} **${interaction.user.username}** tried to kiss themselves... 💭`
    : MSGS[Math.floor(Math.random() * MSGS.length)](interaction.user.username, target.username);
  const gifUrl = await getGif('kiss');

  await interaction.editReply({
    embeds: [createEmbed({
      color: 0xFF1493,
      title: `${EMOJI.love} Kiss!`,
      description: [
        DIVIDER_FANCY, ``,
        msg,
        ``,
        DIVIDER_STARS,
        `${EMOJI.bullet} **From** ─── ${interaction.user}`,
        `${EMOJI.bullet} **To** ─── ${target}`,
        ``,
        DIVIDER_FANCY,
      ].join('\n'),
      image: gifUrl,
      footer: { text: `${EMOJI.heart} How romantic!` },
    })],
  });
}
