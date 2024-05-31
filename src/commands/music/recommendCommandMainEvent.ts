import { ChatInputCommandInteraction } from 'discord.js';
import { MusicInfo } from '../../types/musicData';
import { isPlayListFlag } from '../../events/music/musicCommon';
import { getMusicPlayListInfo, getSingleMusicInfo } from '../../events/music/getMusicInfo';
import { playListMusicMainLogic } from '../../events/music/musicPlayMainLogic';
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

    let originMusicTitle: string;
    const relatedplayListInfo: MusicInfo[] = [];
    let musicInfo: MusicInfo;

    const maxPlayListNum = 15;
    let playListNum = 0;

    // プレイリストの時はプレイリストの中から関連楽曲をとってくる
    if (playListFlag.result) {
      const playListInfo = await getMusicPlayListInfo(url, false);
      originMusicTitle = playListInfo.title;

      do {
        const playListInfoNum = generateRandomNum(0, playListInfo.musicInfo.length - 1);
        musicInfo = await getSingleMusicInfo(playListInfo.musicInfo[playListInfoNum].url ?? '');
        const relatedRandomNum = generateRandomNum(
          1,
          musicInfo.relatedVideosIDlist.length - 5 >= 1 ? musicInfo.relatedVideosIDlist.length - 5 : 2
        );
        playListInfo.musicInfo.splice(playListInfoNum, 1);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        musicInfo.relatedVideosIDlist.sort((_a, _b) => 0.5 - Math.random());
        for (let i = 0; i <= relatedRandomNum; i++)
          relatedplayListInfo.push(await getSingleMusicInfo(musicInfo.relatedVideosIDlist[i], playListNum + i));

        playListNum += relatedRandomNum;
        musicInfo = playListInfo.musicInfo[generateRandomNum(0, playListInfo.musicInfo.length - 1)];
      } while (playListNum <= maxPlayListNum);
      // 曲の時はその曲の関連楽曲をとってくる
    } else {
      musicInfo = await getSingleMusicInfo(url);
      originMusicTitle = musicInfo.title;
      do {
        const relatedRandomNum = generateRandomNum(1, musicInfo.relatedVideosIDlist.length - 5);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        musicInfo.relatedVideosIDlist.sort((_a, _b) => 0.5 - Math.random());
        for (let i = 0; i <= relatedRandomNum; i++)
          relatedplayListInfo.push(await getSingleMusicInfo(musicInfo.relatedVideosIDlist[i], playListNum + i));

        playListNum += relatedRandomNum;
        musicInfo = relatedplayListInfo[generateRandomNum(0, relatedplayListInfo.length - 1)];
      } while (playListNum <= maxPlayListNum);
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
        videosLength: String(relatedplayListInfo.length),
        musicInfo: relatedplayListInfo,
      },
      2
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    Logger.LogSystemError(`recommendCommandMainEventでエラーが発生しました : ${error}`);
    await interaction.editReply({
      embeds: [],
      files: [],
      content: '処理中にエラーが発生しました。再度コマンドを入力してください。',
    });
  }
};
