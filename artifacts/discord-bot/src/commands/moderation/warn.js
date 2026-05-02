import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, warningEmbed, createEmbed, THEME, DIVIDER_FANCY, DIVIDER_STARS, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';
import { addWarning, getWarnings, removeWarning, clearWarnings } from '../../utils/warnStore.js';
import { getGif } from '../../utils/getGif.js';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Warn management')
  .addSubcommand(sub =>
    sub.setName('add')
      .setDescription('Warn a member')
      .addUserOption(opt => opt.setName('user').setDescription('Member to warn').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason for the warning').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('list')
      .setDescription('View all warnings for a member')
      .addUserOption(opt => opt.setName('user').setDescription('Member to check').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('remove')
      .setDescription('Remove a specific warning by ID')
      .addUserOption(opt => opt.setName('user').setDescription('Member').setRequired(true))
      .addStringOption(opt => opt.setName('warn_id').setDescription('Warning ID to remove').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('clear')
      .setDescription('Clear ALL warnings for a member')
      .addUserOption(opt => opt.setName('user').setDescription('Member').setRequired(true))
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'add') {
    await interaction.deferReply();
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const member = interaction.guild.members.cache.get(target.id);

    if (target.bot) return interaction.editReply({ embeds: [errorEmbed('Cannot Warn', 'You cannot warn bots.')] });
    if (target.id === interaction.user.id) return interaction.editReply({ embeds: [errorEmbed('Cannot Warn', 'You cannot warn yourself.')] });

    const [{ warn, total }, gifUrl] = await Promise.all([
      Promise.resolve(addWarning(interaction.guild.id, target.id, interaction.user.id, reason)),
      getGif('slap'),
    ]);

    const severity = total >= 5 ? `${EMOJI.banhammer} **AUTO-MUTE TRIGGERED**` :
                     total >= 3 ? `${EMOJI.warningpc} Approaching limit` :
                     `${EMOJI.warning} Warning issued`;

    await interaction.editReply({
      embeds: [createEmbed({
        color: THEME.warning,
        title: `${EMOJI.warningpc} Member Warned`,
        description: [
          DIVIDER_FANCY, ``,
          `${EMOJI.hyperangry} **${target.username}** has received a warning.`,
          ``,
          DIVIDER_STARS,
          `${EMOJI.bullet} **User** ─── ${target}`,
          `${EMOJI.bullet} **Reason** ─── ${reason}`,
          `${EMOJI.bullet} **Moderator** ─── ${interaction.user}`,
          `${EMOJI.bullet} **Total Warnings** ─── \`${total}\``,
          `${EMOJI.bullet} **Warning ID** ─── \`${warn.id}\``,
          ``,
          severity,
          ``,
          DIVIDER_FANCY,
        ].join('\n'),
        image: gifUrl,
        thumbnail: target.displayAvatarURL({ dynamic: true }),
        footer: { text: `${EMOJI.warning} Warned by ${interaction.user.username}` },
      })],
    });

    // DM the warned user
    try {
      await target.send({
        embeds: [createEmbed({
          color: THEME.warning,
          title: `${EMOJI.warningpc} You Were Warned`,
          description: [
            DIVIDER_FANCY, ``,
            `You have received a warning in **${interaction.guild.name}**.`,
            ``,
            `${EMOJI.bullet} **Reason:** ${reason}`,
            `${EMOJI.bullet} **Moderator:** ${interaction.user.username}`,
            `${EMOJI.bullet} **Total Warnings:** \`${total}\``,
            ``,
            DIVIDER_FANCY,
          ].join('\n'),
        })],
      });
    } catch {}

    // Auto-action at threshold
    if (total >= 5 && member?.moderatable) {
      await member.timeout(10 * 60 * 1000, `Auto-mute: ${total} warnings`).catch(() => {});
      await interaction.followUp({
        embeds: [createEmbed({
          color: THEME.error,
          title: `${EMOJI.banhammer} Auto-Mute Triggered`,
          description: [
            DIVIDER_FANCY, ``,
            `${EMOJI.blobpolice} **${target.username}** has been **auto-muted** for reaching **${total} warnings**.`,
            `${EMOJI.bullet} **Duration:** \`10 minutes\``,
            ``,
            DIVIDER_FANCY,
          ].join('\n'),
        })],
      });
    }
  }

  else if (sub === 'list') {
    const target = interaction.options.getUser('user');
    const warns = getWarnings(interaction.guild.id, target.id);

    if (warns.length === 0) {
      return interaction.reply({ embeds: [successEmbed('No Warnings', `${target.tag} has no warnings.`)] });
    }

    const warnLines = warns.slice(-10).map((w, i) =>
      `**#${i + 1}** \`ID: ${w.id}\`\n${EMOJI.arrow} **Reason:** ${w.reason}\n${EMOJI.arrow} **By:** <@${w.moderatorId}> • <t:${Math.floor(w.timestamp / 1000)}:R>`
    ).join('\n\n');

    const embed = createEmbed({
      color: THEME.warning,
      title: `${EMOJI.warning} Warnings — ${target.tag}`,
      description: [DIVIDER, ``, warnLines, ``, DIVIDER].join('\n'),
      thumbnail: target.displayAvatarURL({ dynamic: true }),
      fields: [{ name: 'Total Warnings', value: `\`${warns.length}\``, inline: true }],
    });

    await interaction.reply({ embeds: [embed] });
  }

  else if (sub === 'remove') {
    const target = interaction.options.getUser('user');
    const warnId = interaction.options.getString('warn_id');

    const removed = removeWarning(interaction.guild.id, target.id, warnId);
    if (!removed) {
      return interaction.reply({ embeds: [errorEmbed('Not Found', `No warning with ID \`${warnId}\` found for **${target.tag}**.`)], ephemeral: true });
    }

    await interaction.reply({
      embeds: [successEmbed('Warning Removed', [
        `${EMOJI.check} Warning \`${warnId}\` removed from **${target.tag}**.`,
        `${EMOJI.arrow} **By:** ${interaction.user.tag}`,
      ].join('\n'))],
    });
  }

  else if (sub === 'clear') {
    const target = interaction.options.getUser('user');
    const count = clearWarnings(interaction.guild.id, target.id);

    await interaction.reply({
      embeds: [successEmbed('Warnings Cleared', [
        `${EMOJI.check} Cleared **${count}** warning(s) from **${target.tag}**.`,
        `${EMOJI.arrow} **By:** ${interaction.user.tag}`,
      ].join('\n'))],
    });
  }
}
