import { Message } from 'discord.js';
import { createServerMessage } from '../../events/admin/sendServerInfo';
import { discord } from '../../modules/discordModule';
import { getBannedUsers, saveBannedUser, saveBannedUsersList } from '../../events/common/readBanUserJsonData';
import { getTotalMusicCommandCount } from '../../store/guildCommandStates';

export const adminCommand = async (message: Message, command: string, userId: string | null) => {
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

    message.reply({ embeds: [embed] });
    return;
  }

  // banコマンド
  if (command === 'ban') {
    // BANするユーザが指定されていない場合はエラーを返却
    if (!userId) {
      await message.reply('BANするユーザーIDを指定してください');
      return;
    }

    // BANされているユーザーを取得
    const bannedUsers: string[] = getBannedUsers();
    // BANするユーザーがBANされていない場合のみBANする
    if (!bannedUsers.includes(userId)) {
      saveBannedUser(userId);
      await message.reply(`${userId}をBANしました`);
    } else {
      await message.reply(`すでに${userId}はBANしています。`);
    }
    return;
  }

  // unbanコマンド
  if (command === 'unban') {
    if (!userId) {
      await message.reply('BAN解除するユーザーIDを指定してください');
      return;
    }

    // BANされているユーザーを取得
    let bannedUsers: string[] = getBannedUsers();

    // BANするユーザーがBANされている場合のみBAN解除する
    if (bannedUsers.includes(userId)) {
      bannedUsers = bannedUsers.filter((id) => id !== userId);
      saveBannedUsersList(bannedUsers);
      await message.reply(`${userId}のBANを解除しました`);
    } else {
      await message.reply(`すでに${userId}は解除されています`);
    }
    return;
  }
};