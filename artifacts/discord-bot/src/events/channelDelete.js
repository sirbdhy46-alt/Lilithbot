/**
 * Antibetray: detect rapid channel deletion by a staff member.
 */
import { AuditLogEvent } from 'discord.js';
import { getAntibetray } from '../utils/guildConfig.js';
import { trackAction, clearTrack, getAuditExecutor, punish, sendBetrayalAlert } from '../utils/betrayDetector.js';

export const name = 'channelDelete';
export const once = false;

export async function execute(channel) {
  const guild = channel.guild;
  if (!guild) return;
  const guildId = guild.id;
  const ab = getAntibetray(guildId);

  if (!ab.enabled) return;

  const executor = await getAuditExecutor(guild, AuditLogEvent.ChannelDelete);
  if (!executor) return;
  if (executor.id === guild.client.user.id) return;
  if (executor.id === guild.ownerId) return;
  if (ab.whitelist.includes(executor.id)) return;

  const count = trackAction(guildId, executor.id, 'channel_delete', ab.windowMs);

  if (count >= ab.channelDeleteThreshold) {
    clearTrack(guildId, executor.id, 'channel_delete');
    await punish(guild, executor.id, `Mass channel deletion detected (${count} channels in 10s)`, ab.punishment);
    await sendBetrayalAlert(guild, {
      userId: executor.id,
      username: executor.tag ?? executor.username,
      action: '🗑️ Mass Channel Deletion',
      count,
      threshold: ab.channelDeleteThreshold,
      punishment: ab.punishment,
    });
  }
}
