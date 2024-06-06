<<<<<<< HEAD
import { ChatInputCommandInteraction, MessageEditOptions, MessagePayload } from 'discord.js';
import { donePlayerMessage, terminateMidwayPlayerMessage } from './embedMessage';

// メッセージを編集する
export const interactionEditMessages = async (
  interaction: ChatInputCommandInteraction,
  messageId: string,
  message: string | MessagePayload | MessageEditOptions
) => {
  interaction.channel?.messages.edit(messageId, message).catch(() => {
    return;
  });
};
=======
import { ChatInputCommandInteraction, MessageEditOptions, MessagePayload } from "discord.js";
import { donePlayerMessage } from "./embedMessage";

// メッセージを編集する
export const interactionEditMessages = async (
    interaction: ChatInputCommandInteraction,
    messageId: string,
    message:string | MessagePayload | MessageEditOptions
) => {
    interaction.channel?.messages.edit(messageId,message).catch(() => {
        return;
    })
}
>>>>>>> origin/master

// メッセージを編集する(音楽再生完了時)
// TODO:再生した情報を出したい
export const donePlayerInteractionEditMessages = async (
<<<<<<< HEAD
  interaction: ChatInputCommandInteraction,
  messageId: string
) => {
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
  interaction.channel?.messages.edit(messageId, embeds).catch(async () => await interaction.channel?.send(embeds));
};
=======
    interaction: ChatInputCommandInteraction,
    messageId: string
) => {
    const embeds = donePlayerMessage();
    interaction.channel?.messages.edit(messageId,embeds)
        .catch(async () => await interaction.channel?.send(embeds));
}
>>>>>>> origin/master
