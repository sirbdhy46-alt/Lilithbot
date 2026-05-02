import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER } from '../../utils/embedBuilder.js';

const TRUTHS = [
  "What's the most embarrassing thing you've done?",
  "Have you ever lied to your best friend?",
  "What's your biggest fear?",
  "Have you ever cheated in a game or test?",
  "What's the worst thing you've said about someone behind their back?",
  "Have you ever pretended to be sick to avoid something?",
  "What's the most childish thing you still do?",
  "Have you ever stolen something, even small?",
  "What's your biggest insecurity?",
  "Who do you have a crush on right now?",
];

export const data = new SlashCommandBuilder()
  .setName('truth')
  .setDescription('Get a random truth question');

export async function execute(interaction) {
  const q = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
  await interaction.reply({
    embeds: [createEmbed({
      color: THEME.info,
      title: '💬 Truth',
      description: `${DIVIDER}\n\n**${interaction.user.username}**, here's your truth:\n\n*"${q}"*\n\n${DIVIDER}`,
    })],
  });
}
