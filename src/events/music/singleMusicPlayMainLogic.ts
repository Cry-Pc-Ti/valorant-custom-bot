import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType } from 'discord.js';

import { interactionEditMessages } from '../discord/interactionMessages';

import { createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';

import { Logger } from '../common/log';
import { musicInfoMessage, donePlayerMessage } from '../discord/embedMessage';
import { playMusicStream, deletePlayerInfo } from './playBackMusic';
import { MusicInfo } from '../../types/musicData';
import { v4 as uuidv4 } from 'uuid';
import { deleteGuildCommandStates, getRepeatModeStates, setGuildCommandStates } from '../../store/guildCommandStates';
import { COMMAND_NAME_MUSIC } from '../../commands/music/mainMusicCommand';

// シングル再生
export const singleMusicMainLogic = async (
  interaction: ChatInputCommandInteraction,
  voiceChannelId: string,
  musicInfo: MusicInfo,
  commandFlg?: number
) => {
  try {
    // 修正するメッセージのIDを取得
    const replyMessageId: string = (await interaction.fetchReply()).id;

    // uuidをuniqueIdとして取得
    const uniqueId = uuidv4();

    // guildIdを取得
    const guildId = interaction.guildId;

    // ボタンを作成
    const { buttonRow } = createButtonRow(uniqueId);

    const buttonCollector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });

    if (!buttonCollector) return;

    if (!guildId || !interaction.guild?.voiceAdapterCreator)
      return interaction.editReply('ボイスチャンネルが見つかりません。');

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
      buttonRowArray: [buttonRow],
      uniqueId: uniqueId,
      interaction: interaction,
      replyMessageId: replyMessageId,
      musicCommandInfo: {
        player: player,
        commandFlg: commandFlg ?? 1,
        musicInfo: [musicInfo],
        playListFlag: false,
        stopToStartFlag: false,
        songIndex: 0,
        repeatMode: 0,
      },
    });
    // guildCommandStates.set(guildId, { player, buttonCollector, interaction, replyMessageId });

    // 音楽情報のメッセージ作成、送信
    const embed = musicInfoMessage(musicInfo, [buttonRow]);
    await interaction.editReply(embed);

    // リピートフラグがtrueの時無限再生
    do {
      // BOTに音楽を流す
      await playMusicStream(player, musicInfo);
    } while (getRepeatModeStates(guildId, COMMAND_NAME_MUSIC) === 1);

    // 再生完了した際メッセージを送信
    const embeds = donePlayerMessage();
    interactionEditMessages(interaction, replyMessageId, embeds);

    // PlayerとListenerを削除
    deletePlayerInfo(player);

    // 情報を削除
    deleteGuildCommandStates(guildId, COMMAND_NAME_MUSIC);
    // BOTをdiscordから切断
    connection.destroy();
  } catch (error) {
    Logger.LogSystemError(`singleMusicMainLogicでエラーが発生しました: ${error}`);
  }
};

// ボタンを作成
const createButtonRow = (uniqueId: string) => {
  // 「一時停止」ボタン
  const stopPlayMusicButton = new ButtonBuilder()
    .setCustomId(`stopPlayMusicButton_${uniqueId}`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel('停止')
    .setEmoji('⏸');

  // 「１曲リピート」ボタン
  const repeatSingleButton = new ButtonBuilder()
    .setCustomId(`repeatSingleButton_${uniqueId}`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel('リピート')
    .setEmoji('🔁');

  // ボタンをActionRowに追加
  const buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
    repeatSingleButton,
    stopPlayMusicButton
  );

  return {
    buttonRow,
  };
};
