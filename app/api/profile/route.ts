import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabaseServer";
import { ProfileUpdateSchema } from "@/lib/validations";
import { errorResponse, handleValidationError, API_CODES } from "@/lib/api-utils";

/**
 * GET /api/profile
 * PATCH /api/profile
 */

export async function GET(req: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse(401, "Authentication required", API_CODES.UNAUTHORIZED);
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      return errorResponse(404, "Profile not found", API_CODES.NOT_FOUND);
    }

    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(500, "Internal server error", API_CODES.INTERNAL_ERROR);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse(401, "Authentication required", API_CODES.UNAUTHORIZED);
    }

    const body = await req.json();
    const validation = ProfileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return handleValidationError(validation.error);
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(validation.data)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return errorResponse(500, "Failed to update profile", API_CODES.INTERNAL_ERROR);
    }

    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(500, "Internal server error", API_CODES.INTERNAL_ERROR);
  }
}
