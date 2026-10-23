export const HTTP_ERRORS = {
  "VALIDATION_ERROR": {
    statusCode: 400,
    code: "VALIDATION_ERROR",
    message: "Invalid input",
    messageFa: "ورودی نامعتبر"
  }, 
  "UNAUTHORIZED": {
    statusCode: 401,
    code: "UNAUTHORIZED",
    message: "",
    messageFa: "API Key نامعتبر"
  },
  "NOT_FOUND": {
    statusCode: 404,
    code: "NOT_FOUND",
    message: "",
    messageFa: "Endpoint ناموجود"
  },
  "RATE_LIMIT_EXCEEDED": {
    statusCode: 429,
    code: "RATE_LIMIT_EXCEEDED",
    message: "LLM provider rate limit exceeded",
    messageFa: "محدودیت درخواست"
  },
  "LLM_PROVIDER_ERROR": {
    statusCode: 502,
    code: "LLM_PROVIDER_ERROR",
    message: "AI service is temporarily unavailable",
    messageFa: "خطای سرویس LLM"
  },
  "SERVICE_UNAVAILABLE": {
    statusCode: 503,
    code: "SERVICE_UNAVAILABLE",
    message: "",
    messageFa: "سرویس موقتاً در دسترس نیست"
  },
  "LLM_TIMEOUT": {
    statusCode: 504,
    code: "LLM_TIMEOUT",
    message: "LLM provider request timed out",
    messageFa: "پایان مهلت پاسخ Provider"
  },
  "INTERNAL_SERVER_ERROR": {
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "",
    messageFa: "خطای پیش‌بینی‌نشده سرور"
  }
} as const

export const LLM_HTTP_ERRORS = {
  LLM_RATE_LIMIT: {
    statusCode: 503,
    code: "LLM_RATE_LIMIT",
    message: "AI service is temporarily busy",
  },
  LLM_TIMEOUT: {
    statusCode: 504,
    code: "LLM_TIMEOUT",
    message: "AI service request timed out",
  },
  LLM_INVALID_RESPONSE: {
    statusCode: 502,
    code: "LLM_INVALID_RESPONSE",
    message: "AI service returned an invalid response",
  },
  LLM_AUTHENTICATION_ERROR: {
    statusCode: 503,
    code: "LLM_AUTHENTICATION_ERROR",
    message: "AI service is unavailable",
  },
  LLM_PROVIDER_ERROR: {
    statusCode: 502,
    code: "LLM_PROVIDER_ERROR",
    message: "AI service is temporarily unavailable",
  },
} as const;