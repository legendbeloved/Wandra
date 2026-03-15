import { NextRequest, NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/geocoding";
import { errorResponse, API_CODES } from "@/lib/api-utils";
import { getServerSupabase } from "@/lib/supabaseServer";

/**
 * POST /api/geocode
 * Reverse geocode coordinates
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse(401, "Authentication required", API_CODES.UNAUTHORIZED);
    }

    const { lat, lng } = await req.json();

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return errorResponse(400, "Invalid coordinates", "INVALID_PARAMS");
    }

    const result = await reverseGeocode(lat, lng);
    
    if (!result) {
      return errorResponse(500, "Geocoding failed", API_CODES.INTERNAL_ERROR);
    }

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(500, "Internal server error", API_CODES.INTERNAL_ERROR);
  }
}
