import { Collection } from 'discord.js';

const cooldowns = new Collection<string, Collection<string, number>>();

/**
 * クールダウンが有効かどうかを確認する関数
 *
 * @param commandName - コマンド名
 * @param uniqueId - 一意なID
 * @param commandCooldowns - コマンドごとのクールダウン時間（ミリ秒）
 * @returns クールダウンが有効かどうか
 */
export const isCooldownActive = (commandName: string, uniqueId: string, commandCooldowns: Map<string, number>) => {
  const now = Date.now();
  const timestamps = cooldowns.get(commandName);
  const cooldownAmount = commandCooldowns.get(commandName) || 0;

  if (timestamps?.has(uniqueId)) {
    const expirationTime = (timestamps.get(uniqueId) as number) + cooldownAmount;
    if (now < expirationTime) {
      return true;
    }
  }
  return false;
};

/**
 * クールダウン残り時間を取得する関数
 *
 * @param commandName - コマンド名
 * @param uniqueId - 一意なID
 * @param commandCooldowns - コマンドごとのクールダウン時間（ミリ秒）
 * @returns クールダウン残り時間（秒）
 */
export const getCooldownTimeLeft = (commandName: string, uniqueId: string, commandCooldowns: Map<string, number>) => {
  const now = Date.now();
  const timestamps = cooldowns.get(commandName);
  const cooldownAmount = commandCooldowns.get(commandName) || 0;

  if (timestamps?.has(uniqueId)) {
    const expirationTime = (timestamps.get(uniqueId) as number) + cooldownAmount;
    return (expirationTime - now) / 1000;
  }
  return 0;
};

/**
 * クールダウンを設定する関数
 *
 * @param commandName - コマンド名
 * @param uniqueId - 一意なID
 * @param commandCooldowns - コマンドごとのクールダウン時間（ミリ秒）
 */
export const setCooldown = (commandName: string, uniqueId: string, commandCooldowns: Map<string, number>) => {
  const now = Date.now();
  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Collection());
  }
  const timestamps = cooldowns.get(commandName);
  timestamps?.set(uniqueId, now);
  setTimeout(() => timestamps?.delete(uniqueId), commandCooldowns.get(commandName) || 0);
};
