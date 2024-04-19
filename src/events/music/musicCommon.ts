import ytdl from 'ytdl-core';
import ytpl from 'ytpl';

// URLからプレイリストかどうかを判別
export const isPlayListFlag = (url: string) => {
  let urlErrorFlag = false;
  let playListFlag = false;
  if (!ytdl.validateURL(url) && ytpl.validateID(url)) playListFlag = true;
  else if (!ytdl.validateURL(url) && !ytpl.validateID(url)) urlErrorFlag = true;
  return {
    urlError: urlErrorFlag,
    result: playListFlag,
  };
};
