// モジュールをインポート
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  AttachmentBuilder,
} from '../modules/discordModule';
import { valorantAgents } from '../data/valorantAgents';
import { AgentData } from '../types/valorantAgentData';
import { agentMessage } from '../events/embedMessage';

export const agentPickCommand = {
  // コマンドの設定
  data: new SlashCommandBuilder()
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

      // ロールが指定されていない場合は、エージェント全体からランダムに選択
      if (!agentRole) {
        randomAgent = valorantAgents[Math.floor(Math.random() * valorantAgents.length)];

        // ロールが指定されている場合は、そのロールのエージェントからランダムに選択
      } else {
        const filteredAgents: AgentData[] = valorantAgents.filter(
          (agent) => agent.role === agentRole
        );
        randomAgent = filteredAgents[Math.floor(Math.random() * filteredAgents.length)];
      }

      // メッセージを作成
      const embedMessage: { embeds: EmbedBuilder[]; files: AttachmentBuilder[] } =
        agentMessage(randomAgent);

      // メッセージを送信
      await interaction.editReply(embedMessage);
    } catch (error: unknown) {
      await interaction.editReply('処理中にエラーが発生しました\n開発者にお問い合わせください');
      console.error(`agentPickCommandでエラーが発生しました : ${error}`);
    }
  },
};