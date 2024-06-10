import { EmbedBuilder, Message } from 'discord.js';
import { getTotalMusicCommandCount } from '../../store/guildCommandStates';

export const musicservser = async (message: Message, serverLength: number) => {
  // guildIdを取得
  const guildId = message.guildId;
  if (!guildId) return;

  const serverCount = getTotalMusicCommandCount();

  // 再生準備中のメッセージを作成(ヒットソング)
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle(
      `ウィングマンくんを導入しているサーバーは${serverLength}です。\n\n音楽のインスタンスは現在${serverCount}個稼働しています。`
    )
    .setFooter({
      text: 'YouTube',
      iconURL: 'attachment://youtube_icon.png',
    })
    .setTimestamp();

  message.reply({ embeds: [embeds] });
};
