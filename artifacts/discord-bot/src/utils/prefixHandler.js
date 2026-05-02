/**
 * PrefixContext — wraps a Discord Message into a slash-command-compatible interface.
 * Uses type-based positional tracking: getUser() returns users in order seen,
 * getInteger() returns numbers in order seen, getString() returns remaining text.
 */
export class PrefixContext {
  constructor(message, args, commandName) {
    this.message = message;
    this.rawArgs = args;
    this.commandName = commandName;
    this.client = message.client;
    this.guild = message.guild;
    this.channel = message.channel;
    this.user = message.author;
    this.member = message.member;
    this.createdTimestamp = message.createdTimestamp;
    this._replied = false;
    this._deferred = false;
    this._lastReply = null;
    this._ephemeral = false;

    // Classify each arg by type
    this._users = [];
    this._members = [];
    this._roles = [];
    this._channels = [];
    this._integers = [];
    this._stringParts = [];
    this._subcommand = args[0]?.toLowerCase() ?? null;

    this._classify(args);
  }

  _classify(args) {
    let pastFirstString = false;
    for (const arg of args) {
      // User mention
      const userMatch = arg.match(/^<@!?(\d+)>$/);
      if (userMatch) {
        const id = userMatch[1];
        const user = this.client.users.cache.get(id) ?? { id, tag: `${id}`, username: id, toString: () => `<@${id}>`, displayAvatarURL: () => '' };
        const member = this.guild?.members.cache.get(id) ?? null;
        this._users.push(user);
        this._members.push(member);
        continue;
      }
      // Role mention
      const roleMatch = arg.match(/^<@&(\d+)>$/);
      if (roleMatch) {
        const role = this.guild?.roles.cache.get(roleMatch[1]) ?? null;
        this._roles.push(role);
        continue;
      }
      // Channel mention
      const chanMatch = arg.match(/^<#(\d+)>$/);
      if (chanMatch) {
        const chan = this.guild?.channels.cache.get(chanMatch[1]) ?? null;
        this._channels.push(chan);
        continue;
      }
      // Raw snowflake ID (treat as user)
      if (/^\d{17,20}$/.test(arg)) {
        const user = this.client.users.cache.get(arg) ?? { id: arg, tag: arg, username: arg, toString: () => `<@${arg}>`, displayAvatarURL: () => '' };
        const member = this.guild?.members.cache.get(arg) ?? null;
        this._users.push(user);
        this._members.push(member);
        continue;
      }
      // Integer
      if (/^-?\d+$/.test(arg)) {
        this._integers.push(parseInt(arg));
        this._stringParts.push(arg);
        continue;
      }
      // String part (accumulate for reason/text)
      this._stringParts.push(arg);
    }
  }

  get replied() { return this._replied; }
  get deferred() { return this._deferred; }

  isChatInputCommand() { return true; }
  isButton() { return false; }
  isStringSelectMenu() { return false; }

  // Counters for positional access
  _userIdx = 0;
  _memberIdx = 0;
  _roleIdx = 0;
  _channelIdx = 0;
  _intIdx = 0;

  get options() {
    const ctx = this;
    return {
      getSubcommand: () => ctx._subcommand,
      getSubcommandGroup: () => null,

      getUser: (_name, _req) => ctx._users[ctx._userIdx++] ?? null,
      getMember: (_name, _req) => ctx._members[ctx._memberIdx++] ?? null,
      getRole: (_name, _req) => ctx._roles[ctx._roleIdx++] ?? null,
      getChannel: (_name, _req) => ctx._channels[ctx._channelIdx++] ?? null,
      getInteger: (_name, _req) => ctx._integers[ctx._intIdx++] ?? null,
      getBoolean: (_name, _req) => null,

      // getString: returns all non-mention, non-integer parts as reason
      getString: (_name, _req) => {
        // Filter out subcommand from string parts
        const filtered = ctx._stringParts.filter(p => p !== ctx._subcommand);
        const joined = filtered.join(' ');
        return joined || null;
      },
    };
  }

  async deferReply(options = {}) {
    this._deferred = true;
    this._ephemeral = options.ephemeral ?? false;
    // Send a temporary message so editReply works
    try {
      this._lastReply = await this.message.reply({ content: '⏳ Processing...' });
    } catch {
      this._lastReply = await this.channel.send({ content: '⏳ Processing...' });
    }
  }

  async reply(options = {}) {
    this._replied = true;
    const payload = typeof options === 'string'
      ? { content: options }
      : { content: options.content, embeds: options.embeds ?? [], components: options.components ?? [], files: options.files ?? [] };

    if (options.fetchReply) {
      try {
        this._lastReply = await this.message.reply(payload);
      } catch {
        this._lastReply = await this.channel.send(payload);
      }
      return this._lastReply;
    }

    try {
      this._lastReply = await this.message.reply(payload);
    } catch {
      this._lastReply = await this.channel.send(payload);
    }
    return this._lastReply;
  }

  async editReply(options = {}) {
    const payload = typeof options === 'string'
      ? { content: options }
      : { content: options.content ?? null, embeds: options.embeds ?? [], components: options.components ?? [], files: options.files ?? [] };

    if (this._lastReply) {
      try {
        return await this._lastReply.edit(payload);
      } catch {
        return this.channel.send(payload);
      }
    }
    return this.reply(options);
  }

  async followUp(options = {}) {
    const payload = typeof options === 'string'
      ? { content: options }
      : { content: options.content ?? null, embeds: options.embeds ?? [], components: options.components ?? [], files: options.files ?? [] };
    return this.channel.send(payload);
  }

  async fetchReply() {
    return this._lastReply;
  }
}

/**
 * Parse raw message content into { commandName, args }
 * Handles quoted strings: !ban @user "reason with spaces"
 */
export function parsePrefixMessage(content, prefix) {
  if (!content.startsWith(prefix)) return null;
  const withoutPrefix = content.slice(prefix.length).trim();
  if (!withoutPrefix) return null;

  const allTokens = tokenize(withoutPrefix);
  if (!allTokens.length) return null;

  const commandName = allTokens[0].toLowerCase();
  const args = allTokens.slice(1);

  return { commandName, args };
}

function tokenize(str) {
  const args = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';

  for (const char of str) {
    if ((char === '"' || char === "'") && !inQuote) {
      inQuote = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuote) {
      inQuote = false;
      quoteChar = '';
      if (current) { args.push(current); current = ''; }
    } else if (char === ' ' && !inQuote) {
      if (current) { args.push(current); current = ''; }
    } else {
      current += char;
    }
  }
  if (current) args.push(current);
  return args;
}
