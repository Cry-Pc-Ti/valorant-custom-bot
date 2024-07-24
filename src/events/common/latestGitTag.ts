import { exec } from 'child_process';

/**
 * Gitの最新タグバージョンを取得する関数
 * @returns Promise<string>
 */
export const getLatestGitTag = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec('git describe --tags', (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        const match = stdout.trim().match(/^(.+?)-\d+-g[0-9a-f]+$/);
        if (match) {
          resolve(match[1]);
        } else {
          resolve(stdout.trim());
        }
      }
    });
  });
};
