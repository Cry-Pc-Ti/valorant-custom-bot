import fs from 'fs';
import sharp, { OverlayOptions } from 'sharp';
import axios from 'axios';
import { Logger } from './log';

// URL から画像をダウンロードして Buffer を返す関数
const downloadImage = async (url: string): Promise<Buffer> => {
  const response = await axios({
    url,
    responseType: 'arraybuffer',
  });

  return Buffer.from(response.data, 'binary');
};

// 画像を連結し1枚の画像にまとめる
export const createConcatImage = async (imagePaths: string[], userId: string): Promise<void> => {
  try {
    const outputImagePath = `./static/img/generated/${userId}.png`;
    // 既存の画像を削除
    if (fs.existsSync(outputImagePath)) {
      await fs.promises.unlink(outputImagePath);
    }

    // URLまたはローカルパスから画像を読み込む
    const images = await Promise.all(
      imagePaths.map(async (path) => {
        if (path.startsWith('http://') || path.startsWith('https://')) {
          return downloadImage(path);
        } else {
          return sharp(path).toBuffer();
        }
      })
    );

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
      .toFile(outputImagePath);
  } catch (error) {
    Logger.LogSystemError(`画像の連結中にエラーが発生しました : ${error}`);
  }
};
