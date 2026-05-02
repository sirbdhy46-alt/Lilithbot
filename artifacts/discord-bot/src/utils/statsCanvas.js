/**
 * Generates a beautiful server stats image using @napi-rs/canvas
 * Returns a Buffer (PNG) ready to be sent as a Discord attachment.
 */
import { createCanvas, loadImage } from '@napi-rs/canvas';

// ── Helpers ───────────────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function timeAgo(ms) {
  const years = Math.floor(ms / (365.25 * 24 * 3600000));
  const months = Math.floor((ms % (365.25 * 24 * 3600000)) / (30.44 * 24 * 3600000));
  if (years > 0) return `${years}y ${months}mo`;
  if (months > 0) return `${months} month${months !== 1 ? 's' : ''}`;
  const days = Math.floor(ms / 86400000);
  return `${days} day${days !== 1 ? 's' : ''}`;
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function generateStatsImage(guild, onlineCount = 0) {
  const W = 900, H = 460;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // ── Background gradient ───────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0b0b1a');
  bg.addColorStop(0.5, '#130a24');
  bg.addColorStop(1, '#0a0f1e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Dot grid pattern ─────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  for (let x = 20; x < W; x += 28) {
    for (let y = 20; y < H; y += 28) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Left accent bar ───────────────────────────────────────────────────────
  const accent = ctx.createLinearGradient(0, 0, 0, H);
  accent.addColorStop(0, '#e53e3e');
  accent.addColorStop(0.5, '#9b59b6');
  accent.addColorStop(1, '#5865f2');
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 5, H);

  // ── Server Icon ───────────────────────────────────────────────────────────
  const iconX = 70, iconY = 80, iconR = 52;
  try {
    const iconUrl = guild.iconURL({ extension: 'png', size: 256 });
    if (iconUrl) {
      const img = await loadImage(iconUrl);
      ctx.save();
      circle(ctx, iconX, iconY, iconR);
      ctx.clip();
      ctx.drawImage(img, iconX - iconR, iconY - iconR, iconR * 2, iconR * 2);
      ctx.restore();
      // Icon border glow
      ctx.save();
      circle(ctx, iconX, iconY, iconR + 3);
      ctx.strokeStyle = '#e53e3e';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
  } catch {}

  // ── Server Name ───────────────────────────────────────────────────────────
  ctx.font = 'bold 32px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(guild.name, 140, 60);

  // ── Server ID + created ───────────────────────────────────────────────────
  ctx.font = '15px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  const createdDate = new Date(guild.createdTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  ctx.fillText(`ID: ${guild.id}`, 140, 82);
  ctx.fillText(`Created: ${createdDate}  •  Age: ${timeAgo(Date.now() - guild.createdTimestamp)}`, 140, 102);

  // ── Verification badge ────────────────────────────────────────────────────
  const verifyLabels = ['None', 'Low', 'Medium', 'High', 'Very High'];
  const vLabel = verifyLabels[guild.verificationLevel] ?? 'Unknown';
  const verifyBg = { None: '#57f287', Low: '#fee75c', Medium: '#f0a500', High: '#ed4245', 'Very High': '#eb459e' }[vLabel] ?? '#5865f2';
  ctx.save();
  roundRect(ctx, 140, 112, 90, 22, 11);
  ctx.fillStyle = verifyBg + '33';
  ctx.fill();
  roundRect(ctx, 140, 112, 90, 22, 11);
  ctx.strokeStyle = verifyBg;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = '12px sans-serif';
  ctx.fillStyle = verifyBg;
  ctx.textAlign = 'center';
  ctx.fillText(`🔒 ${vLabel}`, 185, 127);
  ctx.restore();

  // ── Divider line ──────────────────────────────────────────────────────────
  const grad = ctx.createLinearGradient(20, 0, W - 20, 0);
  grad.addColorStop(0, 'rgba(229,62,62,0.8)');
  grad.addColorStop(0.5, 'rgba(155,89,182,0.8)');
  grad.addColorStop(1, 'rgba(88,101,242,0.8)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(20, 152);
  ctx.lineTo(W - 20, 152);
  ctx.stroke();

  // ── Stats Grid 3×2 ────────────────────────────────────────────────────────
  const channels = guild.channels.cache;
  const textCh = channels.filter(c => c.type === 0).size;
  const voiceCh = channels.filter(c => c.type === 2).size;
  const totalCh = channels.size;
  const boosts = guild.premiumSubscriptionCount ?? 0;
  const tierNames = ['No Tier', 'Tier 1 ✦', 'Tier 2 ✦✦', 'Tier 3 ✦✦✦'];

  const STATS = [
    {
      icon: '👥',
      label: 'Members',
      value: formatNumber(guild.memberCount),
      sub: `${formatNumber(onlineCount)} online`,
      color: '#57f287',
    },
    {
      icon: '📢',
      label: 'Channels',
      value: formatNumber(totalCh),
      sub: `${textCh} text • ${voiceCh} voice`,
      color: '#5865f2',
    },
    {
      icon: '🎭',
      label: 'Roles',
      value: formatNumber(guild.roles.cache.size),
      sub: 'total roles',
      color: '#9b59b6',
    },
    {
      icon: '🚀',
      label: 'Boosts',
      value: formatNumber(boosts),
      sub: tierNames[guild.premiumTier] ?? 'No Tier',
      color: '#f47fff',
    },
    {
      icon: '😀',
      label: 'Emojis',
      value: formatNumber(guild.emojis.cache.size),
      sub: `${guild.stickers.cache.size} stickers`,
      color: '#fee75c',
    },
    {
      icon: '🔐',
      label: 'Security',
      value: vLabel,
      sub: 'verification level',
      color: '#ed4245',
    },
  ];

  const colW = (W - 80) / 3;
  const rowH = 120;
  const startY = 168;

  for (let i = 0; i < STATS.length; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 30 + col * colW;
    const y = startY + row * rowH;
    const stat = STATS[i];

    // Card background
    ctx.save();
    roundRect(ctx, x, y, colW - 16, 108, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fill();
    roundRect(ctx, x, y, colW - 16, 108, 12);
    ctx.strokeStyle = stat.color + '44';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Top color accent
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + 12, y);
    ctx.lineTo(x + colW - 28, y);
    ctx.strokeStyle = stat.color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // Icon
    ctx.font = '26px serif';
    ctx.textAlign = 'left';
    ctx.fillText(stat.icon, x + 14, y + 36);

    // Value
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(stat.value, x + 14, y + 72);

    // Label
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = stat.color;
    ctx.fillText(stat.label.toUpperCase(), x + 14, y + 91);

    // Sub text
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(stat.sub, x + 14, y + 104);
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  ctx.save();
  roundRect(ctx, 0, H - 42, W, 42, 0);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();
  ctx.restore();

  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.textAlign = 'center';
  ctx.fillText('⚜️  Lilith Protector  •  Premium Discord Security', W / 2, H - 17);

  ctx.font = '13px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.textAlign = 'right';
  ctx.fillText(new Date().toUTCString(), W - 20, H - 17);

  return canvas.toBuffer('image/png');
}
