import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  children: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  customStyle?: React.CSSProperties;
  inline?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  language = '',
  className = '',
  showLineNumbers = false,
  showCopyButton = true,
  customStyle = {},
  inline = false
}) => {
  const [copied, setCopied] = useState(false);
  
  const codeString = String(children).replace(/\n$/, '');
  const detectedLanguage = language || (className.includes('language-') ? className.replace('language-', '') : '');
  
  // Only show copy button for Python and TypeScript code blocks
  const shouldShowCopyButton = showCopyButton && 
    (detectedLanguage === 'python' || detectedLanguage === 'typescript' || detectedLanguage === 'javascript' || detectedLanguage === 'ts' || detectedLanguage === 'js' || detectedLanguage === 'py');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // For inline code, return a simple span
  if (inline) {
    return (
      <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
        {codeString}
      </code>
    );
  }

  const defaultStyle = {
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    padding: '1rem',
    ...customStyle
  };

  return (
    <div className="relative group">
      {shouldShowCopyButton && (
        <div className="absolute right-2 top-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check size={14} />
            ) : (
              <Copy size={14} />
            )}
          </Button>
        </div>
      )}
      <SyntaxHighlighter
        style={oneDark}
        language={detectedLanguage}
        PreTag="div"
        className={`rounded-md ${className}`}
        customStyle={defaultStyle}
        showLineNumbers={showLineNumbers || (detectedLanguage && codeString.split('\n').length > 3)}
        wrapLines={true}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
