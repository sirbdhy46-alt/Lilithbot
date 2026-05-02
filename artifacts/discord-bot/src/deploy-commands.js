import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  console.error('❌ DISCORD_TOKEN and DISCORD_CLIENT_ID must be set.');
  process.exit(1);
}

const commands = [];
const commandsDir = join(__dirname, 'commands');

const categories = readdirSync(commandsDir);
for (const category of categories) {
  const files = readdirSync(join(commandsDir, category)).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const filePath = pathToFileURL(join(commandsDir, category, file)).href;
    const command = await import(filePath);
    if (command.data) {
      commands.push(command.data.toJSON());
      console.log(`  ✓ Queued /${command.data.name}`);
    }
  }
}

const rest = new REST().setToken(token);

console.log(`\n🚀 Deploying ${commands.length} slash command(s) to Discord...`);

try {
  const data = await rest.put(
    Routes.applicationCommands(clientId),
    { body: commands },
  );
  console.log(`\n✅ Successfully deployed ${data.length} slash command(s)!`);
  console.log('   Commands are now available globally (may take up to 1 hour to propagate).');
} catch (error) {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
}
