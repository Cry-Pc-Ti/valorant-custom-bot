import { AudioPlayerStatus, createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  SlashCommandBuilder,
} from 'discord.js';
import { MusicInfo } from '../../types/musicData';
import { deletePlayerInfo, playMusic } from '../../events/music/playMusic';
import { donePlayerMessage, musicInfoMessage } from '../../events/discord/embedMessage';
import ytpl from 'ytpl';
import ytdl from 'ytdl-core';
import { clientId } from '../../modules/discordModule';
import { donePlayerInteractionEditMessages, interactionEditMessages } from '../../events/discord/interactionMessages';

export const musicCommand = {
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
            .addChannelTypes(ChannelType.GuildVoice)
        )
        .addBooleanOption((option) =>
          option.setName('shuffle').setDescription('プレイリストをランダムに再生したい場合はtrueを入れてください').setRequired(true)
        )
        .addStringOption((option) =>
          option.setName('url').setDescription('再生したいURLを入力（プレイリストも可）').setRequired(true)
        )
    )
    .addSubcommand((subcommand) => subcommand.setName('disconnect').setDescription('BOTをVCから切断します。'))
    // .addSubcommand((subcommand) =>
    //   subcommand
    //       .setName('search')
    //       .setDescription('検索したワードを入力')
    //       .addStringOption((option) =>
    //           option.setName('words').setDescription('再生したいURLを入力（プレイリストも可）').setRequired(true)
    //       )
    //  )
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    if(interaction.options.getSubcommand() === 'disconnect') {
      try {
        const botJoinVoiceChannelId = await interaction.guild?.members.fetch(clientId);
        if(botJoinVoiceChannelId?.voice.channelId){
            await botJoinVoiceChannelId?.voice.disconnect();
            await interaction.editReply('BOTをVCから切断しました。');
            return
        }
        await interaction.editReply('BOTがVCにいません。');
        return
      } catch (error) {
          console.error(`playMusicCommandでエラーが発生しました : ${error}`);
      }
    }
    else if(interaction.options.getSubcommand() === 'play') {
      try {
        const url = interaction.options.getString('url') ?? '';
        const voiceChannelId = interaction.options.getChannel('channel')?.id;
        const shuffleFlag: boolean = interaction.options.getBoolean('shuffle') ?? false;

        if (!voiceChannelId || !interaction.guildId || !interaction.guild?.voiceAdapterCreator)
          return interaction.editReply('ボイスチャンネルが見つかりません。');

        // プレイリストか曲か判別
        let playListFlag: boolean = false;
        if (!ytdl.validateURL(url) && ytpl.validateID(url)) playListFlag = true;
        else if (!ytpl.validateID(url) && ytdl.validateURL(url)) playListFlag = false;
        else if (!ytdl.validateURL(url) || !ytpl.validateID(url))
          return interaction.editReply('こちらの音楽は再生できません。正しいURLを指定してください。');

        // DateをuniqueIdとして取得
        const uniqueId = Date.now();

        // 「一時停止」ボタン
        const stopPlayMusicButton = new ButtonBuilder()
          .setCustomId(`stopPlayMusicButton_${uniqueId}`)
          .setStyle(ButtonStyle.Secondary)
          .setLabel('停止')
          .setEmoji('⏸');

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
        let replyMessageId: string = (await interaction.fetchReply()).id;

        if (playListFlag) {
          //プレイリストの場合

          //URLからplayList情報を取得
          const playListInfo = await ytpl(url, { pages: 1 });

          // shuffleFlagがtrueの場合配列をシャッフル
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          if (shuffleFlag) playListInfo.items.sort((_a, _b) => 0.5 - Math.random());

          //playListからMusicInfo配列に格納
          const musicInfoList: MusicInfo[] = playListInfo.items.map((item, index) => {
            return {
              songIndex: index + 1,
              url: item.url,
              title: item.title,
              musicImg: item.bestThumbnail.url,
              author: {
                url: item.author.name,
                channelID: item.author.channelID,
                name: item.author.name,
              },
            };
          });

          // 再生している曲のindexを取得
          let songIndex: number;

          // 「前の曲へ」ボタン
          const prevPlayMusicButton = new ButtonBuilder()
            .setCustomId(`prevPlayMusicButton_${uniqueId}`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel('前の曲へ')
            .setEmoji('⏮');

          // 「次の曲へ」ボタン
          const nextPlayMusicButton = new ButtonBuilder()
            .setCustomId(`nextPlayMusicButton_${uniqueId}`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel('次の曲へ')
            .setEmoji('⏭');

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

              // BOTがVCにいない場合処理しない
              if (!(await interaction.guild?.members.fetch(clientId))?.voice.channelId) {
                interactionEditMessages(interaction, buttonInteraction.message.id,'もう一度、再生したい場合はコマンドで再度入力してください。');
                interactionEditMessages(interaction, buttonInteraction.message.id, {components:[]});
                return
              };

              // 他メッセージのボタン押されたときに処理しない
              if (replyMessageId !== buttonInteraction.message.id) return;
              
              // 次の曲へボタン押下時の処理
              if (buttonInteraction.customId === `nextPlayMusicButton_${uniqueId}`) {
                // メッセージを削除
                if (interaction.channel?.messages.fetch(replyMessageId))
                  await interactionEditMessages(interaction, replyMessageId, '');

                // PlayerとListenerを削除
                await deletePlayerInfo(player);

                // ボタンが再生ボタンだった時停止ボタンに変更
                if (stopPlayMusicButton.data.label === '再生') {
                  stopPlayMusicButton.setLabel('停止').setEmoji('⏸');
                  interactionEditMessages(interaction, replyMessageId, { components: [buttonRow] });
                }

                // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
                for (const musicInfo of musicInfoList) {
                  if(musicInfo.songIndex > songIndex){
                  // 曲のindexを格納
                  songIndex = musicInfo.songIndex;
                  // チャンネルアイコンを取得
                  const channelThumbnail = (await ytdl.getBasicInfo(musicInfo.url)).videoDetails.author.thumbnails;
                  const embed = musicInfoMessage(
                    musicInfo,
                    buttonRow,
                    musicInfo.songIndex,
                    musicInfoList.length,
                    channelThumbnail ? channelThumbnail[0].url : null
                  );
                  interaction.channel?.messages.edit(replyMessageId, embed).catch(() => {
                    interaction.channel?.send(embed).then((res) => {
                      replyMessageId = res.id;
                    });
                  });
                  // 音楽再生
                  await playMusic(player, musicInfo);
                  }
                }
                // 再生完了した際メッセージを送信
                await donePlayerInteractionEditMessages(interaction, replyMessageId);

                // playerを削除する。
                player.stop();
                // BOTをdiscordから切断
                connection.destroy();
              }
              // 前の曲へボタン押下時の処理
              if (buttonInteraction.customId === `prevPlayMusicButton_${uniqueId}`) {
                // メッセージを削除
                if (interaction.channel?.messages.fetch(replyMessageId))
                  await interactionEditMessages(interaction, replyMessageId, '');

                // PlayerとListenerを削除
                await deletePlayerInfo(player);

                // ボタンが再生ボタンだった時停止ボタンに変更
                if (stopPlayMusicButton.data.label === '再生') {
                  stopPlayMusicButton.setLabel('停止').setEmoji('⏸');
                  interactionEditMessages(interaction, replyMessageId, { components: [buttonRow] });
                }

                // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
                for (const musicInfo of musicInfoList) {
                  if(musicInfo.songIndex >= songIndex - 1){
                  // 曲のindexを格納
                  songIndex = musicInfo.songIndex;
                  // チャンネルアイコンを取得
                  const channelThumbnail = (await ytdl.getBasicInfo(musicInfo.url)).videoDetails.author.thumbnails;
                  const embed = musicInfoMessage(
                    musicInfo,
                    buttonRow,
                    musicInfo.songIndex,
                    musicInfoList.length,
                    channelThumbnail ? channelThumbnail[0].url : null
                  );
                  interaction.channel?.messages.edit(replyMessageId, embed).catch(() => {
                    interaction.channel?.send(embed).then((res) => {
                      replyMessageId = res.id;
                    });
                  });
                  // 音楽再生
                  await playMusic(player, musicInfo);
                  }
                }
                // 再生完了した際メッセージを送信
                await donePlayerInteractionEditMessages(interaction, replyMessageId);
                // PlayerとListenerを削除
                await deletePlayerInfo(player);
                // BOTをdiscordから切断
                connection.destroy();
              }
              // 再生/停止ボタン押下時
              if (buttonInteraction.customId === `stopPlayMusicButton_${uniqueId}`) {
                // メッセージを削除
                if (interaction.channel?.messages.fetch(replyMessageId))
                  await interactionEditMessages(interaction, replyMessageId, '');

                if (player.state.status === AudioPlayerStatus.Playing) {
                  player.pause();
                  stopPlayMusicButton.setLabel('再生').setEmoji('▶');
                  interactionEditMessages(interaction, replyMessageId, { components: [buttonRow] });
                } else if (player.state.status === AudioPlayerStatus.Paused) {
                  player.unpause();
                  stopPlayMusicButton.setLabel('停止').setEmoji('⏸');
                  interactionEditMessages(interaction, replyMessageId, { components: [buttonRow] });
                }
              }
              return;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
              if (replyMessageId === buttonInteraction.message.id) {
                if (e.status == '400' || e.status == '404') {
                  // 400:DiscordAPIError[40060]: Interaction has already been acknowledged.
                  // 404:DiscordAPIError[10062]: Unknown interaction
                  await interactionEditMessages(interaction, replyMessageId, 'ボタンをもう一度押してください');
                  return;
                } else if (e.status == '401') {
                  console.log('401' + e);
                  return;
                }
                //  [code: 'ABORT_ERR']AbortError: The operation was aborted
              }
            }
          });

          // musicInfoListからmusicInfoを取り出し音楽情報のメッセージを送信し再生
          for (const musicInfo of musicInfoList) {
            songIndex = musicInfo.songIndex;
            // チャンネルアイコンを取得
            const channelThumbnail = (await ytdl.getBasicInfo(musicInfo.url)).videoDetails.author.thumbnails;
            const embed = musicInfoMessage(
              musicInfo,
              buttonRow,
              musicInfo.songIndex,
              musicInfoList.length,
              channelThumbnail ? channelThumbnail[0].url : null
            );
            if (musicInfo.songIndex === 1) await interaction.editReply(embed);
            else
              interaction.channel?.messages.edit(replyMessageId, embed).catch(() => {
                interaction.channel?.send(embed).then((res) => {
                  replyMessageId = res.id;
                });
              });
            await playMusic(player, musicInfo);
          }

          // 再生完了した際メッセージを送信
          await donePlayerInteractionEditMessages(interaction, replyMessageId);
          // PlayerとListenerを削除
          await deletePlayerInfo(player);
          // BOTをdiscordから切断
          connection.destroy();
        } else {
          //一曲の場合

          // 音楽データを取得・作成
          const musicDetails = await ytdl.getBasicInfo(url);
          const musicInfo: MusicInfo = {
            songIndex: 1,
            url: musicDetails.videoDetails.video_url,
            title: musicDetails.videoDetails.title,
            musicImg: musicDetails.videoDetails.thumbnails[3].url,
            author: {
              url: musicDetails.videoDetails.author.channel_url,
              channelID: musicDetails.videoDetails.author.id,
              name: musicDetails.videoDetails.author.name,
              channelThumbnail: musicDetails.videoDetails.author.thumbnails
                ? musicDetails.videoDetails.author.thumbnails[0].url
                : musicDetails.videoDetails.thumbnails[0].url,
            },
          };

          // ボタンをActionRowに追加
          const buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
            stopPlayMusicButton
          );

          const buttonCollector = interaction.channel?.createMessageComponentCollector({
            componentType: ComponentType.Button,
          });

          // 音楽情報のメッセージ作成、送信
          const embed = musicInfoMessage(musicInfo, buttonRow);
          await interaction.editReply(embed);

          if (!buttonCollector) return;

          // ボタンが押された時の処理
          buttonCollector.on('collect', async (buttonInteraction: ButtonInteraction) => {
            try {
              if (!buttonInteraction.replied && !buttonInteraction.deferred) {
                await buttonInteraction.deferUpdate();
              }
              // 再生/一時停止ボタン押下時
              if (buttonInteraction.customId === `stopPlayMusicButton_${uniqueId}`) {
                // メッセージを削除
                await interaction.editReply('');
                if (player.state.status === AudioPlayerStatus.Playing) {
                  player.pause();
                  stopPlayMusicButton.setLabel('再生').setEmoji('▶');
                  interaction.editReply({ components: [buttonRow] });
                } else if (player.state.status === AudioPlayerStatus.Paused) {
                  player.unpause();
                  stopPlayMusicButton.setLabel('停止').setEmoji('⏸');
                  interaction.editReply({ components: [buttonRow] });
                }
              }
              return;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
              console.error(`playMusicCommandでエラーが発生しました : ${e}`);
              if (replyMessageId === buttonInteraction.message.id) {
                if (e.status == '400' || e.status == '404') {
                  // 400:DiscordAPIError[40060]: Interaction has already been acknowledged
                  // 404:Unknown interaction
                  await interaction.editReply('ボタンをもう一度押してください');
                  return;
                } else if (e.status == '401') {
                  console.log('401' + e);
                  return;
                }
                //  [code: 'ABORT_ERR']AbortError: The operation was aborted
              }
            }
          });

          // BOTに音楽を流す
          await playMusic(player, musicInfo);

          // 再生完了した際メッセージを送信
          const embeds = donePlayerMessage();
          await interaction.editReply(embeds);
          // PlayerとListenerを削除
          await deletePlayerInfo(player);
          // BOTをdiscordから切断
          connection.destroy();
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error(`playMusicCommandでエラーが発生しました : ${e}`);
        // それぞれのエラー制御
        if (e.status == '400')
          return await interaction.channel?.send('音楽情報のメッセージ存在しないため再生できません。');
        else if (e.status == '401') return console.log('401' + e);
        else if (e.status == '410')
          return await interaction.editReply('ポリシーに適していないものが含まれるため再生できません。');

        await interaction.editReply('処理中にエラーが発生しました。\n開発者にお問い合わせください。');
      }
    }
    // else if(interaction.options.getSubcommand() === 'search') {
    //   const words = interaction.options.getString('words') ?? '';

    //   if(!words) return interaction.editReply('wordsが不正です');

    //   const searchPlayListInfo = await YouTube.search(words,{type: "playlist",limit: 5,safeSearch: true});

    //   const musicplayListInfo: PlayListInfo[] = searchPlayListInfo.map((item,index)=>{
    //       return {
    //           playListId: index + 1,
    //           url: item.url,
    //           thumbnail:item.thumbnail?.url,
    //           title: item.title
    //       }
    //   });
    //   console.log(musicplayListInfo)
    // }
  },
};
