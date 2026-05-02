import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, Partials } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.GuildMember],
});

client.commands = new Collection();

async function loadCommands() {
  const commandsDir = join(__dirname, 'commands');
  const categories = readdirSync(commandsDir);

  for (const category of categories) {
    const files = readdirSync(join(commandsDir, category)).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const filePath = pathToFileURL(join(commandsDir, category, file)).href;
      try {
        const command = await import(filePath);
        if (command.data && command.execute) {
          client.commands.set(command.data.name, command);
          console.log(`  ✓ Loaded /${command.data.name}`);
        } else {
          console.warn(`  ⚠ Skipped ${file} (missing data or execute)`);
        }
      } catch (err) {
        console.error(`  ✗ Error loading ${file}:`, err.message);
      }
    }
  }
}

async function loadEvents() {
  const eventsDir = join(__dirname, 'events');
  const files = readdirSync(eventsDir).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const filePath = pathToFileURL(join(eventsDir, file)).href;
    const event = await import(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`  ✓ Event: ${event.name}`);
  }
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ⚜️  Lilith Protector');
  console.log('  Premium Discord Bot');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📦 Loading commands...');
  await loadCommands();

  console.log('\n📡 Loading events...');
  await loadEvents();

  const token = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.error('\n❌ Neither DISCORD_TOKEN nor DISCORD_BOT_TOKEN is set! Add it to your environment variables.\n');
    process.exit(1);
  }

  console.log('\n🔗 Connecting to Discord...');
  await client.login(token);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
