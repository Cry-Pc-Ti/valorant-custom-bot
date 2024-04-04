import { AudioPlayerStatus, NoSubscriberBehavior, StreamType, VoiceConnectionStatus, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import ytdl from "ytdl-core";

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

            const connection = joinVoiceChannel({
                channelId: voiceChannelId,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild?.voiceAdapterCreator,
                selfDeaf: true,
            });

            // BOTをVCに接続
            const player = createAudioPlayer();
            connection.subscribe(player);

            // 動画の音源を取得
            const stream = ytdl(ytdl.getURLVideoID(url), {
            filter: format => format.audioCodec === 'opus' && format.container === 'webm',
            quality: 'highest',
            highWaterMark: 32 * 1024 * 1024,
            });
            const resource = createAudioResource(stream, {
                inputType: StreamType.WebmOpus
            });

            // 再生
            player.play(resource);
            interaction.editReply("再生中～♪");
            await entersState(player,AudioPlayerStatus.Playing, 10 * 1000);
            await entersState(player,AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);

            // 終了
            interaction.editReply("再生完了！");
            connection.destroy();

        } catch (error) {
            console.log(error)
        }
    }
}