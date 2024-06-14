import { notion, adminDbId } from '../../modules/notionModule';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import { isFullPage } from '@notionhq/client';

// Notionから管理者のユーザーデータを取得する
export const fetchAdminUserId = async () => {
  // AdminユーザーIDを格納する配列
  const adminUserIds: string[] = [];

  try {
    // DBからページIDを取得
    const response = await notion.databases.query({
      database_id: adminDbId,
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
            adminUserIds.push(userId);
          }
        }
      }
    }

    return adminUserIds;
  } catch (error) {
    console.error(`管理者ユーザーIDの取得中にエラーが発生しました : ${error}`);
    return adminUserIds;
  }
};
