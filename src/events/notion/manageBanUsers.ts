import { notion, banDbId } from '../../modules/notionModule';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import { isFullPage } from '@notionhq/client';
import { BanUserData } from '../../types/banUserData';
import { discord } from '../../modules/discordModule';

let bannedUsersData: BanUserData[] = [];

// Notionから管理者のユーザーデータを取得する
export const fetchBannedUsersData = async (): Promise<BanUserData[]> => {
  try {
    // DBからページIDを取得
    const response = await notion.databases.query({
      database_id: banDbId,
    });

    // 検索結果がない場合は空配列を返す
    if (!response.results.length) return [];

    // 検索結果からページ情報を取得
    for (const data of response.results) {
      // ページ情報を取得
      const pageData: GetPageResponse = await notion.pages.retrieve({ page_id: data.id });

      const bannedUserData: BanUserData = { name: '', id: '', isBan: false };

      // ユーザーIDを配列に格納
      if (isFullPage(pageData)) {
        const properties = pageData.properties;

        // ユーザー名を取得
        if ('Name' in properties && properties.Name.type === 'title') {
          const titleArray = properties.Name.title;
          if (titleArray.length) {
            bannedUserData.name = titleArray[0].plain_text;
          }
        }

        // ユーザーIDを取得
        if ('ID' in properties && properties.ID.type === 'rich_text') {
          const richTextArray = properties.ID.rich_text;
          if (richTextArray.length) {
            bannedUserData.id = richTextArray[0].plain_text;
          }
        }

        // BANフラグを取得
        if ('isBan' in properties && properties.isBan.type === 'checkbox') {
          bannedUserData.isBan = properties.isBan.checkbox;
        }

        bannedUsersData.push(bannedUserData);
      }
    }
    console.log(bannedUsersData);
    return bannedUsersData;
  } catch (error) {
    console.error(`BANユーザーIDの取得中にエラーが発生しました : ${error}`);
    return bannedUsersData;
  }
};

// BANユーザーリストを読み込み
export const loadBannedUsers = (): BanUserData[] => {
  return bannedUsersData;
};

// Banユーザーを登録
export const saveBannedUser = async (userId: string) => {
  try {
    // DiscordユーザIDから名前を取得
    let userName = '';
    await discord.users
      .fetch(userId)
      .then((user) => {
        if (!user.globalName) return;
        if (!user.tag) return;
        userName = `${user.globalName}#${user.tag}`;
      })
      .catch((error) => {
        console.error(`Discordユーザーの取得中にエラーが発生しました : ${error.message}`);
        throw error; // エラーが発生した場合はここで終了
      });

    // ページを作成
    await notion.pages.create({
      parent: { database_id: banDbId },
      properties: {
        Name: { title: [{ text: { content: userName } }] },
        ID: { rich_text: [{ text: { content: userId } }] },
        isBan: { checkbox: true },
      },
    });

    // BANリストを更新
    bannedUsersData = await fetchBannedUsersData();
  } catch (error) {
    console.error(`BANユーザーの登録中にエラーが発生しました : ${error}`);
  }
};

// すでに登録されているユーザーをBAN
export const updateBanUser = async (userId: string) => {
  try {
    // DiscordユーザIDから名前を取得
    let userName = '';
    await discord.users
      .fetch(userId)
      .then((user) => {
        if (!user.globalName) return;
        if (!user.tag) return;
        userName = `${user.globalName}#${user.tag}`;
      })
      .catch((error) => {
        console.error(`Discordユーザーの取得中にエラーが発生しました : ${error.message}`);
        throw error; // エラーが発生した場合はここで終了
      });

    // DBからページIDを取得
    const response = await notion.databases.query({
      database_id: banDbId,
      filter: {
        property: 'ID',
        rich_text: {
          equals: userId,
        },
      },
    });

    if (response.results.length === 0) {
      throw new Error('User not found in the database');
    }

    // ページを更新
    await notion.pages.update({
      page_id: response.results[0].id,
      properties: {
        Name: { title: [{ text: { content: userName } }] },
        ID: { rich_text: [{ text: { content: userId } }] },
        isBan: { checkbox: true },
      },
    });

    // BANリストを更新
    bannedUsersData = await fetchBannedUsersData();
  } catch (error) {
    console.error(`BANユーザーの更新中にエラーが発生しました : ${error}`);
  }
};

// ユーザーのBanを解除
export const unBanUser = async (userId: string) => {
  try {
    // DBからページIDを取得
    const response = await notion.databases.query({
      database_id: banDbId,
      filter: {
        property: 'ID',
        rich_text: {
          equals: userId,
        },
      },
    });

    if (response.results.length === 0) {
      throw new Error('User not found in the database');
    }

    // ページを更新
    await notion.pages.update({
      page_id: response.results[0].id,
      properties: {
        isBan: { checkbox: false },
      },
    });

    // BANリストを更新
    bannedUsersData = await fetchBannedUsersData();
  } catch (error) {
    console.error(`BANユーザーの更新中にエラーが発生しました : ${error}`);
  }
};
