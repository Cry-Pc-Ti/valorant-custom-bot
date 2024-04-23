import { ChatInputCommandInteraction } from 'discord.js';
import { AgentData } from '../../types/valorantData';
import { valorantAgents } from '../common/readJsonData';
import { agentMessage } from '../discord/embedMessage';
import { Logger } from '../common/log';

export const agentCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    // エージェントロールを取得
    const agentRole: string | null = interaction.options.getString('role');

    // エージェントデータを取得

    // ランダムに選択されたエージェントのデータを格納する変数
    let randomAgent: AgentData;

    // ロールが指定されていない場合は、エージェント全体からランダムに選択
    if (!agentRole) {
      randomAgent = valorantAgents[Math.floor(Math.random() * valorantAgents.length)];

      // ロールが指定されている場合は、そのロールのエージェントからランダムに選択
    } else {
      const filteredAgents: AgentData[] = valorantAgents.filter((agent) => agent.role === agentRole);
      randomAgent = filteredAgents[Math.floor(Math.random() * filteredAgents.length)];
    }

    // メッセージを作成
    const embed = agentMessage(randomAgent);

    // メッセージを送信
    await interaction.editReply(embed);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    await interaction.editReply('処理中にエラーが発生しました。再度コマンドを入力してください。');
    console.error(`agentPickCommandでエラーが発生しました : ${error}`);
    Logger.LogSystemError(error);
  }
};
