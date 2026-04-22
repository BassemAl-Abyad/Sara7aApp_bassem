/**
 * Regex Utility Module
 * Centralized regex patterns for validation and data processing
 */

export const REGEX_PATTERNS = {
  // Phone numbers
  EGYPT_PHONE: /^01[0125][0-9]{8}$/,
  INTERNATIONAL_PHONE: /^\+?[1-9]\d{1,14}$/,
  
  // Email validation
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  STRICT_EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Password validation
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  BASIC_PASSWORD: /.{6,}/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{12,}$/,
  
  // Username validation
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  USERNAME_WITH_SPACES: /^[a-zA-Z0-9_ ]{3,20}$/,
  
  // Name validation
  NAME: /^[a-zA-Z\s'-]{2,50}$/,
  FIRST_NAME: /^[a-zA-Z]{2,25}$/,
  LAST_NAME: /^[a-zA-Z]{2,25}$/,
  
  // OTP validation
  OTP: /^[0-9]{6}$/,
  OTP_ALPHANUMERIC: /^[A-Za-z0-9]{6}$/,
  
  // URL validation
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  SLUG: /^[a-z0-9-]+$/,
  
  // ID validation
  MONGODB_OBJECT_ID: /^[0-9a-fA-F]{24}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Address validation
  STREET_ADDRESS: /^[a-zA-Z0-9\s,'-]*$/,
  POSTAL_CODE: /^[0-9]{5}(-[0-9]{4})?$/,
  
  // Credit card validation
  CREDIT_CARD: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,
  
  // Social security number (US format)
  SSN: /^(?!000|666|9)\d{3}-(?!00)\d{2}-(?!0000)\d{4}$/,
  
  // Date validation
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  DATETIME: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  
  // Time validation
  TIME_24H: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  TIME_12H: /^(1[0-2]|0?[1-9]):[0-5][0-9]\s?(AM|PM|am|pm)$/,
  
  // Numeric validation
  POSITIVE_INTEGER: /^[1-9]\d*$/,
  NEGATIVE_INTEGER: /^-[1-9]\d*$/,
  DECIMAL: /^-?\d+(\.\d+)?$/,
  POSITIVE_DECIMAL: /^\d+(\.\d+)?$/,
  
  // File extension validation
  IMAGE_EXTENSION: /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i,
  DOCUMENT_EXTENSION: /\.(pdf|doc|docx|txt|rtf)$/i,
  VIDEO_EXTENSION: /\.(mp4|avi|mov|wmv|flv|webm)$/i,
  AUDIO_EXTENSION: /\.(mp3|wav|ogg|flac|aac)$/i,
  
  // IP address validation
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  IPV6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  
  // Hex color validation
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  
  // Text validation
  NO_SPECIAL_CHARS: /^[a-zA-Z0-9\s]*$/,
  ONLY_LETTERS: /^[a-zA-Z\s]*$/,
  ONLY_NUMBERS: /^[0-9]*$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]*$/,
  
  // Message content validation
  MESSAGE_CONTENT: /^[\s\S]{1,500}$/,
  MESSAGE_NO_LINKS: /^(?!.*(?:https?:\/\/|www\.)).*$/,
  
  // Search patterns
  SEARCH_QUERY: /^[a-zA-Z0-9\s\-_]{2,100}$/,
  
  // Validation for common patterns
  ARABIC_TEXT: /^[\u0600-\u06FF\s]+$/,
  ENGLISH_TEXT: /^[a-zA-Z\s]+$/,
  MIXED_TEXT: /^[\u0600-\u06FFa-zA-Z0-9\s\-_.,!?]+$/,
};

/**
 * Regex validation functions
 */
export const validateRegex = (pattern, value) => {
  return pattern.test(value);
};

/**
 * Enhanced validation with detailed error messages
 */
export const validateWithMessage = (pattern, value, errorMessage) => {
  const isValid = pattern.test(value);
  return {
    isValid,
    message: isValid ? null : errorMessage
  };
};

/**
 * Multiple pattern validation
 */
export const validateMultiplePatterns = (patterns, value) => {
  const results = patterns.map(({ pattern, name, message }) => ({
    name,
    isValid: pattern.test(value),
    message: pattern.test(value) ? null : message
  }));
  
  return {
    allValid: results.every(r => r.isValid),
    results
  };
};

/**
 * Extract matches from string
 */
export const extractMatches = (pattern, text) => {
  const matches = text.match(pattern);
  return matches || [];
};

/**
 * Replace pattern in string
 */
export const replacePattern = (pattern, text, replacement) => {
  return text.replace(pattern, replacement);
};

/**
 * Check if string contains pattern
 */
export const containsPattern = (pattern, text) => {
  return pattern.test(text);
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
  
  const strength = Object.values(checks).filter(Boolean).length;
  
  return {
    strength,
    checks,
    isStrong: strength >= 4,
    isWeak: strength <= 2
  };
};

/**
 * Sanitize input by removing unwanted characters
 */
export const sanitizeInput = (input, allowedPattern) => {
  return input.replace(new RegExp(`[^${allowedPattern.source.slice(1, -1)}]`, 'g'), '');
};

/**
 * Extract URLs from text
 */
export const extractUrls = (text) => {
  const urlPattern = REGEX_PATTERNS.URL;
  return text.match(urlPattern) || [];
};

/**
 * Extract emails from text
 */
export const extractEmails = (text) => {
  const emailPattern = REGEX_PATTERNS.EMAIL;
  return text.match(emailPattern) || [];
};

/**
 * Extract phone numbers from text
 */
export const extractPhoneNumbers = (text) => {
  const phonePattern = REGEX_PATTERNS.EGYPT_PHONE;
  return text.match(phonePattern) || [];
};

/**
 * Validate Egyptian ID format
 */
export const validateEgyptianID = (id) => {
  // Egyptian national ID is 14 digits
  const egyptianIDPattern = /^[0-9]{14}$/;
  return egyptianIDPattern.test(id);
};

/**
 * Validate Arabic name
 */
export const validateArabicName = (name) => {
  return REGEX_PATTERNS.ARABIC_TEXT.test(name.trim()) && name.trim().length >= 2;
};

/**
 * Validate mixed language text (Arabic/English)
 */
export const validateMixedText = (text) => {
  return REGEX_PATTERNS.MIXED_TEXT.test(text) && text.trim().length >= 2;
};

export default {
  REGEX_PATTERNS,
  validateRegex,
  validateWithMessage,
  validateMultiplePatterns,
  extractMatches,
  replacePattern,
  containsPattern,
  validatePasswordStrength,
  sanitizeInput,
  extractUrls,
  extractEmails,
  extractPhoneNumbers,
  validateEgyptianID,
  validateArabicName,
  validateMixedText
};
