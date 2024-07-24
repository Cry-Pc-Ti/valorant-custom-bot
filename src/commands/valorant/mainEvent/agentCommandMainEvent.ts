import { ChatInputCommandInteraction } from 'discord.js';
import { AgentData } from '../../../types/valorantData';
import { agentMessage } from '../../../events/discord/valorantEmbedMessage';
import { Logger } from '../../../events/common/log';
import { fetchAgentsData } from '../../../service/valorant.service';

export const agentCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    // エージェントロールを取得
    const agentRole: string | null = interaction.options.getString('role');

    // valorant-apiからエージェント情報を取得
    const agents: AgentData[] = await fetchAgentsData();

    // ランダムに選択されたエージェントのデータを格納する変数
    let randomAgent: AgentData;

    // ロールが指定されていない場合は、エージェント全体からランダムに選択
    if (!agentRole) {
      randomAgent = agents[Math.floor(Math.random() * agents.length)];

      // ロールが指定されている場合は、そのロールのエージェントからランダムに選択
    } else {
      const filteredAgents: AgentData[] = agents.filter((agent) => agent.roleId === agentRole);
      randomAgent = filteredAgents[Math.floor(Math.random() * filteredAgents.length)];
    }

    // メッセージを作成
    const embed = agentMessage(randomAgent, Boolean(agentRole));

    // メッセージを送信
    await interaction.editReply(embed);
  } catch (error) {
    Logger.LogError(`【${interaction.guild?.id}】agentCommandMainEventでエラーが発生しました`, error);
    await interaction.editReply('処理中にエラーが発生しました。再度コマンドを入力してください。');
  }
};
