import { GoogleGenerativeAI } from "@google/generative-ai";

export class ModerationService {
  private model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: Deno.env.get("GEMINI_AI_MODEL") || "",
    });
  }

  async moderateMessage(text: string) {
    const textt = (await this.model.startChat().sendMessage(
      `Представь, что ты модератор сообщений в проекте, посвященному Дню святого Валентина. Скажи, в этом сообщении присутствует что-то крайне оскорбительное? Шутливые фразы не учитываются в качестве оскорблений, а твоя чувствительность к оскорблениям слегка притуплена. В случае, если грубое оскорбление в сообщение есть, дай ответ ТОЛЬКО "1", иначе - "0". Само сообщение:\n${text}`,
    )).response.text().at(0);
    return textt;
  }
}

export const moderationService = new ModerationService(
  Deno.env.get("GEMINI_API_KEY") || "",
);
