export const ERROR_STATUS = {
  "VALIDATION_ERROR": {
    CODE: 400,
    MESSAGE_FA: "ورودی نامعتبر"
  }, 
  "UNAUTHORIZED": {
    CODE: 401,
    MESSAGE_FA: "API Key نامعتبر"
  },
  "NOT_FOUND": {
    CODE: 404,
    MESSAGE_FA: "Endpoint ناموجود"
  },
  "RATE_LIMIT_EXCEEDED": {
    CODE: 429,
    MESSAGE_FA: "محدودیت درخواست"
  },
  "LLM_PROVIDER_ERROR": {
    CODE: 502,
    MESSAGE_FA: "خطای سرویس LLM"
  },
  "SERVICE_UNAVAILABLE": {
    CODE: 503,
    MESSAGE_FA: "سرویس موقتاً در دسترس نیست"
  },
  "LLM_TIMEOUT": {
    CODE: 504,
    MESSAGE_FA: "پایان مهلت پاسخ Provider"
  },
  "INTERNAL_SERVER_ERROR": {
    CODE: 500,
    MESSAGE_FA: "خطای پیش‌بینی‌نشده سرور"
  }
}