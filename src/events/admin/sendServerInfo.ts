import { EmbedBuilder } from 'discord.js';
import { discord } from '../../modules/discordModule';

export const createServerMessage = async (guildCount: number, musicCount: number) => {
  // メッセージを作成
  const embed = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle(
      `${discord.user?.tag}を導入しているサーバーは${guildCount}個です。\n\n音楽のインスタンスは現在${musicCount}個稼働しています。`
    )
    .setTimestamp();

  return embed;
};
