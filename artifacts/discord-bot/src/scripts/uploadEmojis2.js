/**
 * ADDITIVE emoji upload — adds 120 new emojis WITHOUT deleting existing ones.
 * Merges results into data/emojis.json alongside existing emojis.
 * Run: pnpm --filter @workspace/discord-bot run upload-emojis2
 */
import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const EMOJI_FILE = join(DATA_DIR, 'emojis.json');
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
if (!token || !clientId) { console.error('❌ Missing DISCORD_TOKEN or DISCORD_CLIENT_ID'); process.exit(1); }

// ── 120 NEW handpicked emoji candidates (will be skipped if URL 404s) ─────────
const NEW_EMOJIS = [
  // ── Animated Blobs ──────────────────────────────────────────────────────────
  { name: 'lp_blobdance',      url: 'https://cdn3.emoji.gg/emojis/BlobDance.gif' },
  { name: 'lp_blobpog',        url: 'https://cdn3.emoji.gg/emojis/BlobPog.gif' },
  { name: 'lp_blobsob',        url: 'https://cdn3.emoji.gg/emojis/blobsob.gif' },
  { name: 'lp_blobaww',        url: 'https://cdn3.emoji.gg/emojis/blobaww.png' },
  { name: 'lp_blobwow',        url: 'https://cdn3.emoji.gg/emojis/BlobWow.gif' },
  { name: 'lp_blobhappy',      url: 'https://cdn3.emoji.gg/emojis/blobhappy.png' },
  { name: 'lp_blobpeek',       url: 'https://cdn3.emoji.gg/emojis/blobpeek.png' },
  { name: 'lp_blobsweats',     url: 'https://cdn3.emoji.gg/emojis/blobsweats.gif' },
  { name: 'lp_blobknife',      url: 'https://cdn3.emoji.gg/emojis/blobknife.png' },
  { name: 'lp_blobnervous',    url: 'https://cdn3.emoji.gg/emojis/blobnervous.png' },
  { name: 'lp_blobsalute',     url: 'https://cdn3.emoji.gg/emojis/blobsalute.png' },
  { name: 'lp_blobscream',     url: 'https://cdn3.emoji.gg/emojis/blobscream.png' },
  { name: 'lp_blobpats2',      url: 'https://cdn3.emoji.gg/emojis/blobpats.gif' },
  { name: 'lp_blobcat',        url: 'https://cdn3.emoji.gg/emojis/BlobCat.gif' },
  { name: 'lp_blobreach',      url: 'https://cdn3.emoji.gg/emojis/blobreach.png' },

  // ── Pepe Emotes ─────────────────────────────────────────────────────────────
  { name: 'lp_pepelaugh',      url: 'https://cdn3.emoji.gg/emojis/pepeLaugh.png' },
  { name: 'lp_pepelove',       url: 'https://cdn3.emoji.gg/emojis/pepeLove.png' },
  { name: 'lp_pepecry',        url: 'https://cdn3.emoji.gg/emojis/pepeCry.png' },
  { name: 'lp_pepethink',      url: 'https://cdn3.emoji.gg/emojis/pepeThink.png' },
  { name: 'lp_pepesad',        url: 'https://cdn3.emoji.gg/emojis/Sadge.png' },
  { name: 'lp_pepegood',       url: 'https://cdn3.emoji.gg/emojis/FeelsGoodMan.png' },
  { name: 'lp_pepebad',        url: 'https://cdn3.emoji.gg/emojis/FeelsBadMan.png' },
  { name: 'lp_pepehype',       url: 'https://cdn3.emoji.gg/emojis/PepeHype.gif' },
  { name: 'lp_pepejam',        url: 'https://cdn3.emoji.gg/emojis/pepeJAM.gif' },
  { name: 'lp_pepegun',        url: 'https://cdn3.emoji.gg/emojis/PepeGun.png' },
  { name: 'lp_pepenooo',       url: 'https://cdn3.emoji.gg/emojis/PepeNooo.png' },
  { name: 'lp_pepewine',       url: 'https://cdn3.emoji.gg/emojis/pepewine.png' },
  { name: 'lp_peeposad',       url: 'https://cdn3.emoji.gg/emojis/peepoSad.png' },
  { name: 'lp_peepohappy',     url: 'https://cdn3.emoji.gg/emojis/peepoHappy.png' },
  { name: 'lp_peepohide',      url: 'https://cdn3.emoji.gg/emojis/peepoHide.png' },

  // ── Cat & Neko ──────────────────────────────────────────────────────────────
  { name: 'lp_catjam',         url: 'https://cdn3.emoji.gg/emojis/catJAM.gif' },
  { name: 'lp_catpat',         url: 'https://cdn3.emoji.gg/emojis/catpat.gif' },
  { name: 'lp_catnod',         url: 'https://cdn3.emoji.gg/emojis/catnod.gif' },
  { name: 'lp_catcry',         url: 'https://cdn3.emoji.gg/emojis/catcry.gif' },
  { name: 'lp_cathype',        url: 'https://cdn3.emoji.gg/emojis/cathype.gif' },
  { name: 'lp_catwave',        url: 'https://cdn3.emoji.gg/emojis/catwave.gif' },
  { name: 'lp_nekohug',        url: 'https://cdn3.emoji.gg/emojis/NekoHug.png' },
  { name: 'lp_nekolove',       url: 'https://cdn3.emoji.gg/emojis/NekoLove.png' },
  { name: 'lp_nekopat',        url: 'https://cdn3.emoji.gg/emojis/NekoAtsumePatting.gif' },
  { name: 'lp_catgun',         url: 'https://cdn3.emoji.gg/emojis/CatGun.png' },

  // ── Hype / Twitch Emotes ────────────────────────────────────────────────────
  { name: 'lp_kekw',           url: 'https://cdn3.emoji.gg/emojis/KEKW.png' },
  { name: 'lp_lul',            url: 'https://cdn3.emoji.gg/emojis/LUL.png' },
  { name: 'lp_omegalul',       url: 'https://cdn3.emoji.gg/emojis/OMEGALUL.png' },
  { name: 'lp_pog',            url: 'https://cdn3.emoji.gg/emojis/Pog.png' },
  { name: 'lp_pogchamp',       url: 'https://cdn3.emoji.gg/emojis/PogChamp.png' },
  { name: 'lp_monkas',         url: 'https://cdn3.emoji.gg/emojis/monkaS.png' },
  { name: 'lp_copium',         url: 'https://cdn3.emoji.gg/emojis/Copium.png' },
  { name: 'lp_weirdchamp',     url: 'https://cdn3.emoji.gg/emojis/WeirdChamp.png' },
  { name: 'lp_4head',          url: 'https://cdn3.emoji.gg/emojis/4Head.png' },
  { name: 'lp_clap',           url: 'https://cdn3.emoji.gg/emojis/clap.gif' },
  { name: 'lp_ez',             url: 'https://cdn3.emoji.gg/emojis/EZ.png' },
  { name: 'lp_rip',            url: 'https://cdn3.emoji.gg/emojis/RIP.png' },

  // ── Discord / Nitro ─────────────────────────────────────────────────────────
  { name: 'lp_nitro',          url: 'https://cdn3.emoji.gg/emojis/NitroBoost.png' },
  { name: 'lp_nitrogif',       url: 'https://cdn3.emoji.gg/emojis/DiscordNitro.gif' },
  { name: 'lp_discordlogo',    url: 'https://cdn3.emoji.gg/emojis/Discord.png' },
  { name: 'lp_discordpink',    url: 'https://cdn3.emoji.gg/emojis/DiscordPink.png' },
  { name: 'lp_boostpurple',    url: 'https://cdn3.emoji.gg/emojis/boostpurple.png' },
  { name: 'lp_boostgif',       url: 'https://cdn3.emoji.gg/emojis/Boost.gif' },
  { name: 'lp_partnered',      url: 'https://cdn3.emoji.gg/emojis/Partnered.png' },
  { name: 'lp_verified',       url: 'https://cdn3.emoji.gg/emojis/Verified.png' },

  // ── Colorful Effects ────────────────────────────────────────────────────────
  { name: 'lp_rainbowstar',    url: 'https://cdn3.emoji.gg/emojis/RainbowStar.gif' },
  { name: 'lp_confetti',       url: 'https://cdn3.emoji.gg/emojis/confetti.gif' },
  { name: 'lp_firework',       url: 'https://cdn3.emoji.gg/emojis/firework.gif' },
  { name: 'lp_rainbowhappy',   url: 'https://cdn3.emoji.gg/emojis/RainbowHappy.gif' },
  { name: 'lp_glitter',        url: 'https://cdn3.emoji.gg/emojis/glitter.gif' },
  { name: 'lp_prism',          url: 'https://cdn3.emoji.gg/emojis/Prism.gif' },
  { name: 'lp_aurora',         url: 'https://cdn3.emoji.gg/emojis/aurora.gif' },
  { name: 'lp_particles',      url: 'https://cdn3.emoji.gg/emojis/particles.gif' },

  // ── Stars / Badges ──────────────────────────────────────────────────────────
  { name: 'lp_goldstar2',      url: 'https://cdn3.emoji.gg/emojis/goldstar.png' },
  { name: 'lp_silverstar',     url: 'https://cdn3.emoji.gg/emojis/silverstar.png' },
  { name: 'lp_crystalstar',    url: 'https://cdn3.emoji.gg/emojis/crystalstar.png' },
  { name: 'lp_animstar',       url: 'https://cdn3.emoji.gg/emojis/AnimatedStar.gif' },
  { name: 'lp_staranim2',      url: 'https://cdn3.emoji.gg/emojis/starsparkle.gif' },

  // ── Animals ─────────────────────────────────────────────────────────────────
  { name: 'lp_foxhappy',       url: 'https://cdn3.emoji.gg/emojis/FoxHappy.png' },
  { name: 'lp_bunny',          url: 'https://cdn3.emoji.gg/emojis/bunny.gif' },
  { name: 'lp_hamster',        url: 'https://cdn3.emoji.gg/emojis/hamster.gif' },
  { name: 'lp_penguin',        url: 'https://cdn3.emoji.gg/emojis/penguin.png' },
  { name: 'lp_doge',           url: 'https://cdn3.emoji.gg/emojis/doge.png' },
  { name: 'lp_doggo',          url: 'https://cdn3.emoji.gg/emojis/Doggo.png' },
  { name: 'lp_pikachu',        url: 'https://cdn3.emoji.gg/emojis/pikachu.png' },
  { name: 'lp_eevee',          url: 'https://cdn3.emoji.gg/emojis/eevee.png' },
  { name: 'lp_amogus',         url: 'https://cdn3.emoji.gg/emojis/amogus.gif' },
  { name: 'lp_nyancat',        url: 'https://cdn3.emoji.gg/emojis/NyanCat.gif' },

  // ── Mood & Reaction ─────────────────────────────────────────────────────────
  { name: 'lp_uwu',            url: 'https://cdn3.emoji.gg/emojis/UwU.png' },
  { name: 'lp_owo',            url: 'https://cdn3.emoji.gg/emojis/OwO.png' },
  { name: 'lp_poggers',        url: 'https://cdn3.emoji.gg/emojis/poggers.png' },
  { name: 'lp_yes',            url: 'https://cdn3.emoji.gg/emojis/yes.png' },
  { name: 'lp_no',             url: 'https://cdn3.emoji.gg/emojis/no.png' },
  { name: 'lp_smile2',         url: 'https://cdn3.emoji.gg/emojis/smile.gif' },
  { name: 'lp_lmao',           url: 'https://cdn3.emoji.gg/emojis/lmao.gif' },
  { name: 'lp_trollface',      url: 'https://cdn3.emoji.gg/emojis/trollface.png' },
  { name: 'lp_boomer',         url: 'https://cdn3.emoji.gg/emojis/boomer.png' },
  { name: 'lp_surprised',      url: 'https://cdn3.emoji.gg/emojis/Surprised.gif' },
  { name: 'lp_crying',         url: 'https://cdn3.emoji.gg/emojis/crying.gif' },
  { name: 'lp_dead',           url: 'https://cdn3.emoji.gg/emojis/dead.png' },
  { name: 'lp_sleepy',         url: 'https://cdn3.emoji.gg/emojis/sleepy.png' },
  { name: 'lp_woke',           url: 'https://cdn3.emoji.gg/emojis/woke.png' },

  // ── Gaming ──────────────────────────────────────────────────────────────────
  { name: 'lp_genshin',        url: 'https://cdn3.emoji.gg/emojis/genshin.png' },
  { name: 'lp_controller',     url: 'https://cdn3.emoji.gg/emojis/controller.png' },
  { name: 'lp_minecraft',      url: 'https://cdn3.emoji.gg/emojis/minecraft.png' },
  { name: 'lp_roblox',         url: 'https://cdn3.emoji.gg/emojis/roblox.png' },
  { name: 'lp_fortnite',       url: 'https://cdn3.emoji.gg/emojis/fortnite.png' },
  { name: 'lp_loading',        url: 'https://cdn3.emoji.gg/emojis/loading.gif' },
  { name: 'lp_glitch',         url: 'https://cdn3.emoji.gg/emojis/glitch.gif' },

  // ── Premium / Rare ──────────────────────────────────────────────────────────
  { name: 'lp_legendary',      url: 'https://cdn3.emoji.gg/emojis/legendary.gif' },
  { name: 'lp_epic',           url: 'https://cdn3.emoji.gg/emojis/epic.png' },
  { name: 'lp_rare',           url: 'https://cdn3.emoji.gg/emojis/rare.png' },
  { name: 'lp_mythic',         url: 'https://cdn3.emoji.gg/emojis/mythic.gif' },
  { name: 'lp_prestige',       url: 'https://cdn3.emoji.gg/emojis/prestige.png' },
  { name: 'lp_mastery',        url: 'https://cdn3.emoji.gg/emojis/mastery.gif' },
  { name: 'lp_crystalball',    url: 'https://cdn3.emoji.gg/emojis/CrystalBall.gif' },
  { name: 'lp_godmode',        url: 'https://cdn3.emoji.gg/emojis/GodMode.gif' },

  // ── Checkmarks / UI ─────────────────────────────────────────────────────────
  { name: 'lp_checkgreen',     url: 'https://cdn3.emoji.gg/emojis/checkgreen.png' },
  { name: 'lp_xred',           url: 'https://cdn3.emoji.gg/emojis/xred.png' },
  { name: 'lp_loading2',       url: 'https://cdn3.emoji.gg/emojis/loading2.gif' },
  { name: 'lp_online2',        url: 'https://cdn3.emoji.gg/emojis/online.png' },
  { name: 'lp_idle2',          url: 'https://cdn3.emoji.gg/emojis/idle.png' },
  { name: 'lp_dnd2',           url: 'https://cdn3.emoji.gg/emojis/dnd.png' },
  { name: 'lp_offline2',       url: 'https://cdn3.emoji.gg/emojis/offline.png' },
  { name: 'lp_new',            url: 'https://cdn3.emoji.gg/emojis/new.gif' },
  { name: 'lp_hot',            url: 'https://cdn3.emoji.gg/emojis/hot.gif' },
  { name: 'lp_cool',           url: 'https://cdn3.emoji.gg/emojis/cool.png' },
];

