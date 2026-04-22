/**
 * Regex Implementation Demonstration
 * Shows practical usage of the regex utility system in the Sara7a application
 */

import {
  REGEX_PATTERNS,
  validateWithMessage,
  validatePasswordStrength,
  extractEmails,
  extractPhoneNumbers,
  validateArabicName,
  validateEgyptianID
} from './regex.utils.js';

/**
 * Demonstrate user registration validation
 */
export const demonstrateUserRegistration = () => {
  console.log('=== USER REGISTRATION VALIDATION ===\n');

  const userData = {
    firstName: 'Ahmed',
    lastName: 'Mohamed',
    email: 'ahmed.mohamed@example.com',
    phone: '01012345678',
    password: 'SecurePass123!',
    age: 25
  };

  // Validate each field
  const validations = [
    {
      field: 'firstName',
      value: userData.firstName,
      pattern: REGEX_PATTERNS.FIRST_NAME,
      message: 'First name must contain only letters (2-25 characters)'
    },
    {
      field: 'lastName',
      value: userData.lastName,
      pattern: REGEX_PATTERNS.LAST_NAME,
      message: 'Last name must contain only letters (2-25 characters)'
    },
    {
      field: 'email',
      value: userData.email,
      pattern: REGEX_PATTERNS.EMAIL,
      message: 'Invalid email format'
    },
    {
      field: 'phone',
      value: userData.phone,
      pattern: REGEX_PATTERNS.EGYPT_PHONE,
      message: 'Invalid Egyptian phone number format'
    },
    {
      field: 'password',
      value: userData.password,
      pattern: REGEX_PATTERNS.PASSWORD,
      message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    }
  ];

  validations.forEach(({ field, value, pattern, message }) => {
    const result = validateWithMessage(pattern, value, message);
    console.log(`${field}: ${value} - ${result.isValid ? 'Valid' : 'Invalid'}`);
    if (!result.isValid) {
      console.log(`  Error: ${result.message}`);
    }
  });

  // Password strength analysis
  const passwordAnalysis = validatePasswordStrength(userData.password);
  console.log(`\nPassword Strength Analysis:`);
  console.log(`  Overall Strength: ${passwordAnalysis.strength}/5`);
  console.log(`  Is Strong: ${passwordAnalysis.isStrong ? 'Yes' : 'No'}`);
  console.log(`  Checks Passed: ${Object.values(passwordAnalysis.checks).filter(Boolean).length}/5`);
};

/**
 * Demonstrate message content validation
 */
export const demonstrateMessageValidation = () => {
  console.log('\n=== MESSAGE CONTENT VALIDATION ===\n');

  const messages = [
    'Hello, how are you?',
    'This is a very long message that exceeds the maximum allowed length of 500 characters and should fail validation because it contains way too many characters that go beyond the limit set by the regex pattern which is designed to ensure messages are concise and readable',
    'Visit my website at https://example.com for more info!',
    'Short msg'
  ];

  messages.forEach((message, index) => {
    const result = validateWithMessage(
      REGEX_PATTERNS.MESSAGE_CONTENT,
      message,
      'Message must be 1-500 characters long'
    );
    console.log(`Message ${index + 1}: ${result.isValid ? 'Valid' : 'Invalid'}`);
    console.log(`  Length: ${message.length} characters`);
    if (!result.isValid) {
      console.log(`  Error: ${result.message}`);
    }
  });
};

/**
 * Demonstrate text extraction capabilities
 */
export const demonstrateTextExtraction = () => {
  console.log('\n=== TEXT EXTRACTION DEMONSTRATION ===\n');

  const sampleText = `
    Contact Information:
    Email: admin@sara7a.com, support@example.org
    Phone: 01012345678, 01198765432
    Website: https://sara7a.com, https://example.org
    
    For inquiries, reach out to contact@sara7a.com
    Call us at 01234567890 for immediate support
  `;

  console.log('Sample Text:');
  console.log(sampleText);

  const emails = extractEmails(sampleText);
  const phones = extractPhoneNumbers(sampleText);

  console.log('\nExtracted Information:');
  console.log(`Emails found: ${emails.length}`);
  emails.forEach(email => console.log(`  - ${email}`));
  
  console.log(`Phone numbers found: ${phones.length}`);
  phones.forEach(phone => console.log(`  - ${phone}`));
};

/**
 * Demonstrate Arabic and localization support
 */
