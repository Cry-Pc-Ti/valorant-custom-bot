import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { MusicInfo, PlayListInfo } from '../../types/musicData';
import { SpotifyPlaylistInfo } from '../../types/spotifyData';

/**
 * playコマンドのメッセージを作成
 * @param {MusicInfo} musicInfo - 再生する音楽の情報
 * @param {ActionRowBuilder<ButtonBuilder>[]} buttonRowList - ボタンのアクション行のリスト
 * @returns {Object} Discordメッセージオブジェクト
 */
export const musicInfoMessage = (
  musicInfo: MusicInfo,
  buttonRowList: ActionRowBuilder<ButtonBuilder>[]
): { embeds: EmbedBuilder[]; files: AttachmentBuilder[]; components: ActionRowBuilder<ButtonBuilder>[] } => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle(musicInfo.title)
    .setURL(musicInfo.url ?? null)
    .setImage(musicInfo.musicImg ?? null)
    .setFooter({
      text: 'YouTube',
      iconURL: 'attachment://youtube_icon.png',
    })
    .setTimestamp();

  if (musicInfo.author.channelThumbnail) {
    embeds.setAuthor({
      name: musicInfo.author.name,
      iconURL: musicInfo.author.channelThumbnail,
    });
  } else {
    embeds.setAuthor({
      name: musicInfo.author.name,
    });
  }

  const footerAttachment = new AttachmentBuilder('static/img/icon/youtube_icon.png');

  return { embeds: [embeds], files: [footerAttachment], components: buttonRowList };
};

/**
 * playListコマンドのメッセージを作成
 * @param {PlayListInfo} playListInfo - プレイリストの情報
 * @param {ActionRowBuilder<ButtonBuilder>[]} buttonRowList - ボタンのアクション行のリスト
 * @param {number} musicCount - 現在の曲番号
 * @param {string | undefined} channelThumbnail - チャンネルのサムネイルURL
 * @param {number} commandFlg - コマンドフラグ (0: playCommand, 1: searchCommand, 2: recommend, 3: hitsong)
 * @returns {Object} Discordメッセージオブジェクト
 */
export const musicInfoPlayListMessage = (
  playListInfo: PlayListInfo,
  buttonRowList: ActionRowBuilder<ButtonBuilder>[],
  musicCount: number,
  channelThumbnail: string | undefined,
  commandFlg: number
): { embeds: EmbedBuilder[]; files: AttachmentBuilder[]; components: ActionRowBuilder<ButtonBuilder>[] } => {
  const embeds = new EmbedBuilder().setColor('#fd4556');

  if (commandFlg === 0) {
    embeds.addFields({
      name: 'プレイリスト',
      value: `【[${playListInfo.title}](${playListInfo.url})】を再生中🎵 `,
      inline: true,
    });
    if (playListInfo.musicInfo.length) {
      embeds.addFields({
        name: '曲順',
        value: `${musicCount} / ${playListInfo.musicInfo.length}`,
        inline: true,
      });
    }
  } else if (commandFlg === 1) {
    embeds.addFields(
      {
        name: '検索したワード',
        value: `${playListInfo.searchWord}`,
        inline: true,
      },
      {
        name: '曲順',
        value: `${musicCount} / ${playListInfo.musicInfo.length}`,
        inline: true,
      }
    );
  } else if (commandFlg === 2) {
    embeds.addFields(
      {
        name: '最初に指定した楽曲',
        value: `${playListInfo.title}`,
      },
      {
        name: '曲順',
        value: `${musicCount} / ${playListInfo.musicInfo.length}`,
        inline: true,
      }
    );
  } else if (commandFlg === 3) {
    embeds.addFields({
      name: playListInfo.title,
      value: playListInfo.description ?? '',
    });
    if (playListInfo.rankingFlag) {
      embeds.addFields({
        name: `順位`,
        value: `${musicCount}位`,
        inline: true,
      });
    } else {
      embeds.addFields({
        name: '曲順',
        value: `${musicCount} / ${playListInfo.musicInfo.length}`,
        inline: true,
      });
    }
  }

  if (musicCount === playListInfo.musicInfo.length) {
    embeds.addFields({ name: '次の曲', value: `曲の情報がありません。` });
  } else {
    embeds.addFields({
      name: '次の曲',
      value: `[${playListInfo.musicInfo[musicCount].title}](${playListInfo.musicInfo[musicCount].url})`,
    });
  }

  const embeds2 = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle(playListInfo.musicInfo[musicCount - 1].title)
    .setURL(playListInfo.musicInfo[musicCount - 1].url ?? null)
    .setImage(playListInfo.musicInfo[musicCount - 1].musicImg ?? null)
    .setFooter({
      text: 'YouTube Playlist',
      iconURL: 'attachment://youtube_icon.png',
    })
    .setTimestamp();

  if (channelThumbnail) {
    embeds2.setAuthor({
      name: playListInfo.musicInfo[musicCount - 1].author.name,
      iconURL: channelThumbnail,
    });
  } else {
    embeds2.setAuthor({
      name: playListInfo.musicInfo[musicCount - 1].author.name,
    });
  }

  const footerAttachment = new AttachmentBuilder('static/img/icon/youtube_icon.png');

  return { embeds: [embeds, embeds2], files: [footerAttachment], components: buttonRowList };
};

