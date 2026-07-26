/**
 * Structured Logging Utility for EbookVala
 * Provides consistent JSON/structured log output for security events, API errors, and audit trails.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'security';

export interface LogPayload {
  route?: string;
  userId?: string;
  action?: string;
  details?: Record<string, any>;
  error?: any;
}

export function logEvent(level: LogLevel, message: string, payload?: LogPayload) {
  const timestamp = new Date().toISOString();
  const environment = process.env.NODE_ENV || 'development';

  const entry = {
    timestamp,
    environment,
    level,
    message,
    route: payload?.route,
    userId: payload?.userId,
    action: payload?.action,
    details: payload?.details,
    error: payload?.error ? (payload.error.message || String(payload.error)) : undefined,
  };

  switch (level) {
    case 'error':
      console.error(JSON.stringify(entry));
      break;
    case 'warn':
    case 'security':
      console.warn(JSON.stringify(entry));
      break;
    default:
      console.log(JSON.stringify(entry));
      break;
  }
}
