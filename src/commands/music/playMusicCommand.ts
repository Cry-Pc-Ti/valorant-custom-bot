import { createAudioPlayer, joinVoiceChannel } from "@discordjs/voice";
import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import ytdl from "ytdl-core";
import { MusicInfo } from "../../types/musicData";
import { playMusic } from "../../events/playMusic";
import { musicInfoMessage } from "../../events/embedMessage";

export const playMusicCommand = {
    // コマンドの設定
    data: new SlashCommandBuilder()
        .setName('play')
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
        try {
            await interaction.deferReply();

            const url = interaction.options.getString('url') ?? ""
            const voiceChannelId = interaction.options.getChannel('channel')?.id

            if (!voiceChannelId || !interaction.guildId) return interaction.editReply('ボイスチャンネルが見つかりません。');
            if (!ytdl.validateURL(url) || !interaction.guild?.voiceAdapterCreator) return interaction.editReply('こちらの音楽は再生できません。');

            await interaction.deleteReply()

            //BOTをVCに接続
            const connection = joinVoiceChannel({
                channelId: voiceChannelId,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild?.voiceAdapterCreator,
                selfDeaf: true,
            });
            const player = createAudioPlayer();
            connection.subscribe(player);

            // 音楽データを取得・作成
            const musicDetails = await ytdl.getBasicInfo(url)
            const musicInfo: MusicInfo = {
                url:  musicDetails.videoDetails.video_url,
                title: musicDetails.videoDetails.title,
                musicImg: musicDetails.videoDetails.thumbnails[0].url,
                author: {
                    url: musicDetails.videoDetails.author.channel_url,
                    channelID: musicDetails.videoDetails.author.id,
                    name: musicDetails.videoDetails.author.name,
                    thumbnails: musicDetails.videoDetails.author.thumbnails ? musicDetails.videoDetails.author.thumbnails[0].url : musicDetails.videoDetails.thumbnails[0].url
                }
            }

            // メッセージ作成、送信
            const embed = await musicInfoMessage(musicInfo);
            interaction.channel?.send(embed);
            
            // 再生
            await playMusic(player,musicInfo);

            // 終了
            interaction.editReply("再生完了！");
            connection.destroy();

        } catch (error) {
            console.log(error)
        }
    }
}