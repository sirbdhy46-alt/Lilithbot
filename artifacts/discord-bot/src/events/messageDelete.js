export const name = 'messageDelete';
export const once = false;

// Global snipe cache: channelId → { content, author, image, timestamp }
if (!globalThis.snipeCache) globalThis.snipeCache = new Map();

export async function execute(message) {
  if (message.partial) return;
  if (message.author?.bot) return;

  const imageAttachment = message.attachments.find(a =>
    a.contentType?.startsWith('image/')
  );

  globalThis.snipeCache.set(message.channelId, {
    content: message.content || null,
    author: {
      tag: message.author.tag,
      id: message.author.id,
      avatar: message.author.displayAvatarURL({ dynamic: true, size: 256 }),
    },
    image: imageAttachment?.proxyURL ?? null,
    timestamp: Date.now(),
  });

  // Auto-expire snipe after 5 minutes
  setTimeout(() => {
    const cached = globalThis.snipeCache.get(message.channelId);
    if (cached && cached.timestamp === globalThis.snipeCache.get(message.channelId)?.timestamp) {
      globalThis.snipeCache.delete(message.channelId);
    }
  }, 5 * 60 * 1000);
}
