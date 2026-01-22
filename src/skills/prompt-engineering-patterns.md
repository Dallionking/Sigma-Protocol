---
name: prompt-engineering-patterns
description: "Master advanced prompt engineering techniques to maximize LLM performance, reliability, and controllability in production. Use when optimizing prompts, improving LLM outputs, or designing production prompt templates."
version: "1.0.0"
source: "@wshobson/agents"
triggers:
  - llm-development
  - prompt-optimization
  - ai-integration
  - agent-development
  - chatbot-development
---

# Prompt Engineering Patterns Skill

Master advanced prompt engineering techniques to maximize LLM performance, reliability, and controllability in production. Use when optimizing prompts, improving LLM outputs, or designing production prompt templates.

## When to Invoke

Invoke this skill when:

- Designing prompts for LLM applications
- Optimizing prompt performance and consistency
- Implementing structured reasoning patterns
- Building few-shot learning systems
- Creating reusable prompt templates
- Debugging inconsistent LLM outputs

---

## Core Patterns

### 1. Few-Shot Learning

Provide examples that demonstrate the desired behavior:

```markdown
## Task: Classify customer feedback sentiment

### Examples:

Input: "The product arrived damaged and support was unhelpful"
Output: {"sentiment": "negative", "topics": ["shipping", "support"], "urgency": "high"}

Input: "Love this! Exactly what I needed, fast shipping too"
Output: {"sentiment": "positive", "topics": ["product", "shipping"], "urgency": "low"}

Input: "It's okay, does what it says but nothing special"
Output: {"sentiment": "neutral", "topics": ["product"], "urgency": "low"}

### Now classify:

Input: "{user_input}"
Output:
```

**Best Practices:**

- 3-5 examples is usually optimal
- Include edge cases in examples
- Order examples from simple to complex
- Match example format to expected output exactly

### 2. Chain-of-Thought (CoT)

Elicit step-by-step reasoning:

```markdown
## Zero-Shot CoT

Solve this problem step by step:
{problem}

Let's think through this carefully:

1. First, I'll identify...
2. Then, I'll consider...
3. Finally, I'll conclude...

---

## Few-Shot CoT

Example:
Problem: If a train travels 120 miles in 2 hours, what's its average speed?
Reasoning:

- Distance traveled: 120 miles
- Time taken: 2 hours
- Average speed = Distance / Time
- Average speed = 120 / 2 = 60 mph
  Answer: 60 mph

Now solve:
Problem: {user_problem}
Reasoning:
```

### 3. Self-Consistency

Sample multiple reasoning paths and aggregate:

```python
# Generate N responses with temperature > 0
responses = []
for _ in range(5):
    response = llm.generate(prompt, temperature=0.7)
    responses.append(extract_answer(response))

# Majority vote
final_answer = max(set(responses), key=responses.count)
```

### 4. Role Prompting

Establish expertise and perspective:

```markdown
You are a senior software architect with 15 years of experience in distributed systems. You've designed systems handling millions of requests per second at companies like Google and Netflix.

When reviewing architecture decisions:

- Consider scalability implications
- Identify potential failure modes
- Suggest industry best practices
- Provide concrete examples from real-world systems

Review the following architecture proposal:
{proposal}
```

### 5. Structured Output

Constrain output format:

````markdown
Analyze the following code and respond in this exact JSON format:

{
"summary": "One sentence description",
"complexity": "low" | "medium" | "high",
"issues": [
{
"type": "bug" | "security" | "performance" | "style",
"severity": 1-5,
"line": number,
"description": "string",
"suggestion": "string"
}
],
"score": 1-100
}

Code:

```{language}
{code}
```
````

JSON Response:

````

---

## Advanced Patterns

### ReAct (Reasoning + Acting)

Combine reasoning with tool use:

```markdown
You have access to the following tools:
- search(query): Search the web
- calculate(expression): Evaluate math
- lookup(key): Look up in database

Use this format:
Thought: I need to figure out X
Action: tool_name(parameters)
Observation: [tool output]
... (repeat as needed)
Thought: I now know the answer
Final Answer: The answer is Y

Question: {question}
````

### Tree of Thoughts

Explore multiple reasoning branches:

```markdown
Consider this problem: {problem}

