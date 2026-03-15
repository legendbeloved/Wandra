/**
 * Wandra Error System
 * Standardized error codes, messages, and HTTP status codes.
 */

export type ErrorDefinition = {
  code: string;
  httpStatus: number;
  message: string;
};

export const WANDRA_ERRORS: Record<string, ErrorDefinition> = {
  JOURNEY_NOT_FOUND: {
    code: 'JOURNEY_NOT_FOUND',
    httpStatus: 404,
    message: 'We couldn\'t find that journey. It might have been deleted or moved.',
  },
  JOURNEY_ALREADY_ACTIVE: {
    code: 'JOURNEY_ALREADY_ACTIVE',
    httpStatus: 400,
    message: 'You already have an active journey. End your current one before starting something new.',
  },
  MOMENT_SAVE_FAILED: {
    code: 'MOMENT_SAVE_FAILED',
    httpStatus: 500,
    message: 'Something went wrong while saving your moment. Don\'t worry, it\'s saved locally and will sync soon.',
  },
  AI_GENERATION_FAILED: {
    code: 'AI_GENERATION_FAILED',
    httpStatus: 500,
    message: 'Gemini hit a snag while writing your journal. Give it another try in a moment.',
  },
  AI_RATE_LIMITED: {
    code: 'AI_RATE_LIMITED',
    httpStatus: 429,
    message: 'Slow down, traveler! We\'ve reached the limit for AI generation. Try again in a minute.',
  },
  LOCATION_DENIED: {
    code: 'LOCATION_DENIED',
    httpStatus: 403,
    message: 'We need your location to track your journey. Please enable GPS permissions.',
  },
  GEOCODING_FAILED: {
    code: 'GEOCODING_FAILED',
    httpStatus: 500,
    message: 'We couldn\'t pinpoint your exact location name, but your coordinates are safe.',
  },
  WEATHER_FAILED: {
    code: 'WEATHER_FAILED',
    httpStatus: 500,
    message: 'We couldn\'t fetch the local weather, but we\'ve saved the rest of your moment.',
  },
  AUTH_REQUIRED: {
    code: 'AUTH_REQUIRED',
    httpStatus: 401,
    message: 'You need to be signed in to access this. Please log in to continue.',
  },
  PROFILE_NOT_FOUND: {
    code: 'PROFILE_NOT_FOUND',
    httpStatus: 404,
    message: 'We couldn\'t find your profile. Please check your connection or sign up.',
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    httpStatus: 400,
    message: 'Something is missing or incorrect in your request. Please check the details.',
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    httpStatus: 500,
    message: 'An unexpected error occurred. Our team of explorers is looking into it.',
  },
};

export class WandraError extends Error {
  definition: ErrorDefinition;
  details?: any;

  constructor(code: keyof typeof WANDRA_ERRORS, details?: any) {
    const definition = WANDRA_ERRORS[code];
    super(definition.message);
    this.name = 'WandraError';
    this.definition = definition;
    this.details = details;
  }
}
