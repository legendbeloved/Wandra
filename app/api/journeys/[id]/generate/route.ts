import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabaseServer";
import { errorResponse, API_CODES } from "@/lib/api-utils";
import { generateJournalEntry } from "@/lib/gemini";

/**
 * POST /api/journeys/[id]/generate
 * Trigger AI journal generation
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse(401, "Authentication required", API_CODES.UNAUTHORIZED);
    }

    // 1. Fetch Journey and its Moments
    const { data: journey, error: jError } = await supabase
      .from("journeys")
      .select("*, moments(*)")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (jError || !journey) {
      return errorResponse(404, "Journey not found", API_CODES.NOT_FOUND);
    }

    // 2. Fetch User Profile for AI style
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_style")
      .eq("id", user.id)
      .single();

    // 3. Get Style from body or profile
    const body = await req.json().catch(() => ({}));
    const selectedStyle = body.style || profile?.ai_style || 'poetic';

    // 4. Generate Content
    try {
      const { text, title } = await generateJournalEntry(
        journey,
        journey.moments || [],
        selectedStyle
      );

      // 5. Update Journey
      const { data: updated, error: uError } = await supabase
        .from("journeys")
        .update({
          journal_text: text,
          journal_title: title,
          ai_generated: true,
          status: "completed"
        })
        .eq("id", params.id)
        .select()
        .single();

      if (uError) throw uError;

      return NextResponse.json(updated);
    } catch (aiError: any) {
      if (aiError.message === "RATE_LIMIT") {
        return errorResponse(429, "AI service rate limit reached. Try again in a minute.", API_CODES.RATE_LIMIT);
      }
      throw aiError;
    }
  } catch (error) {
    console.error("GENERATE_API_ERROR:", error);
    return errorResponse(500, "Failed to generate journal", API_CODES.INTERNAL_ERROR);
  }
}