Generate 3 different approaches to solve it:

Approach 1:

- Strategy: [description]
- Steps: [enumerated]
- Potential issues: [list]
- Confidence: [1-10]

Approach 2:

- Strategy: [description]
- Steps: [enumerated]
- Potential issues: [list]
- Confidence: [1-10]

Approach 3:

- Strategy: [description]
- Steps: [enumerated]
- Potential issues: [list]
- Confidence: [1-10]

Now evaluate which approach is best and explain why:
```

### Prompt Chaining

Break complex tasks into stages:

```python
# Stage 1: Extract entities
entities = llm.generate(f"""
Extract all named entities from this text:
{document}

Return as JSON: {{"people": [], "organizations": [], "locations": []}}
""")

# Stage 2: Analyze relationships
relationships = llm.generate(f"""
Given these entities: {entities}
And this text: {document}

Identify relationships between entities.
Return as: {{"relationships": [{{"entity1": "", "entity2": "", "type": ""}}]}}
""")

# Stage 3: Generate summary
summary = llm.generate(f"""
Given:
- Entities: {entities}
- Relationships: {relationships}
- Original text: {document}

Write a structured summary highlighting key entities and their relationships.
""")
```

---

## Prompt Optimization Techniques

### Iterative Refinement Process

1. **Baseline:** Start with a simple prompt
2. **Identify failures:** Run on test cases, find errors
3. **Hypothesize:** Why is it failing?
4. **Modify:** Add instructions, examples, or constraints
5. **Test:** Run on same test cases
6. **Repeat:** Until quality target met

### Common Fixes

| Problem             | Solution                                   |
| ------------------- | ------------------------------------------ |
| Wrong format        | Add explicit format instructions + example |
| Missing information | Add "Be comprehensive" or checklist        |
| Too verbose         | Add "Be concise" or word limit             |
| Inconsistent        | Add more examples, lower temperature       |
| Hallucinations      | Add "Only use information provided"        |
| Off-topic           | Add "Focus only on X" constraints          |

### Temperature Guide

| Use Case         | Temperature | Why                    |
| ---------------- | ----------- | ---------------------- |
| Code generation  | 0.0 - 0.2   | Deterministic, correct |
| Factual Q&A      | 0.0 - 0.3   | Accurate, consistent   |
| Summarization    | 0.3 - 0.5   | Some flexibility       |
| Creative writing | 0.7 - 1.0   | Diverse, creative      |
| Brainstorming    | 0.8 - 1.2   | Maximum variety        |

---

## Production Prompt Template

```markdown
# System Prompt Template

## Role

You are a {role} specializing in {domain}.

## Context

{background_information}

## Task

{specific_task_description}

## Constraints

- {constraint_1}
- {constraint_2}
- {constraint_3}

## Output Format

{format_specification}

## Examples

{few_shot_examples}

## Important Notes

- {note_1}
- {note_2}

---

## User Input

{user_input}

## Your Response:
```

---

## Anti-Patterns

**DON'T:**

- Use vague instructions ("do a good job")
- Assume the model knows context
- Ignore output format specification
- Skip testing on edge cases
- Use production prompts without versioning

**DO:**

- Be specific and explicit
- Provide relevant context
- Specify exact output format
- Test on diverse inputs
- Version control your prompts
- Monitor prompt performance in production

---

## Integration with SSS Protocol

### Agent Development

Use these patterns when creating AI agents for the SSS workflow.

### LLM-Powered Features

Apply when building features that use LLMs (summarization, analysis, etc.).

### Prompt Templates

Create reusable templates following these patterns.

---

## MCP Integration

```javascript
// Research prompt techniques
mcp_exa_web_search_exa({
  query: "prompt engineering techniques 2025 best practices",
});

// Find examples
mcp_exa_web_search_exa({
  query: "few-shot prompting examples production",
});
```

---

_Remember: Prompt engineering is iterative. Measure, learn, improve. What works for one model may not work for another._
