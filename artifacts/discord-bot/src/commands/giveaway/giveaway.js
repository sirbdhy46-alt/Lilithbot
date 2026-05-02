import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createEmbed, errorEmbed, successEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

const activeGiveaways = new Map();

export const data = new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Manage giveaways')
  .addSubcommand(sub =>
    sub.setName('start')
      .setDescription('Start a new giveaway')
      .addStringOption(opt => opt.setName('prize').setDescription('What are you giving away?').setRequired(true))
      .addIntegerOption(opt => opt.setName('minutes').setDescription('Duration in minutes').setMinValue(1).setMaxValue(10080).setRequired(true))
      .addIntegerOption(opt => opt.setName('winners').setDescription('Number of winners').setMinValue(1).setMaxValue(20).setRequired(false))
  )
  .addSubcommand(sub =>
    sub.setName('end')
      .setDescription('End a giveaway early')
      .addStringOption(opt => opt.setName('message_id').setDescription('Message ID of the giveaway').setRequired(true))
  )
  .addSubcommand(sub => sub.setName('list').setDescription('List all active giveaways'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

async function pickWinners(giveaway, winnerCount) {
  const entries = [...giveaway.entries];
  const winners = [];
  const pool = [...entries];
  for (let i = 0; i < Math.min(winnerCount, pool.length); i++) {
    const idx = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(idx, 1)[0]);
  }
  return winners;
}

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'start') {
    const prize = interaction.options.getString('prize');
    const minutes = interaction.options.getInteger('minutes');
    const winnerCount = interaction.options.getInteger('winners') ?? 1;
    const endsAt = Date.now() + minutes * 60 * 1000;

    const embed = createEmbed({
      color: THEME.purple,
      title: `${EMOJI.gift} GIVEAWAY`,
      description: [
        DIVIDER,
        ``,
        `🎉 **${prize}**`,
        ``,
        `${EMOJI.arrow} **Hosted by:** ${interaction.user}`,
        `${EMOJI.arrow} **Winners:** ${winnerCount}`,
        `${EMOJI.arrow} **Ends:** <t:${Math.floor(endsAt / 1000)}:R>`,
        ``,
        DIVIDER,
        `*Click the button below to enter!*`,
      ].join('\n'),
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('giveaway_enter').setLabel('🎁 Enter Giveaway').setStyle(ButtonStyle.Primary)
    );

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const giveaway = { prize, winnerCount, endsAt, entries: new Set(), hostId: interaction.user.id, messageId: msg.id, channelId: interaction.channel.id };
    activeGiveaways.set(msg.id, giveaway);

    const collector = msg.createMessageComponentCollector({ time: minutes * 60 * 1000 });

    collector.on('collect', async i => {
      if (giveaway.entries.has(i.user.id)) {
        return i.reply({ content: `${EMOJI.warning} You're already entered in this giveaway!`, ephemeral: true });
      }
      giveaway.entries.add(i.user.id);
      await i.reply({ content: `${EMOJI.check} You've entered the giveaway for **${prize}**! Good luck!`, ephemeral: true });

      const updatedEmbed = createEmbed({
        color: THEME.purple,
        title: `${EMOJI.gift} GIVEAWAY`,
        description: [
          DIVIDER, ``,
          `🎉 **${prize}**`, ``,
          `${EMOJI.arrow} **Hosted by:** <@${giveaway.hostId}>`,
          `${EMOJI.arrow} **Winners:** ${winnerCount}`,
          `${EMOJI.arrow} **Entries:** ${giveaway.entries.size}`,
          `${EMOJI.arrow} **Ends:** <t:${Math.floor(endsAt / 1000)}:R>`, ``,
          DIVIDER, `*Click the button below to enter!*`,
        ].join('\n'),
      });
      await msg.edit({ embeds: [updatedEmbed] });
    });

    collector.on('end', async () => {
      activeGiveaways.delete(msg.id);
      const winners = await pickWinners(giveaway, winnerCount);
      const winnerMentions = winners.length ? winners.map(id => `<@${id}>`).join(', ') : 'No valid entries';

      const endEmbed = createEmbed({
        color: THEME.success,
        title: `${EMOJI.trophy} GIVEAWAY ENDED`,
        description: [DIVIDER, ``, `🎉 **${prize}**`, ``, `${EMOJI.crown} **Winner(s):** ${winnerMentions}`, `${EMOJI.arrow} **Total Entries:** ${giveaway.entries.size}`, ``, DIVIDER].join('\n'),
      });
      await msg.edit({ embeds: [endEmbed], components: [] });
      if (winners.length) await interaction.channel.send({ content: `🎉 Congratulations ${winnerMentions}! You won **${prize}**!` });
    });
  }

  else if (sub === 'list') {
    if (activeGiveaways.size === 0) return interaction.reply({ embeds: [errorEmbed('No Giveaways', 'There are no active giveaways.')], ephemeral: true });
    const list = [...activeGiveaways.values()].map(g => `${EMOJI.gift} **${g.prize}** — ends <t:${Math.floor(g.endsAt / 1000)}:R> (${g.entries.size} entries)`).join('\n');
    await interaction.reply({ embeds: [createEmbed({ color: THEME.purple, title: `${EMOJI.gift} Active Giveaways`, description: `${DIVIDER}\n\n${list}\n\n${DIVIDER}` })] });
  }

  else if (sub === 'end') {
    const msgId = interaction.options.getString('message_id');
    const giveaway = activeGiveaways.get(msgId);
    if (!giveaway) return interaction.reply({ embeds: [errorEmbed('Not Found', 'No active giveaway with that message ID.')], ephemeral: true });
    activeGiveaways.delete(msgId);
    await interaction.reply({ embeds: [successEmbed('Giveaway Ended', `The giveaway for **${giveaway.prize}** has been ended manually.`)] });
  }
}
