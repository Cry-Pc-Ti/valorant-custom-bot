import sharp, { OverlayOptions } from 'sharp';
import fs from 'fs';
import { CompositionData } from '../types/valorantAgentData';

// 5枚のエージェントの画像を連結し、1枚の画像にまとめる
export const createCompositionImage = async (composition: CompositionData) => {
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

  // 画像を読み込む
  const images = imagePaths.map((path) => sharp(path));

  try {
    // 画像のメタデータを取得
    const metadataList = await Promise.all(images.map((image) => image.metadata()));

    // 画像を連結するための新しい幅と高さを計算
    const newWidth = metadataList.reduce(
      (totalWidth, metadata) => totalWidth + (metadata.width || 0),
      0
    );
    const newHeight = Math.max(...metadataList.map((metadata) => metadata.height || 0));

    // 画像を連結する
    const buffers = await Promise.all(images.map((image) => image.toBuffer()));

    const result = await sharp({
      create: {
        width: newWidth,
        height: newHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(
        buffers.map(
          (buffer, index): OverlayOptions => ({
            input: buffer,
            top: 0,
            left: metadataList
              .slice(0, index)
              .reduce((width, metadata) => width + (metadata.width || 0), 0),
          })
        )
      )
      .toFile('img/composition.png');

    console.log('画像が連結されました:', result);
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
};
