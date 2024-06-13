export interface SpotifyPlaylistInfo {
  name: string;
  id: string;
  title: string;
  description: string;
  ranking: boolean;
  displayFlag: boolean;
  active_date: {
    start_date: string | null;
    end_date: string | null;
  };
}
