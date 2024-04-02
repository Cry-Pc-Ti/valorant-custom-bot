
// サイコロを振った結果を出力
//TODO もっといい書き方ないの。
export const chinchiroResult = async (randomIndexArray: number[]) => {
    let chinchiroResultWords = ""
    randomIndexArray.sort()
    if(randomIndexArray[0] === 4 && randomIndexArray[1] === 5 && randomIndexArray[2] === 6) chinchiroResultWords = `シゴロ: ${randomIndexArray[0]} ${randomIndexArray[1]} ${randomIndexArray[2]}サイ`
    else if(randomIndexArray[0] === 1 && randomIndexArray[1] === 1 && randomIndexArray[2] === 1) chinchiroResultWords = `ピンゾロ: ${randomIndexArray[0]} ${randomIndexArray[1]} ${randomIndexArray[2]}`
    else if(randomIndexArray[0] === 1 && randomIndexArray[1] === 2 && randomIndexArray[2] === 3) chinchiroResultWords = `ヒフミ: ${randomIndexArray[0]} ${randomIndexArray[1]} ${randomIndexArray[2]}`
    else if(randomIndexArray[0] === randomIndexArray[1] && randomIndexArray[1]  ===  randomIndexArray[2]) chinchiroResultWords = `アラシ: ${randomIndexArray[0]}`
    else if(randomIndexArray[0] === randomIndexArray[1] ) chinchiroResultWords = `目: ${randomIndexArray[2]}`
    else if(randomIndexArray[1] === randomIndexArray[2] ) chinchiroResultWords = `目: ${randomIndexArray[0]}`
    else chinchiroResultWords = `目なし: ${randomIndexArray[0]} ${randomIndexArray[1]} ${randomIndexArray[2]}`

    return chinchiroResultWords
}