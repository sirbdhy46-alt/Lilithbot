/**
 * Antibetray: detect rapid mass-banning by a staff member.
 */
import { AuditLogEvent } from 'discord.js';
import { getAntibetray } from '../utils/guildConfig.js';
import { trackAction, clearTrack, getAuditExecutor, punish, sendBetrayalAlert } from '../utils/betrayDetector.js';

export const name = 'guildBanAdd';
export const once = false;

export async function execute(ban) {
  const guild = ban.guild;
  const guildId = guild.id;
  const ab = getAntibetray(guildId);

  if (!ab.enabled) return;

  const executor = await getAuditExecutor(guild, AuditLogEvent.MemberBanAdd);
  if (!executor) return;
  if (executor.id === guild.client.user.id) return;
  if (executor.id === guild.ownerId) return;
  if (ab.whitelist.includes(executor.id)) return;

  const count = trackAction(guildId, executor.id, 'ban', ab.windowMs);

  if (count >= ab.banThreshold) {
    clearTrack(guildId, executor.id, 'ban');
    await punish(guild, executor.id, `Mass banning detected (${count} bans in 10s)`, ab.punishment);
    await sendBetrayalAlert(guild, {
      userId: executor.id,
      username: executor.tag ?? executor.username,
      action: '🔨 Mass Banning',
      count,
      threshold: ab.banThreshold,
      punishment: ab.punishment,
    });
  }
}
