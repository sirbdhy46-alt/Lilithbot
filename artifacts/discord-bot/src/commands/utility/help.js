import { SlashCommandBuilder } from 'discord.js';
import {
  createEmbed, helpNavButtons, moduleSelectMenu,
  THEME, DIVIDER_FANCY, DIVIDER_STARS, DIVIDER_CLEAN, EMOJI,
} from '../../utils/embedBuilder.js';
import { getPrefix } from '../../utils/guildConfig.js';

// ── Module definitions ─────────────────────────────────────────────────────────
export const MODULES = [
  {
    name: 'Home',
    value: 'home',
    emoji: '🏠',
    color: THEME.primary,
    description: 'Bot overview & usage',
    commands: [],
    info: null,
  },
  {
    name: 'Antinuke',
    value: 'antinuke',
    emoji: '🛡️',
    color: 0xE53E3E,
    description: 'Protect your server from nuke attacks',
    commands: [
      { cmd: 'antinuke enable',           desc: 'Enable antinuke protection' },
      { cmd: 'antinuke disable',          desc: 'Disable antinuke protection' },
      { cmd: 'antinuke status',           desc: 'View current antinuke config' },
      { cmd: 'antinuke whitelist add',    desc: 'Whitelist a trusted user' },
      { cmd: 'antinuke whitelist remove', desc: 'Remove whitelist from user' },
      { cmd: 'antinuke whitelist view',   desc: 'List all whitelisted users' },
      { cmd: 'antinuke punishment',       desc: 'Set punishment (ban/kick/strip/timeout)' },
      { cmd: 'antinuke limits',           desc: 'Set action rate limits' },
      { cmd: 'antinuke logging',          desc: 'Set antinuke log channel' },
      { cmd: 'antinuke resetall',         desc: 'Reset all antinuke settings' },
    ],
    info: 'Prevents mass bans, kicks, channel deletes, and role destruction by unauthorized users.',
  },
  {
    name: 'Moderation',
    value: 'moderation',
    emoji: '⚔️',
    color: 0xED4245,
    description: 'Full-featured moderation suite',
    commands: [
      { cmd: 'ban @user [reason]',        desc: 'Permanently ban a member' },
      { cmd: 'unban [userId]',            desc: 'Unban a previously banned user' },
      { cmd: 'kick @user [reason]',       desc: 'Kick a member from the server' },
      { cmd: 'mute @user [duration]',     desc: 'Timeout a member' },
      { cmd: 'unmute @user',              desc: 'Remove a timeout' },
      { cmd: 'warn add @user [reason]',   desc: 'Warn a member' },
      { cmd: 'warn list @user',           desc: 'View member warnings' },
      { cmd: 'warn clear @user',          desc: 'Clear all warnings for a user' },
      { cmd: 'clear [amount]',            desc: 'Bulk delete messages (max 100)' },
      { cmd: 'lock [#channel]',           desc: 'Lock a channel' },
      { cmd: 'unlock [#channel]',         desc: 'Unlock a channel' },
      { cmd: 'slowmode [seconds]',        desc: 'Set channel slowmode' },
      { cmd: 'nick @user [nickname]',     desc: "Change a member's nickname" },
      { cmd: 'nuke',                      desc: 'Clone & delete channel' },
      { cmd: 'role add @user @role',      desc: 'Add a role to a member' },
      { cmd: 'role remove @user @role',   desc: 'Remove a role from a member' },
      { cmd: 'snipe',                     desc: 'Show last deleted message' },
    ],
    info: null,
  },
  {
    name: 'Utility',
    value: 'utility',
    emoji: '🔧',
    color: 0x5865F2,
    description: 'Server & user info tools',
    commands: [
      { cmd: 'help [module]',             desc: 'Browse all commands by module' },
      { cmd: 'ping',                      desc: 'Bot latency & API ping' },
      { cmd: 'botinfo',                   desc: 'Bot statistics and uptime' },
      { cmd: 'serverinfo',                desc: 'Detailed server information' },
      { cmd: 'serverstats',               desc: 'Generate a server stats image' },
      { cmd: 'userinfo [@user]',          desc: 'User account information' },
      { cmd: 'avatar [@user]',            desc: "Get a user's avatar" },
      { cmd: 'banner user [@user]',       desc: "Get a user's profile banner" },
      { cmd: 'banner server',             desc: 'Get the server banner' },
      { cmd: 'roleinfo @role',            desc: 'Detailed role information' },
      { cmd: 'channelinfo [#channel]',    desc: 'Detailed channel information' },
      { cmd: 'permissions [@user]',       desc: 'View member permissions' },
      { cmd: 'afk [reason]',             desc: 'Set/remove your AFK status' },
      { cmd: 'remind [time] [text]',      desc: 'Set a DM reminder' },
      { cmd: 'math [expression]',         desc: 'Evaluate math safely' },
    ],
    info: null,
  },
  {
    name: 'Automod',
    value: 'automod',
    emoji: '🤖',
    color: 0x57F287,
    description: 'Automated content moderation',
    commands: [
      { cmd: 'automod enable',            desc: 'Enable automod system' },
      { cmd: 'automod disable',           desc: 'Disable automod system' },
      { cmd: 'automod antispam',          desc: 'Toggle anti-spam detection' },
      { cmd: 'automod antilinks',         desc: 'Toggle anti-link filter' },
      { cmd: 'automod anticaps',          desc: 'Toggle anti-excessive-caps' },
      { cmd: 'automod antimentions',      desc: 'Toggle mass mention filter' },
      { cmd: 'automod mentionlimit',      desc: 'Set mention threshold' },
      { cmd: 'automod ignore channel',    desc: 'Ignore a channel from automod' },
      { cmd: 'automod ignore role',       desc: 'Ignore a role from automod' },
      { cmd: 'automod status',            desc: 'View automod configuration' },
      { cmd: 'automod reset',             desc: 'Reset all automod settings' },
    ],
    info: 'Messages violating rules are deleted automatically. Staff bypass automod.',
  },
  {
    name: 'Welcoming',
    value: 'welcoming',
    emoji: '👋',
    color: 0xFEE75C,
    description: 'Join & leave messages + autorole',
    commands: [
      { cmd: 'greet set #channel',        desc: 'Set welcome message channel' },
      { cmd: 'greet message [text]',      desc: 'Customize the welcome message' },
      { cmd: 'greet test',                desc: 'Preview your welcome message' },
      { cmd: 'greet reset',               desc: 'Disable welcome messages' },
      { cmd: 'autorole add humans @role', desc: 'Auto-assign role to new members' },
      { cmd: 'autorole add bots @role',   desc: 'Auto-assign role to new bots' },
      { cmd: 'autorole remove @role',     desc: 'Remove an autorole' },
      { cmd: 'autorole list',             desc: 'View all configured autoroles' },
      { cmd: 'autorole reset',            desc: 'Clear all autoroles' },
    ],
    info: null,
  },
  {
    name: 'Automations',
    value: 'automations',
    emoji: '✅',
    color: 0xF47FFF,
    description: 'Vanity invite, VC roles & more',
    commands: [
      { cmd: 'vanity setup #ch @role',    desc: 'Create tracked vanity invite + role' },
      { cmd: 'vanity info',               desc: 'View vanity invite stats' },
      { cmd: 'vanity reset',              desc: 'Remove vanity configuration' },
      { cmd: 'vcrole add #vc @role',      desc: 'Auto-assign role on VC join' },
      { cmd: 'vcrole remove #vc @role',   desc: 'Remove a VC role mapping' },
      { cmd: 'vcrole list',               desc: 'List all VC role mappings' },
      { cmd: 'vcrole reset',              desc: 'Clear all VC role mappings' },
    ],
    info: 'Vanity invites track join source and award roles. VC roles auto-assign on voice join and remove on leave.',
  },
  {
    name: 'Giveaway',
    value: 'giveaway',
    emoji: '🎁',
    color: 0xF1C40F,
    description: 'Host and manage giveaways',
    commands: [
      { cmd: 'giveaway start',            desc: 'Start a new giveaway' },
      { cmd: 'giveaway end [id]',         desc: 'End a giveaway early' },
      { cmd: 'giveaway reroll [id]',      desc: 'Reroll giveaway winner' },
      { cmd: 'giveaway list',             desc: 'List active giveaways' },
      { cmd: 'giveaway delete [id]',      desc: 'Delete a giveaway' },
    ],
    info: 'Lilith manages fair random winner selection with reroll support.',
  },
  {
    name: 'Fun',
    value: 'fun',
    emoji: '🎮',
    color: 0x00B0F4,
    description: 'Fun & entertainment commands',
    commands: [
      { cmd: 'coinflip',                  desc: 'Flip a coin (heads or tails)' },
      { cmd: 'dice [sides]',              desc: 'Roll a dice (default: d6)' },
      { cmd: 'rps [choice]',             desc: 'Rock Paper Scissors vs bot' },
      { cmd: 'joke',                      desc: 'Get a random funny joke' },
      { cmd: 'fact',                      desc: 'Random interesting fact' },
      { cmd: 'choose [opt1] [opt2]...',   desc: 'Let Lilith decide for you' },
      { cmd: 'say [message]',             desc: 'Make Lilith say something' },
      { cmd: 'roast [@user]',             desc: 'Roast someone with a GIF' },
      { cmd: 'compliment [@user]',        desc: 'Compliment someone' },
      { cmd: 'howgay [@user]',            desc: 'Gayness % (just for fun)' },
      { cmd: 'hug [@user]',               desc: 'Give someone a hug (GIF)' },
      { cmd: 'kiss [@user]',              desc: 'Send a kiss (GIF)' },
      { cmd: 'pat [@user]',               desc: 'Pat someone on the head (GIF)' },
      { cmd: '8ball [question]',          desc: 'Ask the magic 8-ball' },
      { cmd: 'ship [@user1] [@user2]',    desc: 'Calculate love compatibility' },
      { cmd: 'truth',                     desc: 'Random truth question' },
      { cmd: 'dare',                      desc: 'Random dare challenge' },
    ],
    info: null,
  },
  {
    name: 'Voice',
    value: 'voice',
    emoji: '🎙️',
    color: 0x9B59B6,
    description: 'Full voice channel controls',
    commands: [
      { cmd: 'voice kick @user',          desc: 'Kick user from voice channel' },
      { cmd: 'voice mute @user',          desc: 'Server-mute a user in voice' },
      { cmd: 'voice unmute @user',        desc: 'Unmute a user in voice' },
      { cmd: 'voice deafen @user',        desc: 'Deafen a user in voice' },
      { cmd: 'voice undeafen @user',      desc: 'Undeafen a user in voice' },
      { cmd: 'voice move @user #vc',      desc: 'Move a user to another VC' },
      { cmd: 'voice muteall [#vc]',       desc: 'Mute all users in a VC' },
      { cmd: 'voice unmuteall [#vc]',     desc: 'Unmute all users in a VC' },
      { cmd: 'voice kickall [#vc]',       desc: 'Kick all users from a VC' },
      { cmd: 'voice info [#vc]',          desc: 'View voice channel information' },
    ],
    info: null,
  },
  {
    name: 'Admin Setup',
    value: 'admin',
    emoji: '⚙️',
    color: 0x2B2D31,
    description: 'Admin configuration commands',
    commands: [
      { cmd: 'prefix set [prefix]',       desc: 'Set a custom server prefix' },
      { cmd: 'prefix reset',              desc: 'Reset prefix to default (!)' },
      { cmd: 'prefix view',               desc: 'View current prefix' },
      { cmd: 'setlog #channel',           desc: 'Set the mod log channel' },
      { cmd: 'theme [color]',             desc: 'Set embed accent color' },
    ],
    info: null,
  },
  {
    name: 'Ignore',
    value: 'ignore',
    emoji: '🔕',
    color: 0x36393F,
    description: 'Ignore channels & roles from commands',
    commands: [
      { cmd: 'ignore channel #channel',   desc: 'Ignore a channel from commands' },
      { cmd: 'ignore role @role',         desc: 'Ignore a role from commands' },
      { cmd: 'ignore list',               desc: 'List all ignored channels/roles' },
      { cmd: 'ignore reset',              desc: 'Reset all ignore settings' },
    ],
    info: null,
  },
];

