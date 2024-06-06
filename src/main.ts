// モジュールをインポート
import { Interaction, REST, Routes, VoiceState } from 'discord.js';
import { CLIENT_ID, discord, TOKEN } from '../src/modules/discordModule';

// コマンドをインポート
import { mainMusicCommand } from './commands/music/mainMusicCommand';
import { mainDiceCommand } from './commands/dice/mainDiceCommand';
import { mainValorantCommand } from './commands/valorant/mainValorantCommand';
import { Logger } from './events/common/log';
import { stopPreviousInteraction } from './store/guildStates';

// コマンド名とそれに対応するコマンドオブジェクトをマップに格納
const commands = {
  [mainDiceCommand.data.name]: mainDiceCommand,
  [mainValorantCommand.data.name]: mainValorantCommand,
  [mainMusicCommand.data.name]: mainMusicCommand,
};

// サーバーにコマンドを登録
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  try {
    console.log('サーバーにコマンドを登録中...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: [mainDiceCommand.data, mainValorantCommand.data, mainMusicCommand.data],
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

// インタラクションが発生時に実行
discord.on('interactionCreate', async (interaction: Interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      Logger.LogAccessInfo(
        `${interaction.user.username}(${interaction.user.id})さんが${interaction.commandName} ${interaction.options.getSubcommand()}コマンドを実行しました`
      );
      // マップからコマンドを取得
      const command = commands[interaction.commandName];

      // コマンドが存在すれば実行
      if (command) command.execute(interaction);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    Logger.LogAccessError(error);
    if (error.status === 403) {
      interaction.channel?.send('コマンドの実行に必要な権限がありません。権限を付与してください。');
      return;
    }
    interaction.channel?.send(
      'エラーが発生したので再度コマンドの入力をお願いいたします。それでも解決しない場合はサーバーを一度蹴ってウィングマン君を招待してください。'
    );
  }
});
// voiceチャンネルでアクションが発生時に実行
discord.on('voiceStateUpdate', async (oldState: VoiceState) => {
  try {
    // ボットがいるチャンネルであるかを確認
    const botMember = await oldState.guild?.members.fetch(CLIENT_ID);
    if (!botMember?.voice.channelId) return;

    // ボットが現在いるチャンネル
    const botChannel = botMember.voice.channel;

    // ボットがいるチャンネルで一人残った場合にのみ切断
    if (botChannel && botChannel.members.size === 1) {
      const guildId = oldState.guild.id;
      if (guildId) await stopPreviousInteraction(guildId);
      botMember.voice.disconnect();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    Logger.LogAccessError(error);
  }
});

discord.login(TOKEN);
