import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { Logger } from '../../../events/common/log';
import {
  getSearchMusicPlayListInfo,
  getMusicPlayListInfo,
  getSearchMusicVideo,
} from '../../../events/music/getMusicInfo';
import { playListMusicMainLogic } from '../../../events/music/playListMusicPlayMainLogic';
import { MusicInfo, PlayListInfo } from '../../../types/musicData';
import { singleMusicMainLogic } from '../../../events/music/singleMusicPlayMainLogic';
import { COMMAND_NAME_MUSIC } from '../mainMusicCommand';
import { stopPreviousInteraction } from '../../../store/guildCommandStates';

export const searchCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  // 修正するメッセージのIDを取得
  const replyMessageId: string = (await interaction.fetchReply()).id;

  try {
    const guildId = interaction.guildId;
    if (guildId) await stopPreviousInteraction(guildId, COMMAND_NAME_MUSIC);

    const words = interaction.options.getString('words');
    const type = interaction.options.getString('type');

    if (!words || !type) return interaction.editReply('wordsが不正です');

    // ボイスチャンネルにいない場合は処理しない
    const voiceChannelId = (await interaction.guild?.members.fetch(interaction.user.id))?.voice.channelId;
    if (!voiceChannelId) return interaction.editReply('ボイスチャンネルに参加してください。');

    // データ収集
    Logger.LogAccessInfo(`${interaction.user.username}(${interaction.user.id})さんが${words} を調べました。`);

    if (type === 'playlist') {
      const musicplayListInfo: PlayListInfo[] = await getSearchMusicPlayListInfo(words);
      // セレクトメニューを作成
      const playListSelect: StringSelectMenuBuilder = new StringSelectMenuBuilder()
        .setCustomId('playListSelect')
        .setPlaceholder('再生したいplaylistを選択してください')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
          musicplayListInfo.map((musicplayList, index) => ({
            value: String(musicplayList.playListId),
            label: `${index + 1}: ${musicplayList.title}`,
            description: `全${musicplayList.videosLength}曲`,
          }))
        );
      // セレクトメニューを作成
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
        try {
          selectMenuInteraction.deferUpdate();

          // URLからプレイリスト情報を取得
          const playListInfo: PlayListInfo = await getMusicPlayListInfo(
            musicplayListInfo[Number(selectMenuInteraction.values)].url,
            false
          );
          playListInfo.searchWord = words;

          // playList再生処理
          await playListMusicMainLogic(interaction, voiceChannelId, playListInfo, 1);
        } catch (error) {
          Logger.LogSystemError(`searchCommandMainEventでエラーが発生しました : ${error}`);
          await interaction.channel?.messages.edit(replyMessageId, {
            content: `再度コマンドを入力してください`,
            files: [],
            components: [],
          });
        }
      });
    } else if (type === 'video') {
      const musicplayVideoList: MusicInfo[] = await getSearchMusicVideo(words);

      // セレクトメニューを作成
      const playListSelect: StringSelectMenuBuilder = new StringSelectMenuBuilder()
        .setCustomId('videoSelect')
        .setPlaceholder('再生したい動画を選択してください')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
          musicplayVideoList.map((musicplayVideo, index) => ({
            value: String(index),
            label: `${index + 1}: ${musicplayVideo.title}`,
            description: `【再生時間】 ${musicplayVideo.durationFormatted}`,
          }))
        );

      // セレクトメニューを作成
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
        try {
          selectMenuInteraction.deferUpdate();

          await singleMusicMainLogic(
            interaction,
            voiceChannelId,
            musicplayVideoList[Number(selectMenuInteraction.values)]
          );
        } catch (error) {
          Logger.LogSystemError(`searchCommandMainEventでエラーが発生しました : ${error}`);
          await interaction.channel?.messages.edit(replyMessageId, {
            content: `再度コマンドを入力してください`,
            files: [],
            components: [],
          });
        }
      });
    }
  } catch (error) {
    Logger.LogSystemError(`searchCommandMainEventでエラーが発生しました : ${error}`);
    await interaction.channel?.messages.edit(replyMessageId, {
      content: `再度コマンドを入力してください`,
      files: [],
      components: [],
    });
  }
};
