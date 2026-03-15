import { NextRequest, NextResponse } from "next/server";
import { JourneyStartSchema } from "@/lib/validations";
import { withErrorHandler, verifyAuth, validateRequest } from "@/lib/api";
import { WandraError } from "@/lib/errors";

/**
 * POST /api/journeys/start
 * Create a new journey session
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const { user, supabase } = await verifyAuth();
  const data = await validateRequest(req, JourneyStartSchema);

  const { data: journey, error } = await supabase
    .from("journeys")
    .insert({
      user_id: user.id,
      destination_name: data.destination_name,
      destination_lat: data.destination_lat,
      destination_lng: data.destination_lng,
      departure_note: data.departure_note,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    throw new WandraError('UNKNOWN_ERROR', error.message);
  }

  return NextResponse.json(journey);
});
