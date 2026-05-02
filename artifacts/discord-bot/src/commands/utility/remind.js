import { SlashCommandBuilder } from 'discord.js';
import { successEmbed, errorEmbed, infoEmbed, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('remind')
  .setDescription('Set a reminder — bot will DM you')
  .addStringOption(o => o.setName('time').setDescription('Time (e.g. 10m, 2h, 1d)').setRequired(true))
  .addStringOption(o => o.setName('reminder').setDescription('What to remind you about').setRequired(true));

function parseTime(str) {
  const match = str.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit];
  return num * ms;
}

export async function execute(interaction) {
  const timeStr = interaction.options?.getString?.('time') ?? '';
  const reminder = interaction.options?.getString?.('reminder') ?? '';
  const ms = parseTime(timeStr);

  if (!ms) return interaction.reply({ embeds: [errorEmbed('Invalid Time', 'Use format: `10m`, `2h`, `1d`, `30s`')], ephemeral: true });
  if (ms > 7 * 24 * 3600000) return interaction.reply({ embeds: [errorEmbed('Too Long', 'Maximum reminder time is 7 days.')], ephemeral: true });

  await interaction.reply({
    embeds: [successEmbed('Reminder Set', [
      `${EMOJI.bell} I'll remind you in **${timeStr}**.`,
      `${EMOJI.arrow} **Reminder:** ${reminder}`,
      `${EMOJI.arrow} You'll receive a DM when it's time.`,
    ].join('\n'))],
  });

  setTimeout(async () => {
    try {
      await interaction.user.send({
        embeds: [infoEmbed('⏰ Reminder!', [
          `${EMOJI.bell} This is your reminder:`,
          ``, `**${reminder}**`, ``,
          `${EMOJI.arrow} Set in: **${interaction.guild?.name ?? 'DMs'}**`,
        ].join('\n'))],
      });
    } catch {
      try {
        await interaction.channel.send({ content: `${interaction.user} ⏰ Reminder: **${reminder}**` });
      } catch {}
    }
  }, ms);
}
