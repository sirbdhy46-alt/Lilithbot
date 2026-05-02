/**
 * voiceStateUpdate — handles the VC Role system
 * Assigns configured roles when a member joins a VC, removes when they leave.
 */
import { getVcRoles } from '../utils/guildConfig.js';

export const name = 'voiceStateUpdate';
export const once = false;

export async function execute(oldState, newState) {
  const guild = newState.guild;
  const member = newState.member ?? oldState.member;
  if (!member || member.user.bot) return;

  const guildId = guild.id;
  const vcroles = getVcRoles(guildId);
  if (!vcroles.length) return;

  const me = guild.members.me;
  if (!me?.permissions.has('ManageRoles')) return;

  const oldChannelId = oldState.channelId;
  const newChannelId = newState.channelId;

  // ── Nothing voice-related changed ────────────────────────────────────────────
  if (oldChannelId === newChannelId) return;

  // ── Roles to REMOVE (from old channel) ───────────────────────────────────────
  if (oldChannelId) {
    const toRemove = vcroles.filter(v =>
      v.channelId === oldChannelId || v.channelId === null
    );

    for (const { roleId } of toRemove) {
      // If they moved to a new channel that ALSO grants this role, skip removing
      if (newChannelId) {
        const stillApplies = vcroles.some(v =>
          v.roleId === roleId && (v.channelId === newChannelId || v.channelId === null)
        );
        if (stillApplies) continue;
      }
      const role = guild.roles.cache.get(roleId);
      if (role && role.position < me.roles.highest.position) {
        await member.roles.remove(role, 'VC Role — Left voice channel').catch(() => {});
      }
    }
  }

  // ── Roles to ADD (for new channel) ───────────────────────────────────────────
  if (newChannelId) {
    const toAdd = vcroles.filter(v =>
      v.channelId === newChannelId || v.channelId === null
    );

    for (const { roleId } of toAdd) {
      const role = guild.roles.cache.get(roleId);
      if (role && role.position < me.roles.highest.position) {
        await member.roles.add(role, 'VC Role — Joined voice channel').catch(() => {});
      }
    }
  }
}
