import { AudioPlayerStatus, AudioResource, StreamType, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel } from "@discordjs/voice";
import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import ytdl from "ytdl-core";
import ytpl from "ytpl";

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
                const playListURLResources: AudioResource<null>[] =  playListInfo.items.map((item) => {
                        // 動画の音源を取得
                        const stream = ytdl(item.url, {
                        filter: format => format.audioCodec === 'opus' && format.container === 'webm',
                        quality: 'highest',
                        highWaterMark: 32 * 1024 * 1024,
                        });

                        const resource = createAudioResource(stream, {
                            inputType: StreamType.WebmOpus
                        });
                    return resource
                });

                // BOTをVCに接続
                const connection = joinVoiceChannel({
                    channelId: voiceChannelId,
                    guildId: interaction.guildId,
                    adapterCreator: interaction.guild?.voiceAdapterCreator,
                    selfDeaf: true,
                });
                const player = createAudioPlayer();
                connection.subscribe(player);

                let musicCount = 0;
                for(const playListURLResource of playListURLResources){
                    musicCount++;
                    player.play(playListURLResource);
                    interaction.editReply(musicCount + "曲目を再生中～♪");
                    await entersState(player,AudioPlayerStatus.Playing, 10 * 10000);
                    await entersState(player,AudioPlayerStatus.Idle, 24 * 60 * 60 * 10000);
                }
                // 終了
                interaction.editReply("再生完了！");
                connection.destroy();
                
        } catch (error) {
            console.log(error)
        }
    }
}