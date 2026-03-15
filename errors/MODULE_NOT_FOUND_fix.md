# Error: Module not found: Can't resolve './ui/ErrorBoundary'
## Type: Build Error
## Description:
The Next.js build failed with the error `Module not found: Can't resolve './ui/ErrorBoundary'` in `app/providers.tsx`.

## Root Cause:
The `ErrorBoundary` component was correctly created in `components/ui/ErrorBoundary.tsx`, but the import in `app/providers.tsx` incorrectly attempted to load it from a relative path `./ui/ErrorBoundary` within the `app` directory.

## Fix Applied:
Updated the import path in `app/providers.tsx` from `./ui/ErrorBoundary` to the aliased path `@/components/ui/ErrorBoundary`.

## Prompt Used:
"Implement the complete error handling strategy for Wandra... [followed by reporting the build error]"

## Verified: Yes