async function fetchImageAsBase64(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'LilithProtector/2.0 Discord Bot' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  const ext = url.endsWith('.gif') ? 'gif' : 'png';
  return `data:image/${ext};base64,${Buffer.from(buf).toString('base64')}`;
}

async function main() {
  const rest = new REST().setToken(token);

  // Load existing saved emojis
  let saved = {};
  if (existsSync(EMOJI_FILE)) {
    try { saved = JSON.parse(readFileSync(EMOJI_FILE, 'utf8')); } catch {}
  }
  const existingNames = new Set(Object.keys(saved));

  // Filter out already-uploaded emojis (by name)
  const toUpload = NEW_EMOJIS.filter(e => !existingNames.has(e.name));

  if (toUpload.length === 0) {
    console.log('\n✅ All new emojis are already uploaded!\n');
    return;
  }

  // Also get already-uploaded lp_ names from Discord to avoid duplicate API error
  let discordNames = new Set();
  try {
    const existing = await rest.get(Routes.applicationEmojis(clientId));
    discordNames = new Set((existing.items ?? []).map(e => e.name));
  } catch {}

  const finalUpload = toUpload.filter(e => !discordNames.has(e.name));

  console.log(`\n🎨 Uploading ${finalUpload.length} new emoji(s) from emoji.gg...\n`);

  let ok = 0;
  let fail = 0;

  for (const { name, url } of finalUpload) {
    try {
      const image = await fetchImageAsBase64(url);
      const result = await rest.post(Routes.applicationEmojis(clientId), {
        body: { name, image },
      });
      const fmt = `<:${result.name}:${result.id}>`;
      saved[name] = { id: result.id, name: result.name, format: fmt };
      console.log(`  ✅ ${name.padEnd(24)} ${fmt}`);
      ok++;
      await new Promise(r => setTimeout(r, 450));
    } catch (err) {
      console.log(`  ❌ ${name.padEnd(24)} ${err.message}`);
      fail++;
    }
  }

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(EMOJI_FILE, JSON.stringify(saved, null, 2));

  const total = Object.keys(saved).length;
  console.log(`\n${'━'.repeat(55)}`);
  console.log(`✅ Uploaded: ${ok}   ❌ Failed: ${fail}`);
  console.log(`📦 Total emojis in library: ${total}`);
  console.log(`📁 Updated data/emojis.json`);
  console.log(`🔄 Restart the bot to load new emojis!\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
