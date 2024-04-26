import { ChatInputCommandInteraction } from 'discord.js';
import { MusicInfo } from '../../types/musicData';
import { isPlayListFlag } from '../../events/music/musicCommon';
import { getMusicPlayListInfo, getSingleMusicInfo } from '../../events/music/getMusicInfo';
import { playListMusicMainLogic } from '../../events/music/playListMusicMainLogic';
import { createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import { generateRandomNum } from '../../events/common/generateRandomNum';
import { preparingPlayerMessage } from '../../events/discord/embedMessage';

export const recommendCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const url = interaction.options.getString('url') ?? '';
    const voiceChannelId = interaction.options.getChannel('channel')?.id;

    if (!voiceChannelId || !interaction.guildId || !interaction.guild?.voiceAdapterCreator)
      return interaction.editReply('ボイスチャンネルが見つかりません。');

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

    // playerを作成しdisに音をながす
    const player = createAudioPlayer();
    // BOTをVCに接続
    const connection = joinVoiceChannel({
      channelId: voiceChannelId,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild?.voiceAdapterCreator,
      selfDeaf: true,
    });
    connection.subscribe(player);
    // playList再生処理
    await playListMusicMainLogic(interaction, connection, player, relatedMusicInfoList);
  } catch (error) {
    await interaction.editReply({
      embeds: [],
      files: [],
      content: '処理中にエラーが発生しました。再度コマンドを入力してください。',
    });
    console.error(error);
  }
};
