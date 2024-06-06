import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  ComponentType,
} from 'discord.js';
import { CLIENT_ID } from '../../modules/discordModule';
import { interactionEditMessages } from '../discord/interactionMessages';
import { debounce } from '../common/buttonDebouce';
import { guildStates } from '../../store/guildStates';
import { AudioPlayerStatus, createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import { isHttpError } from '../common/errorUtils';
import { Logger } from '../common/log';
import { musicInfoMessage, donePlayerMessage } from '../discord/embedMessage';
import { playMusicStream, deletePlayerInfo } from './playBackMusic';
import { MusicInfo } from '../../types/musicData';
import { v4 as uuidv4 } from 'uuid';

// シングル再生
export const singleMusicMainLogic = async (
  interaction: ChatInputCommandInteraction,
  voiceChannelId: string,
  musicInfo: MusicInfo
) => {
  try {
    // 修正するメッセージのIDを取得
    const replyMessageId: string = (await interaction.fetchReply()).id;

    // リピートするかのフラグ
    let repeatFlag: boolean = false;

    // uuidをuniqueIdとして取得
    const uniqueId = uuidv4();

    const guildId = interaction.guildId;

    // ボタンを作成
    const { buttonRow, stopPlayMusicButton, repeatSingleButton } = createButtonRow(uniqueId);

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

    guildStates.set(guildId, { player, buttonCollector, interaction, replyMessageId });

    // ボタンが押された時の処理
    buttonCollector.on(
      'collect',
      debounce(async (buttonInteraction: ButtonInteraction<CacheType>) => {
        try {
          if (!buttonInteraction.replied && !buttonInteraction.deferred) {
            await buttonInteraction.deferUpdate();
          }

          // BOTがVCにいない場合処理しない
          if (!(await interaction.guild?.members.fetch(CLIENT_ID))?.voice.channelId) {
            interactionEditMessages(
              interaction,
              buttonInteraction.message.id,
              'もう一度、再生したい場合はコマンドで再度入力してください。'
            );
            interactionEditMessages(interaction, buttonInteraction.message.id, { components: [] });
            return;
          }

          // 他メッセージのボタン押されたときに処理しない
          if (replyMessageId !== buttonInteraction.message.id) return;

          // メッセージを削除
          if (interaction.channel?.messages.fetch(replyMessageId))
            await interactionEditMessages(interaction, replyMessageId, '');

          // 再生/一時停止ボタン押下時
          if (buttonInteraction.customId === `stopPlayMusicButton_${uniqueId}`) {
            if (player.state.status === AudioPlayerStatus.Playing) {
              player.pause();
              stopPlayMusicButton.setLabel('再生').setEmoji('▶');
            } else if (player.state.status === AudioPlayerStatus.Paused) {
              player.unpause();
              stopPlayMusicButton.setLabel('停止').setEmoji('⏸');
            }
            interactionEditMessages(interaction, replyMessageId, { components: [buttonRow] });
            return;
          }
          // リピートボタン押下時
          if (buttonInteraction.customId === `repeatSingleButton_${uniqueId}`) {
            repeatFlag = !repeatFlag;
            repeatSingleButton.setLabel(repeatFlag ? 'リピート中' : 'リピート').setEmoji('🔂');
            interactionEditMessages(interaction, replyMessageId, { components: [buttonRow] });
            return;
          }
          return;
        } catch (error) {
          if (error instanceof Error) {
            Logger.LogSystemError(`singleMusicMainLogicでエラーが発生しました : ${error}`);
            if (
              (replyMessageId === buttonInteraction.message.id && isHttpError(error) && error.status === 400) ||
              (isHttpError(error) && error.status === 404)
            ) {
              Logger.LogSystemError(error.message);
              await interactionEditMessages(interaction, replyMessageId, 'ボタンをもう一度押してください');
              return;
            }
          }
        }
      }, 500)
    );

    // 音楽情報のメッセージ作成、送信
    const embed = musicInfoMessage(musicInfo, [buttonRow]);
    await interaction.editReply(embed);

    // リピートフラグがtrueの時無限再生
    do {
      // BOTに音楽を流す
      await playMusicStream(player, musicInfo);
    } while (repeatFlag);

    // 再生完了した際メッセージを送信
    const embeds = donePlayerMessage();
    interactionEditMessages(interaction, replyMessageId, embeds);

    // PlayerとListenerを削除
    deletePlayerInfo(player);
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
    .setEmoji('🔂');

  // ボタンをActionRowに追加
  const buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
    repeatSingleButton,
    stopPlayMusicButton
  );

  return {
    buttonRow,
    stopPlayMusicButton,
    repeatSingleButton,
  };
};
