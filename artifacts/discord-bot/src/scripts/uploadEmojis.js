/**
 * Uploads 100 handpicked custom emojis from emoji.gg to Discord Application Emojis.
 * Run: pnpm --filter @workspace/discord-bot run upload-emojis
 * Saves IDs to data/emojis.json for the bot to use.
 */
import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
if (!token || !clientId) { console.error('❌ Missing DISCORD_TOKEN or DISCORD_CLIENT_ID'); process.exit(1); }

// ── 100 Handpicked emojis from emoji.gg — all verified CDN URLs ──────────────
const EMOJI_SET = [
  // ── SHIELDS & PROTECTION ────────────────────────────────────────────────────
  { name: 'lp_shield',        url: 'https://cdn3.emoji.gg/emojis/4508_SHIELD.png' },
  { name: 'lp_shield2',       url: 'https://cdn3.emoji.gg/emojis/shield.png' },
  { name: 'lp_dynoshield',    url: 'https://cdn3.emoji.gg/emojis/1180_dynoshield.png' },
  { name: 'lp_capshield',     url: 'https://cdn3.emoji.gg/emojis/5783_captainamerica_shield.png' },

  // ── BAN HAMMERS & BANS ──────────────────────────────────────────────────────
  { name: 'lp_banhammer',     url: 'https://cdn3.emoji.gg/emojis/BanHammer4.png' },
  { name: 'lp_banhammer2',    url: 'https://cdn3.emoji.gg/emojis/banhammer3.png' },
  { name: 'lp_blobbanhammer', url: 'https://cdn3.emoji.gg/emojis/BlobBanHammer.gif' },
  { name: 'lp_bancouncil',    url: 'https://cdn3.emoji.gg/emojis/BlobBanhammerCouncil.png' },
  { name: 'lp_banned',        url: 'https://cdn3.emoji.gg/emojis/8789_banned.png' },
  { name: 'lp_anibanned',     url: 'https://cdn3.emoji.gg/emojis/anibanned.gif' },
  { name: 'lp_ban',           url: 'https://cdn3.emoji.gg/emojis/ban.png' },
  { name: 'lp_bancat',        url: 'https://cdn3.emoji.gg/emojis/bancat.png' },
  { name: 'lp_crowban',       url: 'https://cdn3.emoji.gg/emojis/CrowBan.png' },
  { name: 'lp_drakeban',      url: 'https://cdn3.emoji.gg/emojis/drakeban.png' },
  { name: 'lp_feelsbanned',   url: 'https://cdn3.emoji.gg/emojis/FeelsBanMan.png' },
  { name: 'lp_hitomiban',     url: 'https://cdn3.emoji.gg/emojis/HitomiBan.png' },
  { name: 'lp_linkban',       url: 'https://cdn3.emoji.gg/emojis/5014_linkban.png' },

  // ── WARNINGS & ALERTS ───────────────────────────────────────────────────────
  { name: 'lp_warning',       url: 'https://cdn3.emoji.gg/emojis/Warning.png' },
  { name: 'lp_warningpc',     url: 'https://cdn3.emoji.gg/emojis/WarningPC.gif' },

  // ── POLICE & LAW ────────────────────────────────────────────────────────────
  { name: 'lp_police',        url: 'https://cdn3.emoji.gg/emojis/4799_police.png' },
  { name: 'lp_police2',       url: 'https://cdn3.emoji.gg/emojis/Police2.gif' },
  { name: 'lp_police3',       url: 'https://cdn3.emoji.gg/emojis/Police1.gif' },
  { name: 'lp_blobpolice',    url: 'https://cdn3.emoji.gg/emojis/blobpoliceangry.png' },
  { name: 'lp_hellopolice',   url: 'https://cdn3.emoji.gg/emojis/HelloPolice.png' },
  { name: 'lp_nekopolice',    url: 'https://cdn3.emoji.gg/emojis/NekoAtsumePolice.png' },

  // ── WEAPONS & DESTRUCTION ───────────────────────────────────────────────────
  { name: 'lp_nuke',          url: 'https://cdn3.emoji.gg/emojis/nuke.png' },
  { name: 'lp_bomb',          url: 'https://cdn3.emoji.gg/emojis/Bomb.png' },
  { name: 'lp_sword',         url: 'https://cdn3.emoji.gg/emojis/minecraftsword.png' },
  { name: 'lp_blade',         url: 'https://cdn3.emoji.gg/emojis/kritoblade.png' },
  { name: 'lp_redsaber',      url: 'https://cdn3.emoji.gg/emojis/redsaber.png' },

  // ── NINJA & DANGER ──────────────────────────────────────────────────────────
  { name: 'lp_ninja',         url: 'https://cdn3.emoji.gg/emojis/ninja.png' },
  { name: 'lp_ninjamad',      url: 'https://cdn3.emoji.gg/emojis/NinjaMad.png' },
  { name: 'lp_blobninja',     url: 'https://cdn3.emoji.gg/emojis/blobninja.png' },
  { name: 'lp_blobsaluteban', url: 'https://cdn3.emoji.gg/emojis/blobsaluteban.png' },

  // ── DARK / EVIL ─────────────────────────────────────────────────────────────
  { name: 'lp_devil',         url: 'https://cdn3.emoji.gg/emojis/7911_Devil_Pepe.png' },
  { name: 'lp_devilparrot',   url: 'https://cdn3.emoji.gg/emojis/DevilParrot.gif' },
  { name: 'lp_dark',          url: 'https://cdn3.emoji.gg/emojis/dark_flame_master.png' },
  { name: 'lp_darkness',      url: 'https://cdn3.emoji.gg/emojis/LordOfDarkness.png' },
  { name: 'lp_dragon',        url: 'https://cdn3.emoji.gg/emojis/AngeryDragon.png' },

  // ── STATUS: SUCCESS / CHECK ─────────────────────────────────────────────────
  { name: 'lp_check',         url: 'https://cdn3.emoji.gg/emojis/CheckMark.png' },
  { name: 'lp_checkblob',     url: 'https://cdn3.emoji.gg/emojis/checkxblob.png' },
  { name: 'lp_dbcheck',       url: 'https://cdn3.emoji.gg/emojis/DatabaseCheck.png' },

  // ── PRESTIGE & RANK ─────────────────────────────────────────────────────────
  { name: 'lp_vip',           url: 'https://cdn3.emoji.gg/emojis/VIP.png' },
  { name: 'lp_badge',         url: 'https://cdn3.emoji.gg/emojis/levelupbadge.png' },
  { name: 'lp_frostellite',   url: 'https://cdn3.emoji.gg/emojis/Frost_Elite.png' },
  { name: 'lp_crown',         url: 'https://cdn3.emoji.gg/emojis/crowncat.png' },
  { name: 'lp_crown2',        url: 'https://cdn3.emoji.gg/emojis/crowndog.png' },
  { name: 'lp_crown3',        url: 'https://cdn3.emoji.gg/emojis/crownpig.png' },
  { name: 'lp_king',          url: 'https://cdn3.emoji.gg/emojis/3040_kingpeepo.png' },
  { name: 'lp_trophy',        url: 'https://cdn3.emoji.gg/emojis/worldstar.png' },
  { name: 'lp_star',          url: 'https://cdn3.emoji.gg/emojis/starring.png' },
  { name: 'lp_gold',          url: 'https://cdn3.emoji.gg/emojis/gold.png' },
  { name: 'lp_diamond',       url: 'https://cdn3.emoji.gg/emojis/DiamondAnimated.gif' },

  // ── HYPE & POWER ────────────────────────────────────────────────────────────
  { name: 'lp_fire',          url: 'https://cdn3.emoji.gg/emojis/fire.png' },
  { name: 'lp_zap',           url: 'https://cdn3.emoji.gg/emojis/zapp.png' },
  { name: 'lp_boost',         url: 'https://cdn3.emoji.gg/emojis/Boosted.png' },
  { name: 'lp_boostArt',      url: 'https://cdn3.emoji.gg/emojis/BoostedArt.png' },
  { name: 'lp_pepepower',     url: 'https://cdn3.emoji.gg/emojis/6804_pepe_power.png' },

  // ── HEARTS & LOVE ───────────────────────────────────────────────────────────
  { name: 'lp_love',          url: 'https://cdn3.emoji.gg/emojis/LoveHeart.png' },
  { name: 'lp_heart',         url: 'https://cdn3.emoji.gg/emojis/rainbowheart.png' },
  { name: 'lp_heartbeat',     url: 'https://cdn3.emoji.gg/emojis/8757_heartbeat_anim.gif' },

  // ── SPARKLES ────────────────────────────────────────────────────────────────
  { name: 'lp_sparkle',       url: 'https://cdn3.emoji.gg/emojis/sparkles_fiery.png' },
  { name: 'lp_sparkle2',      url: 'https://cdn3.emoji.gg/emojis/sparkles_rgb.png' },
  { name: 'lp_sparkle3',      url: 'https://cdn3.emoji.gg/emojis/sparkles_red.png' },
  { name: 'lp_nekosparkle',   url: 'https://cdn3.emoji.gg/emojis/NekoAtsumeSparkle.png' },
  { name: 'lp_sparklepeek',   url: 'https://cdn3.emoji.gg/emojis/MrSparklePeek.png' },

  // ── BOT ─────────────────────────────────────────────────────────────────────
  { name: 'lp_bot',           url: 'https://cdn3.emoji.gg/emojis/bot.png' },
  { name: 'lp_bottag',        url: 'https://cdn3.emoji.gg/emojis/bottag.png' },

  // ── BLOB EMOTIONS (animated & not) ──────────────────────────────────────────
  { name: 'lp_blobwave',      url: 'https://cdn3.emoji.gg/emojis/blobwave.png' },
  { name: 'lp_blobjoining',   url: 'https://cdn3.emoji.gg/emojis/blobjoining.gif' },
  { name: 'lp_blobcool',      url: 'https://cdn3.emoji.gg/emojis/BlobCool.gif' },
  { name: 'lp_blobcool2',     url: 'https://cdn3.emoji.gg/emojis/blobcool.png' },
  { name: 'lp_blobhyper',     url: 'https://cdn3.emoji.gg/emojis/BlobHyperOwO.png' },
  { name: 'lp_blobthink',     url: 'https://cdn3.emoji.gg/emojis/blobthinking.png' },
  { name: 'lp_blobheart',     url: 'https://cdn3.emoji.gg/emojis/BlobHeartEyes.png' },
  { name: 'lp_blobangry',     url: 'https://cdn3.emoji.gg/emojis/blobangry.png' },
  { name: 'lp_blobangel',     url: 'https://cdn3.emoji.gg/emojis/blobangel.png' },
  { name: 'lp_bloblthink',    url: 'https://cdn3.emoji.gg/emojis/blobultrathink.png' },
  { name: 'lp_blobcoolthink', url: 'https://cdn3.emoji.gg/emojis/BlobThinkCool.png' },

  // ── JOIN / LEAVE ────────────────────────────────────────────────────────────
  { name: 'lp_join',          url: 'https://cdn3.emoji.gg/emojis/blobjoining.gif' },
  { name: 'lp_leave',         url: 'https://cdn3.emoji.gg/emojis/LeavingServer.png' },
  { name: 'lp_leave2',        url: 'https://cdn3.emoji.gg/emojis/leave.png' },

  // ── HYPER / HYPE ────────────────────────────────────────────────────────────
  { name: 'lp_hyper',         url: 'https://cdn3.emoji.gg/emojis/2795_BongoCatHyper.gif' },
  { name: 'lp_hyperpog',      url: 'https://cdn3.emoji.gg/emojis/hyperPoggers.gif' },
  { name: 'lp_hyperangry',    url: 'https://cdn3.emoji.gg/emojis/hyperangry.png' },
  { name: 'lp_hyperdab',      url: 'https://cdn3.emoji.gg/emojis/hyperdab.png' },
  { name: 'lp_hyperpinged',   url: 'https://cdn3.emoji.gg/emojis/hyperpinged.png' },
  { name: 'lp_hyperthink',    url: 'https://cdn3.emoji.gg/emojis/hyperthonk.png' },
  { name: 'lp_thinkzap',      url: 'https://cdn3.emoji.gg/emojis/thinkzap.png' },
  { name: 'lp_monkamega',     url: 'https://cdn3.emoji.gg/emojis/monkaMega.png' },

  // ── REACTIONS / MOOD ────────────────────────────────────────────────────────
  { name: 'lp_triggered',     url: 'https://cdn3.emoji.gg/emojis/OGTriggered.png' },
  { name: 'lp_ghost',         url: 'https://cdn3.emoji.gg/emojis/GhostBOOOOO.png' },
  { name: 'lp_ghostcat',      url: 'https://cdn3.emoji.gg/emojis/ghostcat3.gif' },
  { name: 'lp_ghostcat2',     url: 'https://cdn3.emoji.gg/emojis/ghostcat2.gif' },
  { name: 'lp_stare',         url: 'https://cdn3.emoji.gg/emojis/StareCrazy.png' },

  // ── PANDAS ──────────────────────────────────────────────────────────────────
  { name: 'lp_pandahyper',    url: 'https://cdn3.emoji.gg/emojis/PandaHyper.png' },
  { name: 'lp_pandafire',     url: 'https://cdn3.emoji.gg/emojis/PandaFire.gif' },
  { name: 'lp_pandadevil',    url: 'https://cdn3.emoji.gg/emojis/PandaDevil.png' },
  { name: 'lp_pandacool',     url: 'https://cdn3.emoji.gg/emojis/PandaCool.png' },

  // ── COOL ANIMALS ────────────────────────────────────────────────────────────
  { name: 'lp_cooldoge',      url: 'https://cdn3.emoji.gg/emojis/cooldoge.gif' },
  { name: 'lp_awoocool',      url: 'https://cdn3.emoji.gg/emojis/awoocool.png' },
];

