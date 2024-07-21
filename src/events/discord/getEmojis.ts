import { Client } from 'discord.js';

export let rankEmojis: { [key: string]: string } = {};

export const loadEmojis = (client: Client, guildId: string) => {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    console.log('Guild not found');
    return;
  }

  rankEmojis = {};
  guild.emojis.cache.forEach((emoji) => {
    if (emoji.name) {
      rankEmojis[emoji.name] = emoji.toString();
    }
  });
};
