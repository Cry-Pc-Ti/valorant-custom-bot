import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { mapCommandMainEvent } from './mainEvent/mapCommandMainEvent';
import { agentCommandMainEvent } from './mainEvent/agentCommandMainEvent';
import { compositionCommandMainEvent } from './mainEvent/compositionCommandMainEvent';
import { teamCommandMainEvent } from './mainEvent/teamCommandMainEvent';
import { registerCommandMainEvent } from './mainEvent/registerCommandMainEvent';

export const COMMAND_NAME_VALORANT: string = 'valo';

export const mainValorantCommand = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME_VALORANT)
    .setDescription('valorant用のコマンドです。')
    .addSubcommand((subcommand) => subcommand.setName('map').setDescription('【valorant】マップをランダムに選択します'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('agent')
        .setDescription('【valorant】エージェントをランダムに選択します (ロール指定可)')
        .addStringOption((option) =>
          option
            .setName('role')
            .setDescription('エージェントのロールを指定してください')
            .addChoices(
              { name: 'デュエリスト', value: 'duelist' },
              { name: 'イニシエーター', value: 'initiator' },
              { name: 'コントローラー', value: 'controller' },
              { name: 'センチネル', value: 'sentinel' }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('composition')
        .setDescription('【valorant】ランダムに構成を作成します')
        .addNumberOption((option) =>
          option
            .setName('duelist')
            .setDescription('デュエリストの人数を指定してください')
            .setChoices(
              { name: '0', value: 0 },
              { name: '1', value: 1 },
              { name: '2', value: 2 },
              { name: '3', value: 3 },
              { name: '4', value: 4 },
              { name: '5', value: 5 }
            )
        )
        .addNumberOption((option) =>
          option
            .setName('initiator')
            .setDescription('イニシエーターの人数を指定してください')
            .setChoices(
              { name: '0', value: 0 },
              { name: '1', value: 1 },
              { name: '2', value: 2 },
              { name: '3', value: 3 },
              { name: '4', value: 4 },
              { name: '5', value: 5 }
            )
        )
        .addNumberOption((option) =>
          option
            .setName('controller')
            .setDescription('コントローラーの人数を指定してください')
            .setChoices(
              { name: '0', value: 0 },
              { name: '1', value: 1 },
              { name: '2', value: 2 },
              { name: '3', value: 3 },
              { name: '4', value: 4 },
              { name: '5', value: 5 }
            )
        )
        .addNumberOption((option) =>
          option
            .setName('sentinel')
            .setDescription('センチネルの人数を指定してください')
            .setChoices(
              { name: '0', value: 0 },
              { name: '1', value: 1 },
              { name: '2', value: 2 },
              { name: '3', value: 3 },
              { name: '4', value: 4 },
              { name: '5', value: 5 }
            )
        )
        .addStringOption((option) =>
          option
            .setName('ban')
            .setDescription('BANエージェントを選択するか指定してください')
            .addChoices({ name: 'する', value: 'true' }, { name: 'しない', value: 'false' })
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('team')
        .setDescription('【valorant】メンバーをランダムでチーム分けします。')
        .addChannelOption((option) =>
          option
            .setName('attacker')
            .setDescription('アタッカーのボイスチャンネルを指定してください')
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName('defender')
            .setDescription('ディフェンダーのボイスチャンネルを指定してください')
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('rank')
        .setDescription('【valorant】あなたのランクを表示・登録します。')
        .addStringOption((option) => option.setName('riot-id').setDescription('riot-idを入力してください。'))
    )
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    // map command
    if (interaction.options.getSubcommand() === 'map') {
      return await mapCommandMainEvent(interaction);
    }
    // agent command
    else if (interaction.options.getSubcommand() === 'agent') {
      return await agentCommandMainEvent(interaction);
    }
    // composition command
    else if (interaction.options.getSubcommand() === 'composition') {
      return await compositionCommandMainEvent(interaction);
    }
    // team command
    else if (interaction.options.getSubcommand() === 'team') {
      return await teamCommandMainEvent(interaction);
    }
    // rank command
    else if (interaction.options.getSubcommand() === 'rank') {
      return await registerCommandMainEvent(interaction);
    }
  },
};
