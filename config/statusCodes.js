const HTTP_STATUS = Object.freeze({
  // --- Success Codes (2xx) ---
  OK: 200, 
  CREATED: 201, 
  ACCEPTED: 202, // ✅ Request accepted, processing pending
  NO_CONTENT: 204, // ✅ Success, but no response body

  // --- Client Error Codes (4xx) ---
  BAD_REQUEST: 400, // ❌ Invalid request (bad syntax/parameters)
  UNAUTHORIZED: 401, // ❌ Authentication required or failed
  FORBIDDEN: 403, // ❌ Authenticated but not allowed
  NOT_FOUND: 404, // ❌ Resource not found
  CONFLICT: 409, // ❌ Conflict with current resource state
  UNPROCESSABLE_ENTITY: 422, // ❌ Validation failed / semantic error
  TOO_MANY_REQUESTS: 429, // ❌ Rate limiting (too many requests)

  // --- Server Error Codes (5xx) ---
  INTERNAL_SERVER_ERROR: 500, // ⚠️ General server error
  NOT_IMPLEMENTED: 501, // ⚠️ Feature not supported by server
  BAD_GATEWAY: 502, // ⚠️ Invalid response from upstream server
  SERVICE_UNAVAILABLE: 503, // ⚠️ Server unavailable (overload/maintenance)
  GATEWAY_TIMEOUT: 504, // ⚠️ Upstream server took too long
});

module.exports = HTTP_STATUS;
