import { EmbedBuilder } from 'discord.js';
import { ValorantUser } from '../../types/valorantUserData';
import { rankEmojis } from './getEmojis';

// ランク情報のメッセージを作成
export const rankInfoMessage = (valorantUser: ValorantUser) => {
  const emoji = rankEmojis[`${valorantUser.rank}${valorantUser.rankNum ?? ''}`];
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle(`${valorantUser.displayName}さんの現在のランク情報`)
    .setThumbnail(valorantUser.userIcon)
    .addFields(
      { name: 'RIOT-ID', value: `${valorantUser.riotId}#${valorantUser.riotIdTag}`, inline: false },
      { name: 'ランク', value: `${emoji}${valorantUser.rank} ${valorantUser.rankNum ?? ''}`, inline: true },
      { name: 'ポイント', value: `${valorantUser.rankRr} RR`, inline: true }
    );

  return { embeds: [embeds], files: [], components: [] };
};
