// モジュールをインポート
import { SlashCommandBuilder, ChatInputCommandInteraction } from '../modules/discordModule';
import { valorantAgents } from '../data/valorantAgents';
import { AgentData } from '../types/valorantAgentData';

export const randomPickCommands = {
  data: new SlashCommandBuilder()
    .setName('pick')
    .setDescription('エージェントをランダムに選択します (ロール指定可))')
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
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    try {
      const { options } = interaction;

      const agentRole: string | null = options.getString('class');

      // エージェントロールが指定されていない場合はランダムに選択
      if (!agentRole) {
        const randomAgent: AgentData =
          valorantAgents[Math.floor(Math.random() * valorantAgents.length)];

        await interaction.editReply(`今回のエージェントは${randomAgent.name}です`);

        // エージェントロールが指定されている場合はそのロールのエージェントからランダムに選択
      } else {
        const filteredAgents: AgentData[] = valorantAgents.filter(
          (agent) => agent.role === agentRole
        );

        const randomAgent: AgentData =
          filteredAgents[Math.floor(Math.random() * filteredAgents.length)];

        await interaction.editReply(`今回のエージェントは${randomAgent.name}です`);
      }
    } catch (error) {
      await interaction.editReply('処理中にエラーが発生しました');
      console.error(error);
    }
  },
};
