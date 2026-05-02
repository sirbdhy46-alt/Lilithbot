import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER_FANCY, DIVIDER_STARS, EMOJI } from '../../utils/embedBuilder.js';
import { getGif } from '../../utils/getGif.js';

const MSGS = [
  (a, b) => `${EMOJI.blobheart} **${a}** wraps **${b}** in the warmest hug ever!`,
  (a, b) => `${EMOJI.love} **${a}** gives **${b}** a super tight hug! 🫂`,
  (a, b) => `${EMOJI.nekosparkle} **${a}** hugs **${b}** and refuses to let go!`,
  (a, b) => `${EMOJI.heart} **${a}** squeezes **${b}** with all their love!`,
];

export const data = new SlashCommandBuilder()
  .setName('hug')
  .setDescription('Give someone a warm hug 🤗')
  .addUserOption(o => o.setName('user').setDescription('Who to hug').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();
  const target = interaction.options.getUser('user');
  const isSelf = target.id === interaction.user.id;
  const msg = isSelf
    ? `${EMOJI.blobangel} **${interaction.user.username}** hugs themselves... wholesome honestly. 🫂`
    : MSGS[Math.floor(Math.random() * MSGS.length)](interaction.user.username, target.username);
  const gifUrl = await getGif('hug');

  await interaction.editReply({
    embeds: [createEmbed({
      color: 0xFF69B4,
      title: `${EMOJI.blobheart} Hug!`,
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
      footer: { text: `${EMOJI.heart} Spread love!` },
    })],
  });
}