// ── Beautiful home page with inline field cards ────────────────────────────────
function buildHomePage(guild, prefix) {
  const em = EMOJI;
  const filteredMods = MODULES.filter(m => m.value !== 'home');
  const totalCmds = filteredMods.reduce((a, m) => a + m.commands.length, 0);
  const modCount = filteredMods.length;

  return createEmbed({
    color: THEME.primary,
    author: {
      name: 'Lilith Protector  •  Premium Discord Security',
      iconURL: guild?.iconURL?.({ dynamic: true }) ?? undefined,
    },
    title: `${em.shield} Command Hub`,
    description: [
      ``,
      `${em.sparkle} **Welcome to Lilith Protector!** The most powerful premium security & management bot for Discord.`,
      ``,
      `${em.zap} **Prefix →** \`${prefix}\`  ${em.slash} **Slash →** \`/command\``,
      `${em.badge} **${totalCmds} commands** across **${modCount} modules**`,
      ``,
      DIVIDER_STARS,
    ].join('\n'),
    fields: [
      ...filteredMods.map(m => ({
        name: `${m.emoji}  ${m.name}`,
        value: `\`${m.commands.length} cmds\`\n*${m.description}*`,
        inline: true,
      })),
      // Pad to complete last row if needed
      ...(filteredMods.length % 3 !== 0
        ? Array(3 - (filteredMods.length % 3)).fill({ name: '\u200b', value: '\u200b', inline: true })
        : []),
    ],
    thumbnail: guild?.iconURL?.({ dynamic: true, size: 256 }) ?? null,
    footer: { text: `${em.sparkle} Lilith Protector  •  Use the dropdown below to navigate modules` },
  });
}

