import { Client } from 'discord.js';
import { rankEmojis } from '../../constants';

export const loadEmojis = (client: Client, guildId: string) => {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    console.log('Guild not found');
    return;
  }

  guild.emojis.cache.forEach((emoji) => {
    if (emoji.name) {
      rankEmojis[emoji.name] = emoji.toString();
    }
  });
};
