import { ChatInputCommandInteraction } from 'discord.js';
import { MusicInfo } from '../../types/musicData';
import { isPlayListFlag } from '../../events/music/musicCommon';
import { getMusicPlayListInfo, getSingleMusicInfo } from '../../events/music/getMusicInfo';
import { playListMusicMainLogic } from '../../events/music/playListMusicMainLogic';
import { generateRandomNum } from '../../events/common/generateRandomNum';
import { preparingPlayerMessage } from '../../events/discord/embedMessage';
import { Logger } from '../../events/common/log';

export const recommendCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const url = interaction.options.getString('url') ?? '';

    // ボイスチャンネルにいない場合は処理しない
    const voiceChannelId = (await interaction.guild?.members.fetch(interaction.user.id))?.voice.channelId;
    if (!voiceChannelId) return interaction.editReply('ボイスチャンネルに参加してください。');

    // プレイリストか曲か判別
    const playListFlag: { result: boolean; urlError: boolean } = isPlayListFlag(url);

    if (playListFlag.urlError)
      return interaction.editReply('こちらの音楽は再生できません。正しいURLを指定してください。');

    // メッセージを作成
    const embed = preparingPlayerMessage();

    await interaction.editReply(embed);

    const relatedMusicInfoList: MusicInfo[] = [];
    let musicInfo: MusicInfo;

    const maxPlayListNum = 15;
    let playListNum = 0;

    // プレイリストの時はプレイリストの中から関連楽曲をとってくる
    if (playListFlag.result) {
      const musicInfoList = await getMusicPlayListInfo(url, false);

      do {
        const musicInfoListNum = generateRandomNum(0, musicInfoList.length - 1);
        musicInfo = await getSingleMusicInfo(musicInfoList[musicInfoListNum].url ?? '');
        const relatedRandomNum = generateRandomNum(1, musicInfo.relatedVideosIDlist.length - 5);
        musicInfoList.splice(musicInfoListNum, 1);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        musicInfo.relatedVideosIDlist.sort((_a, _b) => 0.5 - Math.random());
        for (let i = 0; i <= relatedRandomNum; i++) {
          relatedMusicInfoList.push(await getSingleMusicInfo(musicInfo.relatedVideosIDlist[i], playListNum + i));
        }
        playListNum += relatedRandomNum;
        musicInfo = musicInfoList[generateRandomNum(0, musicInfoList.length - 1)];
      } while (playListNum <= maxPlayListNum);
      // 曲の時はその曲の関連楽曲をとってくる
    } else {
      musicInfo = await getSingleMusicInfo(url);
      do {
        const relatedRandomNum = generateRandomNum(1, musicInfo.relatedVideosIDlist.length - 5);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        musicInfo.relatedVideosIDlist.sort((_a, _b) => 0.5 - Math.random());
        for (let i = 0; i <= relatedRandomNum; i++) {
          relatedMusicInfoList.push(await getSingleMusicInfo(musicInfo.relatedVideosIDlist[i], playListNum + i));
        }
        playListNum += relatedRandomNum;
        musicInfo = relatedMusicInfoList[generateRandomNum(0, relatedMusicInfoList.length - 1)];
      } while (playListNum <= maxPlayListNum);
    }

    // playList再生処理
    await playListMusicMainLogic(interaction, voiceChannelId, relatedMusicInfoList);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    Logger.LogSystemError(error);
    await interaction.editReply({
      embeds: [],
      files: [],
      content: '処理中にエラーが発生しました。再度コマンドを入力してください。',
    });
  }
};
