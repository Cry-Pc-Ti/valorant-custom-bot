import { terminateMidwayInteractionEditMessages } from '../events/discord/interactionMessages';
import { CommandInfo } from '../types/guildStatesDta';

// 保存しておく場所
const guildCommandStates = new Map<string, Map<string, CommandInfo>>();

//ギルド情報を取得
export const getGuildStates = (guildId: string) => {
  return guildCommandStates.get(guildId);
};

//コマンド情報を取得
export const getCommandStates = (guildId: string, commandName: string) => {
  const guildState = guildCommandStates.get(guildId);
  return guildState?.get(commandName);
};

export const setGuildCommandStates = (guildId: string, commandName: string, commandInfo: CommandInfo) => {
  if (!guildCommandStates.has(guildId)) {
    guildCommandStates.set(guildId, new Map<string, CommandInfo>());
  }
  const commandMap = guildCommandStates.get(guildId);
  commandMap?.set(commandName, commandInfo);
};

// 音楽用の削除するための
export const stopPreviousInteraction = async (guildId: string, commandName: string) => {
  const commandState = getCommandStates(guildId, commandName);
  if (commandState) {
    await terminateMidwayInteractionEditMessages(commandState.interaction, commandState.replyMessageId);
    commandState.musicCommandInfo?.player.stop();
    commandState.musicCommandInfo?.player.removeAllListeners();
    commandState.buttonCollector.stop();

    guildCommandStates.get(guildId)?.delete(commandName);
  }
};

// SongIndexをset
export const setSongIndexStates = (guildId: string, commandName: string, songIndex: number) => {
  if (!guildCommandStates.has(guildId)) {
    guildCommandStates.set(guildId, new Map<string, CommandInfo>());
  }
  const commandMap = guildCommandStates.get(guildId);
  const commandInfo = commandMap?.get(commandName);
  if (!commandInfo || !commandInfo.musicCommandInfo) return;

  commandInfo.musicCommandInfo.songIndex = songIndex;
};

// MessageIdをset
export const setReplyMessageIdStates = (guildId: string, commandName: string, replyMessageId: string) => {
  if (!guildCommandStates.has(guildId)) {
    guildCommandStates.set(guildId, new Map<string, CommandInfo>());
  }
  const commandMap = guildCommandStates.get(guildId);
  const commandInfo = commandMap?.get(commandName);
  if (!commandInfo || !commandInfo.musicCommandInfo) return;

  commandInfo.replyMessageId = replyMessageId;
};

export const getReplyMessageIdStates = (guildId: string, commandName: string) => {
  const states = getCommandStates(guildId, commandName);
  return states?.replyMessageId ?? '';
};

// SongIndexをset
export const setRepeatModeStates = (guildId: string, commandName: string, repeatMode: number) => {
  if (!guildCommandStates.has(guildId)) {
    guildCommandStates.set(guildId, new Map<string, CommandInfo>());
  }
  const commandMap = guildCommandStates.get(guildId);
  const commandInfo = commandMap?.get(commandName);
  if (!commandInfo || !commandInfo.musicCommandInfo) return;

  commandInfo.musicCommandInfo.repeatMode = repeatMode;
};

export const getRepeatModeStates = (guildId: string, commandName: string) => {
  const states = getCommandStates(guildId, commandName);
  return states?.musicCommandInfo?.repeatMode;
};

export const setStopToStartFlagStates = (guildId: string, commandName: string, stopToStartFlag: boolean) => {
  if (!guildCommandStates.has(guildId)) {
    guildCommandStates.set(guildId, new Map<string, CommandInfo>());
  }
  const commandMap = guildCommandStates.get(guildId);
  const commandInfo = commandMap?.get(commandName);
  if (!commandInfo || !commandInfo.musicCommandInfo) return;

  commandInfo.musicCommandInfo.stopToStartFlag = stopToStartFlag;
};

export const getStopToStartFlagStates = (guildId: string, commandName: string) => {
  const states = getCommandStates(guildId, commandName);
  return states?.musicCommandInfo?.stopToStartFlag;
};

export const getMusicCommandInfo = (guildId: string, commandName: string) => {
  const states = getCommandStates(guildId, commandName);
  return states?.musicCommandInfo;
};

export const deleteGuildCommandStates = (guildId: string, commandName: string) => {
  guildCommandStates.get(guildId)?.delete(commandName);
};

// 音楽のじょうほうの数だけ返す
export const getTotalMusicCommandCount = (): number => {
  let count = 0;
  guildCommandStates.forEach((guildState) => {
    if (guildState.has('music')) {
      count++;
    }
  });
  return count;
};
