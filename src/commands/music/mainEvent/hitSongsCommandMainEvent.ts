import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { getSpotifyToken, getTopSongs } from '../../../service/spotify.service';
import { getOneSearchMusicVideo } from '../../../events/music/getMusicInfo';
import { MusicInfo } from '../../../types/musicData';
import { playListMusicMainLogic } from '../../../events/music/playListMusicPlayMainLogic';
import { Logger } from '../../../events/common/log';
import { stopPreviousInteraction } from '../../../store/guildCommandStates';
import { COMMAND_NAME_MUSIC } from '../mainMusicCommand';
import { getSpotifyPlayList } from '../../../events/notion/fetchSpotifyPlayList';
import { SpotifyPlaylistInfo } from '../../../types/spotifyData';
import { hitSongsPreparingPlayerMessage } from '../../../events/discord/musicEmbedMessage';

/**
 * ヒットソング再生コマンドのメインイベント
 *
 * @param interaction - チャット入力コマンドのインタラクション
 */
export const hitSongsCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  // 修正するメッセージのIDを取得
  const replyMessageId: string = (await interaction.fetchReply()).id;
  try {
    const guildId = interaction.guildId;
    if (guildId) await stopPreviousInteraction(guildId, COMMAND_NAME_MUSIC, true);

    // ボイスチャンネルにいない場合は処理しない
    const voiceChannelId = (await interaction.guild?.members.fetch(interaction.user.id))?.voice.channelId;
    if (!voiceChannelId) return interaction.editReply('ボイスチャンネルに参加してください。');

    // Spotifyのプレイリスト情報を取得
    const spotifyPlaylists: SpotifyPlaylistInfo[] = await getSpotifyPlayList();
    if (!spotifyPlaylists) return interaction.editReply('プレイリスト情報が取得できませんでした。再度選択してください');

    // セレクトメニューを作成
    const playListSelect: StringSelectMenuBuilder = new StringSelectMenuBuilder()
      .setCustomId('playListSelect')
      .setPlaceholder('再生したいジャンルを選択してください')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(
        spotifyPlaylists.map((playList, index) => ({
          value: String(index),
          label: `${playList.name}`,
          description: `${playList.description}`,
        }))
      );
    // セレクトメニューを作成
    const row: ActionRowBuilder<StringSelectMenuBuilder> =
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(playListSelect);

    const selectResponse = await interaction.editReply({
      components: [row],
    });

    // 2分後にセレクトメニューを削除するタイマーをセット
    const timeoutId = setTimeout(
      async () => {
        await selectResponse.edit({
          content: '選択されませんでした。再度コマンドを入力してください',
          components: [],
        });
      },
      2 * 60 * 1000
    );

    // セレクトメニューで選択された値を取得
    const collector = selectResponse.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (selectMenuInteraction) => selectMenuInteraction.user.id === interaction.user.id,
    });

    collector.on('collect', async (selectMenuInteraction: StringSelectMenuInteraction) => {
      try {
        // タイマーを削除
        clearTimeout(timeoutId);
        selectMenuInteraction.deferUpdate();

        const spotifyPlaylistInfo = spotifyPlaylists[Number(selectMenuInteraction.values)];

        // メッセージを作成
        const embed = hitSongsPreparingPlayerMessage(spotifyPlaylistInfo);

        await interaction.editReply(embed);

        const token = await getSpotifyToken();
        const topSongs = await getTopSongs(token, spotifyPlaylistInfo.id);

        const videoPromises = topSongs
          .slice(0, 100)
          .map((song: { artists: string; name: string }, index: number) =>
            getOneSearchMusicVideo(`${song.artists} ${song.name}`, index + 1)
          );

        const videoResults = await Promise.all(videoPromises);
        const musicplayVideoList: MusicInfo[] = [...videoResults];

        // データ収集
        Logger.LogAccessInfo(
          `【${interaction.guild?.name}(${interaction.guild?.id})】${interaction.user.username}(${interaction.user.id})さんが${spotifyPlaylistInfo.name} を選択`
        );

        // playList再生処理
        await playListMusicMainLogic(
          interaction,
          voiceChannelId,
          {
            playListId: 1,
            url: 'https://open.spotify.com/playlist/' + spotifyPlaylistInfo.id,
            thumbnail: undefined,
            title: `${spotifyPlaylistInfo.title}`,
            description: `${spotifyPlaylistInfo.description}`,
            rankingFlag: spotifyPlaylistInfo.ranking,
            videosLength: String(musicplayVideoList.length),
            musicInfo: musicplayVideoList,
          },
          3
        );
      } catch (error) {
        Logger.LogError(
          `【${interaction.guild?.id}】hitSongsCommandMainEvent・selectMenuInteractionでエラーが発生しました`,
          error
        );
        await interaction.channel?.messages.edit(replyMessageId, {
          content: `再度コマンドを入力してください`,
          files: [],
          components: [],
        });
      }
    });
  } catch (error) {
    Logger.LogError(`【${interaction.guild?.id}】hitSongsCommandMainEventでエラーが発生しました`, error);
    await interaction.editReply({
      embeds: [],
      files: [],
      content: '処理中にエラーが発生しました。再度コマンドを入力してください。',
    });
  }
};
