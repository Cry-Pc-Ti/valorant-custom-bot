import { ChatInputCommandInteraction } from 'discord.js';
import { Logger } from '../../../events/common/log';
import { getValorantUserMmr } from '../../../service/valorant.service';
import { ValorantUser } from '../../../types/valorantUserData';
import { getUniqueValorantUser, registerValorantUser } from '../../../service/valorantUser.service';

export const registerCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const userName = interaction.options.getString('name');
    const tag = interaction.options.getString('tag');

    if (!userName || !tag) return;

    const userID = interaction.user.id;

    const userInfo = await getUniqueValorantUser(userID);

    if (!userInfo) {
      const rank = await getValorantUserMmr(userName, tag);

      // 正規表現でマッチング
      const match = rank.match(/(\w+)(?:\s+(\d+))?\s+-\s+(\d+)/);

      if (!match) {
        console.log('Input does not match the expected format.');
      }

      const [, rankName, rankNumber, rr] = match;

      const valorantUser: ValorantUser = {
        id: userID,
        name: interaction.user.username,
        userIcon: interaction.user.avatarURL(),
        rank: rankName,
        rank_num: Number(rankNumber) ?? null,
        rank_rr: Number(rr),
      };
      await registerValorantUser(valorantUser);
    }
  } catch (error) {
    Logger.LogError(`【${interaction.guild?.id}】registerCommandMainEventでエラーが発生しました`, error);
    await interaction.editReply('処理中にエラーが発生しました。再度コマンドを入力してください。');
  }
};
