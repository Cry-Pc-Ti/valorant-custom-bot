import { AudioPlayerStatus, createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
} from 'discord.js';
import { interactionEditMessages } from '../discord/interactionMessages';
import { CLIENT_ID } from '../../modules/discordModule';
import { donePlayerMessage, musicInfoMessage } from '../discord/embedMessage';
import { deletePlayerInfo, playBackMusic } from './playBackMusic';
import { MusicInfo } from '../../types/musicData';
import { Logger } from '../common/log';

export const singleMusicMainLogic = async (
  interaction: ChatInputCommandInteraction,
  voiceChannelId: string,
  musicInfo: MusicInfo
) => {
  try {
    // 修正するメッセージのIDを取得
    const replyMessageId: string = (await interaction.fetchReply()).id;

    // リピートするかのフラグ
    let repeatFlg: boolean = false;

    // DateをuniqueIdとして取得
    const uniqueId = Date.now();

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

    const buttonCollector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });

    if (!buttonCollector) return;

    if (!interaction.guildId || !interaction.guild?.voiceAdapterCreator)
      return interaction.editReply('ボイスチャンネルが見つかりません。');

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

    // ボタンが押された時の処理
    buttonCollector.on('collect', async (buttonInteraction: ButtonInteraction) => {
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

        // 再生/一時停止ボタン押下時
        if (buttonInteraction.customId === `stopPlayMusicButton_${uniqueId}`) {
          // メッセージを削除
          await interaction.editReply('');
          if (player.state.status === AudioPlayerStatus.Playing) {
            player.pause();
            stopPlayMusicButton.setLabel('再生').setEmoji('▶');
            interaction.editReply({ components: [buttonRow] });
          } else if (player.state.status === AudioPlayerStatus.Paused) {
            player.unpause();
            stopPlayMusicButton.setLabel('停止').setEmoji('⏸');
            interaction.editReply({ components: [buttonRow] });
          }
          return;
        }
        // リピートボタン押下時
        if (buttonInteraction.customId === `repeatSingleButton_${uniqueId}`) {
          repeatFlg = !repeatFlg;
          await interaction.editReply('');
          if (repeatFlg) {
            repeatSingleButton.setLabel('リピート中').setEmoji('🔂');
            interaction.editReply({ components: [buttonRow] });
          } else {
            repeatSingleButton.setLabel('リピート').setEmoji('🔂');
            interaction.editReply({ components: [buttonRow] });
          }
          return;
        }
        return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (replyMessageId === buttonInteraction.message.id) {
          if (error.status == '400' || error.status == '404') {
            // 400:DiscordAPIError[40060]: Interaction has already been acknowledged
            // 404:Unknown interaction
            Logger.LogSystemError(error.message);
            await interaction.editReply('ボタンをもう一度押してください');
            return;
          }
          Logger.LogSystemError(`singleMusicMainLogicでエラーが発生しました : ${error}`);
          //  [code: 'ABORT_ERR']AbortError: The operation was aborted
        }
      }
    });

    // 音楽情報のメッセージ作成、送信
    const embed = musicInfoMessage(musicInfo, [buttonRow]);
    await interaction.editReply(embed);

    // リピートフラグがtrueの時無限再生
    do {
      // BOTに音楽を流す
      await playBackMusic(player, musicInfo);
    } while (repeatFlg);

    // 再生完了した際メッセージを送信
    const embeds = donePlayerMessage();
    await interaction.editReply(embeds);

    // PlayerとListenerを削除
    deletePlayerInfo(player);
    // BOTをdiscordから切断
    connection.destroy();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    Logger.LogSystemError(`singleMusicMainLogicでエラーが発生しました : ${error}`);
    // それぞれのエラー制御
    if (error.status == '400') return interaction.editReply('音楽情報のメッセージ存在しないため再生できません。');
    else if (error.status == '410')
      return interaction.editReply('ポリシーに適していないものが含まれるため再生できません。');

    interaction.editReply('処理中にエラーが発生しました。再度コマンドを入力してください。');
  }
};
