"use client";

import CodeBlock, { parseCodeBlocks, hasCodeBlocks } from "@/components/chat/CodeBlock";

const testMessages = [
  {
    content: `Here's a simple TypeScript example:

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
console.log(message);
\`\`\`

This function returns a greeting string.`,
    label: "TypeScript code block",
  },
  {
    content: `Check out this Python code:

\`\`\`python
def fibonacci(n: int) -> list[int]:
    """Generate fibonacci sequence up to n numbers."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]

    fib = [0, 1]
    while len(fib) < n:
        fib.append(fib[-1] + fib[-2])
    return fib

print(fibonacci(10))
\`\`\``,
    label: "Python code block",
  },
  {
    content: `React component example:

\`\`\`jsx
function Button({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {children}
    </button>
  );
}
\`\`\`

Use it like: \`<Button onClick={handleClick}>Click me</Button>\``,
    label: "JSX code block",
  },
  {
    content: `Multiple code blocks:

\`\`\`json
{
  "name": "example",
  "version": "1.0.0"
}
\`\`\`

And bash commands:

\`\`\`bash
npm install
npm run dev
\`\`\``,
    label: "Multiple code blocks",
  },
];

export default function CodeBlockTestPage() {
  return (
    <div className="min-h-screen bg-floor-bg text-floor-text p-8">
      <h1 className="text-2xl font-bold mb-6">Code Block Component Test</h1>

      <div className="max-w-3xl space-y-8">
        {/* Test parseCodeBlocks utility */}
        <section className="bg-floor-panel p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Utility Functions Test</h2>
          <div className="space-y-2 text-sm">
            <p>hasCodeBlocks("no code"): <code className="text-floor-highlight">{String(hasCodeBlocks("no code"))}</code></p>
            <p>hasCodeBlocks("```js\ncode\n```"): <code className="text-floor-highlight">{String(hasCodeBlocks("```js\ncode\n```"))}</code></p>
            <p>parseCodeBlocks count: <code className="text-floor-highlight">{parseCodeBlocks(testMessages[3].content).length} parts</code></p>
          </div>
        </section>

        {/* Direct CodeBlock tests */}
        <section className="bg-floor-panel p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Direct CodeBlock Component</h2>
          <CodeBlock
            code={`const greeting = "Hello, World!";
console.log(greeting);`}
            language="javascript"
          />
        </section>

        {/* Message rendering tests */}
        {testMessages.map((msg, i) => (
          <section key={i} className="bg-floor-panel p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">{msg.label}</h2>
            <div className="message-content">
              {renderMessageContent(msg.content)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// Simulate how ChatPanel renders content
function renderMessageContent(content: string) {
  if (!hasCodeBlocks(content)) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  const parts = parseCodeBlocks(content);
  return parts.map((part, i) => {
    if (part.type === "code") {
      return <CodeBlock key={i} code={part.content} language={part.language} />;
    }
    return <span key={i} className="whitespace-pre-wrap">{part.content}</span>;
  });
}
