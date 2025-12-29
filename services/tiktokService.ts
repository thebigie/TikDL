import { TikTokData } from '../types';

/**
 * Fetches TikTok video data using the TikWM API.
 * Includes timeout and error handling for robustness.
 */
export const fetchTikTokData = async (url: string): Promise<TikTokData> => {
  const cleanUrl = url.trim();
  if (!cleanUrl) throw new Error("Please enter a valid TikTok URL");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data: TikTokData = await response.json();
    
    // API specific error code handling
    if (data.code === -1) {
       throw new Error("Invalid URL or the video is private/deleted.");
    }
    
    if (data.code !== 0) {
      throw new Error(data.msg || "Could not fetch video data. Please try again.");
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. Please check your connection.");
    }
    throw error;
  }
};