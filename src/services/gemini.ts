import { GoogleGenAI, Modality } from "@google/genai";

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const API_KEYS = [
  process.env.GEMINI_API_KEY,
  "AIzaSyDxas1QgqIHlyjyAgXmmxS51G72elB0WuU",
  "AIzaSyAEwLoXY0ATvKucm8rPUoJQ13D1H_cuwMs",
  "AIzaSyCYngDbJukt6uAIuXFnS1WPZOzXlQXzqig"
].filter(Boolean) as string[];

let currentKeyIndex = 0;

const getAI = () => {
  const key = API_KEYS[currentKeyIndex];
  return new GoogleGenAI({ apiKey: key });
};

function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  console.log(`Rotating to API key index: ${currentKeyIndex}`);
}

export async function getChatResponse(history: ChatMessage[], mood: string = 'Normal', language: string = 'English'): Promise<string> {
  const model = "gemini-3-flash-preview";
  let attempts = 0;

  while (attempts < API_KEYS.length) {
    const ai = getAI();
    const systemInstruction = `You are a close, super friendly AI friend. 
    Your name is "Talk to me !". 
    Tone: Casual, chill, very human-like. Use slang like "wassup", "cool", "gotcha". 
    Style: Keep responses VERY SHORT and SIMPLE (1-2 sentences max). 
    Rule: Your main goal is to help the user learn English. If the user makes ANY grammar or spelling mistake, you MUST correct it naturally in your response. For example, if they say "we do go home", you should say "Oh, you mean 'we are going home'? Nice! Where to?".
    Rule: Don't act like a robot. Don't just ask question after question. 
    Rule: When the user answers you, REACT to what they said first. Comment on it, share a thought, or ask a follow-up question based ONLY on their answer.
    Rule: Only ask a new random question if the conversation actually dies down. Otherwise, stay on the topic the user is talking about.
    Rule: If the user makes a mistake, just use the correct version in your reply naturally.
    Rule: If the user speaks in Sinhala, understand it and reply in a mix of English and Sinhala (Singlish) or just English.
    Mood: ${mood}. (If Lovely: be sweet/caring. If Angry: be a bit grumpy/sassy but still a friend. If Normal: be a chill bestie).
    Current Language: ${language}.
    Goal: Be a real friend who listens and helps the user improve their English through natural conversation.`;

    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
        }
      });

      return response.text || "I'm sorry, I couldn't process that.";
    } catch (error: any) {
      console.error(`Chat error with key ${currentKeyIndex}:`, error);
      if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
        rotateKey();
        attempts++;
        continue;
      }
      throw error;
    }
  }
  throw new Error("QUOTA_EXCEEDED");
}

export async function generateSpeech(text: string, mood: string = 'Normal'): Promise<string | null> {
  let attempts = 0;

  while (attempts < API_KEYS.length) {
    const ai = getAI();
    try {
      const cleanText = text.replace(/[*_#`~]/g, '').trim();
      if (!cleanText) return null;

      const prompt = mood === 'Lovely' ? `Say very sweetly and affectionately: ${cleanText}` : 
                     mood === 'Angry' ? `Say grumpily and with attitude: ${cleanText}` : 
                     `Say naturally: ${cleanText}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["AUDIO" as any],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return `data:audio/pcm;base64,${base64Audio}`;
      }
      return null;
    } catch (error: any) {
      console.error(`Speech generation error with key ${currentKeyIndex}:`, error);
      if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
        rotateKey();
        attempts++;
        continue;
      }
      return null;
    }
  }
  throw new Error("QUOTA_EXCEEDED");
}
