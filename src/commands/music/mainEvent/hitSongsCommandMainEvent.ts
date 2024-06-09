import { ChatInputCommandInteraction } from 'discord.js';
import { getSpotifyToken, getTopSongs } from '../../../service/spotify.service';
import { getOneSearchMusicVideo } from '../../../events/music/getMusicInfo';
import { MusicInfo } from '../../../types/musicData';
import { playListMusicMainLogic } from '../../../events/music/playListMusicPlayMainLogic';
import { hitSongsPreparingPlayerMessage } from '../../../events/discord/embedMessage';
import { Logger } from '../../../events/common/log';
import { spotifyPlaylistId } from '../../../events/common/readJsonData';

export const hitSongsCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const genre = interaction.options.getNumber('genre') ?? 0;

    // ボイスチャンネルにいない場合は処理しない
    const voiceChannelId = (await interaction.guild?.members.fetch(interaction.user.id))?.voice.channelId;
    if (!voiceChannelId) return interaction.editReply('ボイスチャンネルに参加してください。');

    const spotifyPlaylistInfo = spotifyPlaylistId[genre];

    // データ収集
    Logger.LogAccessInfo(
      `${interaction.user.username}(${interaction.user.id})さんが${spotifyPlaylistInfo.name} を選択しました。`
    );

    // メッセージを作成
    const embed = hitSongsPreparingPlayerMessage(spotifyPlaylistInfo);

    await interaction.editReply(embed);

    const token = await getSpotifyToken();
    const topSongs = await getTopSongs(token, spotifyPlaylistInfo.id);

    const videoPromises = topSongs
      .slice(0, 100)
      .map((song: { artists: string; name: string }, index: number) =>
        getOneSearchMusicVideo(`${song.artists} ${song.name}`, index + 1)
      );

    const videoResults = await Promise.all(videoPromises);
    const musicplayVideoList: MusicInfo[] = [...videoResults];

    // playList再生処理
    await playListMusicMainLogic(
      interaction,
      voiceChannelId,
      {
        playListId: 1,
        url: 'https://open.spotify.com/playlist/' + spotifyPlaylistInfo.id,
        thumbnail: undefined,
        title: `${spotifyPlaylistInfo.title}`,
        description: `${spotifyPlaylistInfo.description}`,
        rankingFlag: spotifyPlaylistInfo.ranking,
        videosLength: String(musicplayVideoList.length),
        musicInfo: musicplayVideoList,
      },
      3
    );
  } catch (error) {
    Logger.LogSystemError(`hitSongsCommandMainEventでエラーが発生しました : ${error}`);
    await interaction.editReply({
      embeds: [],
      files: [],
      content: '処理中にエラーが発生しました。再度コマンドを入力してください。',
    });
  }
};
