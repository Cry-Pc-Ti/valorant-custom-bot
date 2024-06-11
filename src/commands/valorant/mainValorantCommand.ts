import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { mapCommandMainEvent } from './mainEvent/mapCommandMainEvent';
import { agentCommandMainEvent } from './mainEvent/agentCommandMainEvent';
import { compositionCommandMainEvent } from './mainEvent/compositionCommandMainEvent';
import { teamCommandMainEvent } from './mainEvent/teamCommandMainEvent';

export const mainValorantCommand = {
  data: new SlashCommandBuilder()
    .setName('valo')
    .setDescription('valorant用のコマンドです。')
    .addSubcommand((subcommand) => subcommand.setName('map').setDescription('マップをランダムに選択します'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('agent')
        .setDescription('エージェントをランダムに選択します (ロール指定可)')
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
        .setDescription('ランダムに構成を作成します')
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
        .setDescription('メンバーをランダムでチーム分けします。')
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
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();
    // map command
    if (interaction.options.getSubcommand() === 'map') {
      await mapCommandMainEvent(interaction);
    }
    // agent command
    if (interaction.options.getSubcommand() === 'agent') {
      await agentCommandMainEvent(interaction);
    }
    // composition command
    if (interaction.options.getSubcommand() === 'composition') {
      await compositionCommandMainEvent(interaction);
    }
    // team command
    if (interaction.options.getSubcommand() === 'team') {
      await teamCommandMainEvent(interaction);
    }
  },
};
