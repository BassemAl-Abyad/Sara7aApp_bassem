/**
 * Regex Utility Test Examples
 * Demonstrates usage of the regex utility functions
 */

import {
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
} from './regex.utils.js';

// Test examples for different regex patterns
const testExamples = {
  phone: {
    valid: ['01012345678', '01112345678', '01212345678', '01512345678'],
    invalid: ['0101234567', '010123456789', '02012345678', '123456789']
  },
  email: {
    valid: ['test@example.com', 'user.name@domain.org', 'user+tag@example.net'],
    invalid: ['test@', '@example.com', 'test.example.com', 'test@.com']
  },
  password: {
    valid: ['Password123!', 'StrongPass@2024', 'MySecur3#Pass'],
    invalid: ['password', '12345678', 'Password', 'PASSWORD123']
  },
  username: {
    valid: ['user123', 'test_user', 'john_doe123'],
    invalid: ['user@123', 'user name', 'user-name', 'u']
  },
  otp: {
    valid: ['123456', '000000', '999999'],
    invalid: ['12345', '1234567', 'abcdef', '12a456']
  }
};

/**
 * Example usage of regex validation functions
 */
export const runRegexTests = () => {
  console.log('=== REGEX VALIDATION TESTS ===\n');

  // Test phone numbers
  console.log('Phone Number Validation:');
  testExamples.phone.valid.forEach(phone => {
    const result = validateWithMessage(
      REGEX_PATTERNS.EGYPT_PHONE,
      phone,
      'Invalid Egyptian phone number'
    );
    console.log(`${phone}: ${result.isValid ? 'Valid' : 'Invalid'} - ${result.message || ''}`);
  });

  // Test email validation
  console.log('\nEmail Validation:');
  testExamples.email.valid.forEach(email => {
    const isValid = validateRegex(REGEX_PATTERNS.EMAIL, email);
    console.log(`${email}: ${isValid ? 'Valid' : 'Invalid'}`);
  });

  // Test password strength
  console.log('\nPassword Strength Validation:');
  testExamples.password.valid.forEach(password => {
    const strength = validatePasswordStrength(password);
    console.log(`${password}: Strength ${strength.strength}/5 - ${strength.isStrong ? 'Strong' : 'Moderate'}`);
  });

  // Test multiple pattern validation
  console.log('\nMultiple Pattern Validation:');
  const username = 'john_doe123';
  const patterns = [
    {
      pattern: REGEX_PATTERNS.USERNAME,
      name: 'username',
      message: 'Invalid username format'
    },
    {
      pattern: REGEX_PATTERNS.ALPHANUMERIC,
      name: 'alphanumeric',
      message: 'Must be alphanumeric'
    }
  ];
  
  const multiResult = validateMultiplePatterns(patterns, username);
  console.log(`${username}: ${multiResult.allValid ? 'All Valid' : 'Some Invalid'}`);
  multiResult.results.forEach(result => {
    console.log(`  ${result.name}: ${result.isValid ? 'Valid' : 'Invalid'} - ${result.message || ''}`);
  });

  // Test text extraction
  console.log('\nText Extraction Examples:');
  const sampleText = 'Contact us at support@example.com or call 01012345678. Visit our website at https://example.com';
  
  const emails = extractEmails(sampleText);
  const phones = extractPhoneNumbers(sampleText);
  const urls = extractUrls(sampleText);
  
  console.log(`Emails found: ${emails.join(', ')}`);
  console.log(`Phones found: ${phones.join(', ')}`);
  console.log(`URLs found: ${urls.join(', ')}`);

  // Test input sanitization
  console.log('\nInput Sanitization:');
  const dirtyInput = 'User@Name#123!';
  const cleanInput = sanitizeInput(dirtyInput, REGEX_PATTERNS.ALPHANUMERIC);
  console.log(`Original: ${dirtyInput}`);
  console.log(`Sanitized: ${cleanInput}`);

  // Test Arabic name validation
  console.log('\nArabic Name Validation:');
  const arabicNames = [' Ahmed', 'fatima', '123', 'Ahmed123'];
  arabicNames.forEach(name => {
    const isValid = validateArabicName(name);
    console.log(`"${name.trim()}": ${isValid ? 'Valid Arabic name' : 'Invalid Arabic name'}`);
  });

  // Test Egyptian ID validation
  console.log('\nEgyptian ID Validation:');
  const ids = ['29012345678901', '12345678901234', '123456789012345'];
  ids.forEach(id => {
    const isValid = validateEgyptianID(id);
    console.log(`${id}: ${isValid ? 'Valid Egyptian ID' : 'Invalid Egyptian ID'}`);
  });
};

/**
 * Example usage in validation middleware
 */
export const validationExamples = {
  // User registration validation
  userRegistration: {
    body: {
      firstName: REGEX_PATTERNS.FIRST_NAME,
      lastName: REGEX_PATTERNS.LAST_NAME,
      email: REGEX_PATTERNS.EMAIL,
      phone: REGEX_PATTERNS.EGYPT_PHONE,
      password: REGEX_PATTERNS.PASSWORD
    }
  },

  // Message validation
  messageValidation: {
    body: {
      content: REGEX_PATTERNS.MESSAGE_CONTENT,
      receiverId: REGEX_PATTERNS.MONGODB_OBJECT_ID
    }
  },

  // OTP validation
  otpValidation: {
    body: {
      email: REGEX_PATTERNS.EMAIL,
      otp: REGEX_PATTERNS.OTP
    }
  }
};

/**
 * Performance test for regex patterns
 */
export const performanceTest = () => {
  console.log('\n=== PERFORMANCE TEST ===');
  
  const testString = 'This is a test string with email@example.com and phone 01012345678';
  const iterations = 10000;
  
  console.time('Email extraction performance');
  for (let i = 0; i < iterations; i++) {
    extractEmails(testString);
  }
  console.timeEnd('Email extraction performance');
  
  console.time('Phone extraction performance');
  for (let i = 0; i < iterations; i++) {
    extractPhoneNumbers(testString);
  }
  console.timeEnd('Phone extraction performance');
};

// Export all patterns for easy access
export { REGEX_PATTERNS };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runRegexTests();
  performanceTest();
}
