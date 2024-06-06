// サイコロを振った結果を出力
export const exportChinchiroResult = (randomIndexArray: number[]): string => {
  const includesAll = (array: number[], target: number[]) => target.every((element) => array.includes(element));
  const arrayString = randomIndexArray.join(', ');

  const [first, second, third] = randomIndexArray;
  const allSame = first === second && second === third;
  const twoSame1 = first === second && second !== third;
  const twoSame2 = second === third && third !== first;
  const twoSame3 = third === first && first !== second;

  if (allSame) {
    if (first === 1) {
      return `ピンゾロ : ${arrayString}`;
    } else {
      return `ゾロ目 : ${first}`;
    }
  }

  if (includesAll(randomIndexArray, [1, 2, 3])) {
    return `ヒフミ : ${arrayString}`;
  }

  if (includesAll(randomIndexArray, [4, 5, 6])) {
    return `シゴロ : ${arrayString}`;
  }

  if (twoSame1) {
    return `役 : ${third}`;
  }

  if (twoSame2) {
    return `役 : ${first}`;
  }

  if (twoSame3) {
    return `役 : ${second}`;
  }

  return `目なし : ${arrayString}`;
};
