export const ERROR_STATUS = {
  "VALIDATION_ERROR": {
    STATUS_CODE: 400,
    CODE: "VALIDATION_ERROR",
    MESSAGE: "Invalid input",
    MESSAGE_FA: "ورودی نامعتبر"
  }, 
  "UNAUTHORIZED": {
    STATUS_CODE: 401,
    CODE: "UNAUTHORIZED",
    MESSAGE: "",
    MESSAGE_FA: "API Key نامعتبر"
  },
  "NOT_FOUND": {
    STATUS_CODE: 404,
    CODE: "NOT_FOUND",
    MESSAGE: "",
    MESSAGE_FA: "Endpoint ناموجود"
  },
  "RATE_LIMIT_EXCEEDED": {
    STATUS_CODE: 429,
    CODE: "RATE_LIMIT_EXCEEDED",
    MESSAGE: "LLM provider rate limit exceeded",
    MESSAGE_FA: "محدودیت درخواست"
  },
  "LLM_PROVIDER_ERROR": {
    STATUS_CODE: 502,
    CODE: "LLM_PROVIDER_ERROR",
    MESSAGE: "AI service is temporarily unavailable",
    MESSAGE_FA: "خطای سرویس LLM"
  },
  "SERVICE_UNAVAILABLE": {
    STATUS_CODE: 503,
    CODE: "SERVICE_UNAVAILABLE",
    MESSAGE: "",
    MESSAGE_FA: "سرویس موقتاً در دسترس نیست"
  },
  "LLM_TIMEOUT": {
    STATUS_CODE: 504,
    CODE: "LLM_TIMEOUT",
    MESSAGE: "LLM provider request timed out",
    MESSAGE_FA: "پایان مهلت پاسخ Provider"
  },
  "INTERNAL_SERVER_ERROR": {
    STATUS_CODE: 500,
    CODE: "INTERNAL_SERVER_ERROR",
    MESSAGE: "",
    MESSAGE_FA: "خطای پیش‌بینی‌نشده سرور"
  }
}