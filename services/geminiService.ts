
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AIPromptResult, Mood } from "../types";
import { getModelConfig } from "../lib/storage";

// Base64 helper as per instructions
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// PCM Audio Decoding as per instructions
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

async function audioBufferToBlob(audioBuffer: AudioBuffer): Promise<string> {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numberOfChannels * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + audioBuffer.length * numberOfChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, audioBuffer.sampleRate, true);
  view.setUint32(28, audioBuffer.sampleRate * numberOfChannels * 2, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, audioBuffer.length * numberOfChannels * 2, true);

  const offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
      view.setInt16(offset + (i * numberOfChannels + channel) * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

export const generateRadioIntro = async (scriptDescription: string, voiceName: 'Kore' | 'Puck' | 'Zephyr' | 'Charon' = 'Kore'): Promise<string> => {
  const config = getModelConfig();
  const apiKey = config.apiKeys.Gemini || process.env.GEMINI_API_KEY || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });
  const scriptResponse = await ai.models.generateContent({
    model: config.textModelId,
    contents: `Write a very short (max 15 words) lofi radio intro based on this vibe: "${scriptDescription}". Example: "You're listening to Lofi Studio. Stay chill, stay focused."`,
  });
  const finalScript = scriptResponse.text.trim();
  const ttsResponse = await ai.models.generateContent({
    model: config.audioModelId,
    contents: [{ parts: [{ text: `Say in a calm, soothing voice: ${finalScript}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("TTS Generation failed");
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const rawBytes = decodeBase64(base64Audio);
  const audioBuffer = await decodeAudioData(rawBytes, audioContext, 24000, 1);
  return await audioBufferToBlob(audioBuffer);
};

export const getAIAssistantParams = async (prompt: string): Promise<AIPromptResult> => {
  const config = getModelConfig();
  const apiKey = config.apiKeys.Gemini || process.env.GEMINI_API_KEY || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });
  const response = await ai.models.generateContent({
    model: config.textModelId,
    contents: `Based on this lofi scene description, generate musical parameters: "${prompt}"`,
    config: {
      systemInstruction: "You are a specialized music producer assistant for Lofi Hip Hop. Convert descriptive scenes into structured musical parameters.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mood: { type: Type.STRING, enum: Object.values(Mood) },
          bpmRange: {
            type: Type.OBJECT,
            properties: {
              min: { type: Type.NUMBER },
              max: { type: Type.NUMBER }
            }
          },
          suggestedDuration: { type: Type.NUMBER },
          suggestedTitle: { type: Type.STRING },
          reasoning: { type: Type.STRING }
        },
        required: ["mood", "bpmRange", "suggestedDuration", "suggestedTitle", "reasoning"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim()) as AIPromptResult;
  } catch (error) {
    return {
      mood: Mood.CHILL,
      bpmRange: { min: 80, max: 90 },
      suggestedDuration: 180,
      suggestedTitle: "Dreamscape",
      reasoning: "Defaulted to chill vibe."
    };
  }
};

export const replicateAesthetic = async (category: string): Promise<AIPromptResult & { improvementSuggestions: string[], tags: string[], seoTitle: string }> => {
  const config = getModelConfig();
  const apiKey = config.apiKeys.Gemini || process.env.GEMINI_API_KEY || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });
  const response = await ai.models.generateContent({
    model: config.textModelId,
    contents: `Aesthetic Source: Lofi Girl - Category: ${category}. Task: Extract core DNA and generate an 'Improved Clone' profile for a 1-hour YouTube mix.`,
    config: {
      systemInstruction: "You are an AI Content Strategist. Your goal is to replicate the specific 'Lo-Fi Girl' vibe for a given category (Study, Night, etc.) but IMPROVE it for modern audiences. Suggest audio enhancements, generate an SEO-optimized title for YouTube, and a list of 10 relevant tags.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mood: { type: Type.STRING, enum: Object.values(Mood) },
          bpmRange: {
            type: Type.OBJECT,
            properties: {
              min: { type: Type.NUMBER },
              max: { type: Type.NUMBER }
            }
          },
          suggestedDuration: { type: Type.NUMBER },
          suggestedTitle: { type: Type.STRING },
          seoTitle: { type: Type.STRING, description: "Catchy YouTube title including keywords like 'lofi hip hop', 'beats to study', etc." },
          reasoning: { type: Type.STRING },
          improvementSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["mood", "bpmRange", "suggestedDuration", "suggestedTitle", "seoTitle", "reasoning", "improvementSuggestions", "tags"]
      }
    }
  });

  return JSON.parse(response.text.trim());
};
