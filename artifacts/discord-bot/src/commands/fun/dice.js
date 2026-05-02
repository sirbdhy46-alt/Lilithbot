import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('dice')
  .setDescription('Roll one or more dice')
  .addIntegerOption(o => o.setName('sides').setDescription('Number of sides (default: 6)').setMinValue(2).setMaxValue(100))
  .addIntegerOption(o => o.setName('count').setDescription('How many dice (default: 1, max: 10)').setMinValue(1).setMaxValue(10));

export async function execute(interaction) {
  const sides = interaction.options?.getInteger?.('sides') ?? 6;
  const count = interaction.options?.getInteger?.('count') ?? 1;
  const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  const total = rolls.reduce((a, b) => a + b, 0);

  await interaction.reply({
    embeds: [createEmbed({
      color: THEME.info,
      title: `🎲 Dice Roll — d${sides}${count > 1 ? ` ×${count}` : ''}`,
      description: [
        DIVIDER, ``,
        count > 1 ? `**Rolls:** ${rolls.map(r => `\`${r}\``).join(' + ')}` : `**Result:** \`${rolls[0]}\``,
        count > 1 ? `**Total:** \`${total}\`` : '',
        ``, DIVIDER,
      ].join('\n'),
    })],
  });
}
