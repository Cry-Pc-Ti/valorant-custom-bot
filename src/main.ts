// モジュールをインポート
import { Interaction, REST, Routes } from 'discord.js';
import { clientId, discord, token } from '../src/modules/discordModule';

// コマンドをインポート
import { agentPickCommand } from './commands/valorant/agentPickCommand';
import { makeCompositionCommand } from './commands/valorant/makeCompositionCommand';
import { mapSelectCommand } from './commands/valorant/mapSelectCommand';
import { memberAllocationCommand } from './commands/valorant/memberAllocationCommand';
import { musicCommand } from './commands/music/musicCommand';
import { mainDiceCommand } from './commands/dice/mainDiceCommand';

// サーバーにコマンドを登録
const rest = new REST({ version: '10' }).setToken(token);
(async () => {
  try {
    console.log('サーバーにコマンドを登録中...');

    await rest.put(Routes.applicationCommands(clientId), {
      body: [
        agentPickCommand.data,
        mainDiceCommand.data,
        makeCompositionCommand.data,
        mapSelectCommand.data,
        memberAllocationCommand.data,
        musicCommand.data,
      ],
    });
    console.log('コマンドの登録が完了しました');
  } catch (error) {
    console.error(`コマンドの登録中にエラーが発生しました : ${error}`);
  }
})();

// クライアントオブジェクトが準備完了時に実行
discord.on('ready', () => {
  console.log(`準備が完了しました ${discord.user?.tag}がログインします`);
});

// コマンド名とそれに対応するコマンドオブジェクトをマップに格納
const commands = {
  [agentPickCommand.data.name]: agentPickCommand,
  [mainDiceCommand.data.name]: mainDiceCommand,
  [makeCompositionCommand.data.name]: makeCompositionCommand,
  [mapSelectCommand.data.name]: mapSelectCommand,
  [memberAllocationCommand.data.name]: memberAllocationCommand,
  [musicCommand.data.name]: musicCommand,
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
  }
});

discord.login(token);
