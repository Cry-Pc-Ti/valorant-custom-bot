import { createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import {
  ActionRowBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { MusicInfo, PlayListInfo } from '../../types/musicData';
import { clientId } from '../../modules/discordModule';
import { playListMusicMainLogic } from '../../events/music/playListMusicMainLogic';
import ytpl from 'ytpl';
import ytdl from 'ytdl-core';
import YouTube from 'youtube-sr';
import { singleMusicMainLogic } from '../../events/music/singleMusicMainLogic';
import { getMusicPlayListInfo, getSingleMusicInfo } from '../../events/music/getMusicInfo';
import { generateRandomNum } from '../../events/common/generateRandomNum';

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
          option
            .setName('shuffle')
            .setDescription('プレイリストをランダムに再生したい場合はtrueを入れてください')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName('url').setDescription('再生したいURLを入力（プレイリストも可）').setRequired(true)
        )
    )
    .addSubcommand((subcommand) => subcommand.setName('disconnect').setDescription('BOTをVCから切断します。'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('search')
        .setDescription('入力されたワードからplayListを検索して再生します')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('音楽を流すチャンネルを選択')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
        .addStringOption((option) =>
          option.setName('words').setDescription('検索したいワードを入力してください').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('recommend')
        .setDescription('指定されたURLから関連のある曲を再生します（新しい曲探しの旅に出たい方はどうぞ）')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('音楽を流すチャンネルを選択')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
        .addStringOption((option) =>
          option.setName('url').setDescription('再生したいURLを入力（プレイリストも可）').setRequired(true)
        )
    )
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    if (interaction.options.getSubcommand() === 'disconnect') {
      try {
        const botJoinVoiceChannelId = await interaction.guild?.members.fetch(clientId);
        if (botJoinVoiceChannelId?.voice.channelId) {
          await botJoinVoiceChannelId?.voice.disconnect();
          await interaction.editReply('BOTをVCから切断しました。');
          return;
        }
        await interaction.editReply('BOTがVCにいません。');
        return;
      } catch (error) {
        console.error(`playMusicCommandでエラーが発生しました : ${error}`);
      }
    } else if (interaction.options.getSubcommand() === 'play') {
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

        // playerを作成しdisに音をながす
        const player = createAudioPlayer();
        // BOTをVCに接続
        const connection = joinVoiceChannel({
          channelId: voiceChannelId,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild?.voiceAdapterCreator,
          selfDeaf: true,
        });
        connection.subscribe(player);

        if (playListFlag) {
          // プレイリストの場合
          // URLからプレイリスト情報を取得
          const musicInfoList: MusicInfo[] = await getMusicPlayListInfo(url, shuffleFlag);
          // playList再生処理
          await playListMusicMainLogic(interaction, connection, player, musicInfoList);
        } else {
          // 1曲の場合
          // URLから音楽情報を取得
          const musicInfo: MusicInfo = await getSingleMusicInfo(url);
          // shingleSong再生処理
          await singleMusicMainLogic(interaction, connection, player, musicInfo);
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
    } else if (interaction.options.getSubcommand() === 'search') {
      const voiceChannelId = interaction.options.getChannel('channel')?.id;
      const words = interaction.options.getString('words');

      if (!voiceChannelId) return interaction.editReply('ボイスチャンネルが見つかりません。');
      else if (!words) return interaction.editReply('wordsが不正です');

      const searchPlayListInfo = await YouTube.search(words, { type: 'playlist', limit: 20, safeSearch: true });

      // 取得したplaylist情報から必要な情報だけ格納
      const musicplayListInfo: PlayListInfo[] = searchPlayListInfo.map((item, index) => {
        return {
          playListId: index,
          url: item.url ?? '',
          thumbnail: item.thumbnail?.url,
          title: item.title?.substring(0, 100),
        };
      });

      // セレクトメニューを作成
      const playListSelect: StringSelectMenuBuilder = new StringSelectMenuBuilder()
        .setCustomId('playListSelect')
        .setPlaceholder('再生したいplaylistを選択してください')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
          musicplayListInfo.map((musicplayList) => ({
            value: String(musicplayList.playListId),
            label: musicplayList.title ?? '',
          }))
        );
      // セレクトメニューを送信
      const row: ActionRowBuilder<StringSelectMenuBuilder> =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(playListSelect);

      const selectResponse = await interaction.editReply({
        components: [row],
      });

      // セレクトメニューで選択された値を取得
      const collector = selectResponse.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (selectMenuInteraction) => selectMenuInteraction.user.id === interaction.user.id,
      });

      collector.on('collect', async (selectMenuInteraction: StringSelectMenuInteraction) => {
        if (!interaction.guildId || !interaction.guild?.voiceAdapterCreator) {
          interaction.editReply('ボイスチャンネルが見つかりません。');
          return;
        }

        await interaction.editReply({
          content: `【${musicplayListInfo[Number(selectMenuInteraction.values)].title}】を再生しております。`,
          components: [],
        });

        // playerを作成しdisに音をながす
        const player = createAudioPlayer();
        // BOTをVCに接続
        const connection = joinVoiceChannel({
          channelId: voiceChannelId,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild?.voiceAdapterCreator,
          selfDeaf: true,
        });
        connection.subscribe(player);

        // URLからプレイリスト情報を取得
        const musicInfoList: MusicInfo[] = await getMusicPlayListInfo(
          musicplayListInfo[Number(selectMenuInteraction.values)].url,
          true
        );

        // playList再生処理
        await playListMusicMainLogic(interaction, connection, player, musicInfoList);
      });
    } else if (interaction.options.getSubcommand() === 'recommend') {
      const url = interaction.options.getString('url') ?? '';
      const voiceChannelId = interaction.options.getChannel('channel')?.id;

      if (!voiceChannelId || !interaction.guildId || !interaction.guild?.voiceAdapterCreator)
        return interaction.editReply('ボイスチャンネルが見つかりません。');

      // プレイリストか曲か判別
      let playListFlag: boolean = false;
      if (!ytdl.validateURL(url) && ytpl.validateID(url)) playListFlag = true;
      else if (!ytpl.validateID(url) && ytdl.validateURL(url)) playListFlag = false;
      else if (!ytdl.validateURL(url) || !ytpl.validateID(url))
        return interaction.editReply('こちらの音楽は再生できません。正しいURLを指定してください。');

      let musicInfo: MusicInfo;

      if (playListFlag) {
        const musicInfoList = await getMusicPlayListInfo(url, true);
        musicInfo = await getSingleMusicInfo(musicInfoList[generateRandomNum(0, musicInfoList.length - 1)].url);
      } else {
        musicInfo = await getSingleMusicInfo(url);
      }
      const relatedMusicInfoList: MusicInfo[] = [];

      for (let i = 0; i < 10; i++) {
        const relatedVideosID =
          musicInfo.relatedVideosIDlist[generateRandomNum(0, musicInfo.relatedVideosIDlist.length - 1)];
        if (!relatedVideosID || !ytdl.validateID(relatedVideosID)) return;
        musicInfo = await getSingleMusicInfo(relatedVideosID, i);
        relatedMusicInfoList.push(musicInfo);
      }
      // playerを作成しdisに音をながす
      const player = createAudioPlayer();
      // BOTをVCに接続
      const connection = joinVoiceChannel({
        channelId: voiceChannelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild?.voiceAdapterCreator,
        selfDeaf: true,
      });
      connection.subscribe(player);

      // playList再生処理
      await playListMusicMainLogic(interaction, connection, player, relatedMusicInfoList);
    }
  },
};
