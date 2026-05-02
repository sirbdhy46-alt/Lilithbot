import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('howgay')
  .setDescription('Totally accurate gaydar measurement 🌈')
  .addUserOption(o => o.setName('user').setDescription('Who to measure').setRequired(false));

export async function execute(interaction) {
  const target = interaction.options?.getUser?.('user') ?? interaction.user;
  const seed = target.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const percent = seed % 101;
  const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));

  await interaction.reply({
    embeds: [createEmbed({
      color: 0xFF69B4,
      title: `🌈 Gaydar — ${target.username}`,
      description: [DIVIDER, ``, `\`[${bar}]\` **${percent}%**`, ``, DIVIDER].join('\n'),
    })],
  });
}
