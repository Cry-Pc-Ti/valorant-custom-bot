// モジュールをインポート
import { Collection, Interaction, REST, Routes, VoiceState } from 'discord.js';
import { CLIENT_ID, discord, TOKEN } from '../src/modules/discordModule';

// コマンドをインポート
import { COMMAND_NAME_MUSIC, mainMusicCommand } from './commands/music/mainMusicCommand';
import { mainDiceCommand } from './commands/dice/mainDiceCommand';
import { mainValorantCommand } from './commands/valorant/mainValorantCommand';
import { Logger } from './events/common/log';
import { stopPreviousInteraction } from './store/guildCommandStates';
import { isHttpError } from './events/common/errorUtils';
import { buttonHandlers } from './button/buttonHandlers';
import { helpCommand } from './commands/help/helpCommand';
import { getBannedUsers, loadBannedUsers } from './events/common/readBanUserJsonData';
import { adminCommand } from './commands/admin/adminCommand';
import { fetchAdminUserId } from './events/notion/fetchAdminUserId';

// コマンド名とそれに対応するコマンドオブジェクトをマップに格納
const commands = {
  [mainDiceCommand.data.name]: mainDiceCommand,
  [mainValorantCommand.data.name]: mainValorantCommand,
  [mainMusicCommand.data.name]: mainMusicCommand,
  [helpCommand.data.name]: helpCommand,
};

// 管理者ユーザーIDを取得
let adminUserIds: string[] = [];
(async () => {
  adminUserIds = await fetchAdminUserId();
})();

// サーバーにコマンドを登録
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  try {
    console.log('サーバーにコマンドを登録中...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: [mainDiceCommand.data, mainValorantCommand.data, mainMusicCommand.data, helpCommand.data],
    });
    console.log('コマンドの登録が完了しました');
  } catch (error) {
    console.error(`コマンドの登録中にエラーが発生しました : ${error}`);
  }
})();

// クライアントオブジェクトが準備完了時に実行
discord.on('ready', () => {
  console.log(`準備が完了しました ${discord.user?.tag}がログインします`);
  discord.user?.setPresence({
    activities: [{ name: '今日も元気に働いています', type: 0 }],
    status: 'online',
  });
  Logger.initialize();
  loadBannedUsers();
});

// クールダウンのコレクション
const cooldowns = new Collection<string, Collection<string, number>>();

// コマンドごとのクールダウン時間（ミリ秒）
const commandCooldowns = new Map<string, number>([
  ['music', 6 * 1000], // 6秒
  ['dice', 2 * 1000], // 2秒
  ['valo', 3 * 1000], // 3秒
]);

// インタラクションが発生時に実行
discord.on('interactionCreate', async (interaction: Interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const { commandName, user, guild } = interaction;

      // スパム対策
      if (!cooldowns.has(commandName)) {
        cooldowns.set(commandName, new Collection());
      }

      // クールダウン処理
      const now = Date.now();
      const timestamps = cooldowns.get(commandName);
      const cooldownAmount = commandCooldowns.get(commandName) || 0;

      // クールダウン中の場合はエラーメッセージを返す
      if (timestamps?.has(user.id)) {
        const expirationTime = (timestamps.get(user.id) as number) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          await interaction.reply(`コマンドが連続で使用されています。\nあと${timeLeft.toFixed(1)}秒お待ちください。`);
          return;
        }
      }

      timestamps?.set(user.id, now);
      setTimeout(() => timestamps?.delete(user.id), cooldownAmount);

      // BANされているユーザーを取得
      const bannedUsers: string[] = getBannedUsers();

      // BANされているユーザーかどうかチェック
      if (bannedUsers.includes(interaction.user.id)) {
        interaction.reply(
          `下のドキュメントに記載されているお問い合わせ先から運営にご連絡してください\nhttps://wingman-kun.notion.site/Discord-Bot-b9b2f66d841b440f9a4e466aedc5fa49`
        );
        Logger.LogAccessInfo(`【${guild?.name}(${guild?.id})】${user.username}(${user.id})はBANされています。`);
        return;
      }

      try {
        // サブコマンドがある場合は、各サブコマンドの処理内でログを出力
        Logger.LogAccessInfo(
          `【${guild?.name}(${guild?.id})】${user.username}(${user.id})${commandName} ${interaction.options.getSubcommand()}コマンドを実行`
        );
      } catch (error) {
        // サブコマンドがない場合はエラーが発生するので、その場合はコマンド名のみをログに出力
        Logger.LogAccessInfo(
          `【${guild?.name}(${guild?.id})】${user.username}(${user.id})${commandName}コマンドを実行`
        );
      }

      // マップからコマンドを取得
      const command = commands[commandName];

      // コマンドが存在すれば実行
      if (command) command.execute(interaction);
    } else if (interaction.isButton()) {
      // ボタン処理
      await buttonHandlers(interaction);
    }
  } catch (error) {
    Logger.LogAccessError(error);
    if (isHttpError(error) && error.status === 403) {
      interaction.channel?.send('コマンドの実行に必要な権限がありません。権限を付与してください。');
      return;
    }
    interaction.channel?.send(
      'エラーが発生したので再度コマンドの入力をお願いいたします。それでも解決しない場合はサーバーを一度蹴ってウィングマン君を招待してください。'
    );
  }
});

// 管理者コマンドが発生時に実行
discord.on('messageCreate', async (message) => {
  // 特定のユーザーIDのメッセージだけを拾う
  if (!adminUserIds.includes(message.author.id)) return;
  // メッセージがBotもしくは、コマンドでない場合は処理を終了
  if (message.author.bot || !message.content.startsWith('!admin')) return;

  // コマンドを取得
  const args = message.content.split(' ');
  if (args.length < 2) return;

  const command = args[1];
  const userId = args[2] || null;

  // 管理者コマンドを実行
  adminCommand(message, command, userId);
});

// voiceチャンネルでアクションが発生時に実行
discord.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
  try {
    if (oldState.member?.id === CLIENT_ID && !newState.channel) {
      await stopPreviousInteraction(oldState.guild.id, COMMAND_NAME_MUSIC);
    }

    // ボットがいるチャンネルであるかを確認
    const botMember = await oldState.guild?.members.fetch(CLIENT_ID);
    if (!botMember?.voice.channelId) return;

    // ボットが現在いるチャンネル
    const botChannel = botMember.voice.channel;

    // ボットがいるチャンネルで一人残った場合にのみ切断
    if (botChannel && botChannel.members.size === 1) {
      const guildId = oldState.guild.id;
      if (guildId) await stopPreviousInteraction(guildId, COMMAND_NAME_MUSIC);
      botMember.voice.disconnect();
    }
  } catch (error) {
    Logger.LogAccessError(error);
  }
});

discord.login(TOKEN);
