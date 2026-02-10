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
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert educational analyst. You will be provided with a JSON array of student responses.
      Analyze: Look for patterns across ${answers.length} entries.
      Synthesize: Instead of quoting students, summarize the collective thought process.
      Topic: "${topic}"
      Responses: ${JSON.stringify(answers)}

      Output: Return a JSON object with these keys:
      factual_overview: (Bullet points of data/facts mentioned).
      emotional_climate: (The general feeling of the class).
      critical_concerns: (The 3 biggest risks identified).
      innovative_ideas: (The most creative 'Green Hat' solutions).
      final_consensus: (A 2-sentence conclusion for the teacher).

      Ensure the response is a valid JSON object.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

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
