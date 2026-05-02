import { SlashCommandBuilder } from 'discord.js';
import { successEmbed, infoEmbed, EMOJI } from '../../utils/embedBuilder.js';
import { getAfk, setAfk, clearAfk } from '../../utils/guildConfig.js';

export const data = new SlashCommandBuilder()
  .setName('afk')
  .setDescription('Set your AFK status — bot will notify pingers')
  .addStringOption(o => o.setName('reason').setDescription('AFK reason (default: AFK)').setRequired(false));

export async function execute(interaction) {
  const guildId = interaction.guild.id;
  const userId = interaction.user.id;
  const existing = getAfk(guildId, userId);

  if (existing) {
    clearAfk(guildId, userId);
    const duration = Date.now() - existing.timestamp;
    const mins = Math.floor(duration / 60000);
    await interaction.reply({
      embeds: [successEmbed('Welcome Back!', `${EMOJI.check} AFK status removed. You were away for **${mins} minute(s)**.`)],
    });
    return;
  }

  const reason = interaction.options?.getString?.('reason') ?? 'AFK';
  setAfk(guildId, userId, reason);
  await interaction.reply({
    embeds: [infoEmbed('AFK Set', [
      `${EMOJI.bell} You are now AFK: **${reason}**`,
      `${EMOJI.arrow} Anyone who pings you will be notified.`,
      `${EMOJI.arrow} Say anything to remove your AFK status.`,
    ].join('\n'))],
  });
}
