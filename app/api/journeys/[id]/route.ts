import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabaseServer";
import { errorResponse, API_CODES } from "@/lib/api-utils";

/**
 * GET /api/journeys/[id]
 * PATCH /api/journeys/[id]
 * DELETE /api/journeys/[id]
 */

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse(401, "Authentication required", API_CODES.UNAUTHORIZED);
    }

    const { data, error } = await supabase
      .from("journeys")
      .select("*, moments(*)")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return errorResponse(404, "Journey not found", API_CODES.NOT_FOUND);
    }

    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(500, "Internal server error", API_CODES.INTERNAL_ERROR);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse(401, "Authentication required", API_CODES.UNAUTHORIZED);
    }

    const body = await req.json();
    
    // Only allow specific updates
    const allowedUpdates = {
      journal_text: body.journal_text,
      journal_title: body.journal_title,
      mood_tag: body.mood_tag,
    };

    const { data, error } = await supabase
      .from("journeys")
      .update(allowedUpdates)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return errorResponse(500, "Failed to update journey", API_CODES.INTERNAL_ERROR);
    }

    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(500, "Internal server error", API_CODES.INTERNAL_ERROR);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse(401, "Authentication required", API_CODES.UNAUTHORIZED);
    }

    // Soft delete
    const { error } = await supabase
      .from("journeys")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (error) {
      return errorResponse(500, "Failed to delete journey", API_CODES.INTERNAL_ERROR);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(500, "Internal server error", API_CODES.INTERNAL_ERROR);
  }
}
