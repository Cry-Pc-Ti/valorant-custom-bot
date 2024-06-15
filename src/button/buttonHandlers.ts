import { ButtonInteraction } from 'discord.js';
import { getCommandStates } from '../store/guildCommandStates';
import {
  nextPlayMusicButton,
  prevPlayMusicButton,
  repeatSingleButton,
  showUrlButton,
  stopPlayMusicButton,
} from './music/musicButtonHandlers';
import { interactionEditMessages, interactionFetchMessages } from '../events/discord/interactionMessages';
import { CLIENT_ID } from '../modules/discordModule';
import { COMMAND_NAME_MUSIC } from '../commands/music/mainMusicCommand';
import { isHttpError } from '../events/common/errorUtils';
import { Logger } from '../events/common/log';
import { COMMAND_NAME_VALORANT } from '../commands/valorant/mainValorantCommand';
import { moveAttackersToChannel, moveDefendersToChannel } from './valorant/moveMembersButtonHandlers';
import { getCooldownTimeLeft, isCooldownActive, setCooldown } from '../events/common/cooldowns';

/**
 * ボタンのインタラクションを処理する関数
 *
 * @param interaction - ボタンインタラクション
 */
export const buttonHandlers = async (interaction: ButtonInteraction) => {
  // if (!interaction.replied && !interaction.deferred) {
  //   await interaction.deferUpdate();
  // }
  await interaction.deferUpdate();

  const { customId, guildId } = interaction;

  if (!guildId) return;
  try {
    // customIdからcommandNameを取得
    const commandName = determineCommandName(customId);
    if (!commandName) return;

    const commandStates = getCommandStates(guildId, commandName);

    if (
      !commandStates ||
      (commandName === COMMAND_NAME_MUSIC && !(await interaction.guild?.members.fetch(CLIENT_ID))?.voice.channelId) ||
      !interaction.customId.endsWith(`_${commandStates?.uniqueId}`)
    ) {
      return await interactionEditMessages(interaction, interaction.message.id, {
        content: '再度コマンドを入力してください',
        components: [],
      });
    }

    // コマンドごとのクールダウン時間（ミリ秒）
    const commandCooldowns = new Map<string, number>([
      [COMMAND_NAME_MUSIC, 3000], // 4秒
      [COMMAND_NAME_VALORANT, 1000], // 1秒
    ]);

    // スパム対策
    if (isCooldownActive(commandName, commandStates.uniqueId, commandCooldowns)) {
      const timeLeft = getCooldownTimeLeft(commandName, commandStates.uniqueId, commandCooldowns);
      return await interactionEditMessages(interaction, interaction.message.id, {
        content: `ボタンが連打されています。\nあと${timeLeft.toFixed(1)}秒お待ちください。`,
      });
    }

    setCooldown(commandName, commandStates.uniqueId, commandCooldowns);
    const replyMessageIdFlg = await interactionFetchMessages(interaction, commandStates.replyMessageId);

    // メッセージを削除
    if (replyMessageIdFlg) await interactionEditMessages(commandStates.interaction, commandStates.replyMessageId, '');

    await processButtonInteraction(customId, commandStates.uniqueId, interaction);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    await handleError(interaction, guildId, error);
  }
};
/**
 * カスタムIDからコマンド名を決定する関数
 *
 * @param customId - カスタムID
 * @returns コマンド名
 */
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

/**
 * ボタンインタラクションを処理する関数
 *
 * @param customId - カスタムID
 * @param uniqueId - 一意なID
 * @param interaction - ボタンインタラクション
 */
const processButtonInteraction = async (customId: string, uniqueId: string, interaction: ButtonInteraction) => {
  if (customId === `nextPlayMusicButton_${uniqueId}`) {
    await nextPlayMusicButton(interaction);
  } else if (customId === `prevPlayMusicButton_${uniqueId}`) {
    await prevPlayMusicButton(interaction);
  } else if (customId === `stopPlayMusicButton_${uniqueId}`) {
    await stopPlayMusicButton(interaction);
  } else if (customId === `repeatSingleButton_${uniqueId}`) {
    await repeatSingleButton(interaction);
  } else if (customId === `showUrlButton_${uniqueId}`) {
    await showUrlButton(interaction);
  } else if (customId === `attacker_${uniqueId}`) {
    await moveAttackersToChannel(interaction);
  } else if (customId === `difender_${uniqueId}`) {
    await moveDefendersToChannel(interaction);
  }
};

/**
 * エラーを処理する関数
 *
 * @param interaction - ボタンインタラクション
 * @param guildId - ギルドID
 * @param error - エラー
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleError = async (interaction: ButtonInteraction, guildId: string, error: any) => {
  const commandStates = getCommandStates(guildId, COMMAND_NAME_MUSIC);
  const musicCommandInfo = commandStates?.musicCommandInfo;
  if (!commandStates || !musicCommandInfo) return;

  Logger.LogError(`【${interaction.guild?.id}】buttonHandlersでエラーが発生しました`, error);

  if (error.statusCode === 410) return;
  if ((isHttpError(error) && error.status === 400) || (isHttpError(error) && error.status === 404)) {
    await interactionEditMessages(interaction, commandStates.replyMessageId, `ボタンをもう一度押してください`);
    return;
  }
  await interactionEditMessages(interaction, commandStates.replyMessageId, {
    content: '処理中にエラーが発生しました。再度コマンドを入力してください。',
    components: [],
    files: [],
    embeds: [],
  });
};
