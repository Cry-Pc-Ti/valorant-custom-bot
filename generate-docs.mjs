import { exec } from 'child_process';
import open from 'open';
import dotenv from 'dotenv';

// .envファイルを読み込む
dotenv.config();

exec(
  'npx typedoc --entryPoints src --entryPointStrategy expand --out docs --theme hierarchy',
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating docs: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);

    // 環境変数からパスを取得
    const pathToIndexHtml = process.env.PROJECT_PATH + 'docs/index.html';
    console.log(pathToIndexHtml);
    if (!pathToIndexHtml) {
      console.error('DOCS_PATH is not defined in .env file');
      return;
    }

    // 正しいパスでブラウザを開く
    open(pathToIndexHtml, { app: { name: 'chrome' } }).catch((err) => console.error(`Failed to open browser: ${err}`));
  }
);
