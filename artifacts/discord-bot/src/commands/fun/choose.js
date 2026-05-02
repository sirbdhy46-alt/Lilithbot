import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('choose')
  .setDescription('Let the bot pick between multiple options')
  .addStringOption(o => o.setName('options').setDescription('Options separated by | (e.g. pizza | burger | sushi)').setRequired(true));

export async function execute(interaction) {
  const raw = interaction.options?.getString?.('options') ?? '';
  const choices = raw.split('|').map(c => c.trim()).filter(Boolean);
  if (choices.length < 2) return interaction.reply({ content: 'Please give at least 2 options separated by `|`', ephemeral: true });

  const picked = choices[Math.floor(Math.random() * choices.length)];
  const list = choices.map((c, i) => `${i + 1}. ${c === picked ? `**${c}** ${EMOJI.arrow} *chosen!*` : c}`).join('\n');

  await interaction.reply({
    embeds: [createEmbed({
      color: THEME.success,
      title: `${EMOJI.search} I Choose...`,
      description: [DIVIDER, ``, list, ``, `${EMOJI.crown} **Answer: ${picked}**`, ``, DIVIDER].join('\n'),
    })],
  });
}
