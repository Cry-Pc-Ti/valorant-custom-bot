import { exec } from 'child_process';
import open from 'open';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

// .envファイルを読み込む
dotenv.config();

// package.jsonからバージョン情報を取得
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const packageName = packageJson.name;

// Gitタグを取得
exec('git describe --tags', (error, stdout, stderr) => {
  if (error) {
    return;
  }
  if (stderr) {
    return;
  }
  let gitTag = stdout.trim();

  // タグのバージョン部分だけを抽出
  const match = gitTag.match(/^v?\d+\.\d+\.\d+/);
  if (match) {
    gitTag = match[0];
    console.log(`Short Git tag: ${gitTag}`);
  } else {
    return;
  }

  // TypeDocコマンドを実行してバージョン情報を設定
  exec(
    `npx typedoc --entryPoints src --entryPointStrategy expand --out docs --theme hierarchy --name "${packageName} - ${gitTag}"`,
    (error, stdout, stderr) => {
      if (error) {
        return;
      }
      if (stderr) {
        return;
      }
      console.log(`stdout: ${stdout}`);

      // 環境変数からパスを取得
      const pathToIndexHtml = process.env.PROJECT_PATH + 'docs/index.html';
      if (!pathToIndexHtml) {
        console.error('PROJECT_PATH is not defined in .env file');
        return;
      }

      // 正しいパスでブラウザを開く
      open(pathToIndexHtml, { app: { name: 'chrome' } }).catch((err) =>
        console.error(`Failed to open browser: ${err}`)
      );
    }
  );
});
