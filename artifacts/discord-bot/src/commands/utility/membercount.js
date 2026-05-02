import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('membercount')
  .setDescription('Show detailed member count breakdown for this server');

export async function execute(interaction) {
  await interaction.deferReply();
  const guild = interaction.guild;
  await guild.members.fetch();

  const all = guild.members.cache;
  const humans = all.filter(m => !m.user.bot);
  const bots = all.filter(m => m.user.bot);
  const online = all.filter(m => m.presence?.status === 'online');
  const idle = all.filter(m => m.presence?.status === 'idle');
  const dnd = all.filter(m => m.presence?.status === 'dnd');
  const offline = all.filter(m => !m.presence || m.presence.status === 'offline');

  const total = guild.memberCount;
  const humanCount = humans.size;
  const botCount = bots.size;

  // Bar for humans vs bots
  const humanPct = Math.round((humanCount / total) * 20);
  const botPct = 20 - humanPct;
  const humanBar = '█'.repeat(humanPct) + '░'.repeat(botPct);

  const embed = createEmbed({
    color: THEME.primary,
    title: `${EMOJI.user} Member Count — ${guild.name}`,
    description: [
      DIVIDER,
      ``,
      `**Total Members: \`${total.toLocaleString()}\`**`,
      `\`[${humanBar}]\``,
      ``,
      DIVIDER,
    ].join('\n'),
    thumbnail: guild.iconURL({ dynamic: true }),
    fields: [
      { name: `${EMOJI.user} Humans`, value: `\`${humanCount.toLocaleString()}\``, inline: true },
      { name: `${EMOJI.bot} Bots`, value: `\`${botCount.toLocaleString()}\``, inline: true },
      { name: `\u200b`, value: `\u200b`, inline: true },
      { name: `${EMOJI.online} Online`, value: `\`${online.size.toLocaleString()}\``, inline: true },
      { name: `${EMOJI.idle} Idle`, value: `\`${idle.size.toLocaleString()}\``, inline: true },
      { name: `${EMOJI.dnd} Do Not Disturb`, value: `\`${dnd.size.toLocaleString()}\``, inline: true },
      { name: `${EMOJI.offline} Offline`, value: `\`${offline.size.toLocaleString()}\``, inline: true },
      { name: `${EMOJI.boost} Boosters`, value: `\`${guild.premiumSubscriptionCount ?? 0}\``, inline: true },
      { name: `${EMOJI.role} Roles`, value: `\`${guild.roles.cache.size}\``, inline: true },
    ],
  });

  await interaction.editReply({ embeds: [embed] });
}
