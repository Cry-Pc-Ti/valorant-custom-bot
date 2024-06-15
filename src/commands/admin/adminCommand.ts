import { AttachmentBuilder, Message } from 'discord.js';
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
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import * as fse from 'fs-extra';
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

  // logコマンド(ログを出力)
  if (command === 'log') {
    const filePath = path.join(__dirname, '../../../logs/app.log');
    if (fs.existsSync(filePath)) {
      const file = new AttachmentBuilder(filePath);

      // 今日の日付をフォーマット
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      const formattedTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;

      await message.reply({
        content: `${formattedDate} ${formattedTime} 時点でのログファイルです。:`,
        files: [file],
      });
    } else {
      await message.reply('ファイルがありません。');
    }
  }

  // pastlogコマンド(過去ログを出力)
  if (command === 'pastlog') {
    const logsDir = path.join(__dirname, '../../../logs');
    const zipFilePath = path.join(__dirname, '../../../logs.zip');
    const oneDay = 24 * 60 * 60 * 1000;
    const now = new Date();
    const yesterday = new Date(now.getTime() - oneDay);
    const oneWeekAgo = new Date(now.getTime() - 7 * oneDay);

    try {
      // アーカイブデータをストリームするファイルを作成c
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      // すべてのアーカイブデータが書き込まれるのを待つ
      output.on('close', function () {});

      // 警告をキャッチする
      archive.on('warning', function (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      });

      archive.on('error', function (err) {
        throw err;
      });

      // アーカイブデータをファイルにパイプ
      archive.pipe(output);

      const files = fs.readdirSync(logsDir);

      files.forEach((file) => {
        const filePath = path.join(logsDir, file);
        const fileStat = fs.statSync(filePath);
        const fileDate = new Date(fileStat.mtime);

        if (fileDate >= oneWeekAgo && fileDate <= yesterday) {
          archive.file(filePath, { name: file });
        }
      });

      await archive.finalize();

      const file = new AttachmentBuilder(zipFilePath);
      await message.reply({ content: '過去1週間のログファイルです。', files: [file] });
      fse.removeSync(zipFilePath);
    } catch (error) {
      await message.reply('ログアーカイブの作成中にエラーが発生しました。');
    }
  }
};
