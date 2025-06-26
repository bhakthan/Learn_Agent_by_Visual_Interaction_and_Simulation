// Simple script to test patterns.ts syntax
try {
  const fs = require('fs');
  const content = fs.readFileSync('/workspaces/spark-template/src/lib/data/patterns.ts', 'utf8');
  console.log('File loaded successfully, checking syntax...');
  
  // This will throw an error if there's a syntax error
  new Function(content);
  
  console.log('Syntax check passed!');
} catch (error) {
  console.error('Syntax error detected:', error.message);
}