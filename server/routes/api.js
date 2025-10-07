import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 일반 채팅 응답 API
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: 'gpt-4-turbo-preview',
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Failed to fetch response from OpenAI' });
  }
});

// 프롬프트 분석 및 제안 API
router.post('/analyze-prompt', async (req, res) => {
  try {
    const { prompt } = req.body;

    const systemMessage = `You are an expert prompt engineer. Analyze the user's prompt. Rewrite it to be clearer and more effective. Identify weaknesses and categorize them into '지시 불명확', '구조/길이 중복', '문법/스타일 개선'. Provide your output in a JSON format with 'suggested_prompt' and an 'analysis' array.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });
    
    const analysisResult = JSON.parse(completion.choices[0].message.content);
    res.json(analysisResult);

  } catch (error) {
    console.error('Error calling OpenAI API for analysis:', error);
    res.status(500).json({ error: 'Failed to analyze prompt' });
  }
});

export default router;
