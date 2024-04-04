import { Console } from "console";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

// 今のところなにもhelpしません。遊びで追加しました。いろいろ遊びたくて
export const helpComand = {
    // コマンドの設定
    data: new SlashCommandBuilder().setName('help').setDescription('お試し').toJSON(),
    execute: async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply();
        interaction.editReply('何もないっす');
    }
}