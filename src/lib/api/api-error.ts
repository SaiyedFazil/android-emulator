import { isAxiosError } from "axios";

import type { ApiErrorBody } from "@/types/api.types";

/** A failed API call, ready for a form or a toast. */
export interface ApiError {
  /** The HTTP status, or null when there was no answer. */
  status: number | null;
  /** The backend's `error`: a business code (`AUTH_PASSWORD_INCORRECT`) or the status text. */
  code: string | null;
  /** What to show the user. */
  message: string;
  details?: Record<string, unknown>;
}

const NETWORK_MESSAGE = "Can't reach the server. Check your connection and try again.";
const FALLBACK_MESSAGE = "Something went wrong. Try again.";

/** Reads any error from an API call; components branch on `code` and show `message`. */
export function getApiError(error: unknown): ApiError {
  if (!isAxiosError<Partial<ApiErrorBody>>(error)) {
    return { status: null, code: null, message: FALLBACK_MESSAGE };
  }
  const { response } = error;
  if (!response) {
    return { status: null, code: null, message: NETWORK_MESSAGE };
  }
  const body = response.data;
  if (typeof body !== "object" || body === null || typeof body.message !== "string") {
    return { status: response.status, code: null, message: FALLBACK_MESSAGE };
  }
  return {
    status: response.status,
    code: body.error ?? null,
    message: body.message,
    ...(body.details ? { details: body.details } : {}),
  };
}

/** A 4xx answer: retrying the same request won't help. */
export function isClientError(error: unknown): boolean {
  const { status } = getApiError(error);
  return status !== null && status >= 400 && status < 500;
}
