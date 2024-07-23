import { ChatInputCommandInteraction } from 'discord.js';
import { Logger } from '../../../events/common/log';
import { getValorantUserMmr } from '../../../service/valorant.service';
import { ValorantUser, ValorantUserResponse } from '../../../types/valorantUserData';
import { getUniqueValorantUser, registerValorantUser, updateValorantUser } from '../../../service/valorantUser.service';
import { differenceInMinutes } from 'date-fns';
import {
  rankInfoMessage,
  riotIdErrorMessage,
  riotIdUnkowunsMessage,
} from '../../../events/discord/valorantEmbedMessage';

export const registerCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const riotId = interaction.options.getString('riot-id');

    const userID = interaction.user.id;

    // userIDからDBに検索
    const userInfoResponse: ValorantUserResponse | null = await getUniqueValorantUser(userID);

    // DBにデータがない時
    if (!userInfoResponse) {
      // RIOTIDが入力されていない
      if (!riotId) {
        const embed = riotIdUnkowunsMessage();
        return interaction.editReply(embed);
      }

      // riotIdからuserName, tagを抽出
      const { userName, tag } = await parseRiotId(riotId);

      if (!userName || !tag) {
        const embed = riotIdErrorMessage();
        return interaction.editReply(embed);
      }

      const rank = await getValorantUserMmr(userName, tag);
      const { rankName, rankNumber, rr } = await parseRank(rank);

      // 登録する情報を作成
      const valorantUser: ValorantUser = {
        id: userID,
        userName: interaction.user.username,
        displayName: interaction.user.displayName,
        userIcon: interaction.user.avatarURL(),
        riotId: userName,
        riotIdTag: tag,
        rank: rankName,
        rankNum: rankNumber ? Number(rankNumber) : null,
        rankRr: Number(rr),
      };

      //DBに登録
      await registerValorantUser(valorantUser);

      // メッセージ情報を作成
      const embed = rankInfoMessage({
        id: valorantUser.id,
        userName: valorantUser.userName,
        displayName: valorantUser.displayName,
        userIcon: valorantUser.userIcon,
        riotId: valorantUser.riotId,
        riotIdTag: valorantUser.riotIdTag,
        rank: valorantUser.rank,
        rankNum: valorantUser.rankNum,
        rankRr: valorantUser.rankRr,
      });

      return await interaction.editReply(embed);
    }

    const valorantUserInfo: ValorantUser = {
      id: userInfoResponse.id,
      userName: interaction.user.username,
      displayName: interaction.user.displayName,
      userIcon: interaction.user.avatarURL(),
      riotId: userInfoResponse.riotId,
      riotIdTag: userInfoResponse.riotIdTag,
      rank: userInfoResponse.rank,
      rankNum: userInfoResponse.rankNum,
      rankRr: userInfoResponse.rankRr,
    };
    let riotIdFlag: boolean = true;

    if (riotId) {
      // riotIdからuserName, tagを抽出
      const { userName, tag } = await parseRiotId(riotId);

      if (!userName || !tag) {
        const embed = riotIdErrorMessage();
        return interaction.editReply(embed);
      }
      if (userName !== valorantUserInfo.riotId && tag !== valorantUserInfo.riotIdTag) {
        riotIdFlag = false;
        const rank = await getValorantUserMmr(userName, tag);
        const { rankName, rankNumber, rr } = await parseRank(rank);

        valorantUserInfo.riotId = userName;
        valorantUserInfo.riotIdTag = tag;
        valorantUserInfo.rank = rankName;
        valorantUserInfo.rankNum = rankNumber ? Number(rankNumber) : null;
        valorantUserInfo.rankRr = Number(rr);

        await updateValorantUser(valorantUserInfo);
      }
    }

    // 最終更新から10分以上たっている場合ランク情報を再度取得
    if ((await shouldFetchRankData(userInfoResponse.updateAt)) && riotIdFlag) {
      const rank = await getValorantUserMmr(valorantUserInfo.riotId, valorantUserInfo.riotIdTag);
      const { rankName, rankNumber, rr } = await parseRank(rank);

      valorantUserInfo.rank = rankName;
      valorantUserInfo.rankNum = rankNumber ? Number(rankNumber) : null;
      valorantUserInfo.rankRr = Number(rr);

      await updateValorantUser(valorantUserInfo);
    }

    // メッセージ情報を作成
    const embed = rankInfoMessage(valorantUserInfo);

    await interaction.editReply(embed);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.message === 'riotIdError' || error.code === 'ERR_BAD_REQUEST') {
      const embed = riotIdErrorMessage();
      return interaction.editReply(embed);
    }
    Logger.LogError(`【${interaction.guild?.id}】registerCommandMainEventでエラーが発生しました`, error);
    await interaction.editReply('処理中にエラーが発生しました。再度コマンドを入力してください。');
  }
};

// 更新時間が10分前か判断する
const shouldFetchRankData = async (updatedAt: Date): Promise<boolean> => {
  const now = new Date();
  const minutesDifference = differenceInMinutes(now, updatedAt);

  return minutesDifference >= 10;
};

// ランク情報をパースする
const parseRank = async (rank: string) => {
  const match = rank.match(/(\w+)(?:\s+(\d+))?\s+-\s+(\d+)/);
  if (!match) {
    throw new Error('riotIdError');
  }
  const [, rankName, rankNumber, rr] = match;
  return { rankName, rankNumber, rr };
};

// RIOT IDをパースする
const parseRiotId = async (riotId: string) => {
  const hashIndex = riotId.indexOf('#');
  const hashIndexZenkaku = riotId.indexOf('＃');

  if (hashIndex === -1 && hashIndexZenkaku === -1) {
    throw new Error('riotIdError');
  }

  const userName = riotId.slice(0, hashIndex === -1 ? hashIndexZenkaku : hashIndex);
  const tag = riotId.slice(hashIndex === -1 ? hashIndexZenkaku + 1 : hashIndex + 1);

  return { userName, tag };
};
