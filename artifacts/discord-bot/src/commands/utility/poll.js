import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Create a quick poll with reactions')
  .addStringOption(opt => opt.setName('question').setDescription('The poll question').setRequired(true))
  .addStringOption(opt => opt.setName('option1').setDescription('First option').setRequired(true))
  .addStringOption(opt => opt.setName('option2').setDescription('Second option').setRequired(true))
  .addStringOption(opt => opt.setName('option3').setDescription('Third option (optional)').setRequired(false))
  .addStringOption(opt => opt.setName('option4').setDescription('Fourth option (optional)').setRequired(false));

export async function execute(interaction) {
  const question = interaction.options.getString('question');
  const options = [
    interaction.options.getString('option1'),
    interaction.options.getString('option2'),
    interaction.options.getString('option3'),
    interaction.options.getString('option4'),
  ].filter(Boolean);

  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
  const optLines = options.map((o, i) => `${emojis[i]} **${o}**`).join('\n');

  const embed = createEmbed({
    color: THEME.primary,
    title: `${EMOJI.chart} Poll`,
    description: [
      DIVIDER,
      ``,
      `**📋 ${question}**`,
      ``,
      optLines,
      ``,
      DIVIDER,
      `*Created by ${interaction.user.username} • React to vote!*`,
    ].join('\n'),
  });

  const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
  for (let i = 0; i < options.length; i++) {
    await msg.react(emojis[i]);
  }
}
