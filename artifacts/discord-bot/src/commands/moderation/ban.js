import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, errorEmbed, THEME, DIVIDER_FANCY, DIVIDER_STARS, EMOJI } from '../../utils/embedBuilder.js';
import { getGif } from '../../utils/getGif.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a member from the server')
  .addUserOption(opt => opt.setName('user').setDescription('User to ban').setRequired(true))
  .addStringOption(opt => opt.setName('reason').setDescription('Reason for the ban').setRequired(false))
  .addIntegerOption(opt => opt.setName('days').setDescription('Days of messages to delete (0-7)').setMinValue(0).setMaxValue(7).setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

export async function execute(interaction) {
  await interaction.deferReply();

  const target = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') ?? 'No reason provided';
  const days = interaction.options.getInteger('days') ?? 0;
  const member = interaction.guild.members.cache.get(target.id);

  if (target.id === interaction.user.id)
    return interaction.editReply({ embeds: [errorEmbed('Cannot Ban', `${EMOJI.blobthink} You can't ban yourself!`)] });

  if (member && !member.bannable)
    return interaction.editReply({ embeds: [errorEmbed('Cannot Ban', `${EMOJI.blobangry} I cannot ban **${target.username}** — they may have a higher role.`)] });

  const [gifUrl] = await Promise.all([getGif('shoot')]);

  try {
    // DM before ban
    try {
      await target.send({
        embeds: [createEmbed({
          color: THEME.error,
          title: `${EMOJI.banned} You were banned`,
          description: [
            DIVIDER_FANCY, ``,
            `${EMOJI.blobangry} You have been **banned** from **${interaction.guild.name}**.`,
            ``,
            `${EMOJI.bullet} **Reason:** ${reason}`,
            `${EMOJI.bullet} **Moderator:** ${interaction.user.username}`,
            ``,
            DIVIDER_FANCY,
          ].join('\n'),
        })],
      });
    } catch {}

    await interaction.guild.members.ban(target, { reason, deleteMessageDays: days });

    await interaction.editReply({
      embeds: [createEmbed({
        color: THEME.error,
        author: {
          name: `Action: Permanent Ban  •  ${interaction.guild.name}`,
          iconURL: interaction.guild.iconURL({ dynamic: true }) ?? undefined,
        },
        title: `${EMOJI.blobbanhammer}  ${target.username} has been banned`,
        description: DIVIDER_FANCY,
        fields: [
          {
            name: `${EMOJI.user} Banned User`,
            value: `${target}\n\`${target.username}\` (\`${target.id}\`)`,
            inline: true,
          },
          {
            name: `${EMOJI.shield} Moderator`,
            value: `${interaction.user}\n\`${interaction.user.username}\``,
            inline: true,
          },
          {
            name: `🗑️ Message Purge`,
            value: `\`${days}\` day${days !== 1 ? 's' : ''}`,
            inline: true,
          },
          {
            name: `${EMOJI.warning} Reason`,
            value: `> ${reason}`,
            inline: false,
          },
          {
            name: `${EMOJI.calendar} Timestamp`,
            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
            inline: false,
          },
        ],
        image: gifUrl,
        footer: { text: `${EMOJI.banhammer} Banned by ${interaction.user.username}  •  Lilith Protector` },
      })],
    });
  } catch (err) {
    await interaction.editReply({ embeds: [errorEmbed('Ban Failed', `${EMOJI.triggered} ${err.message}`)] });
  }
}
