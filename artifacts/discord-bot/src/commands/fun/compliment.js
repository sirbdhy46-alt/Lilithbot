import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

const COMPLIMENTS = [
  "You're a ray of sunshine in an otherwise dark server.",
  "You make this community so much better just by being here.",
  "If there were more people like you, Discord would be a better place.",
  "You're the kind of person that makes others feel at home.",
  "Your positivity is genuinely contagious — keep it up!",
  "You're not just smart, you're *impressively* smart.",
  "The world is definitely a better place with you in it.",
  "You light up every chat room you enter.",
  "Your creativity is something truly special.",
  "You're a gem — and not just any gem, a diamond.",
  "You handle things with incredible grace and confidence.",
  "People are lucky to have you around.",
];

export const data = new SlashCommandBuilder()
  .setName('compliment')
  .setDescription('Send a compliment to someone')
  .addUserOption(o => o.setName('user').setDescription('Who to compliment').setRequired(false));

export async function execute(interaction) {
  const target = interaction.options?.getUser?.('user') ?? interaction.user;
  const comp = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];

  await interaction.reply({
    embeds: [createEmbed({
      color: THEME.success,
      title: `${EMOJI.heart} Compliment — ${target.username}`,
      description: [DIVIDER, ``, `*"${comp}"*`, ``, `${EMOJI.arrow} For: ${target}`, ``, DIVIDER].join('\n'),
    })],
  });
}
