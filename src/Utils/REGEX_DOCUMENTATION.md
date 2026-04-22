# Regex Utility Documentation

## Overview

The regex utility module provides centralized regex patterns and validation functions for the Sara7a application. This implementation ensures consistent validation across the entire codebase and makes it easy to maintain and update validation rules.

## File Structure

```
src/Utils/
  - regex.utils.js      # Main regex patterns and utility functions
  - regex.test.js       # Test examples and usage demonstrations
  - REGEX_DOCUMENTATION.md  # This documentation file
```

## Available Regex Patterns

### Phone Numbers
- `EGYPT_PHONE`: Validates Egyptian phone numbers (01[0125] + 8 digits)
- `INTERNATIONAL_PHONE`: Validates international phone numbers with optional +

### Email Validation
- `EMAIL`: Standard email validation
- `STRICT_EMAIL`: More strict email validation

### Password Validation
- `PASSWORD`: Minimum 8 chars, uppercase, lowercase, number, special char
- `BASIC_PASSWORD`: Minimum 6 characters
- `STRONG_PASSWORD`: Minimum 12 chars with all character types

### Username and Names
- `USERNAME`: 3-20 chars, alphanumeric and underscores
- `USERNAME_WITH_SPACES`: 3-20 chars, alphanumeric, underscores, and spaces
- `NAME`: 2-50 chars, letters, spaces, hyphens, and apostrophes
- `FIRST_NAME`: 2-25 letters only
- `LAST_NAME`: 2-25 letters only

### OTP and Codes
- `OTP`: 6-digit numeric code
- `OTP_ALPHANUMERIC`: 6-character alphanumeric code

### URL and Web
- `URL`: HTTP/HTTPS URL validation
- `SLUG`: URL-friendly lowercase string with hyphens

### ID Validation
- `MONGODB_OBJECT_ID`: 24-character hexadecimal string
- `UUID`: Standard UUID format

### Address
- `STREET_ADDRESS`: Street address format
- `POSTAL_CODE`: US ZIP code format

### Financial
- `CREDIT_CARD`: Major credit card patterns
- `SSN`: US Social Security Number format

### Date and Time
- `DATE`: YYYY-MM-DD format
- `DATETIME`: ISO datetime format
- `TIME_24H`: 24-hour time format (HH:MM)
- `TIME_12H`: 12-hour time format with AM/PM

### Numeric
- `POSITIVE_INTEGER`: Positive whole numbers
- `NEGATIVE_INTEGER`: Negative whole numbers
- `DECIMAL`: Decimal numbers (positive or negative)
- `POSITIVE_DECIMAL`: Positive decimal numbers

### File Extensions
- `IMAGE_EXTENSION`: Common image file extensions
- `DOCUMENT_EXTENSION`: Common document file extensions
- `VIDEO_EXTENSION`: Common video file extensions
- `AUDIO_EXTENSION`: Common audio file extensions

### Network
- `IPV4`: IPv4 address validation
- `IPV6`: IPv6 address validation

### Colors
- `HEX_COLOR`: Hexadecimal color codes

### Text Validation
- `NO_SPECIAL_CHARS`: Letters, numbers, and spaces only
- `ONLY_LETTERS`: Letters and spaces only
- `ONLY_NUMBERS`: Numbers only
- `ALPHANUMERIC`: Letters and numbers only

### Message and Content
- `MESSAGE_CONTENT`: 1-500 characters for message content
- `MESSAGE_NO_LINKS`: Message content without URLs

### Search and Localization
- `SEARCH_QUERY`: Search query validation
- `ARABIC_TEXT`: Arabic characters and spaces
- `ENGLISH_TEXT`: English characters and spaces
- `MIXED_TEXT`: Mixed Arabic/English with common characters

## Utility Functions

### Basic Validation
```javascript
import { validateRegex } from './regex.utils.js';

const isValid = validateRegex(REGEX_PATTERNS.EMAIL, 'test@example.com');
```

### Validation with Error Messages
```javascript
import { validateWithMessage } from './regex.utils.js';

const result = validateWithMessage(
  REGEX_PATTERNS.PASSWORD,
  'weakpass',
  'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
);
// Returns: { isValid: false, message: 'Password must be...' }
```

### Multiple Pattern Validation
```javascript
import { validateMultiplePatterns } from './regex.utils.js';

const patterns = [
  { pattern: REGEX_PATTERNS.USERNAME, name: 'username', message: 'Invalid username' },
  { pattern: REGEX_PATTERNS.ALPHANUMERIC, name: 'alphanumeric', message: 'Must be alphanumeric' }
];

const result = validateMultiplePatterns(patterns, 'john_doe');
// Returns: { allValid: true, results: [...] }
```

