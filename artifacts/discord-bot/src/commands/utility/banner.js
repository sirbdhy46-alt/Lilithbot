import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createEmbed, errorEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('banner')
  .setDescription('Get a user or server banner')
  .addSubcommand(sub =>
    sub.setName('user')
      .setDescription("Get a user's banner")
      .addUserOption(o => o.setName('user').setDescription('The user').setRequired(false))
  )
  .addSubcommand(sub => sub.setName('server').setDescription("Get this server's banner"));

export async function execute(interaction) {
  const sub = interaction.options?.getSubcommand?.() ?? 'user';

  if (sub === 'user') {
    const user = await (interaction.options?.getUser?.('user') ?? interaction.user).fetch();
    const bannerUrl = user.bannerURL({ dynamic: true, size: 1024 });

    if (!bannerUrl) return interaction.reply({ embeds: [errorEmbed('No Banner', `**${user.username}** does not have a profile banner.`)], ephemeral: true });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Open Banner').setURL(bannerUrl).setStyle(ButtonStyle.Link).setEmoji('🖼️'),
    );

    await interaction.reply({
      embeds: [createEmbed({ color: user.accentColor ?? THEME.primary, title: `${EMOJI.user} Banner — ${user.username}`, image: bannerUrl, description: DIVIDER })],
      components: [row],
    });
  }

  else if (sub === 'server') {
    const guild = interaction.guild;
    const bannerUrl = guild.bannerURL({ dynamic: true, size: 1024 });

    if (!bannerUrl) return interaction.reply({ embeds: [errorEmbed('No Banner', `**${guild.name}** does not have a server banner.`)], ephemeral: true });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Open Banner').setURL(bannerUrl).setStyle(ButtonStyle.Link).setEmoji('🖼️'),
    );

    await interaction.reply({
      embeds: [createEmbed({ color: THEME.primary, title: `${EMOJI.server} Server Banner — ${guild.name}`, image: bannerUrl, description: DIVIDER })],
      components: [row],
    });
  }
}
