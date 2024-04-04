import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const musicStopCommand = {
    // コマンドの設定
    data: new SlashCommandBuilder().setName('playstop').setDescription('お試し').toJSON(),
    execute: async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply();
        
    }
}