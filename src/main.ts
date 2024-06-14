// モジュールをインポート
import { Interaction, REST, Routes, VoiceState } from 'discord.js';
import { CLIENT_ID, discord, TOKEN } from '../src/modules/discordModule';

// コマンドをインポート
import { COMMAND_NAME_MUSIC, mainMusicCommand } from './commands/music/mainMusicCommand';
import { Logger } from './events/common/log';
import { stopPreviousInteraction } from './store/guildCommandStates';
import { buttonHandlers } from './button/buttonHandlers';
import { getBannedUsers, loadBannedUsers } from './events/admin/readBanUserJsonData';
import { adminCommand } from './commands/admin/adminCommand';
import { fetchAdminUserId } from './events/notion/fetchAdminUserId';
import { getCooldownTimeLeft, isCooldownActive, setCooldown } from './events/common/cooldowns';
import { mainDiceCommand } from './commands/dice/mainDiceCommand';
import { helpCommand } from './commands/help/helpCommand';
import { mainValorantCommand } from './commands/valorant/mainValorantCommand';
import { commands } from './modules/commandsModule';

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

/**
 * 管理者ユーザーIDを取得する非同期関数
 */
let adminUserIds: string[] = [];
(async () => {
  adminUserIds = await fetchAdminUserId();
})();

/**
 * クライアントオブジェクトが準備完了時に実行されるイベントリスナー
 */
discord.on('ready', () => {
  console.log(`準備が完了しました ${discord.user?.tag}がログインします`);
  discord.user?.setPresence({
    activities: [{ name: '今日も元気に働いています', type: 0 }],
    status: 'online',
  });
  Logger.initialize();
  loadBannedUsers();
});

/**
 * インタラクションが発生時に実行されるイベントリスナー
 *
 * @param interaction - Discordインタラクションオブジェクト
 */
discord.on('interactionCreate', async (interaction: Interaction) => {
  try {
    // BOTに管理者権限があるかどうかをチェック
    const botMember = interaction.guild?.members.cache.get(CLIENT_ID);
    if (!botMember?.permissions.has('Administrator')) {
      return await interaction.user.send({
        content: `【${interaction.guild?.name}】にこのBOTの権限がありません。権限を付与してください。\n権限付与方法は👇をご覧ください\nhttps://wingman-kun.notion.site/Discord-Bot-b9b2f66d841b440f9a4e466aedc5fa49`,
      });
    }

    if (interaction.isChatInputCommand()) {
      const { commandName, user, guild } = interaction;

      // BANされているユーザーを取得
      const bannedUsers: string[] = getBannedUsers();

      // BANされているユーザーかどうかチェック
      if (bannedUsers.includes(interaction.user.id)) {
        interaction.reply(
          `下のドキュメントに記載されているお問い合わせ先から運営にご連絡してください\nhttps://wingman-kun.notion.site/Discord-Bot-b9b2f66d841b440f9a4e466aedc5fa49`
        );
        Logger.LogAccessInfo(`${user.username}(${user.id})はBANされています。`);
        return;
      }

      // コマンドごとのクールダウン時間（ミリ秒）
      const commandCooldowns = new Map<string, number>([
        ['music', 6 * 1000], // 6秒
        ['dice', 2 * 1000], // 2秒
        ['valo', 3 * 1000], // 3秒
      ]);

      // スパム対策
      if (isCooldownActive(commandName, user.id, commandCooldowns)) {
        const timeLeft = getCooldownTimeLeft(commandName, user.id, commandCooldowns);
        return await interaction.reply(
          `コマンドが連続で使用されています。\nあと${timeLeft.toFixed(1)}秒お待ちください。`
        );
      }

      setCooldown(commandName, user.id, commandCooldowns);

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
    Logger.LogAccessError(`【${interaction.guild?.id}】interactionCreateでエラーが発生しました。`, error);
    interaction.channel?.send(
      `エラーが発生したので再度コマンドの入力をお願いいたします。\nそれでも解決しない場合は、一度蹴サーバから蹴って再度ウィングマンくんを招待してください。👇から招待ができます\nhttps://wingman-kun.notion.site/Discord-Bot-b9b2f66d841b440f9a4e466aedc5fa49`
    );
  }
});

/**
 * メッセージが作成されたときに処理を行うイベントリスナー
 *
 * この関数は特定のユーザーIDのメッセージを処理し、管理者コマンドを実行します。
 *
 * @param message - Discordメッセージオブジェクト
 */
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

/**
 * ボイスチャンネルでアクションが発生したときに実行されるイベントリスナー
 *
 * @param oldState - 変更前のボイスステート
 * @param newState - 変更後のボイスステート
 *
 * この関数は、ボットがボイスチャンネルから切断された場合や、ボットがいるチャンネルに一人だけ残った場合に特定の処理を実行します。
 */
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
    Logger.LogError(`【${oldState.guild.id}】voiceStateUpdateでエラーが発生しました。`, error);
  }
});

// Discordクライアントをログイン
discord.login(TOKEN);
