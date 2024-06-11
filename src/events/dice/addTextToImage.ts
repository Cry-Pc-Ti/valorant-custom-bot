import { CanvasRenderingContext2D, createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import { Logger } from '../common/log';

// フォントを読み込む
registerFont('./static/fonts/Yomogi-Regular.ttf', { family: 'Yomogi' });

export const addTextToImage = async (num: number, userId: string): Promise<void> => {
  try {
    const outputImagePath = `./static/img/generated/${userId}.png`;

    // 既存の画像を削除
    if (fs.existsSync(outputImagePath)) {
      fs.unlinkSync(outputImagePath);
    }

    // 数字によって画像パスを変更
    let imagePath = './static/img/wingman/wingman_';

    if (num === 100) {
      imagePath += 'ecstatic.png';
    } else if (num >= 90 && num <= 99) {
      imagePath += 'joyful.png';
    } else if (num >= 50 && num <= 89) {
      imagePath += 'content.png';
    } else if (num >= 10 && num <= 49) {
      imagePath += 'neutral.png';
    } else if (num >= 2 && num <= 9) {
      imagePath += 'sad.png';
    } else if (num === 1) {
      imagePath += 'feel_down.png';
    } else return;

    // 画像を読み込む
    const image = await loadImage(imagePath);

    // 画像にテキストを追加
    const canvas = createCanvas(image.width, image.height);
    const context: CanvasRenderingContext2D = canvas.getContext('2d');

    context.drawImage(image, 0, 0, image.width, image.height);
    context.fillStyle = 'black';
    context.textAlign = 'center';

    if (num != 1) {
      // フォントサイズとフォントを指定
      context.font = '120px "Yomogi"';

      // テキストを描画
      context.fillText(num.toString(), canvas.width / 2, canvas.height / 4.3);
    } else {
      // フォントサイズとフォントを指定
      context.font = '150px "Yomogi"';

      // テキストを回転させるために原点を移動
      context.translate(canvas.width / 4.9, canvas.height / 1.65);

      // 20度（ラジアンに変換）回転
      context.rotate((-20 * Math.PI) / 180);

      // テキストを描画
      context.fillText(num.toString(), 0, 0);

      // コンテキストの回転と移動を元に戻す
      context.rotate((20 * Math.PI) / 180);
      context.translate(-canvas.width / 4.9, -canvas.height / 1.65);
    }

    const outputStream = fs.createWriteStream(outputImagePath);
    const stream = canvas.createPNGStream();

    await new Promise<void>((resolve, reject) => {
      stream.pipe(outputStream);
      stream.on('end', () => {
        outputStream.end();
        resolve();
      });
      stream.on('error', reject);
    });
  } catch (error) {
    Logger.LogSystemError(`addTextToImageでエラーが発生しました : ${error}`);
  }
};
