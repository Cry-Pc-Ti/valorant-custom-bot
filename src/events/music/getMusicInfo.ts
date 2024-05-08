import ytdl from 'ytdl-core';
import YouTube from 'youtube-sr';

// URLからプレイリスト情報を取得しデータ加工をして返す
export const getMusicPlayListInfo = async (url: string, shuffleFlag: boolean) => {
  //URLからplayList情報を取得
  const playListInfo = await YouTube.getPlaylist(url);

  // shuffleFlagがtrueの場合配列をシャッフル
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  if (shuffleFlag) playListInfo.videos.sort((_a, _b) => 0.5 - Math.random());

  //playListからMusicInfo配列に格納
  return {
    playListId: 1,
    url: url,
    thumbnail: playListInfo.thumbnail?.url,
    title: playListInfo.title ?? 'titleの取得に失敗しました。',
    videosLength: String(playListInfo.videoCount),
    musicInfo: playListInfo.videos.map((musicInfo, index) => {
      return {
        songIndex: index + 1,
        id: musicInfo.id ?? musicInfo.url,
        url: musicInfo.url,
        title: musicInfo.title ?? 'titleの取得に失敗しました。',
        musicImg: musicInfo.thumbnail?.url,
        author: {
          url: musicInfo.channel?.url,
          channelID: musicInfo.channel?.id,
          name: musicInfo.channel?.name ?? 'チャンネル名の取得に失敗しました。',
          channelThumbnail: musicInfo.channel?.icon.url,
        },
        relatedVideosIDlist: [],
      };
    }),
  };
};

// URLから音楽情報を取得しデータ加工をして返す
export const getSingleMusicInfo = async (url: string, index?: number) => {
  // 音楽データを取得・作成
  const musicDetails = await ytdl.getBasicInfo(url);

  return {
    songIndex: index ? index + 1 : 1,
    id: musicDetails.videoDetails.videoId,
    url: musicDetails.videoDetails.video_url,
    title: musicDetails.videoDetails.title,
    musicImg: musicDetails.videoDetails.thumbnails[3].url,
    author: {
      url: musicDetails.videoDetails.author.channel_url,
      channelID: musicDetails.videoDetails.author.id,
      name: musicDetails.videoDetails.author.name,
      channelThumbnail: musicDetails.videoDetails.author.thumbnails?.map((thumbnail) => thumbnail.url)[0],
    },
    relatedVideosIDlist: musicDetails.related_videos.map((item) => item.id ?? ''),
  };
};

// wordsからプリリスト情報を検索しデータ加工をして返す
export const getSearchMusicPlayListInfo = async (words: string) => {
  const searchPlayListInfo = await YouTube.search(words, { type: 'playlist', limit: 30, safeSearch: true });

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
