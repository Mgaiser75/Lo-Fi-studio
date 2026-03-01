
import { GoogleGenAI } from "@google/genai";
import { VisualTheme } from "../types";
import { getModelConfig } from "../lib/storage";

const THEME_PROMPTS: Record<VisualTheme, string> = {
  [VisualTheme.CLASSIC_ANIME]: "90s retro anime style, Studio Ghibli inspired, clean line art, warm nostalgic lighting, flat cel shading, cozy and peaceful atmosphere.",
  [VisualTheme.CYBERPUNK]: "Futuristic cyberpunk anime, neon city lights reflecting in window, rain droplets, synthwave color palette (purple, teal, pink), high contrast, volumetric fog.",
  [VisualTheme.WATERCOLOR]: "Soft watercolor painting style, painterly textures, bleeding colors, ethereal and dreamlike, soft edges, gentle daylight, hand-drawn look.",
  [VisualTheme.RETRO_VHS]: "Lo-fi VHS aesthetic, tracking lines, chromatic aberration, muted vintage colors, 80s anime grit, warm film grain, slight screen flicker.",
  [VisualTheme.MODERN_3D]: "Stylized 3D render, Unreal Engine 5 aesthetic, octane render, beautiful ray-traced lighting, depth of field, high-end production quality, smooth gradients."
};

/**
 * Ensures a paid API key is selected before proceeding with Veo generation.
 */
export const ensureApiKeySelected = async (): Promise<boolean> => {
  if (typeof window.aistudio === 'undefined') return true; // Fallback for environments without the global
  const hasKey = await window.aistudio.hasSelectedApiKey();
  if (!hasKey) {
    await window.aistudio.openSelectKey();
    // Guideline: Assume successful after trigger
    return true;
  }
  return true;
};

/**
 * Generates a high-quality, loopable lofi background.
 * For character consistency (Lo-Fi Girl style), we inject 
 * specific aesthetic markers into the prompt.
 */
export const generateLofiBackground = async (
  sceneDescription: string, 
  theme: VisualTheme = VisualTheme.CLASSIC_ANIME,
  mood: string = 'chill',
  aspectRatio: '16:9' | '9:16' = '16:9',
  resolution: '720p' | '1080p' = '720p'
) => {
  // Enforce API key selection for Veo models
  await ensureApiKeySelected();

  const config = getModelConfig();
  const apiKey = config.apiKeys.Gemini || process.env.GEMINI_API_KEY || process.env.API_KEY;

  // Create fresh instance right before call as per guidelines
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });
  
  const themeModifier = THEME_PROMPTS[theme];
  
  const basePrompt = `
    MASTERPIECE LOFI ANIMATION. 
    STYLE: ${themeModifier}
    SCENE: A character centered in the frame, ${sceneDescription}. 
    COMPOSITION: LoFi Girl inspired, window in the background showing a view of the environment. 
    ATMOSPHERE: ${mood} mood, deeply relaxing, cozy, serene. 
    TECHNICAL: ${resolution}, high quality, subtle environmental movement, perfect seamless loop.
  `.trim();

  try {
    let operation = await ai.models.generateVideos({
      model: config.videoModelId,
      prompt: basePrompt,
      config: {
        numberOfVideos: 1,
        resolution: resolution,
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed.");
    
    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey || '',
      },
    });
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error("Video generation error:", error);
    
    // Guideline: Handle specific errors by prompting for key again
    const errorMsg = error.message || "";
    if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("permission") || errorMsg.includes("403")) {
       await window.aistudio.openSelectKey();
    }
    
    throw error;
  }
};
