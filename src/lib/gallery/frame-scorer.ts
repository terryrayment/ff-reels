import OpenAI from "openai";

/**
 * AI-powered frame scoring using GPT-4o-mini vision.
 *
 * Sends candidate frame URLs (from Mux image API) to GPT-4o-mini,
 * which scores each frame for presentation quality.
 */

export interface ScoredFrame {
  projectId: string;
  muxPlaybackId: string;
  timeOffset: number;
  score: number;
  frameUrl: string;
}

interface CandidateFrame {
  projectId: string;
  muxPlaybackId: string;
  timeOffset: number;
  url: string;
}

let _client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[Frame Scorer] OPENAI_API_KEY not set — cannot score frames");
    return null;
  }
  _client = new OpenAI({ apiKey });
  return _client;
}

/**
 * Generate candidate timestamps for a video.
 * Samples every `intervalSec` seconds, skipping first/last 0.5s.
 */
export function getCandidateTimestamps(
  duration: number,
  intervalSec = 2,
): number[] {
  const timestamps: number[] = [];
  const start = 0.5;
  const end = Math.max(start + 1, duration - 0.5);

  for (let t = start; t < end; t += intervalSec) {
    timestamps.push(Math.round(t * 10) / 10);
  }
  return timestamps;
}

/**
 * Build a Mux thumbnail URL for a specific time offset.
 * Uses 960px width for scoring (cheaper tokens) or 1920px for download.
 */
export function buildMuxFrameUrl(
  muxPlaybackId: string,
  timeOffset: number,
  width = 960,
): string {
  return `https://image.mux.com/${muxPlaybackId}/thumbnail.png?time=${timeOffset}&width=${width}`;
}

/**
 * Score candidate frames using GPT-4o-mini vision.
 * Returns all frames with AI scores (1-10).
 */
export async function scoreFrames(
  candidates: CandidateFrame[],
  batchSize = 16,
): Promise<ScoredFrame[]> {
  const client = getClient();
  if (!client) return [];

  const results: ScoredFrame[] = [];

  // Process in batches to stay within vision context limits
  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);

    try {
      const batchScores = await scoreBatch(client, batch);
      results.push(...batchScores);
    } catch (err) {
      console.error(`[Frame Scorer] Batch ${i / batchSize + 1} failed:`, err);
      // Assign neutral scores to failed batch
      for (const c of batch) {
        results.push({
          projectId: c.projectId,
          muxPlaybackId: c.muxPlaybackId,
          timeOffset: c.timeOffset,
          score: 5,
          frameUrl: c.url,
        });
      }
    }
  }

  return results;
}

const SCORING_PROMPT = `You are evaluating video frames for a professional presentation gallery. A producer will use these as stills in pitch decks and presentations.

Score each frame 1-10 on these criteria:
- Composition: Well-framed, cinematic, interesting angles
- Visual Impact: Striking, memorable, would stop someone scrolling
- Clarity: Sharp focus, no motion blur, no artifacts
- Production Value: Lighting quality, set design, color grade
- Storytelling: Captures an emotional or narrative moment

Be selective. Only give 8+ to truly exceptional frames. Most frames should score 4-6.
Frame numbers correspond to the order of images provided (1-indexed).

Return JSON: { "scores": [{ "frame": 1, "score": 7 }, { "frame": 2, "score": 4 }, ...] }`;

async function scoreBatch(
  client: OpenAI,
  batch: CandidateFrame[],
): Promise<ScoredFrame[]> {
  const imageContent = batch.map((c) => ({
    type: "image_url" as const,
    image_url: { url: c.url, detail: "low" as const },
  }));

  const response = await client.chat.completions.create(
    {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SCORING_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Score these ${batch.length} frames for presentation quality. Return JSON only.`,
            },
            ...imageContent,
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 500,
    },
    { timeout: 30000 },
  );

  const content = response.choices[0]?.message?.content;
  if (!content) return batch.map((c) => ({ ...c, score: 5, frameUrl: c.url }));

  const parsed = JSON.parse(content) as {
    scores: Array<{ frame: number; score: number }>;
  };

  return batch.map((c, idx) => {
    const match = parsed.scores?.find((s) => s.frame === idx + 1);
    return {
      projectId: c.projectId,
      muxPlaybackId: c.muxPlaybackId,
      timeOffset: c.timeOffset,
      score: match?.score ?? 5,
      frameUrl: c.url,
    };
  });
}

/**
 * Build candidate frames for all projects in a reel.
 */
export function buildCandidates(
  projects: Array<{
    id: string;
    muxPlaybackId: string;
    duration: number;
  }>,
): CandidateFrame[] {
  const candidates: CandidateFrame[] = [];

  for (const proj of projects) {
    // For short videos, sample more frequently
    const interval = proj.duration < 4 ? 1 : 2;
    const timestamps = getCandidateTimestamps(proj.duration, interval);

    for (const t of timestamps) {
      candidates.push({
        projectId: proj.id,
        muxPlaybackId: proj.muxPlaybackId,
        timeOffset: t,
        url: buildMuxFrameUrl(proj.muxPlaybackId, t, 960),
      });
    }
  }

  return candidates;
}

/**
 * Select the best frames from scored candidates.
 * Ensures coverage (min 1 per project) and diversity (max 4 per project).
 */
export function selectBestFrames(
  scored: ScoredFrame[],
  totalTarget = 16,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  minPerProject = 1,
  maxPerProject = 4,
): ScoredFrame[] {
  // Group by project
  const byProject: Record<string, ScoredFrame[]> = {};
  const projectOrder: string[] = [];
  for (const frame of scored) {
    if (!byProject[frame.projectId]) {
      byProject[frame.projectId] = [];
      projectOrder.push(frame.projectId);
    }
    byProject[frame.projectId].push(frame);
  }

  // Sort each project's frames by score (descending)
  for (const pid of projectOrder) {
    byProject[pid].sort((a: ScoredFrame, b: ScoredFrame) => b.score - a.score);
  }

  const selected: ScoredFrame[] = [];
  const projectCounts: Record<string, number> = {};

  // First pass: take top frame from each project (guarantee coverage)
  for (const pid of projectOrder) {
    const frames = byProject[pid];
    if (frames.length > 0) {
      selected.push(frames[0]);
      projectCounts[pid] = 1;
    }
  }

  // Second pass: fill remaining slots with highest scoring frames
  const remaining = totalTarget - selected.length;
  if (remaining > 0) {
    const allSorted = scored
      .filter((f) => !selected.includes(f))
      .sort((a, b) => b.score - a.score);

    for (const frame of allSorted) {
      if (selected.length >= totalTarget) break;
      const count = projectCounts[frame.projectId] || 0;
      if (count >= maxPerProject) continue;

      selected.push(frame);
      projectCounts[frame.projectId] = count + 1;
    }
  }

  // Sort final selection by project order then time offset
  selected.sort((a, b) => {
    const orderA = projectOrder.indexOf(a.projectId);
    const orderB = projectOrder.indexOf(b.projectId);
    if (orderA !== orderB) return orderA - orderB;
    return a.timeOffset - b.timeOffset;
  });

  return selected;
}
