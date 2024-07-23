import { prisma } from '../modules/prismaModule';
import { ValorantUser } from '../types/valorantUserData';

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

export const findOneValorantUser = async (userID: string) => {
  return await prisma.valorant_User.findUnique({
    where: {
      id: userID,
    },
  });
};

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

export const findManyValorantUser = async (userIds: string[]) => {
  return await prisma.valorant_User.findMany({
    where: {
      id: { in: userIds },
    },
  });
};