### Text Extraction
```javascript
import { extractEmails, extractPhoneNumbers, extractUrls } from './regex.utils.js';

const text = 'Contact test@example.com or call 01012345678';
const emails = extractEmails(text); // ['test@example.com']
const phones = extractPhoneNumbers(text); // ['01012345678']
```

### Input Sanitization
```javascript
import { sanitizeInput } from './regex.utils.js';

const clean = sanitizeInput('User@Name#123!', REGEX_PATTERNS.ALPHANUMERIC);
// Returns: 'UserName123'
```

### Password Strength Analysis
```javascript
import { validatePasswordStrength } from './regex.utils.js';

const analysis = validatePasswordStrength('Password123!');
// Returns: { strength: 5, checks: {...}, isStrong: true, isWeak: false }
```

### Specialized Validations
```javascript
import { 
  validateEgyptianID, 
  validateArabicName, 
  validateMixedText 
} from './regex.utils.js';

const isValidID = validateEgyptianID('29012345678901');
const isValidArabic = validateArabicName(' Ahmed');
const isValidMixed = validateMixedText('Hello world');
```

## Integration with Validation Middleware

The regex patterns are integrated into the validation middleware:

```javascript
// In validation.middleware.js
import { REGEX_PATTERNS } from "../Utils/regex.utils.js";

export const generalFields = {
  phone: joi.string().pattern(REGEX_PATTERNS.EGYPT_PHONE),
  password: joi.string().pattern(REGEX_PATTERNS.PASSWORD),
  username: joi.string().pattern(REGEX_PATTERNS.USERNAME),
  // ... other fields
};
```

## Usage in Controllers

```javascript
// In auth.validation.js
export const signupSchema = {
  body: joi.object({
    firstName: generalFields.firstName.required(),
    lastName: generalFields.lastName.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    phone: generalFields.phone,
  }),
};
```

## Testing

Run the test examples to verify regex functionality:

```javascript
import { runRegexTests, performanceTest } from './regex.test.js';

runRegexTests();    // Run validation examples
performanceTest();  // Run performance benchmarks
```

## Performance Considerations

- Regex patterns are compiled once and reused
- Complex patterns like credit card validation are optimized
- Performance tests show excellent results for common operations
- Consider caching validation results for frequently validated data

## Best Practices

1. **Use centralized patterns**: Always import from `REGEX_PATTERNS` instead of hardcoding
2. **Provide clear error messages**: Use `validateWithMessage` for user-facing validation
3. **Test edge cases**: Use the provided test examples as a starting point
4. **Consider performance**: For high-volume validation, consider memoization
5. **Document custom patterns**: Add new patterns to this documentation

## Adding New Patterns

To add a new regex pattern:

1. Add the pattern to `REGEX_PATTERNS` in `regex.utils.js`
2. Add corresponding validation functions if needed
3. Update the documentation
4. Add test cases in `regex.test.js`
5. Update validation middleware if applicable

Example:
```javascript
// In regex.utils.js
export const REGEX_PATTERNS = {
  // ... existing patterns
  CUSTOM_PATTERN: /^your-pattern-here$/,
};
```

## Common Use Cases

### User Registration
```javascript
const userValidation = {
  firstName: REGEX_PATTERNS.FIRST_NAME,
  lastName: REGEX_PATTERNS.LAST_NAME,
  email: REGEX_PATTERNS.EMAIL,
  phone: REGEX_PATTERNS.EGYPT_PHONE,
  password: REGEX_PATTERNS.PASSWORD
};
```

### Message Content
```javascript
const messageValidation = {
  content: REGEX_PATTERNS.MESSAGE_CONTENT,
  receiverId: REGEX_PATTERNS.MONGODB_OBJECT_ID
};
```

### OTP Verification
```javascript
const otpValidation = {
  email: REGEX_PATTERNS.EMAIL,
  otp: REGEX_PATTERNS.OTP
};
```

## Troubleshooting

### Common Issues

1. **Pattern not matching**: Check for escaped characters and proper regex syntax
2. **Performance issues**: Consider simplifying complex patterns or adding caching
3. **False positives**: Test with edge cases and adjust patterns accordingly
4. **Unicode issues**: Ensure proper Unicode handling for Arabic text

### Debug Tips

- Use `validateWithMessage` to get detailed error information
- Test patterns individually before integration
- Use the provided test suite as a reference
- Check browser console for regex syntax errors

## Security Considerations

- Password patterns enforce minimum security requirements
- Input sanitization prevents injection attacks
- Email validation prevents malformed email addresses
- Phone number validation ensures proper format
- All patterns are designed to prevent ReDoS attacks

## Maintenance

- Regularly review and update patterns based on user feedback
- Monitor performance metrics for high-volume validations
- Keep documentation updated with new patterns and examples
- Run test suite after any changes to ensure compatibility
