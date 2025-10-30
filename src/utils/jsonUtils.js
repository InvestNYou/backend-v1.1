/**
 * Utility functions for handling JSON parsing with proper error handling
 */

/**
 * Safely parses JSON data with comprehensive error handling
 * @param {any} data - The data to parse (string, object, or other)
 * @param {string} fieldName - Name of the field being parsed (for error messages)
 * @param {string} context - Context where parsing is happening (for error messages)
 * @returns {object} Parsed JSON object
 * @throws {Error} If parsing fails or data is invalid
 */
function safeParseJSON(data, fieldName = 'data', context = 'unknown') {
  if (!data) {
    const error = new Error(`${fieldName} is null or undefined in ${context}`);
    error.code = 'MISSING_DATA';
    throw error;
  }

  try {
    // Check if data is already an object (from Prisma or already parsed)
    if (typeof data === 'object') {
      console.log(`${fieldName} already parsed as object in ${context}`);
      return data;
    }

    // Check if data is a string that needs parsing
    if (typeof data === 'string') {
      // Validate that it's not the problematic "[object Object]" string
      if (data === '[object Object]') {
        const error = new Error(`Invalid ${fieldName} data: [object Object] detected in ${context}`);
        error.code = 'INVALID_OBJECT_STRING';
        throw error;
      }

      // Attempt to parse the JSON string
      const parsed = JSON.parse(data);
      console.log(`Successfully parsed ${fieldName} JSON in ${context}`);
      return parsed;
    }

    // Unexpected data type
    const error = new Error(`Unexpected ${fieldName} type: ${typeof data} in ${context}`);
    error.code = 'UNEXPECTED_TYPE';
    throw error;

  } catch (parseError) {
    // If it's our custom error, re-throw it
    if (parseError.code) {
      throw parseError;
    }

    // If it's a JSON parse error, wrap it with more context
    const error = new Error(`Failed to parse ${fieldName} JSON in ${context}: ${parseError.message}`);
    error.code = 'JSON_PARSE_ERROR';
    error.originalError = parseError;
    error.rawData = data;
    throw error;
  }
}

/**
 * Safely parses quiz questions JSON
 * @param {any} questionsData - The questions data to parse
 * @param {string} context - Context where parsing is happening
 * @returns {Array} Parsed questions array
 */
function safeParseQuizQuestions(questionsData, context = 'quiz') {
  try {
    const parsed = safeParseJSON(questionsData, 'questions', context);

    // Case 1: Already an array of questions
    if (Array.isArray(parsed)) {
      return parsed;
    }

    // Case 2: Object with a nested questions array
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.questions)) {
      return parsed.questions;
    }

    // Case 3: Map-like object with numeric keys {"0": {...}, "1": {...}}
    if (parsed && typeof parsed === 'object') {
      const keys = Object.keys(parsed);
      const allNumeric = keys.length > 0 && keys.every(k => /^\d+$/.test(k));
      if (allNumeric) {
        return keys
          .map(k => ({ key: parseInt(k, 10), value: parsed[k] }))
          .sort((a, b) => a.key - b.key)
          .map(entry => entry.value);
      }
    }

    // Case 4: Single question object – wrap it into an array
    if (parsed && typeof parsed === 'object') {
      return [parsed];
    }

    const error = new Error(`Questions data has unsupported structure in ${context}`);
    error.code = 'INVALID_QUESTIONS_FORMAT';
    throw error;
  } catch (error) {
    console.error(`Error parsing quiz questions in ${context}:`, error);
    throw error;
  }
}

/**
 * Creates a standardized error response for JSON parsing errors
 * @param {Error} error - The error object
 * @param {string} fieldName - Name of the field that failed to parse
 * @returns {object} Standardized error response
 */
function createJSONParseErrorResponse(error, fieldName = 'data') {
  const errorResponse = {
    error: 'Failed to parse data',
    details: error.message,
    code: error.code || 'UNKNOWN_ERROR'
  };

  // Add additional context based on error type
  if (error.code === 'INVALID_OBJECT_STRING') {
    errorResponse.error = 'Invalid data format';
    errorResponse.details = 'Data appears to be corrupted or improperly stored';
  } else if (error.code === 'MISSING_DATA') {
    errorResponse.error = 'Missing data';
    errorResponse.details = `${fieldName} data is required but not provided`;
  } else if (error.code === 'UNEXPECTED_TYPE') {
    errorResponse.error = 'Invalid data type';
    errorResponse.details = `Expected JSON string or object, got ${typeof error.rawData}`;
  }

  return errorResponse;
}

module.exports = {
  safeParseJSON,
  safeParseQuizQuestions,
  createJSONParseErrorResponse
};
