import { createValorantUser, findOneValorantUser } from '../repositories/valorantUserRepository';
import { ValorantUser } from '../types/valorantUserData';

// ValorantのUser情報をDBに登録
export const registerValorantUser = async (valorantUser: ValorantUser) => {
  return await createValorantUser(valorantUser);
};

// ValorantのUser情報を取得
export const getUniqueValorantUser = async (userID: string) => {
  return await findOneValorantUser(userID);
};
