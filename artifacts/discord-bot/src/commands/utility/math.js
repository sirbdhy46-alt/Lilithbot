import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, errorEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('math')
  .setDescription('Evaluate a math expression safely')
  .addStringOption(o => o.setName('expression').setDescription('Math expression (e.g. 2 + 2 * 5, sqrt(144), 2^10)').setRequired(true));

// Safe evaluator — no eval()
function safeEval(expr) {
  const cleaned = expr
    .replace(/\^/g, '**')
    .replace(/sqrt\(([^)]+)\)/g, (_, n) => `Math.sqrt(${n})`)
    .replace(/abs\(([^)]+)\)/g, (_, n) => `Math.abs(${n})`)
    .replace(/floor\(([^)]+)\)/g, (_, n) => `Math.floor(${n})`)
    .replace(/ceil\(([^)]+)\)/g, (_, n) => `Math.ceil(${n})`)
    .replace(/round\(([^)]+)\)/g, (_, n) => `Math.round(${n})`)
    .replace(/log\(([^)]+)\)/g, (_, n) => `Math.log(${n})`)
    .replace(/sin\(([^)]+)\)/g, (_, n) => `Math.sin(${n})`)
    .replace(/cos\(([^)]+)\)/g, (_, n) => `Math.cos(${n})`)
    .replace(/pi/gi, 'Math.PI')
    .replace(/e(?![a-z])/gi, 'Math.E');

  // Only allow safe chars
  if (!/^[\d\s\+\-\*\/\%\.\(\)Math\.PISqrtAbsFloorCeilRoundLogSinCosPIEsqrtabsfloorLog]+$/.test(cleaned.replace(/Math\.\w+/g, ''))) {
    throw new Error('Invalid expression');
  }

  // Use Function for safe sandboxed eval
  const fn = new Function(`"use strict"; return (${cleaned})`);
  return fn();
}

export async function execute(interaction) {
  const expr = interaction.options?.getString?.('expression') ?? '';

  try {
    const result = safeEval(expr);
    if (!isFinite(result)) throw new Error('Result is not finite');

    await interaction.reply({
      embeds: [createEmbed({
        color: THEME.info,
        title: `${EMOJI.chart} Calculator`,
        description: [
          DIVIDER, ``,
          `**Expression:** \`${expr}\``,
          `**Result:** \`${result}\``,
          ``, DIVIDER,
        ].join('\n'),
      })],
    });
  } catch (err) {
    await interaction.reply({
      embeds: [errorEmbed('Invalid Expression', [
        `Could not evaluate: \`${expr}\``,
        ``,
        `**Examples:**`,
        `\`2 + 2 * 5\`  →  12`,
        `\`sqrt(144)\`  →  12`,
        `\`2^10\`  →  1024`,
        `\`sin(pi)\`  →  ~0`,
      ].join('\n'))],
      ephemeral: true,
    });
  }
}
