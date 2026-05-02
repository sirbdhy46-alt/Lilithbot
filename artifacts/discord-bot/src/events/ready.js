import { ActivityType } from 'discord.js';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const name = 'clientReady';
export const once = true;

// ── Cache invites for vanity tracking ─────────────────────────────────────────
async function cacheInvites(client) {
  client.inviteCache = new Map();
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();
      client.inviteCache.set(guild.id, new Map(invites.map(i => [i.code, i.uses])));
    } catch {}
  }
}

export async function execute(client) {
  // Count loaded custom emojis
  const emojiPath = join(__dirname, '../../data/emojis.json');
  let emojiCount = 0;
  try {
    if (existsSync(emojiPath)) {
      const data = JSON.parse(readFileSync(emojiPath, 'utf8'));
      emojiCount = Object.keys(data).length;
    }
  } catch {}

  const totalUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║     LILITH PROTECTOR — ONLINE        ║`);
  console.log(`╚══════════════════════════════════════╝`);
  console.log(`  ✅ Logged in as : ${client.user.tag}`);
  console.log(`  🛡️  Servers      : ${client.guilds.cache.size}`);
  console.log(`  👥 Users        : ${totalUsers.toLocaleString()}`);
  console.log(`  🎨 Custom Emojis: ${emojiCount}`);
  console.log(`  ⚡ Ready!\n`);

  // Cache invites for vanity tracking
  await cacheInvites(client);
  console.log(`  📬 Invite cache ready for ${client.inviteCache.size} guild(s)\n`);

  const activities = [
    { name: '/help | Lilith Protector', type: ActivityType.Watching },
    { name: `${client.guilds.cache.size} server${client.guilds.cache.size !== 1 ? 's' : ''}`, type: ActivityType.Watching },
    { name: '🛡️ Premium Protection', type: ActivityType.Playing },
    { name: '⚜️ Lilith Protector', type: ActivityType.Custom },
  ];

  let i = 0;
  const tick = () => {
    const act = activities[i % activities.length];
    client.user.setPresence({ activities: [{ name: act.name, type: act.type }], status: 'online' });
    i++;
  };

  tick();
  setInterval(tick, 30_000);
}
