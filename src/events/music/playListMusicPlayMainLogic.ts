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
import { interactionEditMessages } from '../discord/interactionMessages';
import { CLIENT_ID } from '../../modules/discordModule';
import { streamPlaylist } from './playBackMusic';
import { PlayListInfo } from '../../types/musicData';
import { Logger } from '../common/log';
import { isHttpError } from '../common/errorUtils';
import { debounce } from '../common/buttonDebouce';
import { v4 as uuidv4 } from 'uuid';
import { getChannelThumbnails } from './getMusicInfo';
import {
  getCommandStates,
  setGuildCommandStates,
  setStopToStartFlagStates,
  stopPreviousInteraction,
} from '../../store/guildCommandStates';
import { COMMAND_NAME } from '../../commands/music/mainMusicCommand';

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

    setGuildCommandStates(guildId, COMMAND_NAME, {
      buttonCollector: buttonCollector,
      interaction: interaction,
      replyMessageId: (await interaction.fetchReply()).id,
      musicCommandInfo: {
        player: player,
        commandFlg: commandFlg,
        buttonRowArray: [buttonRow, buttonRow2],
        playListInfo: playListInfo,
        uniqueId: uniqueId,
        channelThumbnail: channelThumbnails[0],
        stopToStartFlag: false,
        songIndex: 0,
        repeatMode: 0,
      },
    });

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

          // 次の曲へボタン押下時の処理
          if (buttonInteraction.customId === `nextPlayMusicButton_${uniqueId}`) {
            const commandStates = getCommandStates(guildId, COMMAND_NAME);
            const musicCommandInfo = commandStates?.musicCommandInfo;

            if (!commandStates || !musicCommandInfo) return;

            // playListを再生する処理
            await streamPlaylist(guildId, ++musicCommandInfo.songIndex, true);

            // BOTをdiscordから切断
            connection.destroy();

            return;
          }
          // 前の曲へボタン押下時の処理
          if (buttonInteraction.customId === `prevPlayMusicButton_${uniqueId}`) {
            const commandStates = getCommandStates(guildId, COMMAND_NAME);
            const musicCommandInfo = commandStates?.musicCommandInfo;
            if (!commandStates || !musicCommandInfo) return;

            // playListを再生する処理
            await streamPlaylist(guildId, --musicCommandInfo.songIndex, true);

            // BOTをdiscordから切断
            connection.destroy();

            return;
          }
          // 再生/停止ボタン押下時
          if (buttonInteraction.customId === `stopPlayMusicButton_${uniqueId}`) {
            const commandStates = getCommandStates(guildId, COMMAND_NAME);
            const musicCommandInfo = commandStates?.musicCommandInfo;
            if (!commandStates || !musicCommandInfo) return;

            if (commandStates.musicCommandInfo?.player.state.status === AudioPlayerStatus.Playing) {
              commandStates.musicCommandInfo?.player.pause();
              musicCommandInfo.buttonRowArray[0].components[1].label = '再生';
              musicCommandInfo.buttonRowArray[0].components[1].emoji.name = '▶';
              setStopToStartFlagStates(guildId, COMMAND_NAME, true);
            } else if (commandStates.musicCommandInfo?.player.state.status === AudioPlayerStatus.Paused) {
              commandStates.musicCommandInfo?.player.unpause();
              musicCommandInfo.buttonRowArray[0].components[1].label = '停止';
              musicCommandInfo.buttonRowArray[0].components[1].emoji.name = '⏸';
              setStopToStartFlagStates(guildId, COMMAND_NAME, false);
            }
            // メッセージ送信
            interactionEditMessages(commandStates.interaction, commandStates.replyMessageId, {
              components: musicCommandInfo.buttonRowArray,
            });
            return;
          }

          // 1曲リピートボタン押下時
          if (buttonInteraction.customId === `repeatSingleButton_${uniqueId}`) {
            const commandStates = getCommandStates(guildId, COMMAND_NAME);
            const musicCommandInfo = commandStates?.musicCommandInfo;
            if (!commandStates || !musicCommandInfo) return;

            musicCommandInfo.repeatMode++;
            if (musicCommandInfo.repeatMode >= 3) musicCommandInfo.repeatMode = 0;

            // メッセージを削除
            if (await interaction.channel?.messages.fetch(commandStates.replyMessageId)) {
              await interactionEditMessages(commandStates.interaction, commandStates.replyMessageId, '');
            }

            const labelsAndEmojis = [
              { label: 'リピート', emoji: '🔁' },
              { label: '曲リピート中', emoji: '🔂' },
              { label: 'リストリピート中', emoji: '🔁' },
            ];

            const { label, emoji } = labelsAndEmojis[musicCommandInfo.repeatMode];

            musicCommandInfo.buttonRowArray[1].components[0].label = label;
            musicCommandInfo.buttonRowArray[1].components[0].emoji.name = emoji;

            interactionEditMessages(commandStates.interaction, commandStates.replyMessageId, {
              components: musicCommandInfo.buttonRowArray,
            });
            setGuildCommandStates(guildId, COMMAND_NAME, {
              buttonCollector: commandStates.buttonCollector,
              interaction: commandStates.interaction,
              replyMessageId: commandStates.replyMessageId,
              musicCommandInfo: musicCommandInfo,
            });

            return;
          }

          // プレイリストのURLを表示
          if (buttonInteraction.customId === `showUrlButton_${uniqueId}`) {
            await buttonInteraction.followUp({ content: `${playListInfo.url}`, ephemeral: true });
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          const commandStates = getCommandStates(guildId, COMMAND_NAME);
          const musicCommandInfo = commandStates?.musicCommandInfo;
          if (!commandStates || !musicCommandInfo) return;

          if (error.statusCode === 410) return;
          if ((isHttpError(error) && error.status === 400) || (isHttpError(error) && error.status === 404)) {
            await interactionEditMessages(interaction, commandStates.replyMessageId, `ボタンをもう一度押してください`);

            if (error instanceof Error) {
              Logger.LogSystemError(error.message);
            }
            return;
          }
          console.log(error);
          Logger.LogSystemError(`playListMusicMainLogicでエラーが発生しました :${error}`);
          await interactionEditMessages(interaction, commandStates.replyMessageId, {
            content: '処理中にエラーが発生しました。再度コマンドを入力してください。',
            components: [],
            files: [],
            embeds: [],
          });
        }
      }, 500)
    );
    buttonCollector.on('end', async () => {
      const state = getCommandStates(guildId, COMMAND_NAME);
      if (state && state.buttonCollector === buttonCollector) {
        stopPreviousInteraction(guildId, COMMAND_NAME);
      }
    });

    if (!(await streamPlaylist(guildId, 0, false))) {
      return;
    }

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
