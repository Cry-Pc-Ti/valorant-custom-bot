import fs from 'fs';

// BANユーザーを読み込み
let bannedUsers: string[] = [];
const bannedUsersFilePath = './static/data/banData.json';

// BANユーザーをJSONから読み込み
export const loadBannedUsers = () => {
  if (fs.existsSync(bannedUsersFilePath)) {
    const data = fs.readFileSync(bannedUsersFilePath, 'utf8');
    bannedUsers = JSON.parse(data);
  }
};

// BANしたユーザーをブラックリストに追加
export const saveBannedUser = (bannedUsersID: string) => {
  bannedUsers.push(bannedUsersID);
  fs.writeFileSync(bannedUsersFilePath, JSON.stringify(bannedUsers, null, 2));
};

// BANユーザー一覧を取得
export const getBannedUsers = () => {
  return bannedUsers;
};

export const saveBannedUsersList = (bannedUsersList: string[]) => {
  bannedUsers = bannedUsersList;
  fs.writeFileSync(bannedUsersFilePath, JSON.stringify(bannedUsers, null, 2));
};
