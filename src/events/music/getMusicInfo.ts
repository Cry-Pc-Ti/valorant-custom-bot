import ytdl from 'ytdl-core';
import { MusicInfo } from '../../types/musicData';
import ytpl from 'ytpl';

export const getMusicPlayListInfo = async (url: string, shuffleFlag: boolean) => {
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
      relatedVideosIDlist: [],
    };
  });
  return musicInfoList;
};

export const getSingleMusicInfo = async (url: string, index?: number) => {
  // 音楽データを取得・作成
  const musicDetails = await ytdl.getBasicInfo(url);

  const musicInfo: MusicInfo = {
    songIndex: index ? index + 1 : 1,
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
    relatedVideosIDlist: musicDetails.related_videos.map((item) => item.id ?? ''),
  };
  return musicInfo;
};
