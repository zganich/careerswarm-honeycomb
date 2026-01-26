/**
 * Error formatting utilities for tRPC errors
 * Provides user-friendly error messages while logging technical details
 */

import { TRPCClientError } from "@trpc/client";

export interface FormattedError {
  message: string;
  code: string;
  isUserFriendly: boolean;
}

/**
 * Format tRPC errors into user-friendly messages
 * Hides technical stack traces in production
 */
export function formatTRPCError(error: unknown): FormattedError {
  // Handle tRPC client errors
  if (error instanceof TRPCClientError) {
    const code = error.data?.code || "UNKNOWN_ERROR";
    
    // Network errors
    if (error.message.includes("fetch failed") || error.message.includes("NetworkError")) {
      return {
        message: "Please check your internet connection and try again",
        code: "NETWORK_ERROR",
        isUserFriendly: true,
      };
    }
    
    // Authentication errors
    if (code === "UNAUTHORIZED" || error.message.includes("Unauthorized")) {
      return {
        message: "Please sign in to continue",
        code: "UNAUTHORIZED",
        isUserFriendly: true,
      };
    }
    
    // Forbidden errors
    if (code === "FORBIDDEN") {
      return {
        message: "You don't have permission to perform this action",
        code: "FORBIDDEN",
        isUserFriendly: true,
      };
    }
    
    // Not found errors
    if (code === "NOT_FOUND") {
      return {
        message: "The requested resource was not found",
        code: "NOT_FOUND",
        isUserFriendly: true,
      };
    }
    
    // Bad request errors (validation)
    if (code === "BAD_REQUEST") {
      // Try to extract validation message
      const validationMessage = error.message || "Please check your input and try again";
      return {
        message: validationMessage,
        code: "BAD_REQUEST",
        isUserFriendly: true,
      };
    }
    
    // Server errors
    if (code === "INTERNAL_SERVER_ERROR") {
      console.error("[tRPC Error]", {
        code,
        message: error.message,
        data: error.data,
      });
      
      return {
        message: "Something went wrong on our end. Please try again later.",
        code: "INTERNAL_SERVER_ERROR",
        isUserFriendly: true,
      };
    }
    
    // Generic tRPC error
    return {
      message: error.message || "An unexpected error occurred",
      code,
      isUserFriendly: false,
    };
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    console.error("[Generic Error]", {
      message: error.message,
      stack: error.stack,
    });
    
    return {
      message: "An unexpected error occurred. Please try again.",
      code: "UNKNOWN_ERROR",
      isUserFriendly: true,
    };
  }
  
  // Unknown error type
  console.error("[Unknown Error]", error);
  return {
    message: "An unexpected error occurred. Please try again.",
    code: "UNKNOWN_ERROR",
    isUserFriendly: true,
  };
}

/**
 * Get a user-friendly error message from any error type
 */
export function getUserFriendlyMessage(error: unknown): string {
  return formatTRPCError(error).message;
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TRPCClientError) {
    return error.message.includes("fetch failed") || error.message.includes("NetworkError");
  }
  return false;
}

/**
 * Check if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof TRPCClientError) {
    return error.data?.code === "UNAUTHORIZED" || error.message.includes("Unauthorized");
  }
  return false;
}
