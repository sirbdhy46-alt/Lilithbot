import { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed, loadingEmbed, progressEmbed, progressBar, THEME, DIVIDER_STARS, h2, h3, bold, code, row, italic, EMOJI } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('addemojis')
  .setDescription('Bulk add 50+ emojis to this server')
  .addSubcommand(sub =>
    sub.setName('steal')
      .setDescription('Steal all custom emojis from a message and add them here')
      .addStringOption(o =>
        o.setName('message_id')
          .setDescription('Message ID or message link containing the emojis')
          .setRequired(true)
      )
      .addChannelOption(o =>
        o.setName('channel')
          .setDescription('Channel where the message is (defaults to current channel)')
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub.setName('pack')
      .setDescription('Install a pre-made emoji pack (50+ emojis at once)')
      .addStringOption(o =>
        o.setName('name')
          .setDescription('Which emoji pack to install')
          .setRequired(true)
          .addChoices(
            { name: '🔵 Blob Pack  (60 blob emojis)', value: 'blob' },
            { name: '🔥 Hype Pack  (50 hype/reaction emojis)', value: 'hype' },
            { name: '🐱 Cat Pack   (50 cat emojis)', value: 'cats' },
            { name: '😂 Pepe Pack  (50 Pepe emojis)', value: 'pepe' },
          )
      )
  )
  .addSubcommand(sub =>
    sub.setName('list')
      .setDescription('Show available emoji packs and how many slots you have left')
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers);

// ── Pack definitions (name → array of { name, url }) ──────────────────────────
// These are Twemoji-based images at 72×72 px (Twitter open-source, CC-BY 4.0)
const TWEMOJI_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72';

function tw(codepoint) {
  return `${TWEMOJI_BASE}/${codepoint}.png`;
}

const PACKS = {
  blob: [
    { name: 'blob_wave',     url: tw('1f44b') },
    { name: 'blob_heart',    url: tw('1f970') },
    { name: 'blob_cool',     url: tw('1f60e') },
    { name: 'blob_hype',     url: tw('1f929') },
    { name: 'blob_think',    url: tw('1f914') },
    { name: 'blob_angel',    url: tw('1f607') },
    { name: 'blob_devil',    url: tw('1f608') },
    { name: 'blob_laugh',    url: tw('1f602') },
    { name: 'blob_cry',      url: tw('1f622') },
    { name: 'blob_sob',      url: tw('1f62d') },
    { name: 'blob_uwu',      url: tw('1f97a') },
    { name: 'blob_blush',    url: tw('1f60a') },
    { name: 'blob_gasp',     url: tw('1f632') },
    { name: 'blob_angry',    url: tw('1f621') },
    { name: 'blob_silent',   url: tw('1f910') },
    { name: 'blob_sleep',    url: tw('1f634') },
    { name: 'blob_dead',     url: tw('1f635') },
    { name: 'blob_wink',     url: tw('1f609') },
    { name: 'blob_kiss',     url: tw('1f617') },
    { name: 'blob_star',     url: tw('1f60d') },
    { name: 'blob_nerd',     url: tw('1f913') },
    { name: 'blob_money',    url: tw('1f911') },
    { name: 'blob_sick',     url: tw('1f912') },
    { name: 'blob_monocle',  url: tw('1f9d0') },
    { name: 'blob_cowboy',   url: tw('1f920') },
    { name: 'blob_clown',    url: tw('1f921') },
    { name: 'blob_ghost',    url: tw('1f47b') },
    { name: 'blob_alien',    url: tw('1f47d') },
    { name: 'blob_robot',    url: tw('1f916') },
    { name: 'blob_poop',     url: tw('1f4a9') },
    { name: 'blob_fire',     url: tw('1f525') },
    { name: 'blob_skull',    url: tw('1f480') },
    { name: 'blob_100',      url: tw('1f4af') },
    { name: 'blob_clap',     url: tw('1f44f') },
    { name: 'blob_point',    url: tw('1f449') },
    { name: 'blob_thumbsup', url: tw('1f44d') },
    { name: 'blob_thumbsdn', url: tw('1f44e') },
    { name: 'blob_eyes',     url: tw('1f440') },
    { name: 'blob_brain',    url: tw('1f9e0') },
    { name: 'blob_gem',      url: tw('1f48e') },
    { name: 'blob_trophy',   url: tw('1f3c6') },
    { name: 'blob_crown',    url: tw('1f451') },
    { name: 'blob_star2',    url: tw('2b50') },
    { name: 'blob_sparkle',  url: tw('2728') },
    { name: 'blob_lightning',url: tw('26a1') },
    { name: 'blob_rocket',   url: tw('1f680') },
    { name: 'blob_heart2',   url: tw('2764') },
    { name: 'blob_broken',   url: tw('1f494') },
    { name: 'blob_purple',   url: tw('1f49c') },
    { name: 'blob_blue',     url: tw('1f499') },
  ],
  hype: [
    { name: 'hype_party',    url: tw('1f389') },
    { name: 'hype_tada',     url: tw('1f38a') },
    { name: 'hype_fire',     url: tw('1f525') },
    { name: 'hype_100',      url: tw('1f4af') },
    { name: 'hype_muscle',   url: tw('1f4aa') },
    { name: 'hype_crown',    url: tw('1f451') },
    { name: 'hype_gem',      url: tw('1f48e') },
    { name: 'hype_rocket',   url: tw('1f680') },
    { name: 'hype_zap',      url: tw('26a1') },
    { name: 'hype_star',     url: tw('2b50') },
    { name: 'hype_sparkle',  url: tw('2728') },
    { name: 'hype_trophy',   url: tw('1f3c6') },
    { name: 'hype_goat',     url: tw('1f410') },
    { name: 'hype_wave',     url: tw('1f30a') },
    { name: 'hype_disco',    url: tw('1f57a') },
    { name: 'hype_eyes',     url: tw('1f440') },
    { name: 'hype_pog',      url: tw('1f632') },
    { name: 'hype_omg',      url: tw('1f92f') },
    { name: 'hype_sweat',    url: tw('1f613') },
    { name: 'hype_giggle',   url: tw('1f923') },
    { name: 'hype_money',    url: tw('1f911') },
    { name: 'hype_bag',      url: tw('1f4b0') },
    { name: 'hype_coin',     url: tw('1fa99') },
    { name: 'hype_chart',    url: tw('1f4c8') },
    { name: 'hype_vibe',     url: tw('1f60e') },
    { name: 'hype_based',    url: tw('1f60f') },
    { name: 'hype_skull',    url: tw('1f480') },
    { name: 'hype_rage',     url: tw('1f621') },
    { name: 'hype_sad',      url: tw('1f972') },
    { name: 'hype_hug',      url: tw('1fac2') },
    { name: 'hype_flex',     url: tw('1f4aa') },
    { name: 'hype_yes',      url: tw('1f44d') },
    { name: 'hype_no',       url: tw('1f44e') },
    { name: 'hype_clap',     url: tw('1f44f') },
    { name: 'hype_pray',     url: tw('1f64f') },
    { name: 'hype_peace',    url: tw('270c') },
    { name: 'hype_ok',       url: tw('1f44c') },
    { name: 'hype_point',    url: tw('1f448') },
    { name: 'hype_popcorn',  url: tw('1f37f') },
    { name: 'hype_pizza',    url: tw('1f355') },
    { name: 'hype_burger',   url: tw('1f354') },
    { name: 'hype_fries',    url: tw('1f35f') },
    { name: 'hype_beer',     url: tw('1f37a') },
    { name: 'hype_coffee',   url: tw('2615') },
    { name: 'hype_wave2',    url: tw('1f44b') },
    { name: 'hype_gun',      url: tw('1f52b') },
    { name: 'hype_knife',    url: tw('1f52a') },
    { name: 'hype_bomb',     url: tw('1f4a3') },
    { name: 'hype_radioact', url: tw('2622') },
    { name: 'hype_nerd',     url: tw('1f913') },
  ],
  cats: [
    { name: 'cat_joy',       url: tw('1f639') },
    { name: 'cat_heart',     url: tw('1f63b') },
    { name: 'cat_blush',     url: tw('1f63a') },
    { name: 'cat_think',     url: tw('1f638') },
    { name: 'cat_cry',       url: tw('1f63f') },
    { name: 'cat_angry',     url: tw('1f63e') },
    { name: 'cat_pout',      url: tw('1f63d') },
    { name: 'cat_scared',    url: tw('1f640') },
    { name: 'cat_cool',      url: tw('1f431') },
    { name: 'cat_wave',      url: tw('1f44b') },
    { name: 'cat_sleepy',    url: tw('1f634') },
    { name: 'cat_fire',      url: tw('1f525') },
    { name: 'cat_crown',     url: tw('1f451') },
    { name: 'cat_star',      url: tw('2b50') },
    { name: 'cat_gem',       url: tw('1f48e') },
    { name: 'cat_eyes',      url: tw('1f440') },
    { name: 'cat_100',       url: tw('1f4af') },
    { name: 'cat_uwu',       url: tw('1f97a') },
    { name: 'cat_angel',     url: tw('1f607') },
    { name: 'cat_devil',     url: tw('1f608') },
    { name: 'cat_nerd',      url: tw('1f913') },
    { name: 'cat_money',     url: tw('1f911') },
    { name: 'cat_clown',     url: tw('1f921') },
    { name: 'cat_ghost',     url: tw('1f47b') },
    { name: 'cat_robot',     url: tw('1f916') },
    { name: 'cat_skull',     url: tw('1f480') },
    { name: 'cat_monocle',   url: tw('1f9d0') },
    { name: 'cat_cowboy',    url: tw('1f920') },
    { name: 'cat_sunglasses',url: tw('1f60e') },
    { name: 'cat_smirk',     url: tw('1f60f') },
    { name: 'cat_wink',      url: tw('1f609') },
    { name: 'cat_kiss',      url: tw('1f617') },
    { name: 'cat_gasp',      url: tw('1f632') },
    { name: 'cat_angry2',    url: tw('1f621') },
    { name: 'cat_silent',    url: tw('1f910') },
    { name: 'cat_sick',      url: tw('1f912') },
    { name: 'cat_thumbsup',  url: tw('1f44d') },
    { name: 'cat_thumbsdn',  url: tw('1f44e') },
    { name: 'cat_clap',      url: tw('1f44f') },
    { name: 'cat_pray',      url: tw('1f64f') },
    { name: 'cat_rocket',    url: tw('1f680') },
    { name: 'cat_lightning', url: tw('26a1') },
    { name: 'cat_sparkle',   url: tw('2728') },
    { name: 'cat_trophy',    url: tw('1f3c6') },
    { name: 'cat_bag',       url: tw('1f4b0') },
    { name: 'cat_poop',      url: tw('1f4a9') },
    { name: 'cat_broken',    url: tw('1f494') },
    { name: 'cat_purple',    url: tw('1f49c') },
    { name: 'cat_blue',      url: tw('1f499') },
    { name: 'cat_green',     url: tw('1f49a') },
  ],
  pepe: [
    { name: 'pepe_wave',     url: tw('1f44b') },
    { name: 'pepe_cool',     url: tw('1f60e') },
    { name: 'pepe_think',    url: tw('1f914') },
    { name: 'pepe_cry',      url: tw('1f622') },
    { name: 'pepe_laugh',    url: tw('1f602') },
    { name: 'pepe_angry',    url: tw('1f621') },
    { name: 'pepe_sad',      url: tw('1f972') },
    { name: 'pepe_hype',     url: tw('1f929') },
    { name: 'pepe_smirk',    url: tw('1f60f') },
    { name: 'pepe_blush',    url: tw('1f60a') },
    { name: 'pepe_gasp',     url: tw('1f632') },
    { name: 'pepe_sleep',    url: tw('1f634') },
    { name: 'pepe_dead',     url: tw('1f635') },
    { name: 'pepe_skull',    url: tw('1f480') },
    { name: 'pepe_nerd',     url: tw('1f913') },
    { name: 'pepe_clown',    url: tw('1f921') },
    { name: 'pepe_cowboy',   url: tw('1f920') },
    { name: 'pepe_ghost',    url: tw('1f47b') },
    { name: 'pepe_alien',    url: tw('1f47d') },
    { name: 'pepe_robot',    url: tw('1f916') },
    { name: 'pepe_money',    url: tw('1f911') },
    { name: 'pepe_devil',    url: tw('1f608') },
    { name: 'pepe_angel',    url: tw('1f607') },
    { name: 'pepe_fire',     url: tw('1f525') },
    { name: 'pepe_100',      url: tw('1f4af') },
    { name: 'pepe_crown',    url: tw('1f451') },
    { name: 'pepe_gem',      url: tw('1f48e') },
    { name: 'pepe_trophy',   url: tw('1f3c6') },
    { name: 'pepe_rocket',   url: tw('1f680') },
    { name: 'pepe_zap',      url: tw('26a1') },
    { name: 'pepe_star',     url: tw('2b50') },
    { name: 'pepe_sparkle',  url: tw('2728') },
    { name: 'pepe_clap',     url: tw('1f44f') },
    { name: 'pepe_thumbsup', url: tw('1f44d') },
    { name: 'pepe_thumbsdn', url: tw('1f44e') },
    { name: 'pepe_eyes',     url: tw('1f440') },
    { name: 'pepe_muscle',   url: tw('1f4aa') },
    { name: 'pepe_pray',     url: tw('1f64f') },
    { name: 'pepe_poop',     url: tw('1f4a9') },
    { name: 'pepe_ok',       url: tw('1f44c') },
    { name: 'pepe_point',    url: tw('1f449') },
    { name: 'pepe_peace',    url: tw('270c') },
    { name: 'pepe_sob',      url: tw('1f62d') },
    { name: 'pepe_brain',    url: tw('1f9e0') },
    { name: 'pepe_bag',      url: tw('1f4b0') },
    { name: 'pepe_broken',   url: tw('1f494') },
    { name: 'pepe_silent',   url: tw('1f910') },
    { name: 'pepe_uwu',      url: tw('1f97a') },
    { name: 'pepe_smirk2',   url: tw('1f61c') },
    { name: 'pepe_wink',     url: tw('1f609') },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadEmoji(guild, name, url) {
  try {
    const existing = guild.emojis.cache.find(e => e.name === name);
    if (existing) return { status: 'skipped', name };
    const emoji = await guild.emojis.create({ attachment: url, name });
    return { status: 'ok', name: emoji.name };
  } catch (err) {
    return { status: 'error', name, reason: err.message };
  }
}

// ── Command execute ───────────────────────────────────────────────────────────

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guild = interaction.guild;

  // ── /addemojis list ─────────────────────────────────────────────────────────
  if (sub === 'list') {
    const emojiCount = guild.emojis.cache.size;
    const maxEmojis = guild.maximumEmojis;
    const slots = maxEmojis - emojiCount;

    const packLines = Object.entries(PACKS).map(([key, emojis]) => {
      const icon = { blob: '🔵', hype: '🔥', cats: '🐱', pepe: '😂' }[key] ?? '📦';
      return `> ${icon} ${bold(key)} — ${code(emojis.length + ' emojis')}`;
    });

    await interaction.reply({
      embeds: [createEmbed({
        color: THEME.info,
        title: `${EMOJI.sparkle} Available Emoji Packs`,
        description: [
          h2('📦 Emoji Packs'),
          ...packLines,
          ``,
          h3('📊 Server Slots'),
          row('Used', `${emojiCount} / ${maxEmojis}`),
          row('Available', String(slots)),
          ``,
          `> ${italic('Use')} \`/addemojis pack [name]\` ${italic('to install a pack.')}`,
          `> ${italic('Use')} \`/addemojis steal [message_id]\` ${italic('to clone emojis from a message.')}`,
        ].join('\n'),
      })],
    });
    return;
  }

  // ── /addemojis steal ────────────────────────────────────────────────────────
  if (sub === 'steal') {
    const rawInput = interaction.options.getString('message_id');
    const sourceChannel = interaction.options.getChannel('channel') ?? interaction.channel;

    let messageId = rawInput;
    const linkMatch = rawInput.match(/\/(\d+)$/);
    if (linkMatch) messageId = linkMatch[1];

    await interaction.deferReply();

    let targetMessage;
    try {
      targetMessage = await sourceChannel.messages.fetch(messageId);
    } catch {
      return interaction.editReply({
        embeds: [errorEmbed('Message Not Found', `Could not find message \`${messageId}\` in ${sourceChannel}.\nMake sure the channel is correct and the message exists.`)],
      });
    }

    const EMOJI_REGEX = /<a?:(\w+):(\d+)>/g;
    const found = [];
    const seen = new Set();
    let match;
    while ((match = EMOJI_REGEX.exec(targetMessage.content)) !== null) {
      const [, name, id] = match;
      if (!seen.has(id)) {
        seen.add(id);
        const animated = match[0].startsWith('<a:');
        found.push({ name, id, animated });
      }
    }

    if (found.length === 0) {
      return interaction.editReply({
        embeds: [errorEmbed('No Custom Emojis Found', `That message doesn't contain any custom emojis.\nTry a message that has custom emojis in it.`)],
      });
    }

    await interaction.editReply({
      embeds: [loadingEmbed(`Stealing ${found.length} emojis...`, 0)],
    });

    let ok = 0, skipped = 0, failed = 0, frame = 0;
    const errors = [];

    for (let i = 0; i < found.length; i++) {
      const { name, id, animated } = found[i];
      const ext = animated ? 'gif' : 'png';
      const url = `https://cdn.discordapp.com/emojis/${id}.${ext}?size=128`;
      const result = await uploadEmoji(guild, name, url);
      if (result.status === 'ok') ok++;
      else if (result.status === 'skipped') skipped++;
      else { failed++; errors.push(`\`${name}\`: ${result.reason}`); }

      // Update progress bar every 3 emojis
      if (i % 3 === 0) {
        await interaction.editReply({
          embeds: [progressEmbed({
            title: 'Stealing Emojis...',
            label: 'emojis',
            current: i + 1,
            total: found.length,
            barStyle: 'fancy',
            frame: frame++,
            stats: [
              { label: '✅ Added',   value: ok },
              { label: '⏭️ Skipped', value: skipped },
              { label: '❌ Failed',  value: failed },
            ],
          })],
        }).catch(() => {});
      }

      await sleep(800);
    }

    await interaction.editReply({
      embeds: [createEmbed({
        color: ok > 0 ? THEME.success : THEME.error,
        title: `${ok > 0 ? '✅' : '⚠️'}  Emoji Steal Complete`,
        description: [
          `\`\`\``,
          progressBar(ok + skipped, found.length, { style: 'block', size: 22 }),
          `\`\`\``,
          h2('📊 Results'),
          row('Added', String(ok)),
          row('Skipped (already exists)', String(skipped)),
          row('Failed', String(failed)),
          errors.length > 0 ? `\n${h3('❌ Errors')}\n` + errors.slice(0, 5).map(e => `> ${e}`).join('\n') : '',
        ].filter(Boolean).join('\n'),
        footer: { text: 'Lilith Protector  •  Emoji Steal' },
      })],
    });
    return;
  }

  // ── /addemojis pack ─────────────────────────────────────────────────────────
  if (sub === 'pack') {
    const packName = interaction.options.getString('name');
    const pack = PACKS[packName];

    if (!pack) {
      return interaction.reply({
        embeds: [errorEmbed('Unknown Pack', `Pack \`${packName}\` not found. Use \`/addemojis list\` to see available packs.`)],
        ephemeral: true,
      });
    }

    const emojiCount = guild.emojis.cache.size;
    const maxEmojis = guild.maximumEmojis;
    const slots = maxEmojis - emojiCount;

    if (slots <= 0) {
      return interaction.reply({
        embeds: [errorEmbed('No Emoji Slots Left',
          `Your server is full on emoji slots (\`${emojiCount}/${maxEmojis}\`).\nDelete some emojis first or boost the server for more slots.`)],
        ephemeral: true,
      });
    }

    const toUpload = pack.slice(0, slots);
    const skippedDueToSlots = pack.length - toUpload.length;

    const packEmoji = { blob: '🔵', hype: '🔥', cats: '🐱', pepe: '😂' }[packName] ?? '📦';

    await interaction.reply({
      embeds: [loadingEmbed(`${packEmoji} Installing ${packName} pack...`, 0)],
    });

    let ok = 0, skipped = 0, failed = 0, frame = 0;
    const errors = [];

    for (let i = 0; i < toUpload.length; i++) {
      const { name, url } = toUpload[i];
      const result = await uploadEmoji(guild, name, url);
      if (result.status === 'ok') ok++;
      else if (result.status === 'skipped') skipped++;
      else { failed++; errors.push(`\`${name}\`: ${result.reason}`); }

      // Update progress bar every 5 emojis
      if (i % 5 === 0) {
        await interaction.editReply({
          embeds: [progressEmbed({
            title: `${packEmoji} Installing ${packName} pack...`,
            label: 'emojis',
            current: i + 1,
            total: toUpload.length,
            barStyle: 'fancy',
            frame: frame++,
            stats: [
              { label: '✅ Added',   value: ok },
              { label: '⏭️ Skipped', value: skipped },
              { label: '❌ Failed',  value: failed },
            ],
          })],
        }).catch(() => {});
      }

      await sleep(700);
    }

    await interaction.editReply({
      embeds: [createEmbed({
        color: ok > 0 ? THEME.success : THEME.error,
        title: `${ok > 0 ? '✅' : '⚠️'}  ${packEmoji} ${packName} Pack — Done!`,
        description: [
          `\`\`\``,
          progressBar(toUpload.length, toUpload.length, { style: 'block', size: 22 }),
          `\`\`\``,
          h2(`${packEmoji} ${packName} Pack`),
          `> ${italic(`${pack.length} emojis in this pack`)}`,
          ``,
          h3('📊 Results'),
          row('Added', String(ok)),
          row('Skipped (already exists)', String(skipped)),
          row('Failed', String(failed)),
          skippedDueToSlots > 0 ? row('Skipped (no slots)', String(skippedDueToSlots)) : '',
          errors.length > 0 ? `\n${h3('❌ Errors')}\n` + errors.slice(0, 5).map(e => `> ${e}`).join('\n') : '',
        ].filter(Boolean).join('\n'),
        footer: { text: 'Lilith Protector  •  Emoji Packs' },
      })],
    });
  }
}