// ── Per-module command pages ───────────────────────────────────────────────────
function buildModulePage(mod, prefix, pageNum, totalPages) {
  const em = EMOJI;

  // Split commands into two columns if there are many
  const cmds = mod.commands;
  const half = Math.ceil(cmds.length / 2);
  const useColumns = cmds.length > 6;

  let cmdFields;
  if (useColumns) {
    const col1 = cmds.slice(0, half);
    const col2 = cmds.slice(half);
    cmdFields = [
      {
        name: `${em.zap} Commands`,
        value: col1.map(c => `\`/${c.cmd}\`\n╰ *${c.desc}*`).join('\n'),
        inline: true,
      },
      {
        name: '\u200b',
        value: col2.map(c => `\`/${c.cmd}\`\n╰ *${c.desc}*`).join('\n'),
        inline: true,
      },
    ];
  } else {
    cmdFields = [
      {
        name: `${em.zap} Commands`,
        value: cmds.map(c => `\`/${c.cmd}\`\n╰ *${c.desc}*`).join('\n'),
        inline: false,
      },
    ];
  }

  const infoField = mod.info
    ? [{
        name: `${em.dbcheck} How it works`,
        value: `> ${mod.info}`,
        inline: false,
      }]
    : [];

  const prefixNoteField = [{
    name: `${em.blobcool2} Prefix Commands`,
    value: `All commands also work with prefix: \`${prefix}${cmds[0]?.cmd ?? 'command'}\``,
    inline: false,
  }];

  return createEmbed({
    color: mod.color ?? THEME.primary,
    author: {
      name: `Module ${pageNum} of ${totalPages}  •  Lilith Protector`,
    },
    title: `${mod.emoji}  ${mod.name}  —  ${mod.description}`,
    description: DIVIDER_FANCY,
    fields: [...cmdFields, ...infoField, ...prefixNoteField],
    footer: { text: `${em.sparkle} Lilith Protector  •  Page ${pageNum} / ${totalPages}  •  Use ◀▶ or the dropdown` },
  });
}

