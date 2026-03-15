import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "./supabaseServer";
import { WandraError, WANDRA_ERRORS } from "./errors";
import { ZodSchema } from "zod";

/**
 * Standardized error response builder
 */
export function buildErrorResponse(error: any) {
  // Track 500 errors
  if (!error.definition || error.definition.httpStatus === 500) {
    console.error("[CRITICAL_ERROR]:", error);
  }

  if (error instanceof WandraError) {
    return NextResponse.json(
      {
        success: false,
        code: error.definition.code,
        message: error.definition.message,
        details: error.details,
      },
      { status: error.definition.httpStatus }
    );
  }

  // Fallback for unknown errors
  return NextResponse.json(
    {
      success: false,
      code: WANDRA_ERRORS.UNKNOWN_ERROR.code,
      message: WANDRA_ERRORS.UNKNOWN_ERROR.message,
    },
    { status: 500 }
  );
}

/**
 * Auth verification helper (Supabase session check)
 */
export async function verifyAuth() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new WandraError('AUTH_REQUIRED');
  }
  
  return { user, supabase };
}

/**
 * Request validation helper (Zod schema)
 */
export async function validateRequest<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error: any) {
    throw new WandraError('VALIDATION_ERROR', error.errors || error.message);
  }
}

/**
 * Higher-order function to wrap API handlers with error management
 */
export function withErrorHandler(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      return buildErrorResponse(error);
    }
  };
}
