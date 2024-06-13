import { ChatInputCommandInteraction } from 'discord.js';
import { checkUrlType, getMusicPlayListInfo, getSingleMusicInfo } from '../../../events/music/getMusicInfo';
import { MusicInfo, PlayListInfo } from '../../../types/musicData';
import { Logger } from '../../../events/common/log';
import { playListMusicMainLogic } from '../../../events/music/playListMusicPlayMainLogic';
import { playListPlayMusicMessage } from '../../../events/discord/embedMessage';
import { singleMusicMainLogic } from '../../../events/music/singleMusicPlayMainLogic';
import { stopPreviousInteraction } from '../../../store/guildCommandStates';
import { COMMAND_NAME_MUSIC } from '../mainMusicCommand';

/**
 * 音楽再生コマンドのメインイベント
 *
 * @param interaction - チャット入力コマンドのインタラクション
 */
export const playCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const guildId = interaction.guildId;
    if (guildId) await stopPreviousInteraction(guildId, COMMAND_NAME_MUSIC);

    const url = interaction.options.getString('url');
    const shuffleFlag: boolean = interaction.options.getString('shuffle') === 'true';

    if (!url) return interaction.editReply('設定値が不正です。');

    // ボイスチャンネルにいない場合は処理しない
    const voiceChannelId = (await interaction.guild?.members.fetch(interaction.user.id))?.voice.channelId;
    if (!voiceChannelId) return interaction.editReply('ボイスチャンネルに参加してください。');

    // プレイリストか曲か判別
    const playListFlag: { result: boolean; urlError: boolean } = checkUrlType(url);
    if (playListFlag.urlError)
      return interaction.editReply('こちらの音楽は再生できません。正しいURLを指定してください。');

    // データ収集
    Logger.LogAccessInfo(`${interaction.user.username}(${interaction.user.id})さんが${url} を再生しています。`);

    // メッセージを作成
    const embed = playListPlayMusicMessage();

    await interaction.editReply(embed);

    // プレイリストの場合
    if (playListFlag.result) {
      // URLからプレイリスト情報を取得
      const playListInfo: PlayListInfo = await getMusicPlayListInfo(url, shuffleFlag);
      // playList再生処理
      await playListMusicMainLogic(interaction, voiceChannelId, playListInfo, 0);

      // 1曲の場合
    } else {
      // URLから音楽情報を取得
      const musicInfo: MusicInfo = await getSingleMusicInfo(url);
      // shingleSong再生処理
      await singleMusicMainLogic(interaction, voiceChannelId, musicInfo);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    Logger.LogSystemError(`playCommandMainEventでエラーが発生しました : ${error}`);

    if (error.statusCode === 400)
      return await interaction.editReply('音楽情報のメッセージ存在しないため再生できません。');
    else if (error.statusCode == 410) return await interaction.editReply('ポリシーに反しているため再生できません。');

    await interaction.editReply('処理中にエラーが発生しました。再度コマンドを入力してください。');
  }
};
