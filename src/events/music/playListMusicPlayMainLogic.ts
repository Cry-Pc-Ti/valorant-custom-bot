import { AudioPlayerStatus, createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  ComponentType,
} from 'discord.js';
import {
  donePlayerInteractionEditMessages,
  interactionEditMessages,
  terminateMidwayInteractionEditMessages,
} from '../discord/interactionMessages';
import { CLIENT_ID } from '../../modules/discordModule';
import { deletePlayerInfo, playMusicStream } from './playBackMusic';
import { musicInfoPlayListMessage } from '../discord/embedMessage';
import { PlayListInfo } from '../../types/musicData';
import { Logger } from '../common/log';
import { guildStates } from '../../store/guildStates';
import { isHttpError } from '../common/errorUtils';
import { debounce } from '../common/buttonDebouce';
import { v4 as uuidv4 } from 'uuid';
import { getChannelThumbnails } from './getMusicInfo';

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
    const { buttonRow, buttonRow2, prevPlayMusicButton, nextPlayMusicButton, stopPlayMusicButton, repeatSingleButton } =
      createButtonRow(uniqueId);

    const buttonCollector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });

    if (!buttonCollector || !guildId || !interaction.guild?.voiceAdapterCreator)
      return interaction.editReply('ボイスチャンネルが見つかりません。');

    // 全曲のサムネイルを取得
    const channelThumbnails: { [key: string]: string | null } = await getChannelThumbnails(playListInfo.musicInfo);

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

    // 修正するメッセージのIDを取得
    let replyMessageId: string = (await interaction.fetchReply()).id;

    // リピートするかのフラグ 0:デフォルト 1:曲リピートする 2:プレイリストリピートする
    let repeatMode: number = 0;

    // 再生している曲のindexを取得
    let songIndex: number = 0;

    guildStates.set(guildId, { player, buttonCollector, interaction, replyMessageId });

    // ボタンが押された時の処理
    buttonCollector.on(
      'collect',
      debounce(async (buttonInteraction: ButtonInteraction<CacheType>) => {
        if (!buttonInteraction.customId.endsWith(`_${uniqueId}`)) return;

        try {
          if (!buttonInteraction.replied && !buttonInteraction.deferred) {
            await buttonInteraction.deferUpdate();
          }
          // BOTがVCにいない場合処理しない
          if (!(await interaction.guild?.members.fetch(CLIENT_ID))?.voice.channelId) {
            interactionEditMessages(interaction, buttonInteraction.message.id, {
              content: 'もう一度、再生したい場合はコマンドで再度入力してください。',
              components: [],
            });
            return;
          }

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
            }

            // ボタンがリピート中ボタンだった時リピートボタンに変更
            if (repeatMode === 1) {
              repeatMode = 0;
              repeatSingleButton.setLabel('リピート').setEmoji('🔁');
            }

            // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
            do {
              for (const musicInfo of playListInfo.musicInfo) {
                if (musicInfo.songIndex > songIndex) {
                  // 曲のindexを格納
                  songIndex = musicInfo.songIndex;
                  // 次へと前へのボタンの制御
                  if (songIndex === 1 && playListInfo.musicInfo.length === 1) {
                    prevPlayMusicButton.setDisabled(true);
                    nextPlayMusicButton.setDisabled(true);
                  } else if (songIndex === 1 && playListInfo.musicInfo.length > 1) {
                    prevPlayMusicButton.setDisabled(true);
                    nextPlayMusicButton.setDisabled(false);
                  } else if (songIndex !== 1 && playListInfo.musicInfo.length === songIndex) {
                    prevPlayMusicButton.setDisabled(false);
                    nextPlayMusicButton.setDisabled(true);
                  } else {
                    prevPlayMusicButton.setDisabled(false);
                    nextPlayMusicButton.setDisabled(false);
                  }
                  // 音楽情報をを作成
                  const embed = musicInfoPlayListMessage(
                    playListInfo,
                    [buttonRow, buttonRow2],
                    musicInfo.songIndex,
                    channelThumbnails[musicInfo.id],
                    commandFlg
                  );
                  interaction.channel?.messages.edit(replyMessageId, embed).catch(() => {
                    interaction.channel?.send(embed).then((res) => (replyMessageId = res.id));
                  });

                  // BOTに音楽を流す
                  do {
                    // 音楽再生
                    await playMusicStream(player, musicInfo).catch(async (error) => {
                      if (error.message === 'Status code: 410') {
                        repeatMode = 0;
                        await interactionEditMessages(
                          interaction,
                          replyMessageId,
                          `ポリシーに反しているため「${musicInfo.title}」を飛ばしました。`
                        );
                        return;
                      } else if (
                        error.message === 'The operation was aborted' ||
                        error.message === 'Invalid regular expression: missing /'
                      )
                        return;
                      Logger.LogSystemError(
                        `【${interaction.guild?.name}(${interaction.guild?.id})】playBackMusicでエラーが発生しました: ${error}`
                      );
                      player.stop();
                    });
                  } while (repeatMode === 1);
                }
              }
              songIndex = 0;
            } while (repeatMode === 2);
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
            }

            // ボタンがリピート中ボタンだった時リピートボタンに変更
            if (repeatMode === 1) {
              repeatMode = 0;
              repeatSingleButton.setLabel('リピート').setEmoji('🔁');
            }

            // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
            do {
              for (const musicInfo of playListInfo.musicInfo) {
                if (musicInfo.songIndex >= songIndex - 1) {
                  // 曲のindexを格納
                  songIndex = musicInfo.songIndex;
                  // 次へと前へのボタンの制御
                  if (songIndex === 1 && playListInfo.musicInfo.length === 1) {
                    prevPlayMusicButton.setDisabled(true);
                    nextPlayMusicButton.setDisabled(true);
                  } else if (songIndex === 1 && playListInfo.musicInfo.length > 1) {
                    prevPlayMusicButton.setDisabled(true);
                    nextPlayMusicButton.setDisabled(false);
                  } else if (songIndex !== 1 && playListInfo.musicInfo.length === songIndex) {
                    prevPlayMusicButton.setDisabled(false);
                    nextPlayMusicButton.setDisabled(true);
                  } else {
                    prevPlayMusicButton.setDisabled(false);
                    nextPlayMusicButton.setDisabled(false);
                  }

                  const embed = musicInfoPlayListMessage(
                    playListInfo,
                    [buttonRow, buttonRow2],
                    musicInfo.songIndex,
                    channelThumbnails[musicInfo.id],
                    commandFlg
                  );
                  interaction.channel?.messages.edit(replyMessageId, embed).catch(() => {
                    interaction.channel?.send(embed).then((res) => (replyMessageId = res.id));
                  });
                  // リピートフラグがtrueの時無限再生
                  do {
                    await playMusicStream(player, musicInfo).catch(async (error) => {
                      if (error.message === 'Status code: 410') {
                        repeatMode = 0;
                        await interactionEditMessages(
                          interaction,
                          replyMessageId,
                          `ポリシーに反しているため「${musicInfo.title}」を飛ばしました。`
                        );
                        return;
                      } else if (
                        error.message === 'The operation was aborted' ||
                        error.message === 'Invalid regular expression: missing /'
                      )
                        return;
                      Logger.LogSystemError(`playBackMusicでエラーが発生しました: ${error}`);
                      player.stop();
                    });
                  } while (repeatMode === 1);
                }
              }
              songIndex = 0;
            } while (repeatMode === 2);
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
            } else if (player.state.status === AudioPlayerStatus.Paused) {
              player.unpause();
              stopPlayMusicButton.setLabel('停止').setEmoji('⏸');
            }
            interactionEditMessages(interaction, replyMessageId, { components: [buttonRow, buttonRow2] });
            return;
          }

          // 1曲リピートボタン押下時
          if (buttonInteraction.customId === `repeatSingleButton_${uniqueId}`) {
            repeatMode++;
            if (repeatMode >= 3) repeatMode = 0;

            // メッセージを削除
            if (await interaction.channel?.messages.fetch(replyMessageId)) {
              await interactionEditMessages(interaction, replyMessageId, '');
            }

            const labelsAndEmojis = [
              { label: 'リピート', emoji: '🔁' },
              { label: '曲リピート中', emoji: '🔂' },
              { label: 'リストリピート中', emoji: '🔁' },
            ];

            const { label, emoji } = labelsAndEmojis[repeatMode];
            repeatSingleButton.setLabel(label).setEmoji(emoji);
            interactionEditMessages(interaction, replyMessageId, { components: [buttonRow, buttonRow2] });

            return;
          }

          // プレイリストのURLを表示
          if (buttonInteraction.customId === `showUrlButton_${uniqueId}`) {
            await buttonInteraction.followUp({ content: `${playListInfo.url}`, ephemeral: true });
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          if (error.statusCode === 410) return;
          if (
            replyMessageId === buttonInteraction.message.id ||
            (isHttpError(error) && error.status === 400) ||
            (isHttpError(error) && error.status === 404)
          ) {
            await interactionEditMessages(interaction, replyMessageId, `ボタンをもう一度押してください`);

            if (error instanceof Error) {
              Logger.LogSystemError(error.message);
            }
            return;
          }
          console.log(error);
          Logger.LogSystemError(`playListMusicMainLogicでエラーが発生しました :${error}`);
          await interactionEditMessages(interaction, replyMessageId, {
            content: '処理中にエラーが発生しました。再度コマンドを入力してください。',
            components: [],
            files: [],
            embeds: [],
          });
        }
      }, 500)
    );
    buttonCollector.on('end', async () => {
      const state = guildStates.get(guildId);
      if (state && state.buttonCollector === buttonCollector) {
        await terminateMidwayInteractionEditMessages(state.interaction, state.replyMessageId);
        state.buttonCollector.stop();
        guildStates.delete(guildId);
      }
    });

    // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
    do {
      for (const musicInfo of playListInfo.musicInfo) {
        songIndex = musicInfo.songIndex;

        // 次へと前へのボタンの制御
        if (songIndex === 1 && playListInfo.musicInfo.length === 1) {
          prevPlayMusicButton.setDisabled(true);
          nextPlayMusicButton.setDisabled(true);
        } else if (songIndex === 1 && playListInfo.musicInfo.length > 1) {
          prevPlayMusicButton.setDisabled(true);
          nextPlayMusicButton.setDisabled(false);
        } else if (songIndex !== 1 && playListInfo.musicInfo.length === songIndex) {
          prevPlayMusicButton.setDisabled(false);
          nextPlayMusicButton.setDisabled(true);
        } else {
          prevPlayMusicButton.setDisabled(false);
          nextPlayMusicButton.setDisabled(false);
        }

        const embed = musicInfoPlayListMessage(
          playListInfo,
          [buttonRow, buttonRow2],
          musicInfo.songIndex,
          channelThumbnails[musicInfo.id],
          commandFlg
        );
        if (musicInfo.songIndex === 1) await interaction.editReply(embed);
        else
          interaction.channel?.messages.edit(replyMessageId, embed).catch(() => {
            interaction.channel?.send(embed).then((res) => (replyMessageId = res.id));
          });

        // リピートフラグがtrueの時無限再生
        do {
          await playMusicStream(player, musicInfo).catch(async (error) => {
            if (error.message === 'Status code: 410') {
              repeatMode = 0;
              await interactionEditMessages(
                interaction,
                replyMessageId,
                `ポリシーに反しているため「${musicInfo.title}」を飛ばしました。`
              );
              return;
            } else if (
              error.message === 'The operation was aborted' ||
              error.message === 'Invalid regular expression: missing /'
            )
              return;
            Logger.LogSystemError(`playBackMusicでエラーが発生しました: ${error}`);
            player.stop();
          });
        } while (repeatMode === 1);
      }
    } while (repeatMode === 2);
    // 再生完了した際メッセージを送信
    await donePlayerInteractionEditMessages(interaction, replyMessageId);
    // PlayerとListenerを削除
    deletePlayerInfo(player);
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
const createButtonRow = (uniqueId: string) => {
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

  return { buttonRow, buttonRow2, prevPlayMusicButton, nextPlayMusicButton, stopPlayMusicButton, repeatSingleButton };
};
