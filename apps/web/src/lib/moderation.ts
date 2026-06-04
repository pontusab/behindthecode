import "server-only";

export type ModerationResult = {
  flagged: boolean;
  reason: string | null;
};

/**
 * Optional AI moderation for comments. Uses the AI SDK with OpenAI when
 * configured; otherwise returns "not flagged" (fail-open). Enabled only when
 * `settings.aiModeration` is on and `OPENAI_API_KEY` is present.
 */
export async function moderateComment(body: string): Promise<ModerationResult> {
  if (!process.env.OPENAI_API_KEY) return { flagged: false, reason: null };

  try {
    const { generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");
    const { z } = await import("zod");

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        flagged: z.boolean(),
        reason: z
          .enum([
            "spam",
            "harassment",
            "hate",
            "sexual",
            "violence",
            "other",
            "none",
          ])
          .describe("Primary reason if flagged, otherwise 'none'."),
      }),
      system:
        "You are a content moderator for a video platform's comments. Flag spam, scams, harassment, hate speech, sexually explicit, or violent content. Allow normal critical or negative opinions.",
      prompt: body,
    });

    return {
      flagged: object.flagged,
      reason: object.flagged ? object.reason : null,
    };
  } catch {
    // Fail open: never block legitimate users if the AI call fails.
    return { flagged: false, reason: null };
  }
}
