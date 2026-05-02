import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER } from '../../utils/embedBuilder.js';

const DARES = [
  "Send a random GIF in the chat without context.",
  "Speak in rhymes for the next 5 minutes.",
  "Change your nickname to something embarrassing for 10 minutes.",
  "Say something nice about every member online right now.",
  "Repeat everything the next person says for 5 minutes.",
  "Type the next 5 messages in CAPS LOCK.",
  "Do an impression of your favorite bot for 1 minute.",
  "Share an embarrassing photo (optional, but fun!)",
  "Let the group set your status for 30 minutes.",
  "Send a voice message saying 'I am a potato.'",
];

export const data = new SlashCommandBuilder()
  .setName('dare')
  .setDescription('Get a random dare challenge');

export async function execute(interaction) {
  const d = DARES[Math.floor(Math.random() * DARES.length)];
  await interaction.reply({
    embeds: [createEmbed({
      color: THEME.error,
      title: '🔥 Dare',
      description: `${DIVIDER}\n\n**${interaction.user.username}**, your dare:\n\n**"${d}"**\n\n${DIVIDER}`,
    })],
  });
}
