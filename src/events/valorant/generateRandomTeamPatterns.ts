import { rankValues } from '../../constants';
import { getValorantUsersRank } from '../../service/valorantUser.service';
import { Player, RankInfo, TeamPattern } from '../../types/valorantUserData';

/**
 * プレイヤーIDからランダムでチームを生成する
 *
 * @param playerIds - プレイヤーIDの配列
 * @returns 生成したチームの配列
 */
export const generateRandomTeamPatterns = async (playerIds: string[]): Promise<TeamPattern[]> => {
  const players = await getPlayersWithRankScores(playerIds);

  const patterns: TeamPattern[] = [];
  const numberOfPatterns = 10;

  for (let i = 0; i < numberOfPatterns; i++) {
    const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());
    const half = Math.ceil(shuffledPlayers.length / 2);
    const attackTeam = shuffledPlayers.slice(0, half);
    const defenseTeam = shuffledPlayers.slice(half);

    const attackScore = attackTeam.reduce((sum, player) => sum + player.rankScore, 0);
    const defenseScore = defenseTeam.reduce((sum, player) => sum + player.rankScore, 0);

    patterns.push({
      teams: {
        attack: attackTeam,
        defense: defenseTeam,
      },
      attackScore,
      defenseScore,
    });
  }

  return patterns;
};

/**
 * プレイヤーIDからオートバランスで全パターン生成する
 *
 * @param playerIds - プレイヤーIDの配列
 * @returns 生成したチームの配列
 */
export const generateAutoBalanceTeamsPatterns = async (playerIds: string[]): Promise<TeamPattern[]> => {
  const players = await getPlayersWithRankScores(playerIds);
  const allTeamPatterns = generateAllTeamPatterns(players);

  return allTeamPatterns.sort(
    (a, b) => Math.abs(a.attackScore - a.defenseScore) - Math.abs(b.attackScore - b.defenseScore)
  );
};

/**
 * ランク情報から数値化
 *
 * @param rankInfo - ランク情報
 * @returns 数値
 */
const calculateRankScore = (rankInfo: RankInfo): number => {
  const rankKey = `${rankInfo.rank}${rankInfo.rankNum ?? ''}`;
  const baseScore = rankValues[rankKey] || 0;
  const rrScore = rankInfo.rankRr / 100; // RRを小数点として扱う
  return baseScore + rrScore;
};

/**
 * 全通りのチーム分けパターンを生成し、スコア差を計算する
 *
 * @param players - players情報の配列
 * @returns チームパターンの配列
 */
const generateAllTeamPatterns = (players: Player[]): TeamPattern[] => {
  const teamPatterns: TeamPattern[] = [];
  const combinations = generateCombinations(players);

  combinations.forEach((combination) => {
    const teams = divideIntoTeams(combination, players);
    const { attackScore, defenseScore } = calculateTeamScores(teams);
    teamPatterns.push({
      teams: {
        attack: teams[0],
        defense: teams[1],
      },
      attackScore,
      defenseScore,
    });
  });

  return teamPatterns;
};

/**
 * プレイヤーIDのリストからプレイヤー情報を取得し、それぞれのランクスコアを計算する
 *
 * @param playerIds - プレイヤーIDの配列
 * @returns プレイヤー情報の配列
 */
export const getPlayersWithRankScores = async (playerIds: string[]): Promise<Player[]> => {
  const playerRankInfoList = await getValorantUsersRank(playerIds);
  return playerRankInfoList.map((player) => ({
    id: player.id,
    rankScore: calculateRankScore(player),
    rank: player.rank,
    rankNum: player.rankNum,
    rankRr: player.rankRr,
  }));
};

/**
 * チーム分けのすべての組み合わせを生成する
 *
 * @param playerIds - プレイヤー情報の配列
 * @returns チーム分けしたプレイヤー情報の配列
 */
const generateCombinations = (players: Player[]): Player[][] => {
  const result: Player[][] = [];
  const combine = (start: number, team: Player[]) => {
    if (team.length === Math.floor(players.length / 2)) {
      result.push([...team]);
      return;
    }
    for (let i = start; i < players.length; i++) {
      team.push(players[i]);
      combine(i + 1, team);
      team.pop();
    }
  };
  combine(0, []);
  return result;
};

/**
 * 指定されたプレイヤーを二つのチームに分けます。
 *
 * @param teamA - 最初のチームのプレイヤー。
 * @param allPlayers - 全てのプレイヤーのリスト。
 * @returns 二つの配列を含む配列。最初の配列はteamAで、二番目の配列は残りのプレイヤーで構成されるteamBです。
 */
const divideIntoTeams = (teamA: Player[], allPlayers: Player[]): Player[][] => {
  const teamB = allPlayers.filter((player) => !teamA.includes(player));
  return [teamA, teamB];
};

/**
 * チームのスコアを計算します。
 *
 * @param teams - 二つのチームに分けられたプレイヤーの配列。
 *                 teams[0]は攻撃チーム、teams[1]は防御チームを表します。
 * @returns 各チームのスコアを含むオブジェクト。attackScoreは攻撃チームのスコア、defenseScoreは防御チームのスコアです。
 */
const calculateTeamScores = (teams: Player[][]): { attackScore: number; defenseScore: number } => {
  const attackScore = teams[0].reduce((acc, player) => acc + player.rankScore, 0);
  const defenseScore = teams[1].reduce((acc, player) => acc + player.rankScore, 0);
  return { attackScore, defenseScore };
};
