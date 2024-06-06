import fs from 'fs';
import sharp, { OverlayOptions } from 'sharp';
import { Logger } from './log';

// 画像を連結し1枚の画像にまとめる
export const createConcatImage = async (imagePaths: string[]): Promise<void> => {
  try {
    // 既存の画像を削除
    if (fs.existsSync('static/img/generate_image.png')) {
      await fs.promises.unlink('static/img/generate_image.png');
    }

    // 画像を読み込む
    const images = await Promise.all(imagePaths.map((path) => sharp(path).toBuffer()));

    // 画像のメタデータを取得
    const metadataList = await Promise.all(images.map((image) => sharp(image).metadata()));

    // 画像を連結するための新しい幅と高さを計算
    const newWidth = metadataList.reduce((totalWidth, metadata) => totalWidth + (metadata.width || 0), 0);
    const newHeight = Math.max(...metadataList.map((metadata) => metadata.height || 0));

    // 画像を連結する
    await sharp({
      create: {
        width: newWidth,
        height: newHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(
        images.map(
          (buffer, index): OverlayOptions => ({
            input: buffer,
            top: 0,
            left: metadataList.slice(0, index).reduce((width, metadata) => width + (metadata.width || 0), 0),
          })
        )
      )
      .toFile('static/img/generate_image.png');
  } catch (error) {
    Logger.LogSystemError(`画像の連結中にエラーが発生しました : ${error}`);
  }
};
