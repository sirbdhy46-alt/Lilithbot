import { errorEmbed, EMOJI } from '../utils/embedBuilder.js';

export const name = 'interactionCreate';
export const once = false;

export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error in /${interaction.commandName}:`, error);
    const embed = errorEmbed(
      'Command Error',
      `${EMOJI.error} Something went wrong while running this command.\n*If this keeps happening, contact an admin.*`
    );
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
    }
  }
}
