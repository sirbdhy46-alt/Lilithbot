import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER } from '../../utils/embedBuilder.js';

const JOKES = [
  { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!" },
  { setup: "Why did the programmer quit his job?", punchline: "Because he didn't get arrays." },
  { setup: "How do you comfort a JavaScript bug?", punchline: "You console it." },
  { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs!" },
  { setup: "What do you call a fish without eyes?", punchline: "A fsh." },
  { setup: "Why was the Discord bot late?", punchline: "It got caught in an infinite loop." },
  { setup: "I told my wife she was drawing her eyebrows too high.", punchline: "She looked surprised." },
  { setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up." },
  { setup: "What's a programmer's favorite place to hang out?", punchline: "Foo Bar." },
  { setup: "Why did the database administrator leave his wife?", punchline: "She had one too many 'relations'." },
  { setup: "How many programmers does it take to change a light bulb?", punchline: "None — that's a hardware problem." },
  { setup: "A SQL query walks into a bar, walks up to two tables and asks...", punchline: '"Can I join you?"' },
];

export const data = new SlashCommandBuilder()
  .setName('joke')
  .setDescription('Get a random joke');

export async function execute(interaction) {
  const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
  await interaction.reply({
    embeds: [createEmbed({
      color: THEME.warning,
      title: '😂 Random Joke',
      description: [DIVIDER, ``, `**${joke.setup}**`, ``, `||${joke.punchline}||`, `*(click to reveal)*`, ``, DIVIDER].join('\n'),
    })],
  });
}
