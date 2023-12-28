import sharp from 'sharp';
import fs from 'fs';
import { CompositionData } from '../types/valorantAgentData';

// 5枚のエージェントの画像を連結し、1枚の画像にまとめる
export const createAgentsImage = async (composition: CompositionData) => {
  const sharp = require('sharp');

  // 連結したい画像のファイルパス
  const imagePaths: string[] = [];

  // 画像のパスを配列に格納
  for (const agentRole in composition) {
    for (const agent of composition[agentRole as keyof CompositionData]) {
      imagePaths.push(`img/agents/${agent.id}_icon.png`);
    }
  }

  // 既存の画像を削除
  if (fs.existsSync('img/composition.png')) {
    fs.unlinkSync('img/composition.png');
  }

  // 画像を読み込んでPromiseの配列を作成
  const imagePromises: Promise<sharp.Metadata>[] = imagePaths.map((imagePath) =>
    sharp(imagePath).metadata()
  );

  Promise.all(imagePromises)
    .then((metadatas) => {
      // 画像の幅を取得
      const widths: number[] = metadatas
        .map((metadata) => metadata.width)
        .filter((width): width is number => width !== undefined);

      // 画像を横に結合
      return sharp({
        create: {
          width: widths.reduce((acc, curr) => acc + curr, 0),
          height: metadatas[0].height,
          channels: 4, // RGBA
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        },
      })
        .composite(
          imagePaths.map((imagePath, index) => ({
            input: imagePath,
            top: 0,
            left: widths.slice(0, index).reduce((acc, curr) => acc + curr, 0),
          }))
        )
        .toFile('img/composition.png');
    })
    .then(() => {
      console.log('画像の連結が完了し、保存されました。');
      return './img/composition.png';
    })
    .catch((err: unknown) => {
      console.error(err);
    });
};
