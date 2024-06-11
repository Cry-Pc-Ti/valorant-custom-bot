import { ButtonInteraction } from 'discord.js';
import { getCommandStates } from '../store/guildCommandStates';
import {
  nextPlayMusicButton,
  prevPlayMusicButton,
  repeatSingleButton,
  showUrlButton,
  stopPlayMusicButton,
} from './music/musicButtonHandlers';
import { interactionEditMessages } from '../events/discord/interactionMessages';
import { CLIENT_ID } from '../modules/discordModule';
import { COMMAND_NAME_MUSIC } from '../commands/music/mainMusicCommand';
import { isHttpError } from '../events/common/errorUtils';
import { Logger } from '../events/common/log';
import { COMMAND_NAME_VALORANT } from '../commands/valorant/mainValorantCommand';
import { moveAttackersToChannel, moveDefendersToChannel } from './valorant/moveMembersButtonHandlers';

export const buttonHandlers = async (interaction: ButtonInteraction) => {
  if (!interaction.replied && !interaction.deferred) {
    await interaction.deferUpdate();
  }
  const { customId, guildId } = interaction;
  if (!guildId) return;

  try {
    //  customIdからcommandNameを取得
    const commandName = determineCommandName(customId);

    if (commandName === COMMAND_NAME_MUSIC) {
      // 音楽用のボタンでBOTがVCにいない場合処理しない
      if (!(await interaction.guild?.members.fetch(CLIENT_ID))?.voice.channelId) {
        interactionEditMessages(interaction, interaction.message.id, {
          content: 'もう一度、再生したい場合はコマンドで再度入力してください。',
          components: [],
        });
        return;
      }
    }

    const commandStates = getCommandStates(guildId, commandName);

    if (!commandStates) return;

    // 過去のボタンを押されている場合処理しない
    if (!interaction.customId.endsWith(`_${commandStates.uniqueId}`)) {
      interactionEditMessages(interaction, interaction.message.id, {
        content: 'もう一度、再生したい場合はコマンドで再度入力してください。',
        components: [],
      });
      return;
    }
    // メッセージを削除
    if (interaction.channel?.messages.fetch(commandStates.replyMessageId))
      await interactionEditMessages(commandStates.interaction, commandStates.replyMessageId, '');

    // 次の曲へボタン押下時の処理
    if (customId === `nextPlayMusicButton_${commandStates.uniqueId}`) {
      await nextPlayMusicButton(interaction);
      return;
    }
    // 前の曲へボタン押下時の処理
    if (customId === `prevPlayMusicButton_${commandStates.uniqueId}`) {
      await prevPlayMusicButton(interaction);
      return;
    }
    // 停止ボタン押下時の処理
    if (customId === `stopPlayMusicButton_${commandStates.uniqueId}`) {
      await stopPlayMusicButton(interaction);
      return;
    }
    // 1曲リピートボタン押下時の処理
    if (customId === `repeatSingleButton_${commandStates.uniqueId}`) {
      await repeatSingleButton(interaction);
      return;
    }
    // URLを表示ボタン押下時
    if (customId === `showUrlButton_${commandStates.uniqueId}`) {
      await showUrlButton(interaction);
      return;
    }
    // アタッカーサイドボタン押下時
    if (customId === `attacker_${commandStates.uniqueId}`) {
      await moveAttackersToChannel(interaction);
      return;
    }
    // ディフェンダーサイドボタン押下時
    if (customId === `difender_${commandStates.uniqueId}`) {
      await moveDefendersToChannel(interaction);
      return;
    }
    return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const commandStates = getCommandStates(guildId, COMMAND_NAME_MUSIC);
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
    Logger.LogSystemError(`buttonHandlersでエラーが発生しました :${error}`);
    await interactionEditMessages(interaction, commandStates.replyMessageId, {
      content: '処理中にエラーが発生しました。再度コマンドを入力してください。',
      components: [],
      files: [],
      embeds: [],
    });
  }
};

// customIdに基づいてコマンド名を決定するロジックを実装
const determineCommandName = (customId: string): string => {
  if (
    customId.startsWith('nextPlayMusicButton') ||
    customId.startsWith('prevPlayMusicButton') ||
    customId.startsWith('stopPlayMusicButton') ||
    customId.startsWith('repeatSingleButton') ||
    customId.startsWith('showUrlButton')
  ) {
    return COMMAND_NAME_MUSIC;
  } else if (customId.startsWith('attacker') || customId.startsWith('difender')) {
    return COMMAND_NAME_VALORANT;
  }
  return '';
};
