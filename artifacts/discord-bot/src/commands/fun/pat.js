import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, DIVIDER_FANCY, DIVIDER_STARS, EMOJI } from '../../utils/embedBuilder.js';
import { getGif } from '../../utils/getGif.js';

const MSGS = [
  (a, b) => `${EMOJI.pandacool} **${a}** gently pats **${b}** on the head! ✨`,
  (a, b) => `${EMOJI.blobheart} **${a}** gives **${b}** the softest head pat!`,
  (a, b) => `${EMOJI.nekosparkle} **${a}** pats **${b}** like the good bean they are!`,
  (a, b) => `${EMOJI.sparkle} **${a}** pats **${b}** — good job, friend!`,
];

export const data = new SlashCommandBuilder()
  .setName('pat')
  .setDescription('Pat someone on the head 🫶')
  .addUserOption(o => o.setName('user').setDescription('Who to pat').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();
  const target = interaction.options.getUser('user');
  const msg = MSGS[Math.floor(Math.random() * MSGS.length)](interaction.user.username, target.username);
  const gifUrl = await getGif('pat');

  await interaction.editReply({
    embeds: [createEmbed({
      color: 0xFFD700,
      title: `${EMOJI.pandacool} Pat!`,
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
      footer: { text: `${EMOJI.sparkle} *pat pat*` },
    })],
  });
}
