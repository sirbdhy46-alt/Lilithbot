/**
 * Antibetray: detect rapid role deletion by a staff member.
 */
import { AuditLogEvent } from 'discord.js';
import { getAntibetray } from '../utils/guildConfig.js';
import { trackAction, clearTrack, getAuditExecutor, punish, sendBetrayalAlert } from '../utils/betrayDetector.js';

export const name = 'roleDelete';
export const once = false;

export async function execute(role) {
  const guild = role.guild;
  if (!guild) return;
  const guildId = guild.id;
  const ab = getAntibetray(guildId);

  if (!ab.enabled) return;

  const executor = await getAuditExecutor(guild, AuditLogEvent.RoleDelete);
  if (!executor) return;
  if (executor.id === guild.client.user.id) return;
  if (executor.id === guild.ownerId) return;
  if (ab.whitelist.includes(executor.id)) return;

  const count = trackAction(guildId, executor.id, 'role_delete', ab.windowMs);

  if (count >= ab.roleDeleteThreshold) {
    clearTrack(guildId, executor.id, 'role_delete');
    await punish(guild, executor.id, `Mass role deletion detected (${count} roles in 10s)`, ab.punishment);
    await sendBetrayalAlert(guild, {
      userId: executor.id,
      username: executor.tag ?? executor.username,
      action: '🗑️ Mass Role Deletion',
      count,
      threshold: ab.roleDeleteThreshold,
      punishment: ab.punishment,
    });
  }
}
