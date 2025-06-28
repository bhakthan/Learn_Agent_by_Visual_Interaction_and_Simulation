// Test script to validate the syntax of the pythonPatterns.ts file
const fs = require('fs');

try {
  const file = fs.readFileSync('./src/lib/pythonPatterns.ts', 'utf8');
  console.log('File read successfully');
  
  // Try to parse the content as JavaScript
  // Note: This is not a full TypeScript check but will catch major syntax issues
  eval('const test = ' + file);
  console.log('Syntax appears valid');
} catch (error) {
  console.error('Error:', error.message);
}