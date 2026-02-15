
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, TrainingSession, AssessmentResults, ChatMessage, UserStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 2, delay = 500): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
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
  return withRetry(async () => {
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
  
  return withRetry(async () => {
    const prompt = `Bạn là HLV NextLevel Academy cao cấp. 
    Tạo giáo án Tuần ${profile.currentWeek} cho cầu thủ ${profile.name} (${profile.position}).
    
    YÊU CẦU BẮT BUỘC:
    1. Tạo đúng và đủ ${profile.sessionsPerWeek} buổi tập (sessions).
    2. Mỗi buổi tập phải kéo dài khoảng ${timePerSession} phút.
    3. Nội dung tập trung vào: ${profile.weaknesses}.
    4. Cấu trúc mỗi buổi: Khởi động, Tập chính, Tập bổ trợ, Thể lực.
    
    Stats hiện tại: ${JSON.stringify(profile.stats)}.
    Feedback tuần trước: "${feedback || 'Không có'}".
    
    Trả về JSON định dạng PlanResult. Tiếng Việt chuyên nghiệp.`;

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
        duration: timePerSession // Đảm bảo thời lượng hiển thị đúng
      }))
    };
  });
};

export const getCoachChatResponse = async (profile: UserProfile, history: ChatMessage[], message: string) => {
  return withRetry(async () => {
    const systemInstruction = `Bạn là Coach NextLevel. Trả lời cực kỳ ngắn gọn, chuyên nghiệp về bóng đá. 
    Bạn biết rằng cầu thủ này tập ${profile.sessionsPerWeek} buổi/tuần, mỗi buổi ${Math.round((profile.hoursPerWeek * 60) / profile.sessionsPerWeek)} phút.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction }
    });
    return response.text || "HLV đang bận.";
  });
};
