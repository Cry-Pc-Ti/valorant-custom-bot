// モジュールをインポート
import { Interaction, REST, Routes } from 'discord.js';
import { clientId, guildId, discord, token } from '../src/modules/discordModule';

// コマンドをインポート
import { agentPickCommand } from './commands/valorant/agentPickCommand';
import { makeCompositionCommand } from './commands/valorant/makeCompositionCommand';
import { diceCommand } from './commands/dice/diceCommand';
import { mapSelectCommand } from './commands/valorant/mapSelectCommand';
import { memberAllocationCommand } from './commands/valorant/memberAllocationCommand';
import { chinchiroCommand } from './commands/dice/chinchiroCommand';
import { helpComand } from './commands/helpComand';
import { playMusicCommand } from './commands/music/playMusicCommand';
import { playListCommand } from './commands/music/playListMusicCommand';

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
        playMusicCommand.data,
        playListCommand.data
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
  [playMusicCommand.data.name]: playMusicCommand,
  [playListCommand.data.name]: playListCommand
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
