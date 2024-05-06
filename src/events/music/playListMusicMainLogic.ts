import { AudioPlayerStatus, createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
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
import { musicInfoPlayListMessage } from '../discord/embedMessage';
import { PlayListInfo } from '../../types/musicData';
import ytdl from 'ytdl-core';
import { Logger } from '../common/log';

export const playListMusicMainLogic = async (
  interaction: ChatInputCommandInteraction,
  voiceChannelId: string,
  playListInfo: PlayListInfo,
  commandFlg: number
) => {
  try {
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
      .setEmoji('🔁');

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
      stopPlayMusicButton,
      nextPlayMusicButton
    );
    const buttonRow2: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
      repeatSingleButton
    );
    const buttonCollector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });

    if (!buttonCollector || !interaction.guildId || !interaction.guild?.voiceAdapterCreator)
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

    // 修正するメッセージのIDを取得
    let replyMessageId: string = (await interaction.fetchReply()).id;

    // リピートするかのフラグ 0:デフォルト 1:曲リピートする 2:プレイリストリピートする
    let repeatNumberFlg: number = 0;

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

        // メッセージを削除
        if (interaction.channel?.messages.fetch(replyMessageId))
          await interactionEditMessages(interaction, replyMessageId, '');

        // 次の曲へボタン押下時の処理
        if (buttonInteraction.customId === `nextPlayMusicButton_${uniqueId}`) {
          // PlayerとListenerを削除
          deletePlayerInfo(player);

          // ボタンが再生ボタンだった時停止ボタンに変更
          if (stopPlayMusicButton.data.label === '再生') {
            stopPlayMusicButton.setLabel('停止').setEmoji('⏸');
            interactionEditMessages(interaction, replyMessageId, { components: [buttonRow, buttonRow2] });
          }

          // ボタンがリピート中ボタンだった時リピートボタンに変更;
          if (repeatNumberFlg === 1) {
            repeatNumberFlg = 0;
            repeatSingleButton.setLabel('リピート').setEmoji('🔁');
            interactionEditMessages(interaction, replyMessageId, { components: [buttonRow, buttonRow2] });
          }

          // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
          do {
            for (const musicInfo of playListInfo.musicInfo) {
              if (musicInfo.songIndex > songIndex) {
                // 曲のindexを格納
                songIndex = musicInfo.songIndex;
                // チャンネルアイコンを取得
                const channelThumbnail = (await ytdl.getBasicInfo(musicInfo.id)).videoDetails.author.thumbnails;
                if (!channelThumbnail) return;
                const embed = musicInfoPlayListMessage(
                  playListInfo,
                  [buttonRow, buttonRow2],
                  musicInfo.songIndex,
                  channelThumbnail[0].url,
                  commandFlg
                );
                interaction.channel?.messages.edit(replyMessageId, embed).catch(() => {
                  interaction.channel?.send(embed).then((res) => (replyMessageId = res.id));
                });

                // BOTに音楽を流す
                do {
                  // 音楽再生
                  await playBackMusic(player, musicInfo);
                } while (repeatNumberFlg === 1);
              }
            }
            songIndex = 0;
          } while (repeatNumberFlg === 2);
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
          // PlayerとListenerを削除
          deletePlayerInfo(player);

          // ボタンが再生ボタンだった時停止ボタンに変更
          if (stopPlayMusicButton.data.label === '再生') {
            stopPlayMusicButton.setLabel('停止').setEmoji('⏸');
            interactionEditMessages(interaction, replyMessageId, { components: [buttonRow, buttonRow2] });
          }

          // ボタンがリピート中ボタンだった時リピートボタンに変更;
          if (repeatNumberFlg === 1) {
            repeatNumberFlg = 0;
            repeatSingleButton.setLabel('リピート').setEmoji('🔁');
            interactionEditMessages(interaction, replyMessageId, { components: [buttonRow, buttonRow2] });
          }

          // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
          do {
            for (const musicInfo of playListInfo.musicInfo) {
              if (musicInfo.songIndex >= songIndex - 1) {
                // 曲のindexを格納
                songIndex = musicInfo.songIndex;
                // チャンネルアイコンを取得
                const channelThumbnail = (await ytdl.getBasicInfo(musicInfo.id)).videoDetails.author.thumbnails;
                if (!channelThumbnail) return;
                const embed = musicInfoPlayListMessage(
                  playListInfo,
                  [buttonRow, buttonRow2],
                  musicInfo.songIndex,
                  channelThumbnail[0].url,
                  commandFlg
                );
                interaction.channel?.messages.edit(replyMessageId, embed).catch(() => {
                  interaction.channel?.send(embed).then((res) => (replyMessageId = res.id));
                });
                // リピートフラグがtrueの時無限再生
                do {
                  await playBackMusic(player, musicInfo);
                } while (repeatNumberFlg === 1);
              }
            }
            songIndex = 0;
          } while (repeatNumberFlg === 2);
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
          if (player.state.status === AudioPlayerStatus.Playing) {
            player.pause();
            stopPlayMusicButton.setLabel('再生').setEmoji('▶');
            interactionEditMessages(interaction, replyMessageId, { components: [buttonRow, buttonRow2] });
          } else if (player.state.status === AudioPlayerStatus.Paused) {
            player.unpause();
            stopPlayMusicButton.setLabel('停止').setEmoji('⏸');
            interactionEditMessages(interaction, replyMessageId, { components: [buttonRow, buttonRow2] });
          }
          return;
        }

        // 1曲リピートボタン押下時
        if (buttonInteraction.customId === `repeatSingleButton_${uniqueId}`) {
          repeatNumberFlg++;
          if (repeatNumberFlg >= 3) repeatNumberFlg = 0;
          // メッセージを削除
          if (interaction.channel?.messages.fetch(replyMessageId))
            await interactionEditMessages(interaction, replyMessageId, '');
          if (repeatNumberFlg === 0) {
            repeatSingleButton.setLabel('リピート').setEmoji('🔁');
            interactionEditMessages(interaction, replyMessageId, { components: [buttonRow, buttonRow2] });
          } else if (repeatNumberFlg === 1) {
            repeatSingleButton.setLabel('曲リピート中').setEmoji('🔂');
            interactionEditMessages(interaction, replyMessageId, { components: [buttonRow, buttonRow2] });
          } else if (repeatNumberFlg === 2) {
            repeatSingleButton.setLabel('リストリピート中').setEmoji('🔁');
            interactionEditMessages(interaction, replyMessageId, { components: [buttonRow, buttonRow2] });
          }
          return;
        }
        return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if ((replyMessageId === buttonInteraction.message.id && error.status == '400') || error.status == '404') {
          // 400:DiscordAPIError[40060]: Interaction has already been acknowledged.
          // 404:DiscordAPIError[10062]: Unknown interaction
          await interactionEditMessages(
            interaction,
            replyMessageId,
            `ボタンをもう一度押してください\n(すいません。バグってるので根気よく押してください。動きます。)`
          );
          Logger.LogSystemError(error.message);
          return;
        }
        Logger.LogSystemError(`playListMusicMainLogicでエラーが発生しました : ${error}`);
        await interactionEditMessages(interaction, replyMessageId, {
          content: '処理中にエラーが発生しました。再度コマンドを入力してください。',
          components: [],
          files: [],
          embeds: [],
        });
      }
    });

    // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
    do {
      for (const musicInfo of playListInfo.musicInfo) {
        songIndex = musicInfo.songIndex;
        // チャンネルアイコンを取得
        const channelThumbnail = (await ytdl.getBasicInfo(musicInfo.id)).videoDetails.author.thumbnails;
        if (!channelThumbnail) return;
        const embed = musicInfoPlayListMessage(
          playListInfo,
          [buttonRow, buttonRow2],
          musicInfo.songIndex,
          channelThumbnail[0].url,
          commandFlg
        );
        if (musicInfo.songIndex === 1) await interaction.editReply(embed);
        else
          interaction.channel?.messages.edit(replyMessageId, embed).catch(() => {
            interaction.channel?.send(embed).then((res) => (replyMessageId = res.id));
          });

        // リピートフラグがtrueの時無限再生
        do {
          await playBackMusic(player, musicInfo);
        } while (repeatNumberFlg === 1);
      }
    } while (repeatNumberFlg === 2);
    // 再生完了した際メッセージを送信
    await donePlayerInteractionEditMessages(interaction, replyMessageId);
    // PlayerとListenerを削除
    deletePlayerInfo(player);
    // BOTをdiscordから切断
    connection.destroy();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    Logger.LogSystemError(`playListMusicMainLogicでエラーが発生しました : ${error}`);
    // それぞれのエラー制御
    if (error.status == '400')
      return await interaction.channel?.send('音楽情報のメッセージ存在しないため再生できません。');
    else if (error.status == '410')
      return await interaction.channel?.send('ポリシーに適していないものが含まれるため再生できません。');

    await interaction.channel?.send('処理中にエラーが発生しました。再度コマンドを入力してください。');
  }
};
