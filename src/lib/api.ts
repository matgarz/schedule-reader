import type { ScheduleResult } from "../types";

const PROMPT = `You are a schedule parser for a Team Overlap engine. Look at this schedule image and extract ONLY the hard busy commitments (Work, Classes, Commute, Appointments, Meetings, Gym).
CRITICAL RULES:
1. Do NOT extract or include blocks labeled as "Free Time", "(FREE)", "Relax", "Chill", "Wind down", "Lazy Morning", or empty whitespace.
2. We only want time blocks where the user is genuinely BUSY and cannot take a meeting.
3. Group related busy activities together using a logical "code" (e.g., "Work", "Commute").

Respond ONLY with valid JSON in this exact format (no markdown, no preamble):
{
  "courses": [
    {
      "code": "Work",
      "sessions": [
        { "type": "Focus", "days": ["Mon", "Wed"], "time": "12:00–13:00" }
      ]
    }
  ],
  "summary": "A 2-3 sentence plain-text summary of the busy schedule."
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

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
        temperature: 0.1,
        responseMimeType: "application/json",
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

  let clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  clean = clean.replace(/[\n\r]+/g, " ");
  
  try {
    return JSON.parse(clean) as ScheduleResult;
  } catch (err: any) {
    console.error("RAW GEMINI TEXT:", text);
    throw new Error(`JSON Error: ${err.message}. Raw Text: ${text.substring(0, 300)}...`);
  }
}
