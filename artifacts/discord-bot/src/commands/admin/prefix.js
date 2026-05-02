import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, infoEmbed, EMOJI, DIVIDER, createEmbed, THEME } from '../../utils/embedBuilder.js';
import { getPrefix, setPrefix, resetPrefix } from '../../utils/guildConfig.js';

export const data = new SlashCommandBuilder()
  .setName('prefix')
  .setDescription('Manage the custom prefix for this server')
  .addSubcommand(sub =>
    sub.setName('set')
      .setDescription('Set a custom prefix (e.g. !, ?, ., -)')
      .addStringOption(opt => opt.setName('prefix').setDescription('New prefix (1-5 characters)').setRequired(true))
  )
  .addSubcommand(sub => sub.setName('view').setDescription('View the current prefix'))
  .addSubcommand(sub => sub.setName('reset').setDescription('Reset prefix back to default (!)'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guild.id;

  if (sub === 'set') {
    const newPrefix = interaction.options.getString('prefix');
    if (newPrefix.length > 5) {
      return interaction.reply({ embeds: [errorEmbed('Too Long', 'Prefix must be 5 characters or less.')], ephemeral: true });
    }
    setPrefix(guildId, newPrefix);
    await interaction.reply({
      embeds: [successEmbed('Prefix Updated', [
        `${EMOJI.check} Server prefix set to \`${newPrefix}\``,
        ``,
        `${EMOJI.arrow} **Example:** \`${newPrefix}ban @user reason\``,
        `${EMOJI.arrow} **Slash commands** still work normally with \`/\``,
        `${EMOJI.arrow} **Changed by:** ${interaction.user.tag}`,
      ].join('\n'))],
    });
  }

  else if (sub === 'view') {
    const current = getPrefix(guildId);
    await interaction.reply({
      embeds: [createEmbed({
        color: THEME.info,
        title: `${EMOJI.settings} Server Prefix`,
        description: [
          DIVIDER, ``,
          `${EMOJI.arrow} **Current Prefix:** \`${current}\``,
          `${EMOJI.arrow} **Slash Prefix:** \`/\` (always works)`,
          ``,
          `**Example usage:**`,
          `\`${current}ban @user Spamming\``,
          `\`${current}help\``,
          `\`${current}userinfo @user\``,
          ``, DIVIDER,
        ].join('\n'),
      })],
    });
  }

  else if (sub === 'reset') {
    resetPrefix(guildId);
    await interaction.reply({
      embeds: [successEmbed('Prefix Reset', `${EMOJI.check} Prefix has been reset to \`!\` (default).`)],
    });
  }
}
