import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('voice')
  .setDescription('Voice channel control commands')
  .addSubcommand(sub =>
    sub.setName('kick')
      .setDescription('Kick a member from their voice channel')
      .addUserOption(o => o.setName('user').setDescription('Member to kick from voice').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('mute')
      .setDescription('Server-mute a member in voice')
      .addUserOption(o => o.setName('user').setDescription('Member to mute').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('unmute')
      .setDescription('Remove server-mute from a member')
      .addUserOption(o => o.setName('user').setDescription('Member to unmute').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('deafen')
      .setDescription('Server-deafen a member in voice')
      .addUserOption(o => o.setName('user').setDescription('Member to deafen').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('undeafen')
      .setDescription('Remove server-deafen from a member')
      .addUserOption(o => o.setName('user').setDescription('Member to undeafen').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('move')
      .setDescription('Move a member to a different voice channel')
      .addUserOption(o => o.setName('user').setDescription('Member to move').setRequired(true))
      .addChannelOption(o => o.setName('channel').setDescription('Destination voice channel').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('muteall')
      .setDescription('Server-mute everyone in a voice channel')
      .addChannelOption(o => o.setName('channel').setDescription('Voice channel').setRequired(false))
  )
  .addSubcommand(sub =>
    sub.setName('unmuteall')
      .setDescription('Unmute everyone in a voice channel')
      .addChannelOption(o => o.setName('channel').setDescription('Voice channel').setRequired(false))
  )
  .addSubcommand(sub =>
    sub.setName('kickall')
      .setDescription('Kick everyone from a voice channel')
      .addChannelOption(o => o.setName('channel').setDescription('Voice channel (defaults to yours)').setRequired(false))
  )
  .addSubcommand(sub =>
    sub.setName('info')
      .setDescription('View info about a voice channel')
      .addChannelOption(o => o.setName('channel').setDescription('Voice channel').setRequired(false))
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers);

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  const requiresVoice = ['kick', 'mute', 'unmute', 'deafen', 'undeafen', 'move'];

  if (sub === 'kick') {
    const member = interaction.options.getMember('user');
    if (!member) return interaction.reply({ embeds: [errorEmbed('Not Found', 'Member not found.')], ephemeral: true });
    if (!member.voice?.channel) return interaction.reply({ embeds: [errorEmbed('Not in Voice', 'That member is not in a voice channel.')], ephemeral: true });

    const channelName = member.voice.channel.name;
    await member.voice.disconnect(`Voice kicked by ${interaction.user.tag}`);
    await interaction.reply({ embeds: [successEmbed('Kicked from Voice', `${EMOJI.kick} **${member.user.tag}** was kicked from **${channelName}**.`)] });
  }

  else if (sub === 'mute') {
    const member = interaction.options.getMember('user');
    if (!member?.voice?.channel) return interaction.reply({ embeds: [errorEmbed('Not in Voice', 'That member is not in a voice channel.')], ephemeral: true });
    await member.voice.setMute(true, `Muted by ${interaction.user.tag}`);
    await interaction.reply({ embeds: [successEmbed('Voice Muted', `${EMOJI.mute} **${member.user.tag}** has been server-muted.`)] });
  }

  else if (sub === 'unmute') {
    const member = interaction.options.getMember('user');
    if (!member?.voice?.channel) return interaction.reply({ embeds: [errorEmbed('Not in Voice', 'That member is not in a voice channel.')], ephemeral: true });
    await member.voice.setMute(false, `Unmuted by ${interaction.user.tag}`);
    await interaction.reply({ embeds: [successEmbed('Voice Unmuted', `${EMOJI.unmute} **${member.user.tag}** has been server-unmuted.`)] });
  }

  else if (sub === 'deafen') {
    const member = interaction.options.getMember('user');
    if (!member?.voice?.channel) return interaction.reply({ embeds: [errorEmbed('Not in Voice', 'That member is not in a voice channel.')], ephemeral: true });
    await member.voice.setDeaf(true, `Deafened by ${interaction.user.tag}`);
    await interaction.reply({ embeds: [successEmbed('Voice Deafened', `${EMOJI.mute} **${member.user.tag}** has been server-deafened.`)] });
  }

  else if (sub === 'undeafen') {
    const member = interaction.options.getMember('user');
    if (!member?.voice?.channel) return interaction.reply({ embeds: [errorEmbed('Not in Voice', 'That member is not in a voice channel.')], ephemeral: true });
    await member.voice.setDeaf(false, `Undeafened by ${interaction.user.tag}`);
    await interaction.reply({ embeds: [successEmbed('Voice Undeafened', `${EMOJI.unmute} **${member.user.tag}** has been undeafened.`)] });
  }

  else if (sub === 'move') {
    const member = interaction.options.getMember('user');
    const dest = interaction.options.getChannel('channel');
    if (!member?.voice?.channel) return interaction.reply({ embeds: [errorEmbed('Not in Voice', 'That member is not in a voice channel.')], ephemeral: true });
    if (dest.type !== 2) return interaction.reply({ embeds: [errorEmbed('Not Voice', 'Please select a voice channel.')], ephemeral: true });
    await member.voice.setChannel(dest, `Moved by ${interaction.user.tag}`);
    await interaction.reply({ embeds: [successEmbed('Moved', `${EMOJI.move} **${member.user.tag}** moved to **${dest.name}**.`)] });
  }

  else if (sub === 'muteall') {
    await interaction.deferReply();
    const vc = interaction.options.getChannel('channel') ?? interaction.member?.voice?.channel;
    if (!vc) return interaction.editReply({ embeds: [errorEmbed('No Channel', 'Please specify a voice channel or join one.')] });
    if (vc.type !== 2) return interaction.editReply({ embeds: [errorEmbed('Not Voice', 'That is not a voice channel.')] });

    let count = 0;
    for (const [, member] of vc.members) {
      if (!member.user.bot) { await member.voice.setMute(true).catch(() => {}); count++; }
    }
    await interaction.editReply({ embeds: [successEmbed('All Muted', `${EMOJI.mute} Muted **${count}** member(s) in **${vc.name}**.`)] });
  }

  else if (sub === 'unmuteall') {
    await interaction.deferReply();
    const vc = interaction.options.getChannel('channel') ?? interaction.member?.voice?.channel;
    if (!vc) return interaction.editReply({ embeds: [errorEmbed('No Channel', 'Please specify a voice channel or join one.')] });

    let count = 0;
    for (const [, member] of vc.members) {
      await member.voice.setMute(false).catch(() => {}); count++;
    }
    await interaction.editReply({ embeds: [successEmbed('All Unmuted', `${EMOJI.unmute} Unmuted **${count}** member(s) in **${vc.name}**.`)] });
  }

  else if (sub === 'kickall') {
    await interaction.deferReply();
    const vc = interaction.options.getChannel('channel') ?? interaction.member?.voice?.channel;
    if (!vc) return interaction.editReply({ embeds: [errorEmbed('No Channel', 'Please specify or join a voice channel.')] });

    let count = 0;
    for (const [, member] of vc.members) {
      if (member.id !== interaction.client.user.id) { await member.voice.disconnect().catch(() => {}); count++; }
    }
    await interaction.editReply({ embeds: [successEmbed('All Kicked', `${EMOJI.kick} Kicked **${count}** member(s) from **${vc.name}**.`)] });
  }

  else if (sub === 'info') {
    const vc = interaction.options.getChannel('channel') ?? interaction.member?.voice?.channel;
    if (!vc) return interaction.reply({ embeds: [errorEmbed('No Channel', 'Please specify a voice channel or join one.')], ephemeral: true });
    if (vc.type !== 2) return interaction.reply({ embeds: [errorEmbed('Not Voice', 'That is not a voice channel.')], ephemeral: true });

    const members = [...vc.members.values()];
    const humanCount = members.filter(m => !m.user.bot).length;
    const botCount = members.filter(m => m.user.bot).length;
    const mutedCount = members.filter(m => m.voice.mute || m.voice.serverMute).length;
    const deafCount = members.filter(m => m.voice.deaf || m.voice.serverDeaf).length;

    await interaction.reply({
      embeds: [createEmbed({
        color: THEME.primary,
        title: `${EMOJI.voice} Voice Channel — ${vc.name}`,
        description: DIVIDER,
        fields: [
          { name: '🆔 ID', value: `\`${vc.id}\``, inline: true },
          { name: `${EMOJI.user} Total`, value: `\`${members.length}\``, inline: true },
          { name: `${EMOJI.user} Humans`, value: `\`${humanCount}\``, inline: true },
          { name: `${EMOJI.bot} Bots`, value: `\`${botCount}\``, inline: true },
          { name: `${EMOJI.mute} Muted`, value: `\`${mutedCount}\``, inline: true },
          { name: `${EMOJI.mute} Deafened`, value: `\`${deafCount}\``, inline: true },
          { name: `${EMOJI.settings} Bitrate`, value: `\`${vc.bitrate / 1000}kbps\``, inline: true },
          { name: `${EMOJI.user} User Limit`, value: `\`${vc.userLimit || 'Unlimited'}\``, inline: true },
        ],
      })],
    });
  }
}
