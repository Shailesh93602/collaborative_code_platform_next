import { NextResponse } from 'next/server';
import { aiService } from '@/services/ai';

export async function POST(request: Request) {
  try {
    const { code, language } = await request.json();
    const projectContext = 'default'; // You may want to pass this from the client or derive it from the request

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });
    }

    const explanation = await aiService.getCodeExplanation(code, language, projectContext);
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Error in code explanation:', error);
    return NextResponse.json({ error: 'Failed to get code explanation' }, { status: 500 });
  }
}
