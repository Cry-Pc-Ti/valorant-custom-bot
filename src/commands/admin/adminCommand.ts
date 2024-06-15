import { Message } from 'discord.js';
import { createServerMessage } from '../../events/admin/sendServerInfo';
import { discord } from '../../modules/discordModule';
import {
  checkUserBanStatus,
  fetchBanUsersData,
  loadBannedUsers,
  saveBannedUser,
  unBanUser,
  updateBanUser,
} from '../../events/notion/manageBanUsers';
import { getTotalMusicCommandCount } from '../../store/guildCommandStates';
import { BanUserData } from '../../types/banUserData';

export const adminCommand = async (message: Message, command: string, option: string | null) => {
  // serverコマンド
  if (command === 'server') {
    // guildIdを取得
    const guildId = message.guildId;

    // guildIdが取得できない場合はエラーを返却
    if (!guildId) {
      await message.reply({ content: 'サーバー情報を取得できませんでした。' });
    }

    // 現在のサーバー数を取得
    const guildCount = discord.guilds.cache.size;

    // 現在の音楽コマンドのインスタンス数を取得
    const serverCount = getTotalMusicCommandCount();

    // メッセージを作成
    const embed = await createServerMessage(guildCount, serverCount);

    // メッセージを送信
    message.reply({ embeds: [embed] });
    return;
  }

  // banコマンド
  if (command === 'ban') {
    const userId = option;

    // BANするユーザが指定されていない場合はエラーを返却
    if (!userId) {
      await message.reply('BANするユーザーIDを指定してください');
      return;
    }

    // BANユーザーリストを取得
    const bannedUsersData: BanUserData[] = await fetchBanUsersData();

    // BANするユーザーが登録されていない場合
    if (!bannedUsersData.find((user) => user.id === userId)) {
      // BANユーザーを登録
      saveBannedUser(userId);

      await message.reply(`${userId}をBANしました`);

      // BANユーザーは登録されているが、BANされていない場合
    } else if (bannedUsersData.find((user) => user.id === userId && user.isBan === false)) {
      // BANユーザーを更新
      updateBanUser(userId);

      await message.reply(`${userId}をBANしました`);

      // すでにBANされている場合
    } else {
      await message.reply(`すでに${userId}はBANしています。`);
    }
    return;
  }

  // unbanコマンド
  if (command === 'unban') {
    const userId = option;

    // BAN解除するユーザが指定されていない場合はエラーを返却
    if (!userId) {
      await message.reply('BAN解除するユーザーIDを指定してください');
      return;
    }

    // BANされているユーザーを取得
    const bannedUsers = loadBannedUsers();

    // BANするユーザーがBANされている場合のみBAN解除する
    if (bannedUsers.includes(userId)) {
      const isBanned = await checkUserBanStatus(userId);

      if (!isBanned) {
        await message.reply(`${userId}はBANされていません`);
        return;
      }

      // BANユーザーを更新
      unBanUser(userId);

      await message.reply(`${userId}のBANを解除しました`);
    } else {
      await message.reply(`${userId}はBANされていません`);
    }
  }
};
