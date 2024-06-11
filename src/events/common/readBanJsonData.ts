import fs from 'fs';

// BANされたユーザーを読み込む
let bannedUsers: string[] = [];
const bannedUsersFilePath = './static/data/banData.json';

export const loadBannedUsers = () => {
  if (fs.existsSync(bannedUsersFilePath)) {
    const data = fs.readFileSync(bannedUsersFilePath, 'utf8');
    bannedUsers = JSON.parse(data);
  }
};

export const saveBannedUsers = (bannedUsersID: string) => {
  bannedUsers.push(bannedUsersID);
  fs.writeFileSync(bannedUsersFilePath, JSON.stringify(bannedUsers, null, 2));
};

export const getBannedUsers = () => {
  return bannedUsers;
};
export const saveBannedUsersList = (bannedUsersList: string[]) => {
  bannedUsers = bannedUsersList;
  fs.writeFileSync(bannedUsersFilePath, JSON.stringify(bannedUsers, null, 2));
};
