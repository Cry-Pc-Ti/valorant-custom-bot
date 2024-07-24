import { prisma } from '../modules/prismaModule';
import { ValorantUser } from '../types/valorantUserData';

/**
 * Valorantのユーザー情報をデータベースに登録します。
 *
 * @param valorantUser - 登録するValorantユーザーの情報。
 * @returns 登録されたユーザー情報を返します。
 */
export const createValorantUser = async (valorantUser: ValorantUser) => {
  return await prisma.valorant_User.create({
    data: {
      id: valorantUser.id,
      user_name: valorantUser.userName,
      display_name: valorantUser.displayName,
      riot_id: valorantUser.riotId,
      riot_id_tag: valorantUser.riotIdTag,
      rank: valorantUser.rank,
      rank_num: valorantUser.rankNum,
      rank_rr: valorantUser.rankRr,
    },
  });
};

/**
 * 指定されたIDのValorantユーザー情報を取得します。
 *
 * @param userID - 取得するユーザーのID。
 * @returns 見つかったユーザー情報を返します。ユーザーが見つからない場合はnullを返します。
 */
export const findOneValorantUser = async (userID: string) => {
  return await prisma.valorant_User.findUnique({
    where: {
      id: userID,
    },
  });
};

/**
 * Valorantのユーザー情報を更新します。
 *
 * @param valorantUser - 更新するValorantユーザーの情報。
 * @returns 更新されたユーザー情報を返します。
 */
export const updateOneValorantUser = async (valorantUser: ValorantUser) => {
  return await prisma.valorant_User.update({
    where: { id: valorantUser.id },
    data: {
      user_name: valorantUser.userName,
      display_name: valorantUser.displayName,
      riot_id: valorantUser.riotId,
      riot_id_tag: valorantUser.riotIdTag,
      rank: valorantUser.rank,
      rank_num: valorantUser.rankNum,
      rank_rr: valorantUser.rankRr,
    },
  });
};

/**
 * 複数のユーザーIDに対応するValorantユーザー情報を取得します。
 *
 * @param userIds - 取得するユーザーのIDの配列。
 * @returns 見つかったユーザー情報の配列を返します。
 */
export const findManyValorantUser = async (userIds: string[]) => {
  return await prisma.valorant_User.findMany({
    where: {
      id: { in: userIds },
    },
  });
};
