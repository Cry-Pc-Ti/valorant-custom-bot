import { createAudioPlayer, joinVoiceChannel } from "@discordjs/voice";
import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { MusicInfo } from "../../types/musicData";
import { playMusic } from "../../events/playMusic";
import { musicInfoMessage } from "../../events/embedMessage";
import ytpl from "ytpl";
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

            if (!voiceChannelId || !interaction.guildId || !interaction.guild?.voiceAdapterCreator) return interaction.editReply('ボイスチャンネルが見つかりません。');

            // プレイリストか曲か判別
            let playListFlag: boolean = false;
            if(!ytdl.validateURL(url) &&  ytpl.validateID(url)) playListFlag = true;
            else if(!ytpl.validateID(url) && ytdl.validateURL(url)) playListFlag = false;
            else if(!ytdl.validateURL(url) ||!ytpl.validateID(url)) return !interaction.editReply('こちらの音楽は再生できません。正しいURLを指定してください。');

            if(playListFlag){
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

            }else{
                //一曲の場合
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
                    musicImg: musicDetails.videoDetails.thumbnails[3].url,
                    author: {
                        url: musicDetails.videoDetails.author.channel_url,
                        channelID: musicDetails.videoDetails.author.id,
                        name: musicDetails.videoDetails.author.name,
                        channelThumbnail: musicDetails.videoDetails.author.thumbnails ? musicDetails.videoDetails.author.thumbnails[0].url : musicDetails.videoDetails.thumbnails[0].url
                    }
                }

                // 音楽情報のメッセージ作成、送信
                const embed = musicInfoMessage(musicInfo);
                await interaction.editReply(embed);
                
                // BOTに音楽を流す
                await playMusic(player,musicInfo);

                // BOTをdiscordから切断
                interaction.editReply("再生完了！");
                connection.destroy();
            }
        } catch (error) {
            await interaction.editReply('処理中にエラーが発生しました\n開発者にお問い合わせください');
            console.error(`playMusicCommandでエラーが発生しました : ${error}`);
        }
    }
}