# JavaScript String Template Best Practices

This document outlines our best practices for working with strings in JavaScript/TypeScript to maintain code readability, consistency, and performance.

## Template Literals

Always use template literals (backticks) instead of string concatenation when inserting variables into strings:

```javascript
// ✅ Good: Use template literals
const name = 'User';
const greeting = `Hello, ${name}!`;

// ❌ Bad: Avoid string concatenation
const badGreeting = 'Hello, ' + name + '!';
```

## Multiline Strings

For multiline strings, use template literals with proper indentation:

```javascript
// ✅ Good: Readable multiline strings
const message = `
  This is a multiline string
  that is easy to read and
  maintains its formatting.
`;

// ❌ Bad: Concatenating multiple lines
const badMessage = "This is a multiline string\n" +
  "that is harder to read\n" +
  "and error-prone.";
```

## String Interpolation

Use template literal interpolation for computed values:

```javascript
// ✅ Good: Expression in template literal
const total = `Total: $${price * quantity}`;

// ❌ Bad: Concatenating expressions
const badTotal = 'Total: $' + (price * quantity);
```

## Tagged Templates

Consider using tagged templates for specialized string processing:

```javascript
// For HTML escaping, internationalization, or other specialized formatting
const html = safeHtml`<div>${userInput}</div>`;
```

## Performance Considerations

- For simple strings with a few concatenations, template literals and `+` operators have similar performance
- For building large strings iteratively, use array join or StringBuilder patterns:

```javascript
// ✅ Good: Building large strings
const pieces = [];
for (const item of items) {
  pieces.push(`Item: ${item}`);
}
const result = pieces.join('\n');

// ❌ Bad: Building large strings with repeated concatenation
let result = '';
for (const item of items) {
  result += `Item: ${item}\n`; // Performance issue for large collections
}
```

## Escape Sequences

Use template literals to avoid excessive escape sequences:

```javascript
// ✅ Good: Clean path strings with template literals
const path = `C:\\Users\\${username}\\Documents`;

// ❌ Bad: Hard-to-read escape sequences
const badPath = "C:\\\\Users\\\\" + username + "\\\\Documents";
```

Following these practices helps maintain consistent, readable, and maintainable code throughout the project.