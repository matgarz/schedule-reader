import type { ScheduleResult } from "../types";

const PROMPT = `You are a class schedule parser. Look at this schedule image and extract all classes.
Respond ONLY with valid JSON in this exact format (no markdown, no preamble):
{
  "courses": [
    {
      "code": "SOEN 342",
      "sessions": [
        { "type": "LEC", "days": ["Mon", "Wed"], "time": "12:00–13:00" },
        { "type": "TUT", "days": ["Wed"], "time": "13:00–14:00" }
      ]
    }
  ],
  "summary": "A short 2-3 sentence plain-text summary of the schedule: busiest days, free days, total classes, etc."
}`;

/**
 * Sends a base64-encoded image to the Gemini 1.5 Flash API (free tier).
 *
 * Free limits: 15 requests/min, 1500 requests/day — plenty for personal use.
 * Get a free API key at: https://aistudio.google.com/app/apikey
 */
export async function parseScheduleImage(
  base64: string,
  mediaType: string
): Promise<ScheduleResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY in .env.local");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mediaType,
                data: base64,
              },
            },
            { text: PROMPT },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 1000,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini API error ${response.status}: ${JSON.stringify(err)}`
    );
  }

  const data = await response.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as ScheduleResult;
}