export const demonstrateArabicSupport = () => {
  console.log('\n=== ARABIC LANGUAGE SUPPORT ===\n');

  const testNames = [
    ' Ahmed Mohamed',
    'fatima ali',
    '123invalid',
    'Mohamed123',
    '   ',
    'valid Arabic name'
  ];

  console.log('Arabic Name Validation:');
  testNames.forEach(name => {
    const isValid = validateArabicName(name);
    console.log(`"${name.trim()}": ${isValid ? 'Valid' : 'Invalid'} Arabic name`);
  });

  // Test Egyptian ID validation
  const testIDs = [
    '29012345678901', // Valid Egyptian ID
    '12345678901234', // Valid format
    '123456789012345', // Invalid (15 digits)
    '2901234567890',   // Invalid (13 digits)
    'abcdef12345678'   // Invalid (contains letters)
  ];

  console.log('\nEgyptian ID Validation:');
  testIDs.forEach(id => {
    const isValid = validateEgyptianID(id);
    console.log(`${id}: ${isValid ? 'Valid' : 'Invalid'} Egyptian ID`);
  });
};

/**
 * Demonstrate security-focused validation
 */
export const demonstrateSecurityValidation = () => {
  console.log('\n=== SECURITY VALIDATION DEMONSTRATION ===\n');

  const passwords = [
    'password',           // Weak
    '12345678',           // Weak
    'Password',           // Weak
    'PASSWORD123',        // Moderate
    'Password123',        // Moderate
    'Password123!',       // Strong
    'StrongPassword@2024', // Strong
    'Very$ecureP@ssw0rd'  // Strong
  ];

  console.log('Password Security Analysis:');
  passwords.forEach(password => {
    const analysis = validatePasswordStrength(password);
    const strength = analysis.isStrong ? 'Strong' : analysis.isWeak ? 'Weak' : 'Moderate';
    console.log(`"${password}": ${strength} (${analysis.strength}/5)`);
    
    if (!analysis.isStrong) {
      const missingChecks = Object.entries(analysis.checks)
        .filter(([key, value]) => !value)
        .map(([key]) => key);
      console.log(`  Missing: ${missingChecks.join(', ')}`);
    }
  });
};

/**
 * Demonstrate URL and web validation
 */
export const demonstrateWebValidation = () => {
  console.log('\n=== WEB VALIDATION DEMONSTRATION ===\n');

  const urls = [
    'https://sara7a.com',
    'http://example.org',
    'https://www.example.com/path?query=value',
    'ftp://invalid-protocol.com',
    'not-a-url',
    'https://sub.domain.example.co.uk'
  ];

  console.log('URL Validation:');
  urls.forEach(url => {
    const result = validateWithMessage(
      REGEX_PATTERNS.URL,
      url,
      'Invalid URL format'
    );
    console.log(`${url}: ${result.isValid ? 'Valid' : 'Invalid'}`);
    if (!result.isValid) {
      console.log(`  Error: ${result.message}`);
    }
  });

  // Test slug validation
  const slugs = [
    'valid-slug',
    'valid_slug',
    'Invalid Slug!',
    '123-valid',
    'a',
    'this-is-a-very-long-slug-that-should-still-be-valid'
  ];

  console.log('\nSlug Validation:');
  slugs.forEach(slug => {
    const result = validateWithMessage(
      REGEX_PATTERNS.SLUG,
      slug,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    );
    console.log(`${slug}: ${result.isValid ? 'Valid' : 'Invalid'}`);
  });
};

/**
 * Run all demonstrations
 */
export const runAllDemonstrations = () => {
  console.log('REGEX UTILITY SYSTEM DEMONSTRATION');
  console.log('=====================================\n');

  demonstrateUserRegistration();
  demonstrateMessageValidation();
  demonstrateTextExtraction();
  demonstrateArabicSupport();
  demonstrateSecurityValidation();
  demonstrateWebValidation();

  console.log('\n=== DEMONSTRATION COMPLETE ===');
  console.log('The regex utility system is now fully integrated into the Sara7a application!');
  console.log('All validation patterns are centralized and easily maintainable.');
};

// Export for easy testing
export default {
  runAllDemonstrations,
  demonstrateUserRegistration,
  demonstrateMessageValidation,
  demonstrateTextExtraction,
  demonstrateArabicSupport,
  demonstrateSecurityValidation,
  demonstrateWebValidation
};
