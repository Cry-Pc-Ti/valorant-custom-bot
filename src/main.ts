// モジュールをインポート
import {
  Interaction,
  REST,
  Routes,
  clientId,
  guildId,
  discord,
  token,
} from '../src/modules/discordModule';
import { pickCommands } from '../src/commands/pickCommands';

// サーバーにコマンドを登録
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('サーバーにコマンドを登録中...');

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: [pickCommands.data],
    });

    console.log('コマンドの登録が完了しました');
  } catch (error: unknown) {
    console.error(`コマンドの登録中にエラーが発生しました : ${error}`);
  }
})();

// クライアントオブジェクトが準備完了時に実行
discord.on('ready', () => {
  console.log(`ログインしました : ${discord.user?.tag}`);
});

discord.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === pickCommands.data.name) {
    pickCommands.execute(interaction);
  }
});

discord.login(token);
