import { ButtonInteraction, ChatInputCommandInteraction, MessageEditOptions, MessagePayload } from 'discord.js';
import { donePlayerMessage, terminateMidwayPlayerMessage } from './embedMessage';
import { getInteractionIdStates } from '../../store/guildCommandStates';
import { COMMAND_NAME_MUSIC } from '../../commands/music/mainMusicCommand';

// メッセージを編集する
export const interactionEditMessages = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  messageId: string,
  message: string | MessagePayload | MessageEditOptions
) => {
  interaction.channel?.messages.edit(messageId, message).catch(() => {
    return;
  });
};

// メッセージがあるか確認
export const interactionFetchMessages = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  messageId: string
) => {
  return await interaction.channel?.messages
    .fetch(messageId)
    .then(() => true)
    .catch(() => false);
};

// メッセージを編集する(音楽再生完了時)
// TODO:再生した情報を出したい
export const donePlayerInteractionEditMessages = async (
  interaction: ChatInputCommandInteraction,
  messageId: string
) => {
  await interactionEditMessages(interaction, messageId, '');
  const embeds = donePlayerMessage();
  interaction.channel?.messages.edit(messageId, embeds).catch(async () => await interaction.channel?.send(embeds));
};

// メッセージを編集する(音楽途中再生時)
// TODO:再生した情報を出したい
export const terminateMidwayInteractionEditMessages = async (
  interaction: ChatInputCommandInteraction,
  messageId: string
) => {
  const embeds = terminateMidwayPlayerMessage();
  interaction.channel?.messages.edit(messageId, embeds).catch(async () => {
    if (getInteractionIdStates(interaction?.guildId ?? '', COMMAND_NAME_MUSIC).id) {
      await interaction.channel?.send(embeds);
    }
  });
};
