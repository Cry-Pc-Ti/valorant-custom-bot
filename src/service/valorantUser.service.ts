import {
  createValorantUser,
  findManyValorantUser,
  findOneValorantUser,
  updateOneValorantUser,
} from '../repositories/valorantUserRepository';
import { ValorantUser, ValorantUserResponse } from '../types/valorantUserData';

// ValorantのUser情報をDBに登録
export const registerValorantUser = async (valorantUser: ValorantUser) => {
  return await createValorantUser(valorantUser);
};

// ValorantのUser情報を取得更新
export const updateValorantUser = async (valorantUser: ValorantUser) => {
  return await updateOneValorantUser(valorantUser);
};

// ValorantのUser情報を取得
export const getUniqueValorantUser = async (userID: string): Promise<ValorantUserResponse | null> => {
  const userInfo = await findOneValorantUser(userID);
  if (!userInfo) return null;

  return {
    id: userInfo.id,
    userName: userInfo?.user_name,
    displayName: userInfo?.display_name,
    riotId: userInfo.riot_id,
    riotIdTag: userInfo.riot_id_tag,
    rank: userInfo.rank,
    rankNum: userInfo.rank_num ?? null,
    rankRr: userInfo.rank_rr,
    updateAt: userInfo.updated_at,
  };
};

export const getValorantUsersRank = async (userIds: string[]) => {
  const fetchedValorantUsersResponse = await findManyValorantUser(userIds);

  const userRankMap = new Map<string, ValorantUserResponse>();

  fetchedValorantUsersResponse.forEach((user) => {
    userRankMap.set(user.id, {
      id: user.id,
      userName: user?.user_name,
      displayName: user?.display_name,
      riotId: user.riot_id,
      riotIdTag: user.riot_id_tag,
      rank: user.rank,
      rankNum: user.rank_num ?? null,
      rankRr: user.rank_rr,
      updateAt: user.updated_at,
    });
  });
  const defaultRankInfo = {
    rank: 'Unrated',
    rankNum: null,
    rankRr: 0,
  };
  return userIds.map((userId) => userRankMap.get(userId) || { ...defaultRankInfo, id: userId });
};
