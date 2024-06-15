import { COMMAND_NAME_MUSIC } from '../commands/music/mainMusicCommand';
import { Logger } from '../events/common/log';
import { terminateMidwayInteractionEditMessages } from '../events/discord/interactionMessages';
import { CommandInfo } from '../types/guildStatesData';

/**
 * @alpha
 * @public
 *
 * @remarks
 * このマップはギルドごとのコマンドの状態を管理します。
 * 最初のキーはギルドIDを表し、2番目のキーはコマンド名を表します。
 *
 * @example
 * ```typescript
 * const commandInfo = {
 *   buttonCollector: /* InteractionCollector<ButtonInteraction<CacheType>> * /,
 *   buttonRowArray: /* ActionRowBuilder<ButtonBuilder>[] * /,
 *   uniqueId: 'unique-id-123',
 *   interaction: /* ChatInputCommandInteraction * /,
 *   replyMessageId: 'reply-message-id-123',
 *   musicCommandInfo: {
 *     player: /* AudioPlayer * /,
 *     commandFlg: 1,
 *     playListInfo: /* PlayListInfo * /,
 *     musicInfo: [/* MusicInfo * /],
 *     playListFlag: true,
 *     channelThumbnails: {
 *       'channel-id': 'thumbnail-url'
 *     },
 *     stopToStartFlag: false,
 *     songIndex: 0,
 *     repeatMode: 1
 *   },
 *   valorantCommandInfo: {
 *     attackerChannelId: 'attacker-channel-id',
 *     defenderChannelId: 'defender-channel-id',
 *     teams: /* TeamData * /
 *   }
 * };
 * guildCommandStates.set('guildId123', new Map([['play', commandInfo]]));
 * ```
 */
const guildCommandStates = new Map<string, Map<string, CommandInfo>>();
/**
 * ギルドのコマンド状態を取得します。
 *
 * @param guildId - ギルドID
 * @returns ギルドのコマンド状態
 */
export const getGuildStates = (guildId: string) => {
  return guildCommandStates.get(guildId);
};

/**
 * 特定のコマンドの状態を取得します。
 *
 * @param guildId - ギルドID
 * @param commandName - コマンド名
 * @returns コマンドの状態
 */
export const getCommandStates = (guildId: string, commandName: string) => {
  const guildState = guildCommandStates.get(guildId);
  return guildState?.get(commandName);
};

/**
 * ギルドのコマンド状態を設定します。
 *
 * @param guildId - ギルドID
 * @param commandName - コマンド名
 * @param commandInfo - コマンド情報
 */
export const setGuildCommandStates = (guildId: string, commandName: string, commandInfo: CommandInfo) => {
  if (!guildCommandStates.has(guildId)) {
    guildCommandStates.set(guildId, new Map<string, CommandInfo>());
  }
  const commandMap = guildCommandStates.get(guildId);
  commandMap?.set(commandName, commandInfo);
};

/**
 * 音楽コマンドのインタラクションを停止し、関連する情報を削除します。
 *
 * @param guildId - ギルドID
 * @param commandName - コマンド名
 */
export const stopPreviousInteraction = async (guildId: string, commandName: string) => {
  const commandState = getCommandStates(guildId, commandName);
  if (commandState) {
    await terminateMidwayInteractionEditMessages(commandState.interaction, commandState.replyMessageId);
    commandState.musicCommandInfo?.player.stop();
    commandState.musicCommandInfo?.player.removeAllListeners();
    commandState.buttonCollector.stop();
    Logger.LogAccessInfo(
      `【${commandState.interaction.guild?.name}(${commandState.interaction.guild?.id})】BOTがVCから切断`
    );

    guildCommandStates.get(guildId)?.delete(commandName);
  }
};

/**
 * 音楽コマンドの曲インデックスを設定します。
 *
 * @param guildId - ギルドID
 * @param commandName - コマンド名
 * @param songIndex - 曲インデックス
 */
export const setSongIndexStates = (guildId: string, commandName: string, songIndex: number) => {
  if (!guildCommandStates.has(guildId)) {
    guildCommandStates.set(guildId, new Map<string, CommandInfo>());
  }
  const commandMap = guildCommandStates.get(guildId);
  const commandInfo = commandMap?.get(commandName);
  if (!commandInfo || !commandInfo.musicCommandInfo) return;

  commandInfo.musicCommandInfo.songIndex = songIndex;
};

