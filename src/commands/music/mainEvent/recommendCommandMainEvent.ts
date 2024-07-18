import { ChatInputCommandInteraction } from 'discord.js';
import { preparingPlayerMessage } from '../../../events/discord/embedMessage';
import { MusicInfo } from '../../../types/musicData';
import { checkUrlType, getMusicPlayListInfo, getSingleMusicInfo } from '../../../events/music/getMusicInfo';
import { generateRandomNum } from '../../../events/common/generateRandomNum';
import { playListMusicMainLogic } from '../../../events/music/playListMusicPlayMainLogic';
import { Logger } from '../../../events/common/log';
import { stopPreviousInteraction } from '../../../store/guildCommandStates';
import { COMMAND_NAME_MUSIC } from '../mainMusicCommand';

const MAX_PLAYLIST_NUM = 15;
const BATCH_SIZE = 5;

/**
 * おすすめ音楽再生コマンドのメインイベント
 *
 * @param interaction - チャット入力コマンドのインタラクション
 */
export const recommendCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const guildId = interaction.guildId;
    if (guildId) await stopPreviousInteraction(guildId, COMMAND_NAME_MUSIC, true);

    const url = interaction.options.getString('url') ?? '';

    // ボイスチャンネルにいない場合は処理しない
    const voiceChannelId = (await interaction.guild?.members.fetch(interaction.user.id))?.voice.channelId;
    if (!voiceChannelId) return interaction.editReply('ボイスチャンネルに参加してください。');

    // プレイリストか曲か判別
    const playListFlag: { result: boolean; urlError: boolean } = checkUrlType(url);

    if (playListFlag.urlError)
      return interaction.editReply('こちらの音楽は再生できません。正しいURLを指定してください。');

    // メッセージを作成
    const embed = preparingPlayerMessage();

    await interaction.editReply(embed);

    const relatedPlayListInfo: MusicInfo[] = [];
    let originMusicTitle: string;
    let musicInfo: MusicInfo;
    let playListNum = 0;

    // プレイリストの時はプレイリストの中から関連楽曲をとってくる
    if (playListFlag.result) {
      const playListInfo = await getMusicPlayListInfo(url, false);
      originMusicTitle = playListInfo.title;

      while (playListNum <= MAX_PLAYLIST_NUM) {
        const playListInfoNum = generateRandomNum(0, playListInfo.musicInfo.length - 1);
        const musicInfo = await getSingleMusicInfo(playListInfo.musicInfo[playListInfoNum].url ?? '');

        const relatedRandomNum = generateRandomNum(
          1,
          musicInfo.relatedVideosIDlist.length - 5 >= 1 ? musicInfo.relatedVideosIDlist.length - 5 : 2
        );

        musicInfo.relatedVideosIDlist.sort(() => 0.5 - Math.random());

        const batchMusicInfo = await fetchRelatedMusicInfoBatch(
          musicInfo.relatedVideosIDlist.slice(0, relatedRandomNum + 1),
          playListNum
        );

        relatedPlayListInfo.push(...batchMusicInfo);
        playListNum += batchMusicInfo.length;
        playListInfo.musicInfo.splice(playListInfoNum, 1);
      }
    } else {
      musicInfo = await getSingleMusicInfo(url);
      originMusicTitle = musicInfo.title;

      while (playListNum <= MAX_PLAYLIST_NUM) {
        const relatedRandomNum = generateRandomNum(
          1,
          musicInfo.relatedVideosIDlist.length - 5 >= 1 ? musicInfo.relatedVideosIDlist.length - 5 : 2
        );

        musicInfo.relatedVideosIDlist.sort(() => 0.5 - Math.random());

        const batchMusicInfo = await fetchRelatedMusicInfoBatch(
          musicInfo.relatedVideosIDlist.slice(0, relatedRandomNum + 1),
          playListNum
        );

        relatedPlayListInfo.push(...batchMusicInfo);
        playListNum += batchMusicInfo.length;
        musicInfo = relatedPlayListInfo[generateRandomNum(0, relatedPlayListInfo.length - 1)];
      }
    }

    // playList再生処理
    await playListMusicMainLogic(
      interaction,
      voiceChannelId,
      {
        playListId: 1,
        url: url,
        thumbnail: undefined,
        title: originMusicTitle,
        videosLength: String(relatedPlayListInfo.length),
        musicInfo: relatedPlayListInfo,
      },
      2
    );
  } catch (error) {
    Logger.LogError(`【${interaction.guild?.id}】recommendCommandMainEventでエラーが発生しました`, error);
    await interaction.editReply({
      embeds: [],
      files: [],
      content: '処理中にエラーが発生しました。再度コマンドを入力してください。',
    });
  }
};

/**
 * 関連音楽情報のIDを取得する関数
 *
 * @param musicInfoList - 音楽情報のIDリスト
 * @param playListNum - プレイリストの番号
 * @returns 関連音楽情報の配列
 */
const fetchRelatedMusicInfoBatch = async (musicInfoList: string[], playListNum: number): Promise<MusicInfo[]> => {
  const relatedPlayListInfo: MusicInfo[] = [];
  for (let i = 0; i < musicInfoList.length; i += BATCH_SIZE) {
    const batch = musicInfoList.slice(i, i + BATCH_SIZE);
    const fetchPromises = batch.map((videoId, index) => getSingleMusicInfo(videoId, playListNum + index));
    const results = await Promise.all(fetchPromises);
    relatedPlayListInfo.push(...results);
  }
  return relatedPlayListInfo;
};
