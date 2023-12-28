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
import { agentPickCommand } from './commands/agentPickCommand';
import { autoCompositionCommand } from './commands/autoCompositionCommand';
import { mapSelectCommand } from './commands/mapSelectCommand';

// サーバーにコマンドを登録
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('サーバーにコマンドを登録中...');

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: [agentPickCommand.data, autoCompositionCommand.data, mapSelectCommand.data],
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

// インタラクションが発生時に実行
discord.on('interactionCreate', async (interaction: Interaction) => {
  // if (interaction.isAutocomplete()) {
  //   if (interaction.commandName === autoCompositionCommand.data.name) {
  //     await autoCompositionCommand.autocomplete(interaction);
  //   }
  // }

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === agentPickCommand.data.name) {
      agentPickCommand.execute(interaction);
    }

    if (interaction.commandName === autoCompositionCommand.data.name) {
      autoCompositionCommand.execute(interaction);
    }

    if (interaction.commandName === mapSelectCommand.data.name) {
      mapSelectCommand.execute(interaction);
    }
  }
});

discord.login(token);
