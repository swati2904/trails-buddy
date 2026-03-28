const ERROR_MESSAGES_BY_CODE = {
  AUTH_REQUIRED: 'Please sign in to continue.',
  AUTH_TOKEN_INVALID: 'Your session is invalid. Please sign in again.',
  AUTH_TOKEN_EXPIRED: 'Your session expired. Please sign in again.',
  AUTH_FORBIDDEN: 'You do not have permission for this action.',
  VALIDATION_ERROR: 'Please review your input and try again.',
  RESOURCE_NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
};

export const getApiErrorMessage = (error, fallbackMessage) => {
  const code = String(error?.code || error?.details?.error?.code || '').trim();

  if (code && ERROR_MESSAGES_BY_CODE[code]) {
    return ERROR_MESSAGES_BY_CODE[code];
  }

  return error?.message || fallbackMessage;
};

export const shouldForceSignOut = (error) => {
  const code = String(error?.code || error?.details?.error?.code || '').trim();
  return code === 'AUTH_TOKEN_INVALID' || code === 'AUTH_TOKEN_EXPIRED';
};