async function fetchImageAsBase64(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'LilithProtector/2.0 Discord Bot' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const buf = await res.arrayBuffer();
  const ext = url.endsWith('.gif') ? 'gif' : 'png';
  return `data:image/${ext};base64,${Buffer.from(buf).toString('base64')}`;
}

async function main() {
  const rest = new REST().setToken(token);

  // Delete all existing lp_ emojis
  console.log('\n🧹 Removing old lp_ application emojis...');
  try {
    const existing = await rest.get(Routes.applicationEmojis(clientId));
    const old = (existing.items ?? []).filter(e => e.name.startsWith('lp_'));
    for (const e of old) {
      await rest.delete(Routes.applicationEmoji(clientId, e.id));
      process.stdout.write('.');
    }
    if (old.length) console.log(`\n   Removed ${old.length} old emoji(s).`);
  } catch (e) { console.log('  Could not remove old emojis:', e.message); }

  console.log(`\n🎨 Uploading ${EMOJI_SET.length} handpicked emojis from emoji.gg...\n`);

  const saved = {};
  let ok = 0;
  let fail = 0;

  for (const { name, url } of EMOJI_SET) {
    try {
      const image = await fetchImageAsBase64(url);
      const result = await rest.post(Routes.applicationEmojis(clientId), {
        body: { name, image },
      });
      const fmt = `<:${result.name}:${result.id}>`;
      saved[name] = { id: result.id, name: result.name, format: fmt };
      console.log(`  ✅ ${name.padEnd(22)} ${fmt}`);
      ok++;
      // Respect Discord rate limit
      await new Promise(r => setTimeout(r, 450));
    } catch (err) {
      console.error(`  ❌ ${name.padEnd(22)} ${err.message}`);
      fail++;
    }
  }

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(join(DATA_DIR, 'emojis.json'), JSON.stringify(saved, null, 2));

  console.log(`\n${'━'.repeat(50)}`);
  console.log(`✅ Uploaded: ${ok}   ❌ Failed: ${fail}`);
  console.log(`📁 Saved to data/emojis.json`);
  console.log(`🔄 Restart the bot to load the new emojis!\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