// ── Slash command definition ───────────────────────────────────────────────────
export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Browse Lilith Protector modules and commands')
  .addStringOption(opt =>
    opt.setName('module')
      .setDescription('Jump directly to a module')
      .setRequired(false)
      .addChoices(
        ...MODULES.filter(m => m.value !== 'home').map(m => ({ name: m.name, value: m.value }))
      )
  );

export async function execute(interaction) {
  const guildId = interaction.guild?.id ?? '0';
  const prefix = getPrefix(guildId);
  const moduleArg = interaction.options?.getString?.('module') ?? null;
  const filteredMods = MODULES.filter(m => m.value !== 'home');
  const totalPages = filteredMods.length + 1;

  let currentPage = 0;
  if (moduleArg) {
    const idx = filteredMods.findIndex(m => m.value === moduleArg);
    if (idx !== -1) currentPage = idx + 1;
  }

  const getEmbed = () => {
    if (currentPage === 0) return buildHomePage(interaction.guild, prefix);
    return buildModulePage(filteredMods[currentPage - 1], prefix, currentPage, totalPages);
  };

  const getComponents = () => [
    helpNavButtons(currentPage, totalPages),
    moduleSelectMenu([
      { name: 'Home', value: 'home', emoji: '🏠', description: 'Bot overview & command hub' },
      ...filteredMods.map(m => ({ name: m.name, value: m.value, emoji: m.emoji, description: m.description })),
    ]),
  ];

  const msg = await interaction.reply({ embeds: [getEmbed()], components: getComponents(), fetchReply: true });
  const collector = msg.createMessageComponentCollector({ time: 5 * 60 * 1000 });

  collector.on('collect', async i => {
    if (i.user.id !== interaction.user.id) {
      return i.reply({ content: `${EMOJI.blobangry} This menu belongs to **${interaction.user.username}**.`, ephemeral: true });
    }
    if (i.customId === 'help_first')        currentPage = 0;
    else if (i.customId === 'help_prev')    currentPage = Math.max(0, currentPage - 1);
    else if (i.customId === 'help_next')    currentPage = Math.min(totalPages - 1, currentPage + 1);
    else if (i.customId === 'help_last')    currentPage = totalPages - 1;
    else if (i.customId === 'help_close')   { await i.update({ components: [] }); return collector.stop('closed'); }
    else if (i.customId === 'help_module_select') {
      const val = i.values[0];
      currentPage = val === 'home' ? 0 : filteredMods.findIndex(m => m.value === val) + 1;
    }
    await i.update({ embeds: [getEmbed()], components: getComponents() }).catch(() => {});
  });

  collector.on('end', (_, reason) => {
    if (reason !== 'closed') msg.edit({ components: [] }).catch(() => {});
  });
}
