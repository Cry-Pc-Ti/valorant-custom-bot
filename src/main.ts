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
import { diceCommand } from './commands/diceCommand';
import { mapSelectCommand } from './commands/mapSelectCommand';
import { memberAllocationCommand } from './commands/memberAllocationCommand';

// サーバーにコマンドを登録
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('サーバーにコマンドを登録中...');

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: [agentPickCommand.data, autoCompositionCommand.data, mapSelectCommand.data,memberAllocationCommand.data,diceCommand.data],
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

// コマンド名とそれに対応するコマンドオブジェクトをマップに格納
const commands = {
  [agentPickCommand.data.name]: agentPickCommand,
  [autoCompositionCommand.data.name]: autoCompositionCommand,
  [mapSelectCommand.data.name]: mapSelectCommand,
};

// インタラクションが発生時に実行
discord.on('interactionCreate', async (interaction: Interaction) => {
  if (interaction.isChatInputCommand()) {
    // マップからコマンドを取得
    const command = commands[interaction.commandName];

    // コマンドが存在すれば実行
    if (command) {
      command.execute(interaction);
    }

    if (interaction.commandName === memberAllocationCommand.data.name) {
      memberAllocationCommand.execute(interaction);
    }
    if (interaction.commandName === diceCommand.data.name) {
      diceCommand.execute(interaction);
    }
  }
});

discord.login(token);
