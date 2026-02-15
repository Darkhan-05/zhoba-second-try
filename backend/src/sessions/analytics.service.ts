import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AnalyticsService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || 'dummy_key';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async summarizeAnswers(topic: string, answers: any[]) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert educational analyst. You will be provided with a JSON array of student responses.
      Topic: "${topic}"
      Responses: ${JSON.stringify(answers)}

      INSTRUCTION:
      1. Analyze patterns across all ${answers.length} entries.
      2. Summarize the collective thought process instead of quoting individuals.
      3. IMPORTANT: Regardless of the language used by students (Kazakh, English, or Russian), your output MUST be entirely in RUSSIAN.
      
      Output MUST be a valid JSON object with these EXACT keys:
      factual_overview: (Краткий обзор фактов и данных в виде буллитов на русском).
      emotional_climate: (Общий эмоциональный настрой класса на русском).
      critical_concerns: (3 главных риска или критических замечания на русском).
      innovative_ideas: (Самые креативные идеи 'Зеленой шляпы' на русском).
      final_consensus: (Итоговое резюме для учителя в 2-х предложениях на русском).
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      console.log('text', text)
      // Clean up the text if it contains markdown code blocks
      text = text.replace(/```json|```/g, '').trim();

      return JSON.parse(text);
    } catch (error) {
      console.error('AI Summary Error:', error);
      // Fallback or rethrow
      return {
        factual_overview: 'Failed to generate summary.',
        emotional_climate: 'N/A',
        critical_concerns: 'N/A',
        innovative_ideas: 'N/A',
        final_consensus: 'Please check the raw responses.',
        error: error.message
      };
    }
  }
}
