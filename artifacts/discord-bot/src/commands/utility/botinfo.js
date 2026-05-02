import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER_FANCY, DIVIDER_STARS, EMOJI } from '../../utils/embedBuilder.js';
import { version as djsVersion } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('botinfo')
  .setDescription('View detailed Lilith Protector bot statistics');

function uptimeFmt(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

export async function execute(interaction) {
  const client = interaction.client;
  const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
  const totalUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
  const ping = Math.round(client.ws.ping);
  const pingBar = `\`${'█'.repeat(Math.min(10, Math.round(ping / 50)))}${'░'.repeat(10 - Math.min(10, Math.round(ping / 50)))}\``;

  const embed = createEmbed({
    color: THEME.primary,
    author: {
      name: 'Lilith Protector  •  Premium Discord Security Bot',
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    },
    title: null,
    description: [
      `${EMOJI.sparkle} **Elite-grade protection, moderation & automation for Discord.**`,
      ``,
      DIVIDER_FANCY,
    ].join('\n'),
    fields: [
      // Row 1 — reach
      {
        name: `${EMOJI.server} Servers`,
        value: `**${client.guilds.cache.size.toLocaleString()}**`,
        inline: true,
      },
      {
        name: `${EMOJI.users} Total Users`,
        value: `**${totalUsers.toLocaleString()}**`,
        inline: true,
      },
      {
        name: `${EMOJI.bot} Commands`,
        value: `**${client.commands?.size ?? '59'}** loaded`,
        inline: true,
      },
      // Row 2 — performance
      {
        name: `⏱️ Uptime`,
        value: `\`${uptimeFmt(client.uptime ?? 0)}\``,
        inline: true,
      },
      {
        name: `💾 Memory`,
        value: `\`${memMB} MB\``,
        inline: true,
      },
      {
        name: `${EMOJI.hyperpinged} Ping`,
        value: `${pingBar} \`${ping}ms\``,
        inline: true,
      },
      // Row 3 — tech info
      {
        name: `⚙️ Runtime`,
        value: `Node.js \`${process.version}\``,
        inline: true,
      },
      {
        name: `📦 Library`,
        value: `discord.js \`v${djsVersion}\``,
        inline: true,
      },
      {
        name: `😀 Custom Emojis`,
        value: `\`123\` emoji.gg emojis`,
        inline: true,
      },
      // Links row
      {
        name: `${EMOJI.link} Quick Links`,
        value: [
          `[**Invite Lilith**](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands)`,
          `[**Support Server**](https://discord.gg/lilith)`,
        ].join('  ·  '),
        inline: false,
      },
    ],
    thumbnail: client.user.displayAvatarURL({ dynamic: true, size: 256 }),
    footer: { text: `${EMOJI.sparkle} Lilith Protector  •  Premium Discord Protection` },
  });

  await interaction.reply({ embeds: [embed] });
}
