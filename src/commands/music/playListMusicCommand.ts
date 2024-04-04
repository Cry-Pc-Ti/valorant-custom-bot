import { AudioPlayerStatus, AudioResource, StreamType, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel } from "@discordjs/voice";
import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import ytpl from "ytpl";
import { playMusic } from "../../events/playMusic";
import { mapMessage, playListInfoMessage } from "../../events/embedMessage";

export const playListCommand = {
    // コマンドの設定
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('VCで音楽を流します。')
        .addChannelOption((option) =>
        option
            .setName('channel')
            .setDescription('音楽を流すチャンネルを選択')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice),
        )
        .addStringOption((option) =>
        option
            .setName('url')
            .setDescription('再生したいURLを指定')
            .setRequired(true)
        )
        .toJSON(),
        execute: async (interaction: ChatInputCommandInteraction) => {
            await interaction.deferReply();
            try {

                const url = interaction.options.getString('url') ?? ""
                const voiceChannelId = interaction.options.getChannel('channel')?.id

                if (!voiceChannelId || !interaction.guildId) return interaction.editReply('ボイスチャンネルが見つかりません。');
                if (!ytpl.validateID(url) || !interaction.guild?.voiceAdapterCreator) return interaction.editReply('こちらの音楽は再生できません。');

                //URLからplayListを取得
                const playListInfo = await ytpl(url, { pages: 1 });

                //playListから音楽情報を取得しResource配列に格納
                const musicInfoList: any[] =  playListInfo.items.map((item) => {
                    console.log(item)
                    return{
                        url: item.url,
                        title: item.title,
                        musicImg: item.bestThumbnail.url,
                        author: {
                            url: item.author.name,
                            channelID: item.author.channelID,
                            name: item.author.name,
                        }
                    }
                });

                // BOTをVCに接続
                const connection = joinVoiceChannel({
                    channelId: voiceChannelId,
                    guildId: interaction.guildId,
                    adapterCreator: interaction.guild?.voiceAdapterCreator,
                    selfDeaf: true,
                    selfMute: true
                });
                const player = createAudioPlayer();
                connection.subscribe(player);

                let musicCount = 0;
                for(const musicInfo of musicInfoList){
                    musicCount++;
                    // メッセージを作成
                    const embed = playListInfoMessage(musicInfo,musicCount,musicInfoList.length);
                    interaction.editReply(embed);
                    await playMusic(player,musicInfo)
                }
                // 終了
                interaction.editReply("再生完了！");
                connection.destroy();
                
        } catch (error) {
            console.log(error)
        }
    }
}