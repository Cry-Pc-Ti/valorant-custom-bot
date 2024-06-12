import { notion, spotifyDbId } from '../../modules/notionModule';
import { isFullPage } from '@notionhq/client';
import { SpotifyPlaylistInfo } from '../../types/spotifyData';

// NotionからspotifeのplayListIDを取得する
export const getSpotifyPlayList = async (): Promise<SpotifyPlaylistInfo[]> => {
  try {
    // DBからページIDを取得
    const response = await notion.databases.query({
      database_id: spotifyDbId,
    });

    // 検索結果がない場合は空配列を返す
    if (!response.results.length) return [];

    // ページ情報を並列に取得
    const pagePromises = response.results.map((data) => notion.pages.retrieve({ page_id: data.id }));
    const pageDataArray = await Promise.all(pagePromises);

    // ページ情報からPlaylistInfoを抽出して配列に変換
    const spotifyPlaylist: SpotifyPlaylistInfo[] = pageDataArray.map((pageData) => {
      const playListInfo: SpotifyPlaylistInfo = {
        name: '',
        id: '',
        title: '',
        description: '',
        ranking: false,
        displayFlag: false,
        active_date: {
          start_date: null,
          end_date: null,
        },
      };

      if (isFullPage(pageData)) {
        const properties = pageData.properties;

        if ('ID' in properties && properties.ID.type === 'rich_text') {
          const richTextArray = properties.ID.rich_text;
          if (richTextArray.length) {
            playListInfo.id = richTextArray[0].plain_text;
          }
        }
        if ('title' in properties && properties.title.type === 'rich_text') {
          const richTextArray = properties.title.rich_text;
          if (richTextArray.length) {
            playListInfo.title = richTextArray[0].plain_text;
          }
        }
        if ('displayFlag' in properties && properties.displayFlag.type === 'checkbox') {
          playListInfo.displayFlag = properties.displayFlag.checkbox;
        }
        if ('ranking' in properties && properties.ranking.type === 'checkbox') {
          playListInfo.ranking = properties.ranking.checkbox;
        }
        if ('name' in properties && properties.name.type === 'title') {
          const titleArray = properties.name.title;
          if (titleArray.length) {
            playListInfo.name = titleArray[0].plain_text;
          }
        }
        if ('description' in properties && properties.description.type === 'rich_text') {
          const richTextArray = properties.description.rich_text;
          if (richTextArray.length) {
            playListInfo.description = richTextArray[0].plain_text;
          }
        }
        if ('active_date' in properties && properties.active_date.type === 'date') {
          playListInfo.active_date.start_date = properties.active_date.date?.start ?? '';
          playListInfo.active_date.end_date = properties.active_date.date?.end ?? '';
        }
      }

      return playListInfo;
    });
    const now = new Date();

    return spotifyPlaylist.slice(0, 24).filter((playList) => {
      if (!playList.displayFlag) {
        return false;
      }
      const startDate = playList.active_date.start_date ? new Date(playList.active_date.start_date) : null;
      const endDate = playList.active_date.end_date ? new Date(playList.active_date.end_date) : null;
      if (startDate && endDate) {
        return now >= startDate && now <= endDate;
      } else if (startDate && !endDate) {
        return now >= startDate;
      } else if (!startDate && endDate) {
        return now <= endDate;
      }
      return true; // start_dateまたはend_dateがNULLの場合は表示する
    });
  } catch (error) {
    console.error('Error fetching Spotify playlist info from Notion:', error);
    throw error;
  }
};
