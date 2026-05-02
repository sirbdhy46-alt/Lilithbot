import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER_FANCY, DIVIDER_STARS, EMOJI } from '../../utils/embedBuilder.js';
import { getGif } from '../../utils/getGif.js';

const ROASTS = [
  "I'd roast you, but my parents told me not to burn trash.",
  "You're like a cloud — when you disappear, it's a beautiful day.",
  "I'd explain it to you, but I left my crayons at home.",
  "Some cause happiness wherever they go. You cause happiness whenever you go.",
  "I've seen more life in a sleeping sloth.",
  "You're proof that even evolution can have off days.",
  "If laughter is the best medicine, your face must be curing diseases.",
  "You're the human equivalent of a participation trophy.",
  "I would challenge you to a battle of wits, but I see you're unarmed.",
  "I'm jealous of people who haven't met you.",
  "You have the charm of a week-old sandwich left in a Discord server's general chat.",
  "Your brain is so small it could fit inside a Discord emoji.",
];

export const data = new SlashCommandBuilder()
  .setName('roast')
  .setDescription('Roast someone (or yourself)')
  .addUserOption(o => o.setName('user').setDescription('Who to roast').setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply();
  const target = interaction.options?.getUser?.('user') ?? interaction.user;
  const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
  const gifUrl = await getGif('baka');

  await interaction.editReply({
    embeds: [createEmbed({
      color: THEME.error,
      title: `${EMOJI.fire} Roasted — ${target.username}`,
      description: [
        DIVIDER_FANCY, ``,
        `${EMOJI.triggered} **${interaction.user.username}** just roasted **${target.username}**:`,
        ``,
        `*"${roast}"*`,
        ``,
        DIVIDER_STARS,
        `${EMOJI.bullet} **Victim** ─── ${target}`,
        `${EMOJI.bullet} **Roaster** ─── ${interaction.user}`,
        ``,
        DIVIDER_FANCY,
      ].join('\n'),
      image: gifUrl,
      footer: { text: `${EMOJI.fire} Get rekt!` },
    })],
  });
}
