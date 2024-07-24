import { Client } from 'discord.js';
import { rankEmojis } from '../../constants';

/**
 * 指定されたサーバーから絵文字を読み込み、グローバル変数に格納する
 * @param {Client} client - Discordクライアントオブジェクト
 * @param {string} guildId - 絵文字をロードするサーバーのID
 * @returns {void}
 */
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
