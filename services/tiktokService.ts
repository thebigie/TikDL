import { TikTokData } from '../types';

/**
 * Fetches TikTok video data using the TikWM API.
 * This is a public API frequently used for research and download projects.
 */
export const fetchTikTokData = async (url: string): Promise<TikTokData> => {
  const cleanUrl = url.trim();
  if (!cleanUrl) throw new Error("URL is empty");

  // Using tikwm API as it's one of the most reliable free public options
  const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch video data: ${response.statusText}`);
  }

  const data: TikTokData = await response.json();
  
  if (data.code !== 0) {
    throw new Error(data.msg || "Invalid TikTok URL or video is private/deleted.");
  }

  return data;
};