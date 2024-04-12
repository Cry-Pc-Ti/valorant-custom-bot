import { CanvasRenderingContext2D, createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';

// フォントを読み込む
registerFont('./static/fonts/Yomogi-Regular.ttf', { family: 'Yomogi' });

export const addTextToImage = async (num: number) => {
  try {
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
    } else if (num >= 1 && num <= 9) {
      imagePath += 'sad.png';
    } else return;

    // 画像を読み込む
    const image = await loadImage(imagePath);

    // 画像にテキストを追加
    const canvas = createCanvas(image.width, image.height);
    const context: CanvasRenderingContext2D = canvas.getContext('2d');

    context.drawImage(image, 0, 0, image.width, image.height);
    context.fillStyle = 'black';
    context.font = '198px "Yomogi"';
    context.textAlign = 'center';
    context.fillText(num.toString(), canvas.width / 2, canvas.height / 4.5);

    const outputStream = fs.createWriteStream('./static/img/generate_image.png');
    const stream = canvas.createPNGStream();
    stream.pipe(outputStream);
  } catch (error) {
    console.error(error);
  }
};
