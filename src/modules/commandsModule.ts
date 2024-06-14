import { mainDiceCommand } from '../commands/dice/mainDiceCommand';
import { helpCommand } from '../commands/help/helpCommand';
import { mainValorantCommand } from '../commands/valorant/mainValorantCommand';
import { mainMusicCommand } from '../commands/music/mainMusicCommand';

// コマンド名とそれに対応するコマンドオブジェクトをマップに格納
const commands = {
  [mainDiceCommand.data.name]: mainDiceCommand,
  [mainValorantCommand.data.name]: mainValorantCommand,
  [mainMusicCommand.data.name]: mainMusicCommand,
  [helpCommand.data.name]: helpCommand,
};

export { commands };
