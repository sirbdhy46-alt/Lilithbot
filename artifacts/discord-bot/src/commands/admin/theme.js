import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed, infoEmbed, EMOJI, DIVIDER } from '../../utils/embedBuilder.js';
import { setThemeColor, getTheme, resetTheme, parseHex } from '../../utils/themeManager.js';

export const data = new SlashCommandBuilder()
  .setName('theme')
  .setDescription('Configure the bot theme for this server')
  .addSubcommand(sub =>
    sub.setName('set')
      .setDescription('Set a theme color')
      .addStringOption(opt =>
        opt.setName('key').setDescription('Color key').setRequired(true)
          .addChoices(
            { name: 'Primary', value: 'primary' },
            { name: 'Success', value: 'success' },
            { name: 'Error', value: 'error' },
            { name: 'Warning', value: 'warning' },
            { name: 'Info', value: 'info' },
          )
      )
      .addStringOption(opt => opt.setName('color').setDescription('Hex color e.g. #FF5733').setRequired(true))
  )
  .addSubcommand(sub => sub.setName('view').setDescription('View current theme colors'))
  .addSubcommand(sub => sub.setName('reset').setDescription('Reset theme to defaults'))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guild.id;

  if (sub === 'set') {
    const key = interaction.options.getString('key');
    const hex = interaction.options.getString('color');
    const num = parseHex(hex);
    if (num === null) return interaction.reply({ embeds: [errorEmbed('Invalid Color', `\`${hex}\` is not a valid hex color.\n*Example: \`#FF5733\`*`)], ephemeral: true });
    setThemeColor(guildId, key, num);
    return interaction.reply({ embeds: [successEmbed('Theme Updated', `${EMOJI.settings} **${key}** color set to \`${hex}\`.`)] });
  }

  if (sub === 'reset') {
    resetTheme(guildId);
    return interaction.reply({ embeds: [successEmbed('Theme Reset', `${EMOJI.check} Server theme has been reset to defaults.`)] });
  }

  if (sub === 'view') {
    const t = getTheme(guildId);
    return interaction.reply({
      embeds: [infoEmbed('Current Theme', [
        `${DIVIDER}`,
        ``,
        `${EMOJI.arrow} **Primary:** \`#${t.primary.toString(16).padStart(6, '0').toUpperCase()}\``,
        `${EMOJI.arrow} **Success:** \`#${t.success.toString(16).padStart(6, '0').toUpperCase()}\``,
        `${EMOJI.arrow} **Error:**   \`#${t.error.toString(16).padStart(6, '0').toUpperCase()}\``,
        `${EMOJI.arrow} **Warning:** \`#${t.warning.toString(16).padStart(6, '0').toUpperCase()}\``,
        `${EMOJI.arrow} **Info:**    \`#${t.info.toString(16).padStart(6, '0').toUpperCase()}\``,
        ``,
        `${DIVIDER}`,
      ].join('\n'))],
    });
  }
}
