import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { playListMusicMainLogic } from '../../events/music/playListMusicMainLogic';
import { MusicInfo, PlayListInfo } from '../../types/musicData';
import { getMusicPlayListInfo, getSearchMusicPlayListInfo } from '../../events/music/getMusicInfo';
import { Logger } from '../../events/common/log';

export const searchCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const words = interaction.options.getString('words');

    if (!words) return interaction.editReply('wordsが不正です');

    // ボイスチャンネルにいない場合は処理しない
    const voiceChannelId = (await interaction.guild?.members.fetch(interaction.user.id))?.voice.channelId;
    if (!voiceChannelId) return interaction.editReply('ボイスチャンネルに参加してください。');

    // データ収集
    Logger.LogAccessInfo(`${interaction.user.username}(${interaction.user.id})さんが${words} を調べました。`);

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
        await interaction.editReply({
          content: `【${musicplayListInfo[Number(selectMenuInteraction.values)].title}】を再生しております。`,
          components: [],
        });

        // URLからプレイリスト情報を取得
        const musicInfoList: MusicInfo[] = await getMusicPlayListInfo(
          musicplayListInfo[Number(selectMenuInteraction.values)].url,
          true
        );

        // playList再生処理
        await playListMusicMainLogic(interaction, voiceChannelId, musicInfoList);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        Logger.LogSystemError(error);
        await interaction.editReply({
          content: `もう一度選択するか、再度コマンドを入力してください`,
          files: [],
          components: [],
        });
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    Logger.LogSystemError(error);
    await interaction.editReply({
      embeds: [],
      files: [],
      content: '処理中にエラーが発生しました。再度コマンドを入力してください。',
    });
  }
};
