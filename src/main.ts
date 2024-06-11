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
import { musicservser } from './events/admin/serverInfo';

// コマンド名とそれに対応するコマンドオブジェクトをマップに格納
const commands = {
  [mainDiceCommand.data.name]: mainDiceCommand,
  [mainValorantCommand.data.name]: mainValorantCommand,
  [mainMusicCommand.data.name]: mainMusicCommand,
  [helpCommand.data.name]: helpCommand,
};
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

      const now = Date.now();
      const timestamps = cooldowns.get(commandName);
      const cooldownAmount = commandCooldowns.get(commandName) || 0;

      if (timestamps?.has(user.id)) {
        const expirationTime = (timestamps.get(user.id) as number) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          await interaction.reply(`コマンドが連打されています。あと${timeLeft.toFixed(1)}秒お待ちください。`);
          return;
        }
      }
      timestamps?.set(user.id, now);
      setTimeout(() => timestamps?.delete(user.id), cooldownAmount);

      try {
        // サブコマンドがないときのデータ収集ログ
        Logger.LogAccessInfo(
          `【${guild?.name}(${guild?.id})】${user.username}(${user.id})${commandName} ${interaction.options.getSubcommand()}コマンドを実行`
        );
      } catch (error) {
        // サブコマンドがないときのデータ収集ログ
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
// 登録するユーザーID
const allowedUserIds = [
  '695536234373709865', // りゅまPC
  '420558464184614923', // りゅまけいたい
  '472019916007145487', // ame
  '484390835639812106', // ぺこめいん
  '884320451306864651', // ぺこさぶ
  '607110949249482753', // ゆずき
  '903315439319408670', // もかお
];
// 隠しコマンド
discord.on('messageCreate', async (message) => {
  // 特定のユーザーIDのメッセージだけを拾う
  if (!allowedUserIds.includes(message.author.id)) return;

  // メッセージ内容をチェックして反応する
  if (message.content === '!admin server') {
    await musicservser(message, discord.guilds.cache.size);
  }
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
