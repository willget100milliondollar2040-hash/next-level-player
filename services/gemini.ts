
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, TrainingSession, AssessmentResults, ChatMessage, UserStats } from "../types";

// Lấy API Key an toàn
const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key || key === "undefined") return "";
  return key;
};

const withRetry = async <T>(fn: (ai: any) => Promise<T>, maxRetries = 2, delay = 500): Promise<T> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: Hãy vào Vercel Settings -> Environment Variables để thêm API_KEY.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn(ai);
    } catch (error: any) {
      lastError = error;
      if (error?.message?.includes('429') || error?.status === 429) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

export const analyzeAssessment = async (profile: Partial<UserProfile>, results: AssessmentResults) => {
  return withRetry(async (ai) => {
    const prompt = `Phân tích cầu thủ ${profile.age}t, vị trí ${profile.position}. 
    Kết quả: 100m ${results.sprint100m}s, Tâng bóng ${results.juggling}, Rê bóng ${results.dribbling}s, Plank ${results.plank}s. 
    Điểm yếu: ${profile.weaknesses}. 
    Trả JSON: stats(0-100), level(1-100), evaluation (ngắn gọn tiếng Việt).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stats: {
              type: Type.OBJECT,
              properties: {
                technical: { type: Type.NUMBER },
                physical: { type: Type.NUMBER },
                tactical: { type: Type.NUMBER },
                mental: { type: Type.NUMBER },
                speed: { type: Type.NUMBER },
                stamina: { type: Type.NUMBER }
              },
              required: ["technical", "physical", "tactical", "mental", "speed", "stamina"]
            },
            level: { type: Type.NUMBER },
            evaluation: { type: Type.STRING }
          },
          required: ["stats", "level", "evaluation"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export interface PlanResult {
  sessions: TrainingSession[];
  updatedStats: UserStats;
  evaluation: string;
}

export const generatePersonalizedPlan = async (profile: UserProfile, feedback?: string): Promise<PlanResult> => {
  const timePerSession = Math.round((profile.hoursPerWeek * 60) / profile.sessionsPerWeek);
  
  return withRetry(async (ai) => {
    const prompt = ` HLB NextLevel Academy. Tạo giáo án Tuần ${profile.currentWeek} cho ${profile.name} (${profile.position}).
    Yêu cầu: ${profile.sessionsPerWeek} buổi, ${timePerSession} phút/buổi. Tập trung: ${profile.weaknesses}. Trả JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updatedStats: {
              type: Type.OBJECT,
              properties: {
                technical: { type: Type.NUMBER },
                physical: { type: Type.NUMBER },
                tactical: { type: Type.NUMBER },
                mental: { type: Type.NUMBER },
                speed: { type: Type.NUMBER },
                stamina: { type: Type.NUMBER }
              },
              required: ["technical", "physical", "tactical", "mental", "speed", "stamina"]
            },
            evaluation: { type: Type.STRING },
            sessions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['technical', 'physical', 'recovery'] },
                  duration: { type: Type.NUMBER },
                  difficulty: { type: Type.NUMBER },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        phase: { type: Type.STRING, enum: ["Khởi động", "Tập chính", "Tập bổ trợ", "Thể lực"] },
                        name: { type: Type.STRING },
                        reps: { type: Type.STRING },
                        description: { type: Type.STRING },
                        youtubeQuery: { type: Type.STRING }
                      },
                      required: ["phase", "name", "reps", "description", "youtubeQuery"]
                    }
                  }
                },
                required: ["id", "title", "type", "duration", "difficulty", "exercises"]
              }
            }
          },
          required: ["updatedStats", "evaluation", "sessions"]
        }
      }
    });
    
    const result = JSON.parse(response.text || '{}');
    return {
      ...result,
      sessions: result.sessions.slice(0, profile.sessionsPerWeek).map((s: any) => ({ 
        ...s, 
        completed: false,
        duration: timePerSession 
      }))
    };
  });
};

export const getCoachChatResponse = async (profile: UserProfile, history: ChatMessage[], message: string) => {
  return withRetry(async (ai) => {
    const systemInstruction = `Bạn là Coach NextLevel. Trả lời cực kỳ ngắn gọn, chuyên nghiệp về bóng đá.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction }
    });
    return response.text || "HLV đang bận.";
  });
};