/**
 * コマンドの返信メッセージIDを設定します。
 *
 * @param guildId - ギルドID
 * @param commandName - コマンド名
 * @param replyMessageId - 返信メッセージID
 */
export const setReplyMessageIdStates = (guildId: string, commandName: string, replyMessageId: string) => {
  if (!guildCommandStates.has(guildId)) {
    guildCommandStates.set(guildId, new Map<string, CommandInfo>());
  }
  const commandMap = guildCommandStates.get(guildId);
  const commandInfo = commandMap?.get(commandName);
  if (!commandInfo || !commandInfo.musicCommandInfo) return;

  commandInfo.replyMessageId = replyMessageId;
};

/**
 * コマンドの返信メッセージIDを取得します。
 *
 * @param guildId - ギルドID
 * @param commandName - コマンド名
 * @returns 返信メッセージID
 */
export const getReplyMessageIdStates = (guildId: string, commandName: string) => {
  const states = getCommandStates(guildId, commandName);
  return states?.replyMessageId ?? '';
};

/**
 * コマンドのインタラクションIDを取得します。
 *
 * @param guildId - ギルドID
 * @param commandName - コマンド名
 * @returns インタラクションID
 */
export const getInteractionIdStates = (guildId: string, commandName: string) => {
  const states = getCommandStates(guildId, commandName);
  return states?.interaction ?? '';
};

/**
 * 音楽コマンドのリピートモードを設定します。
 *
 * @param guildId - ギルドID
 * @param commandName - コマンド名
 * @param repeatMode - リピートモード
 */
export const setRepeatModeStates = (guildId: string, commandName: string, repeatMode: number) => {
  if (!guildCommandStates.has(guildId)) {
    guildCommandStates.set(guildId, new Map<string, CommandInfo>());
  }
  const commandMap = guildCommandStates.get(guildId);
  const commandInfo = commandMap?.get(commandName);
  if (!commandInfo || !commandInfo.musicCommandInfo) return;

  commandInfo.musicCommandInfo.repeatMode = repeatMode;
};

/**
 * 音楽コマンドのリピートモードを取得します。
 *
 * @param guildId - ギルドID
 * @param commandName - コマンド名
 * @returns リピートモード
 */
export const getRepeatModeStates = (guildId: string, commandName: string) => {
  const states = getCommandStates(guildId, commandName);
  return states?.musicCommandInfo?.repeatMode;
};

/**
 * 音楽コマンドの停止から開始のフラグを設定します。
 *
 * @param guildId - ギルドID
 * @param commandName - コマンド名
 * @param stopToStartFlag - 停止から開始のフラグ
 */
export const setStopToStartFlagStates = (guildId: string, commandName: string, stopToStartFlag: boolean) => {
  if (!guildCommandStates.has(guildId)) {
    guildCommandStates.set(guildId, new Map<string, CommandInfo>());
  }
  const commandMap = guildCommandStates.get(guildId);
  const commandInfo = commandMap?.get(commandName);
  if (!commandInfo || !commandInfo.musicCommandInfo) return;

  commandInfo.musicCommandInfo.stopToStartFlag = stopToStartFlag;
};

/**
 * 音楽コマンドの停止から開始のフラグを取得します。
 *
 * @param guildId - ギルドID
 * @param commandName - コマンド名
 * @returns 停止から開始のフラグ
 */
export const getStopToStartFlagStates = (guildId: string, commandName: string) => {
  const states = getCommandStates(guildId, commandName);
  return states?.musicCommandInfo?.stopToStartFlag;
};

/**
 * 音楽コマンド情報を取得します。
 *
 * @param guildId - ギルドID
 * @param commandName - コマンド名
 * @returns 音楽コマンド情報
 */
export const getMusicCommandInfo = (guildId: string, commandName: string) => {
  const states = getCommandStates(guildId, commandName);
  return states?.musicCommandInfo;
};

/**
 * 特定のギルドコマンド状態を削除します。
 *
 * @param guildId - ギルドID
 * @param commandName - コマンド名
 */
export const deleteGuildCommandStates = (guildId: string, commandName: string) => {
  guildCommandStates.get(guildId)?.delete(commandName);
};

/**
 * 音楽コマンドを使用しているインスタンス数を取得します。
 *
 * @returns 音楽コマンドのインスタンス数
 */
export const getTotalMusicCommandCount = (): number => {
  let count = 0;
  guildCommandStates.forEach((guildState) => {
    if (guildState.has(COMMAND_NAME_MUSIC)) {
      count++;
    }
  });
  return count;
};
