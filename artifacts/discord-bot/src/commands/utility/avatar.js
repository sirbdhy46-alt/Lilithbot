import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('avatar')
  .setDescription("Get a user's avatar in full size")
  .addUserOption(opt =>
    opt.setName('user').setDescription('The user').setRequired(false)
  );

export async function execute(interaction) {
  const target = interaction.options.getUser('user') ?? interaction.user;
  const avatarUrl = target.displayAvatarURL({ dynamic: true, size: 1024 });
  const pngUrl = target.displayAvatarURL({ extension: 'png', size: 1024 });
  const jpgUrl = target.displayAvatarURL({ extension: 'jpg', size: 1024 });

  const embed = createEmbed({
    color: THEME.primary,
    title: `${EMOJI.user} Avatar — ${target.username}`,
    description: `${DIVIDER}\n*Click the buttons below to download in different formats*\n${DIVIDER}`,
    image: avatarUrl,
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('PNG').setURL(pngUrl).setStyle(ButtonStyle.Link).setEmoji('🖼️'),
    new ButtonBuilder().setLabel('JPG').setURL(jpgUrl).setStyle(ButtonStyle.Link).setEmoji('📷'),
    new ButtonBuilder().setLabel('WEBP').setURL(avatarUrl).setStyle(ButtonStyle.Link).setEmoji('🌐'),
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}
