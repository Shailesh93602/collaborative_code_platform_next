import { Client } from "@gradio/client";

export class AIService {
  private static client: Client | null = null;

  private static async getClient(): Promise<Client> {
    if (!this.client) {
      this.client = await Client.connect("Qwen/Qwen2.5-Coder-Artifacts");
    }
    return this.client;
  }

  static async getAIResponse(query: string): Promise<string> {
    const client = await this.getClient();
    const result = await client.predict("/generation_code", { query });
    return result.data[0];
  }

  static async getAISuggestions(code: string): Promise<any> {
    const client = await this.getClient();
    const result = await client.predict("/generation_code", {
      query: code + " Provide me suggestions for this code",
    });
    return JSON.parse(result.data[0]);
  }
}
