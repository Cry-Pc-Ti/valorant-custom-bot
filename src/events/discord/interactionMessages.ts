import { ButtonInteraction, ChatInputCommandInteraction, MessageEditOptions, MessagePayload } from 'discord.js';

import { getInteractionIdStates } from '../../store/guildCommandStates';
import { COMMAND_NAME_MUSIC } from '../../commands/music/mainMusicCommand';
import { donePlayerMessage, terminateMidwayPlayerMessage } from './musicEmbedMessage';

/**
 * 指定されたメッセージを編集する
 * @param {ChatInputCommandInteraction | ButtonInteraction} interaction - インタラクションオブジェクト
 * @param {string} messageId - 編集するメッセージのID
 * @param {string | MessagePayload | MessageEditOptions} message - 編集後のメッセージ内容
 * @returns {Promise<void>}
 */
export const interactionEditMessages = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  messageId: string,
  message: string | MessagePayload | MessageEditOptions
): Promise<void> => {
  interaction.channel?.messages.edit(messageId, message).catch(() => {
    return;
  });
};

/**
 * 指定されたメッセージが存在するか確認する
 * @param {ChatInputCommandInteraction | ButtonInteraction} interaction - インタラクションオブジェクト
 * @param {string} messageId - 確認するメッセージのID
 * @returns {Promise<boolean>} メッセージが存在する場合はtrue、存在しない場合はfalse
 */
export const interactionFetchMessages = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  messageId: string
): Promise<boolean | undefined> => {
  return await interaction.channel?.messages
    .fetch(messageId)
    .then(() => true)
    .catch(() => false);
};

/**
 * 音楽再生完了時にメッセージを編集する
 * @param {ChatInputCommandInteraction} interaction - インタラクションオブジェクト
 * @param {string} messageId - 編集するメッセージのID
 * @returns {Promise<void>}
 */
export const donePlayerInteractionEditMessages = async (
  interaction: ChatInputCommandInteraction,
  messageId: string
): Promise<void> => {
  await interactionEditMessages(interaction, messageId, '');
  const embeds = donePlayerMessage();
  interaction.channel?.messages.edit(messageId, embeds).catch(async () => await interaction.channel?.send(embeds));
};

/**
 * 音楽途中再生時にメッセージを編集する
 * @param {ChatInputCommandInteraction} interaction - インタラクションオブジェクト
 * @param {string} messageId - 編集するメッセージのID
 * @returns {Promise<void>}
 */
export const terminateMidwayInteractionEditMessages = async (
  interaction: ChatInputCommandInteraction,
  messageId: string
): Promise<void> => {
  const embeds = terminateMidwayPlayerMessage();
  interaction.channel?.messages.edit(messageId, embeds).catch(async () => {
    if (getInteractionIdStates(interaction?.guildId ?? '', COMMAND_NAME_MUSIC).id) {
      await interaction.channel?.send(embeds);
    }
  });
};
