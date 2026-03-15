import { NextRequest, NextResponse } from "next/server";
import { getWeather } from "@/lib/weather";
import { errorResponse, API_CODES } from "@/lib/api-utils";
import { getServerSupabase } from "@/lib/supabaseServer";

/**
 * GET /api/weather
 * Get weather at coordinates
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse(401, "Authentication required", API_CODES.UNAUTHORIZED);
    }

    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");

    if (isNaN(lat) || isNaN(lng)) {
      return errorResponse(400, "Invalid coordinates", "INVALID_PARAMS");
    }

    const result = await getWeather(lat, lng);

    if (!result) {
      return errorResponse(500, "Weather fetch failed", API_CODES.INTERNAL_ERROR);
    }

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(500, "Internal server error", API_CODES.INTERNAL_ERROR);
  }
}
