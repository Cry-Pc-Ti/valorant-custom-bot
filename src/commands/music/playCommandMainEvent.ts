import { createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';
import { isPlayListFlag } from '../../events/music/musicCommon';
import { getMusicPlayListInfo, getSingleMusicInfo } from '../../events/music/getMusicInfo';
import { playListMusicMainLogic } from '../../events/music/playListMusicMainLogic';
import { MusicInfo } from '../../types/musicData';
import { singleMusicMainLogic } from '../../events/music/singleMusicMainLogic';
import { Logger } from '../../events/common/log';

// playCommand
export const playCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const url = interaction.options.getString('url');
    const voiceChannelId = interaction.options.getChannel('channel')?.id;
    const shuffleFlag: boolean = interaction.options.getBoolean('shuffle') ?? false;

    if (!url) return interaction.editReply('設定値が不正です。');
    if (!voiceChannelId || !interaction.guildId || !interaction.guild?.voiceAdapterCreator)
      return interaction.editReply('ボイスチャンネルが見つかりません。');

    // プレイリストか曲か判別
    const playListFlag: { result: boolean; urlError: boolean } = isPlayListFlag(url);
    if (playListFlag.urlError)
      return interaction.editReply('こちらの音楽は再生できません。正しいURLを指定してください。');

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

    // プレイリストの場合
    if (playListFlag.result) {
      // URLからプレイリスト情報を取得
      const musicInfoList: MusicInfo[] = await getMusicPlayListInfo(url, shuffleFlag);
      // playList再生処理
      await playListMusicMainLogic(interaction, connection, player, musicInfoList);

      // 1曲の場合
    } else {
      // URLから音楽情報を取得
      const musicInfo: MusicInfo = await getSingleMusicInfo(url);
      // shingleSong再生処理
      await singleMusicMainLogic(interaction, connection, player, musicInfo);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    Logger.LogSystemError(e);
    console.error(`playMusicCommandでエラーが発生しました : ${e}`);
    // それぞれのエラー制御
    if (e.status == '400') return await interaction.channel?.send('音楽情報のメッセージ存在しないため再生できません。');
    else if (e.status == '401') return console.log('401' + e);
    else if (e.status == '410')
      return await interaction.channel?.send('ポリシーに適していないものが含まれるため再生できません。');

    await interaction.channel?.send('処理中にエラーが発生しました。再度コマンドを入力してください。');
  }
};
