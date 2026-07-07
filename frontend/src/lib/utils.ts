import { type ClassValue, clsx } from "clsx";
import { isAxiosError } from "axios";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (isAxiosError(error) && Array.isArray(error.response?.data?.errors)) {
    const fieldErrors: Record<string, string> = {};
    for (const { field, message } of error.response.data.errors) {
      if (field) fieldErrors[field] = message;
    }
    return fieldErrors;
  }
  return {};
}
