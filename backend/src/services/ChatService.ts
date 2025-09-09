import OpenAI from 'openai';
import { logger } from '../config/logger';

export class ChatService {
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      logger.warn('OpenAI API key not configured. Chat responses will be simulated.');
    }
  }

  async processMessage(message: string): Promise<string> {
    try {
      if (this.openai) {
        const completion = await this.openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are ShaunAI, an autonomous agent representing Shaun. You help automate daily tasks, integrate with various services, and provide assistance through a unified operator console. Be helpful, concise, and action-oriented."
            },
            {
              role: "user",
              content: message
            }
          ],
          model: "gpt-3.5-turbo",
          max_tokens: 500,
          temperature: 0.7
        });

        return completion.choices[0]?.message?.content || "I couldn't process that request.";
      } else {
        // Simulated response when OpenAI is not configured
        return `ShaunAI (simulated): I received your message: "${message}". OpenAI integration is not configured yet. Please set up your OPENAI_API_KEY environment variable to enable full AI responses.`;
      }
    } catch (error) {
      logger.error('Error in ChatService.processMessage:', error);
      throw new Error('Failed to process chat message');
    }
  }
}