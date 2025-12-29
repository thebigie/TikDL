export interface TikTokData {
  code: number;
  msg: string;
  processed_time: number;
  data: {
    id: string;
    region: string;
    title: string;
    cover: string;
    origin_cover: string;
    duration: number;
    play: string;
    wmplay: string;
    hdplay: string;
    music: string;
    images?: string[];
    music_info: {
      id: string;
      title: string;
      play: string;
      author: string;
      original: boolean;
      duration: number;
      album: string;
    };
    author: {
      id: string;
      unique_id: string;
      nickname: string;
      avatar: string;
      signature?: string; // Bio
    };
    digg_count: number;
    comment_count: number;
    share_count: number;
    download_count: number;
    collect_count: number;
    play_count: number;
    create_time?: number; // Often returned by API
  };
}

export interface GeminiInsights {
  suggestedCaptions: string[];
  suggestedHashtags: string[];
  viralAnalysis: string;
  bestTimeToPost: string;
}