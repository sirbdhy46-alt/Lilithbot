import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('coinflip')
  .setDescription('Flip a coin — heads or tails')
  .addIntegerOption(o => o.setName('times').setDescription('Flip multiple times (max 10)').setMinValue(1).setMaxValue(10));

export async function execute(interaction) {
  const times = interaction.options?.getInteger?.('times') ?? 1;
  const results = Array.from({ length: times }, () => Math.random() < 0.5 ? '🪙 **Heads**' : '🔘 **Tails**');
  const heads = results.filter(r => r.includes('Heads')).length;
  const tails = results.filter(r => r.includes('Tails')).length;

  await interaction.reply({
    embeds: [createEmbed({
      color: THEME.warning,
      title: `🪙 Coin Flip${times > 1 ? ` ×${times}` : ''}`,
      description: [
        DIVIDER, ``,
        results.join('\n'),
        ``,
        times > 1 ? `${EMOJI.arrow} Heads: **${heads}** | Tails: **${tails}**` : '',
        ``, DIVIDER,
      ].join('\n'),
    })],
  });
}
