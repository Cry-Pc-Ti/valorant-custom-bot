import ytdl from 'ytdl-core';
import YouTube from 'youtube-sr';
import { MusicInfo, PlayListInfo } from '../../types/musicData';
import { Logger } from '../common/log';
import ytpl from 'ytpl';

// プレイリストの動画をシャッフルする関数
const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// URLからプレイリスト情報を取得しデータ加工をして返す
export const getMusicPlayListInfo = async (url: string, shuffleFlag: boolean): Promise<PlayListInfo> => {
  //URLからplayList情報を取得
  const playListInfo = await YouTube.getPlaylist(url);

  // shuffleFlagがtrueの場合シャッフル
  if (shuffleFlag) shuffleArray(playListInfo.videos);

  //playListからMusicInfo配列に格納
  const musicInfoArray: MusicInfo[] = playListInfo.videos.map((musicInfo, index) => ({
    songIndex: index + 1,
    id: musicInfo.id ?? musicInfo.url,
    url: musicInfo.url,
    title: musicInfo.title ?? 'titleの取得に失敗しました。',
    musicImg: musicInfo.thumbnail?.url,
    durationFormatted: '', // 必要に応じてフォーマットする
    author: {
      url: musicInfo.channel?.url,
      channelID: musicInfo.channel?.id,
      name: musicInfo.channel?.name ?? 'チャンネル名の取得に失敗しました。',
      channelThumbnail: musicInfo.channel?.icon.url,
    },
    relatedVideosIDlist: [],
  }));

  return {
    playListId: 1,
    url,
    thumbnail: playListInfo.thumbnail?.url,
    title: playListInfo.title ?? 'titleの取得に失敗しました。',
    videosLength: String(playListInfo.videoCount),
    musicInfo: musicInfoArray,
  };
};

// URLから音楽情報を取得しデータ加工をして返す関数
export const getSingleMusicInfo = async (url: string, index: number = 0) => {
  try {
    // 音楽データを取得
    const musicDetails = await ytdl.getBasicInfo(url);

    // データ加工して返す
    return {
      songIndex: index + 1,
      id: musicDetails.videoDetails.videoId,
      url: musicDetails.videoDetails.video_url,
      title: musicDetails.videoDetails.title,
      musicImg: musicDetails.videoDetails.thumbnails?.[3]?.url ?? '',
      durationFormatted: '', // 必要に応じてフォーマットする
      author: {
        url: musicDetails.videoDetails.author.channel_url,
        channelID: musicDetails.videoDetails.author.id,
        name: musicDetails.videoDetails.author.name,
        channelThumbnail: musicDetails.videoDetails.author.thumbnails?.[0]?.url ?? '',
      },
      // 関連動画のIDリスト
      relatedVideosIDlist: musicDetails.related_videos?.map((item) => item.id ?? '').filter((id) => id !== '') ?? [],
    };
  } catch (error) {
    Logger.LogSystemError(`Failed to fetch music info from URL ${url}: ${error}`);
    throw new Error('音楽情報の取得に失敗しました。');
  }
};

// wordsからプリリスト情報を検索しデータ加工をして返す
export const getSearchMusicPlayListInfo = async (words: string) => {
  const searchPlayListInfo = await YouTube.search(words, { type: 'playlist', limit: 25, safeSearch: true });

  // 取得したplaylist情報から必要な情報だけ格納
  return searchPlayListInfo.map((item, index) => {
    return {
      playListId: index,
      url: item.url ?? '',
      thumbnail: item.thumbnail?.url,
      title: item.title?.substring(0, 90) ?? 'titleの取得に失敗しました。',
      videosLength: String(item.videos),
      musicInfo: [],
    };
  });
};

// wordsからVideo情報を検索しデータ加工をして返す
export const getSearchMusicVideo = async (words: string) => {
  const searchPlayVideo = await YouTube.search(words, { type: 'video', limit: 25, safeSearch: true });

  // 取得したplaylist情報から必要な情報だけ格納
  return searchPlayVideo.map((item, index) => {
    return {
      songIndex: index,
      id: item.id ?? '',
      url: item.url,
      title: item.title?.substring(0, 90) ?? 'titleの取得に失敗しました。',
      musicImg: item.thumbnail?.url,
      durationFormatted: item.durationFormatted,
      author: {
        url: item.channel?.url,
        channelID: item.channel?.id,
        name: item.channel?.name ?? 'チャンネル名の取得に失敗しました。',
        channelThumbnail: item.channel?.icon.url,
      },
      relatedVideosIDlist: [],
    };
  });
};

// wordsからVideo情報を１件のみ検索しデータ加工をして返す
export const getOneSearchMusicVideo = async (words: string, index?: number) => {
  const searchVideo = await YouTube.searchOne(words, 'video', true);

  return {
    songIndex: index,
    id: searchVideo.id ?? '',
    url: searchVideo.url,
    title: searchVideo.title?.substring(0, 90) ?? 'titleの取得に失敗しました。',
    musicImg: searchVideo.thumbnail?.url,
    durationFormatted: searchVideo.durationFormatted,
    author: {
      url: searchVideo.channel?.url,
      channelID: searchVideo.channel?.id,
      name: searchVideo.channel?.name ?? 'チャンネル名の取得に失敗しました。',
      channelThumbnail: searchVideo.channel?.icon.url,
    },
    relatedVideosIDlist: [],
  };
};

// チャンネルアイコンを取得
export const getChannelThumbnails = async (musicInfos: MusicInfo[]): Promise<{ [key: string]: string | null }> => {
  const channelThumbnails: { [key: string]: string | null } = {};

  // 全曲のチャンネルアイコンを並行して一度に取得
  const thumbnailPromises = musicInfos.map(async (musicInfo) => {
    try {
      const info = await ytdl.getBasicInfo(musicInfo.id);
      const thumbnails = info.videoDetails.author.thumbnails;
      channelThumbnails[musicInfo.id] = thumbnails?.[0]?.url ?? null;
    } catch (error) {
      channelThumbnails[musicInfo.id] = null;
    }
  });

  await Promise.all(thumbnailPromises);

  return channelThumbnails;
};

// URLからプレイリストかどうかを判別
export const checkUrlType = (url: string) => {
  let isUrlError = false;
  let isPlayList = false;

  if (!ytdl.validateURL(url)) {
    if (ytpl.validateID(url)) {
      isPlayList = true;
    } else {
      isUrlError = true;
    }
  }

  return {
    urlError: isUrlError,
    result: isPlayList,
  };
};
