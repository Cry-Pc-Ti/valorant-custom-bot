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
import { createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import { Logger } from '../../events/common/log';

export const searchCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const voiceChannelId = interaction.options.getChannel('channel')?.id;
    const words = interaction.options.getString('words');

    if (!voiceChannelId) return interaction.editReply('ボイスチャンネルが見つかりません。');
    else if (!words) return interaction.editReply('wordsが不正です');

    const musicplayListInfo: PlayListInfo[] = await getSearchMusicPlayListInfo(words);

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    Logger.LogSystemError(error);
  }
};