/**
 * playList再生準備中のメッセージを作成 (play)
 * @returns {Object} Discordメッセージオブジェクト
 */
export const playListPlayMusicMessage = (): { embeds: EmbedBuilder[]; files: AttachmentBuilder[]; components: [] } => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('プレイリスト情報を取得しております。少々お待ちください\n\n※取得に時間がかかる場合がございます。')
    .setFooter({
      text: 'YouTube',
      iconURL: 'attachment://youtube_icon.png',
    })
    .setTimestamp();

  const footerAttachment = new AttachmentBuilder('static/img/icon/youtube_icon.png');

  return { embeds: [embeds], files: [footerAttachment], components: [] };
};

/**
 * 再生準備中のメッセージを作成 (recommend)
 * @returns {Object} Discordメッセージオブジェクト
 */
export const preparingPlayerMessage = (): { embeds: EmbedBuilder[]; files: AttachmentBuilder[]; components: [] } => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('関連の楽曲を探しております。少々お待ちください')
    .setFooter({
      text: 'YouTube',
      iconURL: 'attachment://youtube_icon.png',
    })
    .setTimestamp();

  const footerAttachment = new AttachmentBuilder('static/img/icon/youtube_icon.png');

  return { embeds: [embeds], files: [footerAttachment], components: [] };
};

/**
 * 再生準備中のメッセージを作成 (hitsong)
 * @param {SpotifyPlaylistInfo} spotifyPlaylistInfo - Spotifyプレイリスト情報
 * @returns {Object} Discordメッセージオブジェクト
 */
export const hitSongsPreparingPlayerMessage = (
  spotifyPlaylistInfo: SpotifyPlaylistInfo
): { embeds: EmbedBuilder[]; files: AttachmentBuilder[]; components: [] } => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle(`${spotifyPlaylistInfo.title}で検索中です。\n少々お待ちください\n\n※hitsongはspotify調べです。`)
    .setFooter({
      text: 'YouTube',
      iconURL: 'attachment://youtube_icon.png',
    })
    .setTimestamp();

  const footerAttachment = new AttachmentBuilder('static/img/icon/youtube_icon.png');

  return { embeds: [embeds], files: [footerAttachment], components: [] };
};

/**
 * 再生途中のメッセージを作成
 * @returns {Object} Discordメッセージオブジェクト
 */
export const terminateMidwayPlayerMessage = (): {
  embeds: EmbedBuilder[];
  files: AttachmentBuilder[];
  components: [];
} => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('途中で再生が終了しました。')
    .setFooter({
      text: 'YouTube',
      iconURL: 'attachment://youtube_icon.png',
    })
    .setTimestamp();

  const footerAttachment = new AttachmentBuilder('static/img/icon/youtube_icon.png');

  return { embeds: [embeds], files: [footerAttachment], components: [] };
};

/**
 * 再生完了のメッセージを作成
 * @returns {Object} Discordメッセージオブジェクト
 */
export const donePlayerMessage = (): { embeds: EmbedBuilder[]; files: AttachmentBuilder[]; components: [] } => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('再生完了')
    .setFooter({
      text: 'YouTube',
      iconURL: 'attachment://youtube_icon.png',
    })
    .setTimestamp();

  const footerAttachment = new AttachmentBuilder('static/img/icon/youtube_icon.png');

  return { embeds: [embeds], files: [footerAttachment], components: [] };
};
