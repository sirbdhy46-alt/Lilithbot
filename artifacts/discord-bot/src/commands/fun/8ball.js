import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

const ANSWERS = [
  { text: 'It is certain.', color: THEME.success },
  { text: 'It is decidedly so.', color: THEME.success },
  { text: 'Without a doubt.', color: THEME.success },
  { text: 'Yes, definitely.', color: THEME.success },
  { text: 'You may rely on it.', color: THEME.success },
  { text: 'As I see it, yes.', color: THEME.success },
  { text: 'Most likely.', color: THEME.success },
  { text: 'Outlook good.', color: THEME.success },
  { text: 'Yes.', color: THEME.success },
  { text: 'Signs point to yes.', color: THEME.success },
  { text: 'Reply hazy, try again.', color: THEME.warning },
  { text: 'Ask again later.', color: THEME.warning },
  { text: 'Better not tell you now.', color: THEME.warning },
  { text: 'Cannot predict now.', color: THEME.warning },
  { text: 'Concentrate and ask again.', color: THEME.warning },
  { text: "Don't count on it.", color: THEME.error },
  { text: 'My reply is no.', color: THEME.error },
  { text: 'My sources say no.', color: THEME.error },
  { text: 'Outlook not so good.', color: THEME.error },
  { text: 'Very doubtful.', color: THEME.error },
];

export const data = new SlashCommandBuilder()
  .setName('8ball')
  .setDescription('Ask the magic 8-ball a question')
  .addStringOption(opt => opt.setName('question').setDescription('Your question').setRequired(true));

export async function execute(interaction) {
  const question = interaction.options.getString('question');
  const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];

  const embed = createEmbed({
    color: answer.color,
    title: `🎱 Magic 8-Ball`,
    description: [
      DIVIDER,
      ``,
      `**${EMOJI.search} Question:**`,
      `*${question}*`,
      ``,
      `**🎱 Answer:**`,
      `**${answer.text}**`,
      ``,
      DIVIDER,
    ].join('\n'),
  });

  await interaction.reply({ embeds: [embed] });
}
