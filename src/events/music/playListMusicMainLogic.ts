import { AudioPlayer, AudioPlayerStatus, VoiceConnection } from '@discordjs/voice';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
} from 'discord.js';
import { donePlayerInteractionEditMessages, interactionEditMessages } from '../discord/interactionMessages';
import { CLIENT_ID } from '../../modules/discordModule';
import { deletePlayerInfo, playBackMusic } from './playBackMusic';
import { musicInfoMessage } from '../discord/embedMessage';
import { MusicInfo } from '../../types/musicData';
import ytdl from 'ytdl-core';

export const playListMusicMainLogic = async (
  interaction: ChatInputCommandInteraction,
  connection: VoiceConnection,
  player: AudioPlayer,
  musicInfoList: MusicInfo[]
) => {
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

  // 「前の曲へ」ボタン
  const prevPlayMusicButton = new ButtonBuilder()
    .setCustomId(`prevPlayMusicButton_${uniqueId}`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel('前の曲へ')
    .setEmoji('⏮');

  // 「次の曲へ」ボタン
  const nextPlayMusicButton = new ButtonBuilder()
    .setCustomId(`nextPlayMusicButton_${uniqueId}`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel('次の曲へ')
    .setEmoji('⏭');

  // ボタンをActionRowに追加
  const buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
    prevPlayMusicButton,
    repeatSingleButton,
    stopPlayMusicButton,
    nextPlayMusicButton
  );
  const buttonCollector = interaction.channel?.createMessageComponentCollector({
    componentType: ComponentType.Button,
  });

  if (!buttonCollector) return;

  // 修正するメッセージのIDを取得
  let replyMessageId: string = (await interaction.fetchReply()).id;

  // リピートするかのフラグ
  let repeatFlg: boolean = false;

  // 再生している曲のindexを取得
  let songIndex: number;

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

      // 次の曲へボタン押下時の処理
      if (buttonInteraction.customId === `nextPlayMusicButton_${uniqueId}`) {
        // メッセージを削除
        if (interaction.channel?.messages.fetch(replyMessageId))
          await interactionEditMessages(interaction, replyMessageId, '');

        // PlayerとListenerを削除
        deletePlayerInfo(player);

        // ボタンが再生ボタンだった時停止ボタンに変更
        if (stopPlayMusicButton.data.label === '再生') {
          stopPlayMusicButton.setLabel('停止').setEmoji('⏸');
          interactionEditMessages(interaction, replyMessageId, { components: [buttonRow] });
        }

        // ボタンがリピート中ボタンだった時リピートボタンに変更
        if (repeatFlg) {
          repeatFlg = false;
          repeatSingleButton.setLabel('リピート').setEmoji('🔂');
          interactionEditMessages(interaction, replyMessageId, { components: [buttonRow] });
        }

        // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
        for (const musicInfo of musicInfoList) {
          if (musicInfo.songIndex > songIndex) {
            // 曲のindexを格納
            songIndex = musicInfo.songIndex;
            // チャンネルアイコンを取得
            const channelThumbnail = (await ytdl.getBasicInfo(musicInfo.id)).videoDetails.author.thumbnails;
            const embed = musicInfoMessage(
              musicInfo,
              buttonRow,
              musicInfo.songIndex,
              musicInfoList.length,
              channelThumbnail ? channelThumbnail[0].url : null
            );
            interaction.channel?.messages.edit(replyMessageId, embed).catch(() => {
              interaction.channel?.send(embed).then((res) => {
                replyMessageId = res.id;
              });
            });

            // BOTに音楽を流す
            do {
              // 音楽再生
              await playBackMusic(player, musicInfo);
            } while (repeatFlg);
          }
        }
        // 再生完了した際メッセージを送信
        await donePlayerInteractionEditMessages(interaction, replyMessageId);

        // playerを削除する。
        player.stop();
        // BOTをdiscordから切断
        connection.destroy();

        return;
      }
      // 前の曲へボタン押下時の処理
      if (buttonInteraction.customId === `prevPlayMusicButton_${uniqueId}`) {
        // メッセージを削除
        if (interaction.channel?.messages.fetch(replyMessageId))
          await interactionEditMessages(interaction, replyMessageId, '');

        // PlayerとListenerを削除
        deletePlayerInfo(player);

        // ボタンが再生ボタンだった時停止ボタンに変更
        if (stopPlayMusicButton.data.label === '再生') {
          stopPlayMusicButton.setLabel('停止').setEmoji('⏸');
          interactionEditMessages(interaction, replyMessageId, { components: [buttonRow] });
        }

        // ボタンがリピート中ボタンだった時リピートボタンに変更
        if (repeatFlg) {
          repeatFlg = false;
          repeatSingleButton.setLabel('リピート').setEmoji('🔂');
          interactionEditMessages(interaction, replyMessageId, { components: [buttonRow] });
        }

        // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
        for (const musicInfo of musicInfoList) {
          if (musicInfo.songIndex >= songIndex - 1) {
            // 曲のindexを格納
            songIndex = musicInfo.songIndex;
            // チャンネルアイコンを取得
            const channelThumbnail = (await ytdl.getBasicInfo(musicInfo.id)).videoDetails.author.thumbnails;
            const embed = musicInfoMessage(
              musicInfo,
              buttonRow,
              musicInfo.songIndex,
              musicInfoList.length,
              channelThumbnail ? channelThumbnail[0].url : null
            );
            interaction.channel?.messages.edit(replyMessageId, embed).catch(() => {
              interaction.channel?.send(embed).then((res) => {
                replyMessageId = res.id;
              });
            });
            // リピートフラグがtrueの時無限再生
            do {
              await playBackMusic(player, musicInfo);
            } while (repeatFlg);
          }
        }
        // 再生完了した際メッセージを送信
        await donePlayerInteractionEditMessages(interaction, replyMessageId);
        // PlayerとListenerを削除
        deletePlayerInfo(player);
        // BOTをdiscordから切断
        connection.destroy();

        return;
      }
      // 再生/停止ボタン押下時
      if (buttonInteraction.customId === `stopPlayMusicButton_${uniqueId}`) {
        // メッセージを削除
        if (interaction.channel?.messages.fetch(replyMessageId))
          await interactionEditMessages(interaction, replyMessageId, '');

        if (player.state.status === AudioPlayerStatus.Playing) {
          player.pause();
          stopPlayMusicButton.setLabel('再生').setEmoji('▶');
          interactionEditMessages(interaction, replyMessageId, { components: [buttonRow] });
          return;
        } else if (player.state.status === AudioPlayerStatus.Paused) {
          player.unpause();
          stopPlayMusicButton.setLabel('停止').setEmoji('⏸');
          interactionEditMessages(interaction, replyMessageId, { components: [buttonRow] });
          return;
        }
      }

      // 1曲リピートボタン押下時
      if (buttonInteraction.customId === `repeatSingleButton_${uniqueId}`) {
        repeatFlg = !repeatFlg;
        if (interaction.channel?.messages.fetch(replyMessageId))
          await interactionEditMessages(interaction, replyMessageId, '');
        if (repeatFlg) {
          repeatSingleButton.setLabel('リピート中').setEmoji('🔂');
          interactionEditMessages(interaction, replyMessageId, { components: [buttonRow] });
        } else {
          repeatSingleButton.setLabel('リピート').setEmoji('🔂');
          interactionEditMessages(interaction, replyMessageId, { components: [buttonRow] });
        }
        return;
      }
      return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (replyMessageId === buttonInteraction.message.id) {
        if (e.status == '400' || e.status == '404') {
          // 400:DiscordAPIError[40060]: Interaction has already been acknowledged.
          // 404:DiscordAPIError[10062]: Unknown interaction
          await interactionEditMessages(interaction, replyMessageId, 'ボタンをもう一度押してください');
          return;
        } else if (e.status == '401') {
          console.log('401' + e);
          return;
        }
        //  [code: 'ABORT_ERR']AbortError: The operation was aborted
      }
    }
  });
  // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
  for (const musicInfo of musicInfoList) {
    songIndex = musicInfo.songIndex;
    // チャンネルアイコンを取得
    const channelThumbnail = (await ytdl.getBasicInfo(musicInfo.id)).videoDetails.author.thumbnails;
    const embed = musicInfoMessage(
      musicInfo,
      buttonRow,
      musicInfo.songIndex,
      musicInfoList.length,
      channelThumbnail ? channelThumbnail[0].url : null
    );
    if (musicInfo.songIndex === 1) await interaction.editReply(embed);
    else
      interaction.channel?.messages.edit(replyMessageId, embed).catch(() => {
        interaction.channel?.send(embed).then((res) => {
          replyMessageId = res.id;
        });
      });

    // リピートフラグがtrueの時無限再生
    do {
      await playBackMusic(player, musicInfo);
    } while (repeatFlg);
  }
  // 再生完了した際メッセージを送信
  await donePlayerInteractionEditMessages(interaction, replyMessageId);
  // PlayerとListenerを削除
  deletePlayerInfo(player);
  // BOTをdiscordから切断
  connection.destroy();
};
