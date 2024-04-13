import { AudioPlayerStatus, createAudioPlayer, joinVoiceChannel } from "@discordjs/voice";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, ChatInputCommandInteraction, ComponentType,  SlashCommandBuilder } from "discord.js";
import { MusicInfo } from "../../types/musicData";
import { playMusic } from "../../events/playMusic";
import { musicInfoMessage } from "../../events/embedMessage";
import ytpl from "ytpl";
import ytdl from "ytdl-core";

export const playMusicCommand = {
    // コマンドの設定
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('音楽関連のコマンドです。')
        .addSubcommand((subcommand) =>
            subcommand
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
                        .setDescription('再生したいURLを入力（プレイリストも可）')
                        .setRequired(true)
                )
                .addBooleanOption((option) =>
                    option
                        .setName('shuffle')
                        .setDescription('プレイリストをランダムに再生したい場合はtrueを入れてください')
                )
        )
        .toJSON(),

    execute: async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply();
        
        // 修正するメッセージのIDを取得
        const replyMessageId: string = (await interaction.fetchReply()).id;

        try {
            const url = interaction.options.getString('url') ?? ""
            const voiceChannelId = interaction.options.getChannel('channel')?.id
            const shuffleFlag: boolean = interaction.options.getBoolean('shuffle') ?? false;

            if (!voiceChannelId || !interaction.guildId || !interaction.guild?.voiceAdapterCreator) return interaction.editReply('ボイスチャンネルが見つかりません。');

            // プレイリストか曲か判別
            let playListFlag: boolean = false;
            if(!ytdl.validateURL(url) &&  ytpl.validateID(url)) playListFlag = true;
            else if(!ytpl.validateID(url) && ytdl.validateURL(url)) playListFlag = false;
            else if(!ytdl.validateURL(url) || !ytpl.validateID(url)) return interaction.editReply('こちらの音楽は再生できません。正しいURLを指定してください。');

            // DateをuniqueIdとして取得
            const uniqueId = Date.now();

            // 「一時停止」ボタン
            const stopPlayMusicButton = new ButtonBuilder()
                .setCustomId(`stopPlayMusicButton_${uniqueId}`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel("停止")
                .setEmoji("⏸");
            
            // BOTをVCに接続
            const connection = joinVoiceChannel({
                channelId: voiceChannelId,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild?.voiceAdapterCreator,
                selfDeaf: true,
            });
            const player = createAudioPlayer();
            connection.subscribe(player);

            if(playListFlag){
                //プレイリストの場合

                //URLからplayList情報を取得
                const playListInfo = await ytpl(url, { pages: 1 });

                // shuffleFlagがtrueの場合配列をシャッフル
                if(shuffleFlag){
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    playListInfo.items.sort((_a, _b) => 0.5 - Math.random())
                }
                
                //playListからMusicInfo配列に格納
                const originMusicInfoList: MusicInfo[] = playListInfo.items.map((item, index) => {
                    return {
                        songIndex: index + 1,
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

                // 再生している曲のindexを取得
                let songIndex: number;

                // 「前の曲へ」ボタン
                const prevPlayMusicButton = new ButtonBuilder()
                    .setCustomId(`prevPlayMusicButton_${uniqueId}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("前の曲へ")
                    .setEmoji("⏮");
            
                // 「次の曲へ」ボタン
                const nextPlayMusicButton = new ButtonBuilder()
                    .setCustomId(`nextPlayMusicButton_${uniqueId}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("次の曲へ")
                    .setEmoji("⏭");

                // ボタンをActionRowに追加
                const buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    prevPlayMusicButton,
                    stopPlayMusicButton,
                    nextPlayMusicButton
                );

                const buttonCollector = interaction.channel?.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                });
                if (!buttonCollector) return;

                // ボタンが押された時の処理
                buttonCollector.on('collect', async (buttonInteraction: ButtonInteraction) => { 
                try {
                    if (!buttonInteraction.replied && !buttonInteraction.deferred) {
                        await buttonInteraction.deferUpdate();
                    }
                    // 次の曲へボタン押下時の処理
                    if(buttonInteraction.customId === `nextPlayMusicButton_${uniqueId}`){
                        // playerを削除する。
                        player.stop();
                        // Listenerをすべて削除する。
                        player.removeAllListeners();

                        // 該当の音楽のリストを取得
                        const nextMusicInfoList: MusicInfo[] = originMusicInfoList.filter(musicInfo => musicInfo.songIndex > songIndex );

                        // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
                        for(const musicInfo of nextMusicInfoList){
                            // 曲のindexを格納
                            songIndex = musicInfo.songIndex
                            // チャンネルアイコンを取得
                            const channelThumbnail = (await ytdl.getBasicInfo(musicInfo.url)).videoDetails.author.thumbnails;
                            const embed = musicInfoMessage(musicInfo,buttonRow,musicInfo.songIndex,originMusicInfoList.length,channelThumbnail ? channelThumbnail[0].url : null);
                            interaction.channel?.messages.edit(replyMessageId,embed);
                            await playMusic(player,musicInfo);
                        }
                    }
                    // 前の曲へボタン押下時の処理
                    if(buttonInteraction.customId === `prevPlayMusicButton_${uniqueId}`){
                        // playerを削除する。
                        player.stop();
                        // Listenerをすべて削除する。
                        player.removeAllListeners();

                        // 該当の音楽のリストを取得
                        const prevMusicInfoList: MusicInfo[] = originMusicInfoList.filter(musicInfo => musicInfo.songIndex >= songIndex - 1);

                        // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
                        for(const musicInfo of prevMusicInfoList){
                            // 曲のindexを格納
                            songIndex = musicInfo.songIndex
                            // チャンネルアイコンを取得
                            const channelThumbnail = (await ytdl.getBasicInfo(musicInfo.url)).videoDetails.author.thumbnails;
                            const embed = musicInfoMessage(musicInfo,buttonRow,musicInfo.songIndex,originMusicInfoList.length,channelThumbnail ? channelThumbnail[0].url : null );
                            interaction.channel?.messages.edit(replyMessageId,embed);
                            await playMusic(player,musicInfo);
                        }
                    }
                    // 再生/停止ボタン押下時
                    if(buttonInteraction.customId === `stopPlayMusicButton_${uniqueId}`){
                        if(player.state.status === AudioPlayerStatus.Playing){
                            player.pause();
                            stopPlayMusicButton
                                .setLabel("再生")
                                .setEmoji("▶");
                            interaction.channel?.messages.edit(replyMessageId,{components:[buttonRow]});
                        }else if(player.state.status === AudioPlayerStatus.Paused){
                            player.unpause();
                            stopPlayMusicButton
                                .setLabel("停止")
                                .setEmoji("⏸");
                            interaction.channel?.messages.edit(replyMessageId,{components:[buttonRow]});
                        }
                    }
                    return
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (e: any) {
                    if(e.status == '401'){
                        console.error(`playMusicCommandでエラーが発生しました : ${e.messages}`);
                        return
                    }else if(e.status == '404'){
                        console.error(`playMusicCommandでエラーが発生しました : ${e.messages}`);
                        interaction.channel?.messages.edit(replyMessageId,'ボタンをもう一度押してください');
                        return
                    }
                    console.log(e)
                    // await interaction.followUp({ content: 'ボタンの処理中にエラーが発生しました', ephemeral: true });
                }
                });

                // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
                for(const musicInfo of originMusicInfoList){
                    songIndex = musicInfo.songIndex;
                    // チャンネルアイコンを取得
                    const channelThumbnail = (await ytdl.getBasicInfo(musicInfo.url)).videoDetails.author.thumbnails;
                    const embed = musicInfoMessage(musicInfo,buttonRow,musicInfo.songIndex,originMusicInfoList.length,channelThumbnail ? channelThumbnail[0].url : null);
                    if(musicInfo.songIndex === 1) await interaction.editReply(embed);
                    else interaction.channel?.messages.edit(replyMessageId,embed);
                    await playMusic(player,musicInfo);
                }

                // BOTをdiscordから切断
                interaction.channel?.messages.edit(replyMessageId,"プレイリスト再生完了！");
                connection.destroy();

            }else{
                //一曲の場合

                // 音楽データを取得・作成
                const musicDetails = await ytdl.getBasicInfo(url)
                const musicInfo: MusicInfo = {
                    songIndex: 1,
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

                // ボタンをActionRowに追加
                const buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    stopPlayMusicButton,
                );

                const buttonCollector = interaction.channel?.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                  });

                // 音楽情報のメッセージ作成、送信
                const embed = musicInfoMessage(musicInfo,buttonRow);
                await interaction.editReply(embed);

                if (!buttonCollector) return;

                // ボタンが押された時の処理
                buttonCollector.on('collect', async (buttonInteraction: ButtonInteraction) => { 
                    try {
                        if (!buttonInteraction.replied && !buttonInteraction.deferred) {
                            await buttonInteraction.deferUpdate();
                        }
                        // 再生/一時停止ボタン押下時
                        if(buttonInteraction.customId === `stopPlayMusicButton_${uniqueId}`){
                            if(player.state.status === AudioPlayerStatus.Playing){
                                player.pause();
                                stopPlayMusicButton
                                    .setLabel("再生")
                                    .setEmoji("▶");
                                interaction.editReply({components:[buttonRow]});
                            }else if(player.state.status === AudioPlayerStatus.Paused){
                                player.unpause();
                                stopPlayMusicButton
                                    .setLabel("停止")
                                    .setEmoji("⏸");
                                interaction.editReply({components:[buttonRow]});
                            }
                        }
                        return
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } catch (e: any) {
                        if(e.status == '401'){
                            console.error(`playMusicCommandでエラーが発生しました : ${e.messages}`);
                            return
                        }
                        // await interaction.followUp({ content: 'ボタンの処理中にエラーが発生しました', ephemeral: true });
                    }
                });

                // BOTに音楽を流す
                await playMusic(player,musicInfo);

                // BOTをdiscordから切断
                interaction.editReply("再生完了！");
                connection.destroy();
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            if(e.status == '410') {
                console.error(`playMusicCommandでエラーが発生しました : ${e}`);
                return await interaction.editReply('ポリシーに適していないものが含まれるため再生できません。');
            }
            if(e.status == '401') {
                console.error(`playMusicCommandでエラーが発生しました : ${e}`);
            }
            await interaction.editReply('処理中にエラーが発生しました。\n開発者にお問い合わせください。');
            console.log(e)
            console.error(`playMusicCommandでエラーが発生しました : ${e}`);
        }
    }
}