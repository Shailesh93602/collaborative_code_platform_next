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
    const result: any = await client.predict("/generation_code", { query });
    return result.data?.[0];
  }

  static async getAISuggestions(code: string): Promise<any> {
    const client = await this.getClient();
    const result: any = await client.predict("/generation_code", {
      query: code + " Provide me suggestions for this code",
    });
    return JSON.parse(result.data?.[0]);
  }

  static async getCodeExplanation(
    code: string,
    type: "explanation" | "documentation"
  ): Promise<string> {
    const client = await this.getClient();
    const query =
      type === "explanation"
        ? `Explain this code concisely:\n\n${code}`
        : `Generate documentation for this code:\n\n${code}`;
    const result: any = await client.predict("/generation_code", { query });
    return result.data?.[0];
  }
}
