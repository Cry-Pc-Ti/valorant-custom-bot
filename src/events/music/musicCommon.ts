import ytdl from 'ytdl-core';
import ytpl from 'ytpl';

// URLからプレイリストかどうかを判別
export const checkUrlType = (url: string) => {
  let isUrlError = false;
  let isPlayList = false;

  if (!ytdl.validateURL(url)) {
    if (ytpl.validateID(url)) {
      isPlayList = true;
    } else {
      isUrlError = true;
    }
  }

  return {
    urlError: isUrlError,
    result: isPlayList,
  };
};
