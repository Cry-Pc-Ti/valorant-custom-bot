import {  createAudioPlayer,joinVoiceChannel } from "@discordjs/voice";
import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import ytpl from "ytpl";
import { playMusic } from "../../events/playMusic";
import {  musicInfoMessage } from "../../events/embedMessage";
import ytdl from "ytdl-core";
;

export const playListCommand = {
    // コマンドの設定
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('VCでプレイリストから音楽を流します。')
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
            .setDescription('再生したいプレイリストを指定')
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
                const musicInfoList: any[] = playListInfo.items.map((item) => {
                    return {
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
                });
                const player = createAudioPlayer();
                connection.subscribe(player);

                // 修正するメッセージのIDを取得
                const replyMessageId: string = (await interaction.fetchReply()).id;

                // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
                for(const [index,musicInfo] of musicInfoList.entries()){
                    // TODO:もっときれいにできないか検討。42行目の処理だとうまくいかなくて、、
                    // チャンネルアイコンを取得
                    const channelThumbnail = (await ytdl.getBasicInfo(musicInfo.url)).videoDetails.author.thumbnails;
                    const embed = musicInfoMessage(musicInfo,index + 1,musicInfoList.length,channelThumbnail ? channelThumbnail[0].url : musicInfo.musicImg);
                    if(index === 0) await interaction.editReply(embed);
                    else interaction.channel?.messages.edit(replyMessageId,embed);
                    await playMusic(player,musicInfo);
                }

                // BOTをdiscordから切断
                interaction.channel?.messages.edit(replyMessageId,"プレイリスト再生完了！");
                connection.destroy();

        } catch (error) {
            await interaction.editReply('処理中にエラーが発生しました\n開発者にお問い合わせください');
            console.error(`playListCommandでエラーが発生しました : ${error}`);
        }
    }
}