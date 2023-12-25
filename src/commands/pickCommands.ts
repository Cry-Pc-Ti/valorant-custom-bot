// モジュールをインポート
import { SlashCommandBuilder, ChatInputCommandInteraction } from '../modules/discordModule';

interface AgentData {
  name: { en: string; jp: string };
  class: string;
}

export const pickCommands = {
  data: new SlashCommandBuilder()
    .setName('pick')
    .setDescription('Pick Agent Ramdomly')
    .addStringOption((option) =>
      option
        .setName('class')
        .setDescription('Select Agent Class')
        .addChoices(
          { name: 'Duelist', value: 'duelist' },
          { name: 'Initiator', value: 'initiator' },
          { name: 'Controller', value: 'controller' },
          { name: 'Sentinel', value: 'sentinel' }
        )
    )
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    try {
      const { options } = interaction;

      const agentClass: string | null = options.getString('class');

      const valorantAgents: AgentData[] = [
        { name: { en: 'Jett', jp: 'ジェット' }, class: 'duelist' },
        { name: { en: 'Phoenix', jp: 'フェニックス' }, class: 'duelist' },
        { name: { en: 'Neon', jp: 'ネオン' }, class: 'duelist' },
        { name: { en: 'Yoru', jp: 'ヨル' }, class: 'duelist' },
        { name: { en: 'Raze', jp: 'レイズ' }, class: 'duelist' },
        { name: { en: 'Reyna', jp: 'レイナ' }, class: 'duelist' },
        { name: { en: 'Iso', jp: 'アイソ' }, class: 'duelist' },
        { name: { en: 'Sova', jp: 'ソーヴァ' }, class: 'initiator' },
        { name: { en: 'KAY/O', jp: 'KAY/O' }, class: 'initiator' },
        { name: { en: 'Skye', jp: 'スカイ' }, class: 'initiator' },
        { name: { en: 'Fade', jp: 'フェイド' }, class: 'initiator' },
        { name: { en: 'Breach', jp: 'ブリーチ' }, class: 'initiator' },
        { name: { en: 'Gekko', jp: 'ゲッコー' }, class: 'initiator' },
        { name: { en: 'Brimstone', jp: 'ブリムストーン' }, class: 'controller' },
        { name: { en: 'Astra', jp: 'アストラ' }, class: 'controller' },
        { name: { en: 'Viper', jp: 'ヴァイパー' }, class: 'controller' },
        { name: { en: 'Omen', jp: 'オーメン' }, class: 'controller' },
        { name: { en: 'Harbor', jp: 'ハーバー' }, class: 'controller' },
        { name: { en: 'Sage', jp: 'セージ' }, class: 'sentinel' },
        { name: { en: 'Killjoy', jp: 'キルジョイ' }, class: 'sentinel' },
        { name: { en: 'Cypher', jp: 'サイファー' }, class: 'sentinel' },
        { name: { en: 'Chamber', jp: 'チェンバー' }, class: 'sentinel' },
        { name: { en: 'Deadlock', jp: 'デッドロック' }, class: 'sentinel' },
      ];

      // エージェントクラスが指定されていない場合はランダムに選択
      if (!agentClass) {
        const randomAgent: AgentData =
          valorantAgents[Math.floor(Math.random() * valorantAgents.length)];
        await interaction.editReply(`今回のエージェントは${randomAgent.name.jp}です`);

        // エージェントクラスが指定されている場合はそのクラスのエージェントからランダムに選択
      } else {
        const filteredAgents: AgentData[] = valorantAgents.filter(
          (agent) => agent.class === agentClass
        );

        const randomAgent: AgentData =
          filteredAgents[Math.floor(Math.random() * filteredAgents.length)];
        await interaction.editReply(`今回のエージェントは${randomAgent.name.jp}です`);
      }
    } catch (error) {
      await interaction.editReply('処理中にエラーが発生しました');
      console.error(error);
    }
  },
};
