/**
 * Email Verification Types
 */

export interface SendVerificationRequest {
  email: string;
}

export interface SendVerificationResponse {
  message: string;
  email: string;
  expiresAt: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface VerifyCodeResponse {
  message: string;
  email: string;
  verified: boolean;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
  email: string;
  expiresAt: string;
}

export interface ErrorResponse {
  error: string;
}

