import { prisma } from '../modules/prismaModule';
import { ValorantUser } from '../types/valorantUserData';

export const createValorantUser = async (valorantUser: ValorantUser) => {
  return await prisma.valorant_User.create({
    data: {
      id: valorantUser.id,
      name: valorantUser.name,
      rank: valorantUser.rank,
      rank_num: valorantUser.rank_num,
      rank_rr: valorantUser.rank_rr,
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
