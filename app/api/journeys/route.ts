import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabaseServer";
import { errorResponse, API_CODES } from "@/lib/api-utils";

/**
 * GET /api/journeys
 * List all user journeys
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse(401, "Authentication required", API_CODES.UNAUTHORIZED);
    }

    const { data, error } = await supabase
      .from("journeys")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null) // Exclude soft deleted
      .order("created_at", { ascending: false });

    if (error) {
      console.error("FETCH_JOURNEYS_ERROR:", error);
      return errorResponse(500, "Failed to fetch journeys", API_CODES.INTERNAL_ERROR);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("JOURNEYS_API_ERROR:", error);
    return errorResponse(500, "Internal server error", API_CODES.INTERNAL_ERROR);
  }
}
