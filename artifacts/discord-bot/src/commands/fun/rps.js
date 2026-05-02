import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

const CHOICES = ['🪨 Rock', '📄 Paper', '✂️ Scissors'];
const WIN = { 0: 2, 1: 0, 2: 1 };

export const data = new SlashCommandBuilder()
  .setName('rps')
  .setDescription('Play Rock, Paper, Scissors against the bot')
  .addStringOption(o => o.setName('choice').setDescription('Your choice').setRequired(true)
    .addChoices({ name: '🪨 Rock', value: '0' }, { name: '📄 Paper', value: '1' }, { name: '✂️ Scissors', value: '2' }));

export async function execute(interaction) {
  const userIdx = parseInt(interaction.options?.getString?.('choice') ?? '0');
  const botIdx = Math.floor(Math.random() * 3);
  let result;
  if (userIdx === botIdx) result = `🟡 **It's a tie!**`;
  else if (WIN[userIdx] === botIdx) result = `${EMOJI.trophy} **You win!**`;
  else result = `${EMOJI.cross} **Bot wins!**`;

  await interaction.reply({
    embeds: [createEmbed({
      color: userIdx === botIdx ? THEME.warning : WIN[userIdx] === botIdx ? THEME.success : THEME.error,
      title: '🎮 Rock Paper Scissors',
      description: [
        DIVIDER, ``,
        `${EMOJI.user} **You:** ${CHOICES[userIdx]}`,
        `${EMOJI.bot} **Bot:** ${CHOICES[botIdx]}`,
        ``, result, ``, DIVIDER,
      ].join('\n'),
    })],
  });
}
