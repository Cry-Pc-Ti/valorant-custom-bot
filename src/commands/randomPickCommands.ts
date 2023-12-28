// モジュールをインポート
import { SlashCommandBuilder, ChatInputCommandInteraction } from '../modules/discordModule';
import { valorantAgents } from '../data/valorantAgents';
import { AgentData } from '../types/valorantAgentData';
import { pickMessage } from '../event/embedMessage';

export const randomPickCommands = {
  // コマンドの設定
  data: new SlashCommandBuilder()
    .setName('pick')
    .setDescription('エージェントをランダムに選択します (ロール指定可))')
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
    .toJSON(),

  // コマンドの実行
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    try {
      const { options } = interaction;

      // エージェントロールを取得
      const agentRole: string | null = options.getString('role');

      // ランダムに選択されたエージェントのデータを格納する変数
      let randomAgent: AgentData;

      // ロールが指定されていない場合はランダムに選択
      if (!agentRole) {
        randomAgent = valorantAgents[Math.floor(Math.random() * valorantAgents.length)];

        // ロールが指定されている場合は、そのロールのエージェントからランダムに選択
      } else {
        const filteredAgents: AgentData[] = valorantAgents.filter(
          (agent) => agent.role === agentRole
        );
        randomAgent = filteredAgents[Math.floor(Math.random() * filteredAgents.length)];
      }

      // メッセージを作成・送信
      const embedMessage = pickMessage(randomAgent);
      await interaction.editReply(embedMessage);
    } catch (error) {
      await interaction.editReply('処理中にエラーが発生しました');
      console.error(error);
    }
  },
};
