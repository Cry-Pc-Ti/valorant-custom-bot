import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const botDisconnectCommand = {
    // コマンドの設定
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('音楽関連のコマンドです。')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('disconnect')
                .setDescription('BotをVCから切断します。')
        )
        .toJSON(),

    execute: async (interaction: ChatInputCommandInteraction) => {
        try {
            await interaction.deferReply();
        } catch (error) {
            console.log(error)
            console.error(`botDisconnectCommandでエラーが発生しました : ${error}`);
        }
    }
}