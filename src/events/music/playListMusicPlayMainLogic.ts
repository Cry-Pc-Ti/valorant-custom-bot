import { createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType } from 'discord.js';
import { streamPlaylist } from './playBackMusic';
import { PlayListInfo } from '../../types/musicData';
import { Logger } from '../common/log';
import { isHttpError } from '../common/errorUtils';
import { v4 as uuidv4 } from 'uuid';
import { getChannelThumbnails } from './getMusicInfo';
import { setGuildCommandStates } from '../../store/guildCommandStates';
import { COMMAND_NAME_MUSIC } from '../../commands/music/mainMusicCommand';

// 音楽再生
export const playListMusicMainLogic = async (
  interaction: ChatInputCommandInteraction,
  voiceChannelId: string,
  playListInfo: PlayListInfo,
  commandFlg: number
) => {
  try {
    const guildId = interaction.guildId;

    // uuidをuniqueIdとして取得
    const uniqueId = uuidv4();

    // ボタンを作成
    const { buttonRow, buttonRow2 } = createButtonRow(uniqueId);

    const buttonCollector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });

    if (!buttonCollector || !guildId || !interaction.guild?.voiceAdapterCreator)
      return interaction.editReply('ボイスチャンネルが見つかりません。');

    // 全曲のサムネイルを取得
    const channelThumbnails: { [key: string]: string } = await getChannelThumbnails(playListInfo.musicInfo);

    // playerを作成しdisに音をながす
    const player = createAudioPlayer();

    // BOTをVCに接続
    const connection = joinVoiceChannel({
      channelId: voiceChannelId,
      guildId: guildId,
      adapterCreator: interaction.guild?.voiceAdapterCreator,
      selfDeaf: true,
    });
    connection.subscribe(player);

    setGuildCommandStates(guildId, COMMAND_NAME_MUSIC, {
      buttonCollector: buttonCollector,
      buttonRowArray: [buttonRow, buttonRow2],
      uniqueId: uniqueId,
      interaction: interaction,
      replyMessageId: (await interaction.fetchReply()).id,
      musicCommandInfo: {
        player: player,
        commandFlg: commandFlg,
        playListInfo: playListInfo,
        playListFlag: true,
        channelThumbnails: channelThumbnails,
        stopToStartFlag: false,
        songIndex: 0,
        repeatMode: 0,
      },
    });

    // buttonCollector.on('end', async () => {
    //   const state = getCommandStates(guildId, COMMAND_NAME_MUSIC);
    //   if (state && state.buttonCollector === buttonCollector) {
    //     stopPreviousInteraction(guildId, COMMAND_NAME_MUSIC);
    //   }
    // });

    //
    await streamPlaylist(guildId, 0, false);

    // BOTをdiscordから切断
    connection.destroy();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    Logger.LogSystemError(`playListMusicMainLogicでエラーが発生しました : ${error}`);
    if (error.statusCode === 410)
      return await interaction.channel?.send('ポリシーに適していないものが含まれるため再生できません。');
    if (isHttpError(error) && error.status === 400)
      return await interaction.channel?.send('音楽情報のメッセージ存在しないため再生できません。');

    await interaction.channel?.send('処理中にエラーが発生しました。再度コマンドを入力してください。');
  }
};
// ボタンを作成
export const createButtonRow = (uniqueId: string) => {
  const stopPlayMusicButton = new ButtonBuilder()
    .setCustomId(`stopPlayMusicButton_${uniqueId}`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel('停止')
    .setEmoji('⏸');

  const repeatSingleButton = new ButtonBuilder()
    .setCustomId(`repeatSingleButton_${uniqueId}`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel('リピート')
    .setEmoji('🔁');

  const prevPlayMusicButton = new ButtonBuilder()
    .setCustomId(`prevPlayMusicButton_${uniqueId}`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel('前の曲へ')
    .setEmoji('⏮');

  const nextPlayMusicButton = new ButtonBuilder()
    .setCustomId(`nextPlayMusicButton_${uniqueId}`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel('次の曲へ')
    .setEmoji('⏭');

  const showUrlButton = new ButtonBuilder()
    .setCustomId(`showUrlButton_${uniqueId}`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel('URLを表示')
    .setEmoji('🔗');

  const buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
    prevPlayMusicButton,
    stopPlayMusicButton,
    nextPlayMusicButton
  );
  const buttonRow2: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
    repeatSingleButton,
    showUrlButton
  );

  return { buttonRow, buttonRow2 };
};
