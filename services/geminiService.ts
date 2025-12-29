import { GoogleGenAI, Type } from "@google/genai";
import { GeminiInsights, TikTokData } from "../types";

export const generateVideoInsights = async (videoData: TikTokData['data']): Promise<GeminiInsights> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing. Returning mock data.");
    return {
      suggestedCaptions: ["API Key Missing", "Check configuration"],
      suggestedHashtags: ["#error", "#setup"],
      viralAnalysis: "Please configure your API_KEY to enable AI insights.",
      bestTimeToPost: "N/A"
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this TikTok video's metadata and provide viral insights.
    Title/Caption: ${videoData.title}
    Author: ${videoData.author.nickname} (@${videoData.author.unique_id})
    Stats: ${videoData.digg_count} likes, ${videoData.comment_count} comments, ${videoData.share_count} shares.
    Duration: ${videoData.duration}s
    Music: ${videoData.music_info.title} by ${videoData.music_info.author}
    Type: ${videoData.images ? "Photo Slideshow" : "Video"}

    Please provide:
    1. 3 highly engaging "viral" caption alternatives (short, punchy).
    2. A list of 10 trending hashtags specific to this content's niche.
    3. A brief analysis of why this content works or how to improve it.
    4. Best time to post a similar video (generic advice based on niche).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedCaptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 engaging captions."
            },
            suggestedHashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 10 trending hashtags."
            },
            viralAnalysis: {
              type: Type.STRING,
              description: "Short analysis of viral potential."
            },
            bestTimeToPost: {
              type: Type.STRING,
              description: "Best time to post recommendation."
            },
          },
          required: ["suggestedCaptions", "suggestedHashtags", "viralAnalysis", "bestTimeToPost"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No analysis generated");
    
    return JSON.parse(text) as GeminiInsights;

  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback in case of AI failure to prevent app crash
    return {
      suggestedCaptions: ["Check this out!", "TikTok Viral", "Trending now"],
      suggestedHashtags: ["#fyp", "#tiktok", "#viral"],
      viralAnalysis: "Could not generate analysis at this time. Please try again later.",
      bestTimeToPost: "Evenings usually work best!",
    };
  }
};