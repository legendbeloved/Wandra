import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabaseServer";
import { MomentSchema } from "@/lib/validations";
import { errorResponse, handleValidationError, API_CODES } from "@/lib/api-utils";
import { reverseGeocode } from "@/lib/geocoding";
import { getWeather } from "@/lib/weather";

/**
 * POST /api/journeys/[id]/moment
 * Add a moment to an active journey
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse(401, "Authentication required", API_CODES.UNAUTHORIZED);
    }

    const body = await req.json();
    const validation = MomentSchema.safeParse(body);

    if (!validation.success) {
      return handleValidationError(validation.error);
    }

    // Enrich with server-side data (Geocoding & Weather)
    const [geo, weather] = await Promise.all([
      reverseGeocode(validation.data.lat, validation.data.lng),
      getWeather(validation.data.lat, validation.data.lng)
    ]);

    const { data, error } = await supabase
      .from("moments")
      .insert({
        journey_id: id,
        user_id: user.id,
        lat: validation.data.lat,
        lng: validation.data.lng,
        place_name: validation.data.place_name || geo?.place_name,
        weather_condition: weather?.condition,
        weather_temp: weather?.temp,
        weather_icon: weather?.icon,
        photo_url: validation.data.photo_url,
        user_mood: validation.data.user_mood,
        is_key_moment: validation.data.is_key_moment,
      })
      .select()
      .single();

    if (error) {
      console.error("MOMENT_INSERT_ERROR:", error);
      return errorResponse(500, "Failed to capture moment", API_CODES.INTERNAL_ERROR);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("MOMENT_API_ERROR:", error);
    return errorResponse(500, "Internal server error", API_CODES.INTERNAL_ERROR);
  }
}
