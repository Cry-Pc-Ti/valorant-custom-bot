import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { clientId } from "../../modules/discordModule";

export const botDisconnectCommand = {
    // コマンドの設定
    data: new SlashCommandBuilder()
        .setName('musi')
        .setDescription('音楽関連のコマンドです。')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('disconnect')
                .setDescription('BOTをVCから切断します。')
        )
        .toJSON(),

    execute: async (interaction: ChatInputCommandInteraction) => {
        try {
            await interaction.deferReply();
            const botJoinVoiceChannelId = await interaction.guild?.members.fetch(clientId);
            if(botJoinVoiceChannelId?.voice.channelId){
                await botJoinVoiceChannelId?.voice.disconnect();
                await interaction.editReply('BOTをVCから切断しました。');
                return
            }
            await interaction.editReply('BOTがVCにいません。');
            return
        } catch (error) {
            console.error(`botDisconnectCommandでエラーが発生しました : ${error}`);
        }
    }
}