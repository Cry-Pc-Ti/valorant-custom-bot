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
    const shuffleFlag: boolean = interaction.options.getBoolean('shuffle') ?? false;

    if (!url) return interaction.editReply('設定値が不正です。');

    // ボイスチャンネルにいない場合は処理しない
    const voiceChannelId = (await interaction.guild?.members.fetch(interaction.user.id))?.voice.channelId;
    if (!voiceChannelId) return interaction.editReply('ボイスチャンネルに参加してください。');

    // プレイリストか曲か判別
    const playListFlag: { result: boolean; urlError: boolean } = isPlayListFlag(url);
    if (playListFlag.urlError)
      return interaction.editReply('こちらの音楽は再生できません。正しいURLを指定してください。');

    // データ収集
    Logger.LogAccessInfo(`${interaction.user.username}(${interaction.user.id})さんが${url} を再生しています。`);

    // プレイリストの場合
    if (playListFlag.result) {
      // URLからプレイリスト情報を取得
      const musicInfoList: MusicInfo[] = await getMusicPlayListInfo(url, shuffleFlag);
      // playList再生処理
      await playListMusicMainLogic(interaction, voiceChannelId, musicInfoList);

      // 1曲の場合
    } else {
      // URLから音楽情報を取得
      const musicInfo: MusicInfo = await getSingleMusicInfo(url);
      // shingleSong再生処理
      await singleMusicMainLogic(interaction, voiceChannelId, musicInfo);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    Logger.LogSystemError(e);
    // それぞれのエラー制御
    if (e.status == '400') return await interaction.editReply('音楽情報のメッセージ存在しないため再生できません。');
    else if (e.status == '410')
      return await interaction.editReply('ポリシーに適していないものが含まれるため再生できません。');

    await interaction.editReply('処理中にエラーが発生しました。再度コマンドを入力してください。');
  }
};
