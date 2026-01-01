
import { GoogleGenAI, Type } from "@google/genai";
import { GreetingConfig, GeneratedGreeting, Festival, Relationship } from "../types";

export const generateGreetingData = async (config: GreetingConfig): Promise<GeneratedGreeting> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const festivalContext = config.festival === Festival.SPRING_FESTIVAL 
    ? "2026 马年（丙午年）春节" 
    : `2026 ${config.festival}`;

  // 针对不同关系定制化语气引导
  let relationGuidance = "";
  switch(config.relationship) {
    case Relationship.LOVER:
      relationGuidance = "语气要深情、浪漫，侧重陪伴与未来的约定。";
      break;
    case Relationship.TEACHER:
      relationGuidance = "语气要极其尊崇、感激，引用如‘春风化雨’、‘桃李芬芳’等修辞。";
      break;
    case Relationship.PARENT:
      relationGuidance = "语气要温情、感恩，侧重身体健康、长寿安康。";
      break;
    case Relationship.RELATIVE:
      relationGuidance = "语气要亲切、自然，侧重家族兴旺、常回家看看。";
      break;
    default:
      relationGuidance = "根据设定的语气灵活发挥。";
  }

  const prompt = `
    请为我生成 ${festivalContext} 的祝福。
    节日：${config.festival}
    收信人：${config.recipientName}
    发信人：${config.senderName}
    关系类型：${config.relationship} (${relationGuidance})
    设定语气：${config.tone}
    关键词：${config.keywords}
    
    要求：
    1. 篇幅严控：正文必须在 45-65 字之间，文字精炼，排版美观。
    2. 马年元素：如果是春节/马年，融入马年祥瑞（如骏马奔腾、马到成功）。
    3. 结构：要求辞藻优美，读起来朗朗上口。
    
    请输出 JSON 格式：
    - title: 4-8字标题
    - content: 祝福语正文
    - shortBlessing: 4字吉祥成语
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          shortBlessing: { type: Type.STRING }
        },
        required: ["title", "content", "shortBlessing"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateGreetingImage = async (greeting: GeneratedGreeting, festival: Festival, tone: string, relationship: Relationship): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // 更加抽象和安全的描述，针对不同关系微调配色
  let colorPalette = "red and gold";
  if (relationship === Relationship.LOVER) colorPalette = "romantic warm pink and gold";
  if (relationship === Relationship.TEACHER) colorPalette = "elegant ink wash blue and gold";
  if (relationship === Relationship.LEADER || relationship === Relationship.CLIENT) colorPalette = "premium deep red and heavy gold";

  let baseSubject = "Minimalist modern Chinese paper-cut style";
  if (festival === Festival.SPRING_FESTIVAL) {
    baseSubject = "An abstract artistic silhouette of a soaring horse with flowing mane, using golden lines";
  } else if (festival === Festival.VALENTINE) {
    baseSubject = "Abstract floating lotus flowers and elegant silk patterns";
  }

  const imagePrompt = `
    High-end artistic background for a greeting card. 
    Subject: ${baseSubject}. 
    Color: ${colorPalette}.
    Style: Minimalist, Zen, modern Chinese aesthetic. 
    Technical: Soft bokeh, macro lighting, clean space for text.
    Strictly NO text, NO people, NO faces, NO realistic photos. 
    Pure background textures.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: imagePrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    if (!response.candidates?.[0]?.content?.parts) throw new Error("API Limit");

    let imageUrl = "";
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) throw new Error("Image error");
    return imageUrl;
  } catch (err) {
    console.error("Image generation failed, falling back to safe prompt", err);
    // 降级处理：使用最基础且绝对安全的提示词
    const fallbackResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: "Abstract silk texture background, deep red and golden gradient, minimalist festive atmosphere, no text." }]
      },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });
    return `data:image/png;base64,${fallbackResponse.candidates[0].content.parts.find(p => p.inlineData).inlineData.data}`;
  }
};
