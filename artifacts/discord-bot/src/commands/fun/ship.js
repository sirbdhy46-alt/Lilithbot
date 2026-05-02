import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ship')
  .setDescription('Calculate the love compatibility between two users')
  .addUserOption(opt => opt.setName('user1').setDescription('First user').setRequired(true))
  .addUserOption(opt => opt.setName('user2').setDescription('Second user').setRequired(false));

export async function execute(interaction) {
  const user1 = interaction.options.getUser('user1');
  const user2 = interaction.options.getUser('user2') ?? interaction.user;

  const seed = (user1.id + user2.id).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const percent = seed % 101;

  const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));
  const verdict = percent >= 80 ? '💞 Soulmates!' : percent >= 60 ? '💕 Great Match!' : percent >= 40 ? '💛 Pretty Good' : percent >= 20 ? '🤍 It\'s Complicated' : '💔 Not Meant to Be';

  const embed = createEmbed({
    color: percent >= 60 ? 0xFF69B4 : THEME.primary,
    title: `${EMOJI.heart} Shipping`,
    description: [
      DIVIDER,
      ``,
      `**${user1.username}** ❤️ **${user2.username}**`,
      ``,
      `\`[${bar}]\` **${percent}%**`,
      ``,
      `${verdict}`,
      ``,
      DIVIDER,
    ].join('\n'),
  });

  await interaction.reply({ embeds: [embed] });
}
