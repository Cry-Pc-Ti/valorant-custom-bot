// モジュールをインポート
import { Interaction, REST, Routes } from 'discord.js';
import { clientId, guildId, discord, token } from '../src/modules/discordModule';

// コマンドをインポート
import { agentPickCommand } from './commands/agentPickCommand';
import { makeCompositionCommand } from './commands/makeCompositionCommand';
import { diceCommand } from './commands/diceCommand';
import { mapSelectCommand } from './commands/mapSelectCommand';
import { memberAllocationCommand } from './commands/memberAllocationCommand';
import { chinchiroCommand } from './commands/chinchiroCommand';
import { helpComand } from './commands/helpComand';
import { playMusicCommand } from './commands/playMusicCommand';

// サーバーにコマンドを登録
const rest = new REST({ version: '10' }).setToken(token);
(async () => {
  try {
    console.log('サーバーにコマンドを登録中...');

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: [
        agentPickCommand.data,
        makeCompositionCommand.data,
        mapSelectCommand.data,
        memberAllocationCommand.data,
        diceCommand.data,
        chinchiroCommand.data,
        helpComand.data,
        playMusicCommand.data
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
  [makeCompositionCommand.data.name]: makeCompositionCommand,
  [mapSelectCommand.data.name]: mapSelectCommand,
  [memberAllocationCommand.data.name]: memberAllocationCommand,
  [diceCommand.data.name]: diceCommand,
  [chinchiroCommand.data.name]: chinchiroCommand,
  [helpComand.data.name]: helpComand,
  [playMusicCommand.data.name]: playMusicCommand
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
