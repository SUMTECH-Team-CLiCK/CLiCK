import { Router } from "express";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const router = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

router.post("/analyze-prompt", async (req, res) => {
    const { prompt } = req.body;
    try {
        const sys = `다음 프롬프트를 태그별로 분석하고 JSON 형식으로 수정안을 제시해줘. 
형식: {"tags":[],"patches":{},"full_suggestion":""}`;
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: sys },
                { role: "user", content: prompt },
            ],
        });

        const parsed = JSON.parse(completion.choices[0].message.content);
        await supabase.from("analyses").insert({
            user_id: "anon",
            source_text: prompt,
            tags: parsed.tags,
            patches: parsed.patches,
            full_suggestion: parsed.full_suggestion,
        });

        res.json(parsed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "분석 실패" });
    }
});

export default router;
