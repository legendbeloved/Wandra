import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorResponse = {
  status: number;
  message: string;
  code: string;
  field?: string;
};

/**
 * Standard API error response generator
 */
export function errorResponse(
  status: number,
  message: string,
  code: string,
  field?: string
) {
  return NextResponse.json(
    { status, message, code, field },
    { status }
  );
}

/**
 * Handle validation errors from Zod
 */
export function handleValidationError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const firstError = error.issues[0];
    return errorResponse(
      400,
      firstError.message,
      "VALIDATION_ERROR",
      firstError.path.join(".")
    );
  }
  return errorResponse(400, "Validation failed", "VALIDATION_ERROR");
}

export const API_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMIT: "RATE_LIMIT",
  ALREADY_EXISTS: "ALREADY_EXISTS",
};
