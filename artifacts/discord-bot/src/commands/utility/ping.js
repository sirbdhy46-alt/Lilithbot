import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER_FANCY, DIVIDER_STARS, EMOJI } from '../../utils/embedBuilder.js';

function latencyBar(ms, max = 500, length = 12) {
  const filled = Math.min(length, Math.round((ms / max) * length));
  return `\`${'█'.repeat(filled)}${'░'.repeat(length - filled)}\``;
}

function latencyLabel(ms) {
  if (ms < 80)  return { text: 'Lightning Fast', emoji: '🟢' };
  if (ms < 150) return { text: 'Excellent',       emoji: '🟢' };
  if (ms < 250) return { text: 'Good',            emoji: '🟡' };
  if (ms < 400) return { text: 'Average',         emoji: '🟠' };
  return               { text: 'High Latency',    emoji: '🔴' };
}

function uptimeFmt(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s % 60}s`;
}

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check bot latency and API response time');

export async function execute(interaction) {
  const sent = await interaction.reply({ content: `${EMOJI.loading} Measuring latency...`, fetchReply: true });
  const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
  const api = Math.round(interaction.client.ws.ping);
  const uptime = uptimeFmt(interaction.client.uptime ?? 0);

  const rtLabel  = latencyLabel(roundtrip);
  const apiLabel = latencyLabel(api);

  const overallColor = [roundtrip, api].some(ms => ms >= 400)
    ? THEME.error
    : [roundtrip, api].some(ms => ms >= 250)
      ? THEME.warning
      : THEME.success;

  await interaction.editReply({
    content: '',
    embeds: [createEmbed({
      color: overallColor,
      author: { name: 'Lilith Protector  •  Network Diagnostics' },
      title: `${EMOJI.hyperpinged} Latency Report`,
      description: DIVIDER_FANCY,
      fields: [
        {
          name: `${EMOJI.zap} Bot Latency`,
          value: `${latencyBar(roundtrip)}  \`${roundtrip}ms\`\n${rtLabel.emoji} **${rtLabel.text}**`,
          inline: true,
        },
        {
          name: `${EMOJI.dbcheck} Discord API`,
          value: `${latencyBar(api)}  \`${api}ms\`\n${apiLabel.emoji} **${apiLabel.text}**`,
          inline: true,
        },
        {
          name: `${EMOJI.sparkle} Status`,
          value: `${EMOJI.check} **Online**\n⏱️ Uptime: \`${uptime}\``,
          inline: true,
        },
        {
          name: '\u200b',
          value: `${EMOJI.bot} Serving \`${interaction.client.guilds.cache.size}\` server${interaction.client.guilds.cache.size !== 1 ? 's' : ''}  •  Shard \`#0\``,
          inline: false,
        },
      ],
      footer: { text: `${EMOJI.sparkle} Lilith Protector  •  Measured at ${new Date().toUTCString()}` },
    })],
  });
}
