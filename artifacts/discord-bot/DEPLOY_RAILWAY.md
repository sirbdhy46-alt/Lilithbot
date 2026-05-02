# Deploying Lilith Protector to Railway

## Step 1 — Push to GitHub

1. Create a new GitHub repository
2. Push your project:
   ```
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

## Step 2 — Create a Railway project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository

## Step 3 — Set the Root Directory

In your Railway service settings:
- Go to **Settings** → **Source**
- Set **Root Directory** to: `artifacts/discord-bot`

## Step 4 — Add Environment Variables

In Railway → your service → **Variables**, add:

| Variable | Value |
|---|---|
| `DISCORD_TOKEN` | Your bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | Your bot's Application ID |

## Step 5 — Register Slash Commands

After your first deploy, open a terminal in Railway (or run locally):

```bash
npm run deploy
```

This registers all slash commands globally with Discord.

## Step 6 — Deploy

Railway will automatically build and deploy. Your bot will be online within ~1 minute.

---

## New Features Added

### `/addemojis` — Bulk add 50+ emojis
- `/addemojis pack blob` — Install 50 Blob emojis
- `/addemojis pack hype` — Install 50 Hype/reaction emojis
- `/addemojis pack cats` — Install 50 Cat emojis
- `/addemojis pack pepe` — Install 50 Pepe emojis
- `/addemojis steal [message_id]` — Steal all emojis from a message
- `/addemojis list` — See available packs and free slots
- Requires **Manage Emojis & Stickers** permission

### `/goodbye` — Configure leave messages
- Leave messages now **auto-delete after 23 seconds**
- `/goodbye channel #channel` — Set a specific channel
- `/goodbye config` — View current settings
- `/goodbye reset` — Revert to system channel
