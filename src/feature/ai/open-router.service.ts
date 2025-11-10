import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import OpenAI from 'openai';

@Injectable()
export class OpenRouterService {
  private readonly client: OpenAI;
  private readonly clientModel: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(OpenRouterService.name);
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('app.ai.openRouterApiKey'),
      baseURL: this.configService.get<string>('app.ai.openRouterBaseUrl'),
    });
    this.clientModel = 'minimax/minimax-m2:free';
  }

  public async generateQuestionsFromStoryPassage(
    passage: string,
  ): Promise<string[]> {
    const prompt: string = `
      You are a children's dyslexia language therapist and reading specialist.

      Your goal is to help a dyslexic student improve:
      1. Reading clarity (fluency and pacing)
      2. Word recognition (decoding and sight-word familiarity)
      3. Alphabet recognition (letter-to-sound awareness)

      You will be given a short story passage.
      From it, generate 4 short reading prompts that are directly based on the story.

      Guidelines for your prompts:
      - Language: Indonesian
      - Each prompt must be a **factual phrase** from the story (no imagination or added detail)
      - Each must be **5 words or fewer**
      - Each must be **phonetically simple and rhythmically clear**
      - Prefer **high-frequency or early-reading words** (e.g., “Rafi pakai sepatu hujan”)
      - Avoid abstract or compound sentences
      - Avoid new vocabulary not present in the story
      - Avoid punctuation and special characters
      - Include a mix of:
        - **Whole-word repetition prompts** (for sight word recall)
        - **Short phrase reconstruction** (for context recall)
        - **Sound-pattern reinforcement** (for phonological awareness)

      Return ONLY a **JSON array of strings** with no extra explanation or formatting.

      Example Output:
      ["Rafi pakai sepatu", "Tanah penuh lumpur", "Rafi tertawa gembira", "Sepatu hujan kuat"]

      Story Passage:
      ${passage}
    `;

    try {
      const completion: OpenAI.Chat.ChatCompletion =
        await this.client.chat.completions.create({
          model: this.clientModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
        });

      const content: string =
        completion.choices[0].message
          ?.content!.replace(/```json/g, '')
          .replace(/```/g, '')
          .trim() ?? '[]';

      const parsed: string[] = JSON.parse(content) as string[];
      if (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === 'string')
      ) {
        return parsed;
      }

      throw new InternalServerErrorException(
        'Gagal menghasilkan pertanyaan, silahkan coba lagi. (OpenRouter Error)',
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Gagal menghasilkan pertanyaan, silahkan coba lagi.',
      );
    }
  }
}
