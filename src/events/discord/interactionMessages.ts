import { ChatInputCommandInteraction, MessageEditOptions, MessagePayload } from "discord.js";

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

// メッセージを編集する(音楽再生完了時)
export const donePlayerInteractionEditMessages = async (
    interaction: ChatInputCommandInteraction,
    messageId: string
) => {
    interaction.channel?.messages.edit(messageId,{embeds:[],components:[],files:[]})
        .catch(() => {
            return;
        });
    interaction.channel?.messages.edit(messageId,'再生完了！')
        .catch(() => {
            interaction.channel?.send('再生完了！');
            return
        });
}
