import { notion, banDbId } from '../../modules/notionModule';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import { isFullPage } from '@notionhq/client';

// Notionから管理者のユーザーデータを取得する
export const fetchBanUserId = async () => {
  // AdminユーザーIDを格納する配列
  const bannedUserIds: string[] = [];

  try {
    // DBからページIDを取得
    const response = await notion.databases.query({
      database_id: banDbId,
    });

    // 検索結果がない場合は空配列を返す
    if (!response.results.length) return [];

    // 検索結果からページ情報を取得
    for (const data of response.results) {
      const pageData: GetPageResponse = await notion.pages.retrieve({ page_id: data.id });

      // ユーザーIDを配列に格納
      if (isFullPage(pageData)) {
        const properties = pageData.properties;

        if ('ID' in properties && properties.ID.type === 'rich_text') {
          const richTextArray = properties.ID.rich_text;

          if (richTextArray.length) {
            const userId = richTextArray[0].plain_text;
            bannedUserIds.push(userId);
          }
        }
      }
    }

    console.log(`BanされたユーザーIDを取得しました : ${bannedUserIds}`);

    return bannedUserIds;
  } catch (error) {
    console.error(`管理者ユーザーIDの取得中にエラーが発生しました : ${error}`);
    return bannedUserIds;
  }
};

(async () => {
  await fetchBanUserId();
})();
