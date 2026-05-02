import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load custom application emojis ───────────────────────────────────────────
let C = {};
const emojiPath = join(__dirname, '../../data/emojis.json');
if (existsSync(emojiPath)) {
  try { C = JSON.parse(readFileSync(emojiPath, 'utf8')); } catch {}
}

// Validate custom emoji format <:name:snowflake>
const CUSTOM_EMOJI_RE = /^<a?:\w+:\d{17,20}>$/;
function isValidCustomEmoji(format) {
  return typeof format === 'string' && CUSTOM_EMOJI_RE.test(format);
}

// Return custom emoji if valid, else Unicode fallback
function e(key, fallback = '') {
  const format = C[`lp_${key}`]?.format;
  return isValidCustomEmoji(format) ? format : fallback;
}

// Footers can NEVER render custom emojis — strip them
function sanitizeText(text = '') {
  return text
    .replace(/<a?:\w+:\d+>/g, '')
    .replace(/:\w+:/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  DISCORD TEXT FORMATTING HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** # Heading 1  (largest) */
export const h1           = (t) => `# ${t}`;
/** ## Heading 2  (medium) */
export const h2           = (t) => `## ${t}`;
/** ### Heading 3  (small) */
export const h3           = (t) => `### ${t}`;

/** *italic* */
export const italic       = (t) => `*${t}*`;
/** **bold** */
export const bold         = (t) => `**${t}**`;
/** ***bold italic*** */
export const boldItalic   = (t) => `***${t}***`;
/** __underline__ */
export const underline    = (t) => `__${t}__`;
/** __**bold underline**__ */
export const boldUnder    = (t) => `__**${t}**__`;
/** ~~strikethrough~~ */
export const strike       = (t) => `~~${t}~~`;
/** `inline code` */
export const code         = (t) => `\`${t}\``;
/** ```multi-line code block``` */
export const codeBlock    = (t, lang = '') => `\`\`\`${lang}\n${t}\n\`\`\``;
/** ||spoiler|| */
export const spoiler      = (t) => `||${t}||`;
/** > single line quote */
export const quote        = (t) => `> ${t}`;
/** >>> big block quote (spans rest of message) */
export const bigQuote     = (t) => `>>> ${t}`;

// Convenience: bold label + code value  →  **Label** — `value`
export const field        = (label, value) => `${bold(label)} — ${code(value)}`;
// Convenience: bullet row  →  ▸ **Label** ── `value`
export const row          = (label, value) => `▸ ${bold(label)} ── ${code(String(value))}`;
// Convenience: bullet row without code  →  ▸ **Label** ── value
export const rowRaw       = (label, value) => `▸ ${bold(label)} ── ${value}`;

// ── Theme colors ──────────────────────────────────────────────────────────────
export const THEME = {
  primary:  0xE53E3E,
  success:  0x57F287,
  error:    0xED4245,
  warning:  0xFEE75C,
  info:     0x5865F2,
  dark:     0x2B2D31,
  purple:   0x9B59B6,
  gold:     0xF1C40F,
  cyan:     0x00B0F4,
};

// ── Dividers (keep for backwards compat) ─────────────────────────────────────
export const DIVIDER       = '╔══════════════════════════╗';
export const DIVIDER_END   = '╚══════════════════════════╝';
export const DIVIDER_MID   = '╠══════════════════════════╣';
export const DIVIDER_THIN  = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
export const DIVIDER_DOTS  = '· · · · · · · · · · · · · ·';
export const DIVIDER_STARS = '✦ ─────────────────────── ✦';
export const DIVIDER_CLEAN = '━━━━━━━━━━━━━━━━━━━━━━━━━━━';
export const DIVIDER_FANCY = '◈━━━━━━━━━━━━━━━━━━━━━━━◈';
export const DIVIDER_GLOW  = '⋆ ───────────────────── ⋆';
export const DIVIDER_ROSE  = '❀ ─────────────────────── ❀';

// ── EMOJI map ─────────────────────────────────────────────────────────────────
export const EMOJI = {
  // Security & Shields
  get shield()        { return e('shield',        '🛡️'); },
  get shield2()       { return e('shield2',       '🛡️'); },
  get dynoshield()    { return e('dynoshield',     '🛡️'); },
  get capshield()     { return e('capshield',      '🛡️'); },

  // Ban & Punish
  get banhammer()     { return e('banhammer',     '🔨'); },
  get banhammer2()    { return e('banhammer2',    '🔨'); },
  get blobbanhammer() { return e('blobbanhammer', '🔨'); },
  get bancouncil()    { return e('bancouncil',    '🔨'); },
  get banned()        { return e('banned',         '🚫'); },
  get anibanned()     { return e('anibanned',      '🚫'); },
  get ban()           { return e('ban',            '🔨'); },
  get bancat()        { return e('bancat',         '🔨'); },
  get crowban()       { return e('crowban',        '🔨'); },
  get feelsbanned()   { return e('feelsbanned',    '😔'); },
  get linkban()       { return e('linkban',        '🔗'); },

  // Warnings & Alerts
  get warning()       { return e('warning',       '⚠️'); },
  get warn()          { return e('warning',       '⚠️'); },
  get warningpc()     { return e('warningpc',     '⚠️'); },

  // Police & Law
  get police()        { return e('police',        '👮'); },
  get blobpolice()    { return e('blobpolice',    '👮'); },

  // Weapons
  get nuke()          { return e('nuke',          '💣'); },
  get bomb()          { return e('bomb',          '💣'); },
  get sword()         { return e('sword',         '⚔️'); },

  // Ninja & Action
  get ninja()         { return e('ninja',         '🥷'); },
  get blobninja()     { return e('blobninja',     '🥷'); },
  get blobsaluteban() { return e('blobsaluteban', '🫡'); },

  // Dark / Evil
  get devil()         { return e('devil',         '😈'); },
  get dragon()        { return e('dragon',        '🐉'); },

  // Status
  get check()         { return e('check',         '✅'); },
  get checkblob()     { return e('checkblob',     '✅'); },
  get dbcheck()       { return e('dbcheck',       '✅'); },

  // Prestige & Rank
  get vip()           { return e('vip',           '💎'); },
  get badge()         { return e('badge',         '🏅'); },
  get crown()         { return e('crown',         '👑'); },
  get crown2()        { return e('crown2',        '👑'); },
  get king()          { return e('king',          '👑'); },
  get trophy()        { return e('trophy',        '🏆'); },
  get star()          { return e('star',          '⭐'); },
  get diamond()       { return e('diamond',       '💎'); },

  // Hype & Power
  get fire()          { return e('fire',          '🔥'); },
  get zap()           { return e('zap',           '⚡'); },
  get boost()         { return e('boost',         '🚀'); },

  // Hearts
  get love()          { return e('love',          '❤️'); },
  get heart()         { return e('heart',         '💖'); },

  // Sparkles
  get sparkle()       { return e('sparkle',       '✨'); },
  get sparkles()      { return e('sparkle',       '✨'); },
  get success()       { return e('sparkle',       '✨'); },

  // Bot
  get bot()           { return e('bot',           '🤖'); },

  // Blob Emotions
  get blobwave()      { return e('blobwave',      '👋'); },
  get blobjoining()   { return e('blobjoining',   '👋'); },
  get blobcool()      { return e('blobcool',      '😎'); },
  get blobhyper()     { return e('blobhyper',     '🤩'); },
  get blobthink()     { return e('blobthink',     '🤔'); },
  get blobheart()     { return e('blobheart',     '🥰'); },
  get blobangry()     { return e('blobangry',     '😠'); },
  get blobangel()     { return e('blobangel',     '😇'); },

  // Join / Leave
  get join()          { return e('join',          '📥'); },
  get welcome()       { return e('blobjoining',   '👋'); },
  get leave()         { return e('leave',         '📤'); },
  get leave2()        { return e('leave2',        '👋'); },

  // Hype
  get hyper()         { return e('hyper',         '🎉'); },
  get hyperpog()      { return e('hyperpog',      '😮'); },
  get hyperpinged()   { return e('hyperpinged',   '📣'); },
  get monkamega()     { return e('monkamega',     '😱'); },

  // Moods
  get triggered()     { return e('triggered',     '😤'); },
  get ghost()         { return e('ghost',         '👻'); },
  get stare()         { return e('stare',         '👀'); },

  // Static nav/UI strings
  arrow:      '╰',
  arrowRight: '➜',
  dot:        '◆',
  bullet:     '▸',
  next:       '▶️',
  prev:       '◀️',
  first:      '⏮️',
  last:       '⏭️',
  close:      '✖️',
  bell:       '🔔',

  // Aliases
  get error()    { return e('warning',    '⚠️'); },
  get cross()    { return e('banned',     '❌'); },
  get loading()  { return '⏳'; },
  get ping()     { return e('hyperpinged','📡'); },
  get owner()    { return e('king',       '👑'); },
  get admin()    { return e('dynoshield', '🛡️'); },
  get gem()      { return e('diamond',    '💎'); },
  get lock()     { return e('blobpolice', '🔒'); },
  get unlock()   { return '🔓'; },
  get slow()     { return '🐌'; },
  get mute()     { return '🔇'; },
  get unmute()   { return '🔊'; },
  get kick()     { return e('blobninja',  '👢'); },
  get user()     { return e('blobcool',   '👤'); },
  get users()    { return '👥'; },
  get role()     { return e('badge',      '🎭'); },
  get server()   { return e('dynoshield', '🏠'); },
  get channel()  { return '📢'; },
  get settings() { return e('dbcheck',   '⚙️'); },
  get wrench()   { return '🔧'; },
  get hammer()   { return e('banhammer', '🔨'); },
  get chart()    { return '📊'; },
  get search()   { return '🔍'; },
  get calendar() { return '📅'; },
  get time()     { return '🕒'; },
  get link()     { return e('linkban',   '🔗'); },
  get pin()      { return '📌'; },
  get stats()    { return '📈'; },
  get thunder()  { return e('zap',       '⚡'); },
  get gift()     { return '🎁'; },
  get giveaway() { return '🎁'; },
  get ticket()   { return '🎟️'; },
  get online()   { return '🟢'; },
  get idle()     { return '🟡'; },
  get dnd()      { return '🔴'; },
  get offline()  { return '⚫'; },
  get info()     { return e('dbcheck',   'ℹ️'); },

  // Module labels (always Unicode — safe for buttons/selects)
  antinuke:   '🛡️',
  antibetray: '🔐',
  emergency:  '🚨',
  limit:      '🔢',
  automod:    '🤖',
  fun:        '🎮',
  moderation: '⚔️',
  utility:    '🔧',
  boycott:    '⭐',
  automations:'✅',
  voice:      '🎙️',
  ignore:     '🔕',
  home:       '🏠',
  mail:       '📬',
  coin:       '🪙',
  money:      '💰',
  music:      '🎵',
  private:    '🔒',
  public:     '🔓',
  nitro:      '💜',
  invite:     '💌',
  category:   '📁',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  CORE EMBED BUILDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function createEmbed(options = {}) {
  const {
    title, description, color = THEME.primary,
    fields = [], footer, thumbnail, image,
    timestamp = true, author, url,
  } = options;

  const embed = new EmbedBuilder().setColor(color);

  if (title)         embed.setTitle(title);
  if (description)   embed.setDescription(description);
  if (fields.length) embed.addFields(fields);
  if (thumbnail)     embed.setThumbnail(thumbnail);
  if (image)         embed.setImage(image);
  if (url)           embed.setURL(url);
  if (timestamp)     embed.setTimestamp();

  // Footers CANNOT render custom emojis — sanitize every time
  const rawFooter = footer
    ? (typeof footer === 'string' ? { text: footer } : footer)
    : { text: '✨ Lilith Protector  •  Premium Protection' };

  embed.setFooter({ ...rawFooter, text: sanitizeText(rawFooter.text ?? '') });

  if (author) {
    const a = typeof author === 'string' ? { name: author } : author;
    embed.setAuthor({ ...a, name: sanitizeText(a.name ?? '') });
  }

  return embed;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  STYLED HELPER EMBEDS  (using Discord native formatting)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * ✅ Success embed
 * >>> ✅ **title**
 * description
 */
export function successEmbed(title, description, extra = {}) {
  return createEmbed({
    color: THEME.success,
    title: `✅  ${title}`,
    description: `>>> ${description}`,
    ...extra,
  });
}

/**
 * ⚠️ Error embed
 * > ⚠️ **title**
 * description
 */
export function errorEmbed(title, description, extra = {}) {
  return createEmbed({
    color: THEME.error,
    title: `⚠️  ${title}`,
    description: `> ${description}`,
    ...extra,
  });
}

/**
 * ⚠️ Warning embed  (yellow)
 */
export function warningEmbed(title, description, extra = {}) {
  return createEmbed({
    color: THEME.warning,
    title: `⚠️  ${title}`,
    description: `> ${description}`,
    ...extra,
  });
}

/**
 * ℹ️ Info embed
 */
export function infoEmbed(title, description, extra = {}) {
  return createEmbed({
    color: THEME.info,
    title: `ℹ️  ${title}`,
    description: `> ${description}`,
    ...extra,
  });
}

/**
 * ⏳ Loading embed
 */
export function loadingEmbed(title = 'Processing...') {
  return createEmbed({
    color: THEME.dark,
    title: `⏳  ${title}`,
    description: `> *Please wait a moment...*`,
    timestamp: false,
  });
}

/**
 * Module embed — used in /help command
 */
export function moduleEmbed(emoji, title, commands, description = null) {
  const cmdList = commands.map(c => `\`${c}\``).join('  ');
  const lines = [
    description ? `> ***${description}***\n` : '',
    cmdList,
  ].filter(Boolean).join('\n');
  return createEmbed({ color: THEME.primary, title: `${emoji}  ${title}`, description: lines });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  UI COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function helpNavButtons(currentPage, totalPages, customId = 'help') {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${customId}_first`).setEmoji('⏮️')
      .setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 0),
    new ButtonBuilder()
      .setCustomId(`${customId}_prev`).setEmoji('◀️')
      .setStyle(ButtonStyle.Primary).setDisabled(currentPage === 0),
    new ButtonBuilder()
      .setCustomId(`${customId}_close`).setLabel('Close').setEmoji('✖️')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`${customId}_next`).setEmoji('▶️')
      .setStyle(ButtonStyle.Primary).setDisabled(currentPage === totalPages - 1),
    new ButtonBuilder()
      .setCustomId(`${customId}_last`).setEmoji('⏭️')
      .setStyle(ButtonStyle.Secondary).setDisabled(currentPage === totalPages - 1),
  );
}

export function moduleSelectMenu(modules) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('help_module_select')
      .setPlaceholder('⚜️  Navigate to a module...')
      .addOptions(modules.map(m => ({
        label: m.name,
        value: m.value,
        emoji: m.emoji,
        description: m.description,
      })))
  );
}

export function confirmButtons(confirmId, cancelId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(confirmId).setLabel('Confirm').setEmoji('✅')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(cancelId).setLabel('Cancel').setEmoji('❌')
      .setStyle(ButtonStyle.Secondary),
  );
}
