import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabaseServer";
import { errorResponse, API_CODES } from "@/lib/api-utils";

/**
 * PATCH /api/journeys/[id]/end
 * End an active journey session
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse(401, "Authentication required", API_CODES.UNAUTHORIZED);
    }

    const { data: journey, error: fetchError } = await supabase
      .from("journeys")
      .select("started_at")
      .eq("id", id)
      .single();

    if (fetchError || !journey) {
      return errorResponse(404, "Journey not found", API_CODES.NOT_FOUND);
    }

    const endedAt = new Date().toISOString();
    const durationMinutes = Math.round(
      (new Date(endedAt).getTime() - new Date(journey.started_at).getTime()) / (1000 * 60)
    );

    const { data, error } = await supabase
      .from("journeys")
      .update({
        status: "completed",
        ended_at: endedAt,
        duration_minutes: durationMinutes,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return errorResponse(500, "Failed to end journey", API_CODES.INTERNAL_ERROR);
    }

    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(500, "Internal server error", API_CODES.INTERNAL_ERROR);
  }
}
