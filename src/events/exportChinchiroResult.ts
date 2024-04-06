// サイコロを振った結果を出力
export const exportChinchiroResult = async (randomIndexArray: number[]) => {
  let result = '';
  const isAllIncludes = (array: number[], target: number[]) => array.every((element) => target.includes(element));
  const arrayString = `${randomIndexArray[0]}, ${randomIndexArray[1]}, ${randomIndexArray[2]}`;

  switch (true) {
    case isAllIncludes(randomIndexArray, [1, 1, 1]):
      result = `ピンゾロ : ${arrayString}`;
      break;

    case randomIndexArray.every((num) => num === randomIndexArray[0]):
      result = `アラシ : ${randomIndexArray[0]}`;
      break;

    case isAllIncludes(randomIndexArray, [4, 5, 6]):
      result = `シゴロ : ${arrayString}`;
      break;

    case randomIndexArray[0] === randomIndexArray[1] && randomIndexArray[1] !== randomIndexArray[2]:
      result = `目 : ${randomIndexArray[2]}`;
      break;

    case randomIndexArray[1] === randomIndexArray[2] && randomIndexArray[2] !== randomIndexArray[0]:
      result = `目 : ${randomIndexArray[0]}`;
      break;

    case randomIndexArray[2] === randomIndexArray[0] && randomIndexArray[0] !== randomIndexArray[1]:
      result = `目 : ${randomIndexArray[1]}`;
      break;

    case isAllIncludes(randomIndexArray, [1, 2, 3]):
      result = `ヒフミ : ${arrayString}`;
      break;

    default:
      result = `目なし : ${arrayString}`;
      break;
  }

  return result;
};
