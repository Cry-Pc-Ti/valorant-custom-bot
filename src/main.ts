// モジュールをインポート
import { Interaction, REST, Routes } from 'discord.js';
import { clientId, guildId, discord, token } from '../src/modules/discordModule';

// コマンドをインポート
import { agentPickCommand } from './commands/valorant/agentPickCommand';
import { chinchiroCommand } from './commands/dice/chinchiroCommand';
import { diceCommand } from './commands/dice/diceCommand';
import { makeCompositionCommand } from './commands/valorant/makeCompositionCommand';
import { mapSelectCommand } from './commands/valorant/mapSelectCommand';
import { memberAllocationCommand } from './commands/valorant/memberAllocationCommand';
import { playMusicCommand } from './commands/music/playMusicCommand';

// サーバーにコマンドを登録
const rest = new REST({ version: '10' }).setToken(token);
(async () => {
  try {
    console.log('サーバーにコマンドを登録中...');

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: [
        agentPickCommand.data,
        chinchiroCommand.data,
        diceCommand.data,
        makeCompositionCommand.data,
        mapSelectCommand.data,
        memberAllocationCommand.data,
        playMusicCommand.data,
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
  [chinchiroCommand.data.name]: chinchiroCommand,
  [diceCommand.data.name]: diceCommand,
  [makeCompositionCommand.data.name]: makeCompositionCommand,
  [mapSelectCommand.data.name]: mapSelectCommand,
  [memberAllocationCommand.data.name]: memberAllocationCommand,
  [playMusicCommand.data.name]: playMusicCommand,
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
