import axios from 'axios';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '../modules/spotifyModule';
import { Logger } from '../events/common/log';

/**
 * Spotify APIのトークンを取得
 * @returns {Promise<string>} Spotify APIのアクセストークン
 * @throws エラーが発生した場合
 */
export const getSpotifyToken = async () => {
  const token = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data.access_token;
  } catch (error) {
    Logger.LogAccessError(`getSpotifyTokenでエラーが発生しました`, error);
    throw error;
  }
};

/**
 * 指定されたプレイリストのトップソングを取得
 * @param {string} accessToken - Spotify APIのアクセストークン
 * @param {string} playlistId - プレイリストのID
 * @returns {Promise<{name: string; artists: string}[]>} 曲情報の配列
 * @throws エラーが発生した場合
 */
export const getTopSongs = async (accessToken: string, playlistId: string) => {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const songInfoList = response.data.items.map((item: { track: { name: string; artists: { name: string }[] } }) => {
      return {
        name: item.track.name,
        artists: item.track.artists.map((artist) => artist.name).join(' '),
      };
    });
    return songInfoList;
  } catch (error) {
    Logger.LogAccessError(`getTopSongsでエラーが発生しました`, error);
    throw error;
  }
};
