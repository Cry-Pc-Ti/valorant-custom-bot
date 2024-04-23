// モジュールをインポート
import { Interaction, REST, Routes, VoiceState } from 'discord.js';
import { CLIENT_ID, discord, TOKEN } from '../src/modules/discordModule';

// コマンドをインポート
import { musicCommand } from './commands/music/musicCommand';
import { mainDiceCommand } from './commands/dice/mainDiceCommand';
import { mainValorantCommand } from './commands/valorant/mainValorantCommand';
import { Logger } from './events/common/log';

// コマンド名とそれに対応するコマンドオブジェクトをマップに格納
const commands = {
  [mainDiceCommand.data.name]: mainDiceCommand,
  [mainValorantCommand.data.name]: mainValorantCommand,
  [musicCommand.data.name]: musicCommand,
};

// サーバーにコマンドを登録
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  try {
    console.log('サーバーにコマンドを登録中...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: [mainDiceCommand.data, mainValorantCommand.data, musicCommand.data],
    });
    console.log('コマンドの登録が完了しました');
  } catch (error) {
    console.error(`コマンドの登録中にエラーが発生しました : ${error}`);
  }
})();

// クライアントオブジェクトが準備完了時に実行
discord.on('ready', () => {
  console.log(`準備が完了しました ${discord.user?.tag}がログインします`);
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
    if (error.status === 403) {
      interaction.channel?.send('コマンドの実行に必要な権限がありません。権限を付与してください。');
      Logger.LogAccessError(error);
      return;
    }
    console.error(`コマンドの実行中にエラーが発生しました : ${error}`);
  }
});
// voiceチャンネルでアクションが発生時に実行
discord.on('voiceStateUpdate', async (oldState: VoiceState) => {
  try {
    if (oldState.channel?.members.size === 1) {
      const botJoinVoiceChannelId = await oldState.guild?.members.fetch(CLIENT_ID);
      if (botJoinVoiceChannelId?.voice.channelId) {
        botJoinVoiceChannelId?.voice.disconnect();
        return;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.status === 403) {
      console.error(`コマンドの実行中にエラーが発生しました : ${error}`);
      Logger.LogAccessError(error);
    }
    console.error(`コマンドの実行中にエラーが発生しました : ${error}`);
  }
});

discord.login(TOKEN);
