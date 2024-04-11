import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

const addTextToImage = async (imagePath: string, text: string, outputPath: string): Promise<void> => {
  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext('2d');

  context.drawImage(image, 0, 0, image.width, image.height);

  context.fillStyle = 'white';
  context.font = '256px Arial';
  context.textAlign = 'center';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const outputStream = fs.createWriteStream(outputPath);
  const stream = canvas.createPNGStream();
  stream.pipe(outputStream);

  return new Promise<void>((resolve, reject) => {
    outputStream.on('finish', resolve);
    outputStream.on('error', reject);
  });
};

const main = async () => {
  const imagePath = './static/img/icon/valorant_icon.png';
  const text = '1';
  const outputPath = 'output_image.png';

  await addTextToImage(imagePath, text, outputPath);
  console.log('Image created!');
};

main().catch(console.error);
