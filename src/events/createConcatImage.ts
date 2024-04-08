import fs from 'fs';
import sharp, { OverlayOptions } from 'sharp';

// 画像を連結し1枚の画像にまとめる
export const createImage = async (imagePaths: string[]) => {
  // 既存の画像を削除
  if (fs.existsSync('static/img/concat_image.png')) {
    fs.unlinkSync('static/img/concat_image.png');
  }

  // 画像を読み込む
  const images: sharp.Sharp[] = imagePaths.map((path) => sharp(path));

  try {
    // 画像のメタデータを取得
    const metadataList: sharp.Metadata[] = await Promise.all(images.map((image) => image.metadata()));

    // 画像を連結するための新しい幅と高さを計算
    const newWidth: number = metadataList.reduce((totalWidth, metadata) => totalWidth + (metadata.width || 0), 0);
    const newHeight: number = Math.max(...metadataList.map((metadata) => metadata.height || 0));

    // 画像を連結する
    const buffers: Buffer[] = await Promise.all(images.map((image) => image.toBuffer()));

    // 画像を作成
    await sharp({
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
            left: metadataList.slice(0, index).reduce((width, metadata) => width + (metadata.width || 0), 0),
          })
        )
      )
      .toFile('static/img/concat_image.png');
  } catch (error) {
    console.error(`画像の連結中にエラーが発生しました : ${error}`);
  }
};
