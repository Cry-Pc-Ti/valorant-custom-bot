import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { mapCommandMainEvent } from '../../events/valorant/mapCommandMainEvent';
import { agentCommandMainEvent } from '../../events/valorant/agentCommandMainEvent';
import { compositionCommandMainEvent } from '../../events/valorant/compositionCommandMainEvent';
import { randomteamsCommandMainEvent } from '../../events/valorant/randomteamsCommandMainEvent';

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
              { name: 'Duelist', value: 'duelist' },
              { name: 'Initiator', value: 'initiator' },
              { name: 'Controller', value: 'controller' },
              { name: 'Sentinel', value: 'sentinel' }
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
        .addBooleanOption((option) =>
          option.setName('ban').setDescription('BANエージェントを選択するか指定してください')
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('randomteams')
        .setDescription('メンバーをランダムでチーム分けします')
        .addChannelOption((option) =>
          option
            .setName('attacker')
            .setDescription('アタッカーのボイスチャンネルを指定します')
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName('defender')
            .setDescription('ディフェンダーのボイスチャンネルを指定します')
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)
        )
    )
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();
    // mapcommand
    if (interaction.options.getSubcommand() === 'map') {
      await mapCommandMainEvent(interaction);
    }
    // agentcommand
    if (interaction.options.getSubcommand() === 'agent') {
      await agentCommandMainEvent(interaction);
    }
    // compositioncommand
    if (interaction.options.getSubcommand() === 'composition') {
      await compositionCommandMainEvent(interaction);
    }
    // randomteamscommand
    if (interaction.options.getSubcommand() === 'randomteams') {
      await randomteamsCommandMainEvent(interaction);
    }
  },
};
