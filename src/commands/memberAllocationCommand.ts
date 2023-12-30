import { valorantMaps } from "../data/valorantMaps";
import { mapMessage, memberAllocationMessage } from "../events/embedMessage";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "../modules/discordModule";
import { MapData, MemberAllocationData, MemberData,  } from "../types/valorantAgentData";

export const memberAllocationCommand = {
  // コマンドの設定
    data: new SlashCommandBuilder()
    .setName('member')
    .setDescription('メンバーをランダムでチーム分けします。')
    .addUserOption((option)=>
      option
        .setName('メンバー1')
        .setDescription('参加するメンバーを入力'))
    .addUserOption((option)=>
      option
        .setName('メンバー2')
        .setDescription('参加するメンバーを入力'))
    .addUserOption((option)=>
      option
        .setName('メンバー3')
        .setDescription('参加するメンバーを入力'))
    .addUserOption((option)=>
      option
        .setName('メンバー4')
        .setDescription('参加するメンバーを入力'))
    .addUserOption((option)=>
    option
      .setName('メンバー5')
      .setDescription('参加するメンバーを入力'))
    .addUserOption((option)=>
      option
        .setName('メンバー6')
        .setDescription('参加するメンバーを入力'))
    .addUserOption((option)=>
      option
        .setName('メンバー7')
        .setDescription('参加するメンバーを入力'))
    .addUserOption((option)=>
      option
        .setName('メンバー8')
        .setDescription('参加するメンバーを入力'))
    .addUserOption((option)=>
        option
          .setName('メンバー9')
          .setDescription('参加するメンバーを入力'))
    .addUserOption((option)=>
        option
          .setName('メンバー10')
          .setDescription('参加するメンバーを入力'))
    .toJSON(),

    execute: async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply();

        try {
            const { options } = interaction;

            const memberAllocation:MemberAllocationData = {
              attack: [],
              defense: [],
          }
      
          for(let i = 1; i < 11; i++){
              if(options.getUser('メンバー' + String(i)) !== null){
                const randomIndex = Math.floor(Math.random() * 2);
                //メンバー情報を作成
                let member:MemberData = {
                  name: options.getUser('メンバー' + String(i))?.username,
                  id: options.getUser('メンバー' + String(i))?.id
                }
      
                //メンバーをアタッカーサイドとディフェンダーサイドの配列に振り分け
                if((randomIndex === 0 && memberAllocation.attack.length < 5) || (randomIndex === 1 && memberAllocation.defense.length >= 5)){
                  memberAllocation.attack.push(member)
                }else if((randomIndex === 1 && memberAllocation.defense.length < 5) || (randomIndex === 0 && memberAllocation.attack.length >= 5)){
                  memberAllocation.defense.push(member)
                }
              }
            }
          // メッセージを作成・送信
          const embedMessage = memberAllocationMessage(memberAllocation);
          await interaction.editReply(embedMessage);

          } catch (error) {
            await interaction.editReply('処理中にエラーが発生しました');
            console.error(error);
          }
    }
}