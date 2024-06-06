import { ChatInputCommandInteraction } from 'discord.js';
import { getSpotifyToken, getTopSongs } from '../../service/spotify.service';
import { getOneSearchMusicVideo } from '../../events/music/getMusicInfo';
import { MusicInfo } from '../../types/musicData';
import { playListMusicMainLogic } from '../../events/music/musicPlayMainLogic';
import { hitSongsPreparingPlayerMessage } from '../../events/discord/embedMessage';
import { Logger } from '../../events/common/log';

export const hitSongsCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const genre = interaction.options.getString('genre') ?? '';

    // ボイスチャンネルにいない場合は処理しない
    const voiceChannelId = (await interaction.guild?.members.fetch(interaction.user.id))?.voice.channelId;
    if (!voiceChannelId) return interaction.editReply('ボイスチャンネルに参加してください。');

    // メッセージを作成
    const embed = hitSongsPreparingPlayerMessage(genre);

    await interaction.editReply(embed);

    const token = await getSpotifyToken();
    const topSongs = await getTopSongs(token, genre);
    const musicplayVideoList: MusicInfo[] = [];
    for (let i = 0; i < topSongs.length; i++) {
      const song = topSongs[i];
      musicplayVideoList.push(await getOneSearchMusicVideo(`${song.artists} ${song.name}`, i + 1));
    }

    // playList再生処理
    await playListMusicMainLogic(
      interaction,
      voiceChannelId,
      {
        playListId: 1,
        url: 'なんもないです',
        thumbnail: undefined,
        title: `TOP50- ${genre}`,
        videosLength: String(musicplayVideoList.length),
        musicInfo: musicplayVideoList,
      },
      3
    );

    // console.log('Top Songs:', topSongs);
  } catch (error) {
    Logger.LogSystemError(`hitSongsCommandMainEventでエラーが発生しました : ${error}`);
    await interaction.editReply({
      embeds: [],
      files: [],
      content: '処理中にエラーが発生しました。再度コマンドを入力してください。',
    });
  }
};
