// Python patterns implementation
export const pythonPatterns = {
  'react': `# ReAct Agent implementation
import openai
import json
from typing import Dict, List, Any, Optional, Union

class ReActAgent:
    def __init__(self, client, model: str = "gpt-4"):
        self.client = client
        self.model = model
        
    async def execute(self, query: str, max_cycles: int = 5) -> Dict[str, Any]:
        """Execute the ReAct agent to solve a problem through reasoning and action cycles."""
        try:
            current_cycle = 0
            done = False
            context_history = []
            final_answer = ''
            
            # Add initial query to context
            context_history.append(f"User query: {query}")
            
            # Available tools
            tools = {
                'search': (lambda query: {
                    'results': f"Search results for '{query}'",
                    'links': ["https://example.com/1", "https://example.com/2"]
                }),
                'calculate': (lambda expression: {
                    'result': eval(expression)
                }),
                'weather': (lambda location: {
                    'temperature': 72,
                    'condition': 'sunny',
                    'location': location
                })
            }
            
            while not done and current_cycle < max_cycles:
                current_cycle += 1
                
                # Step 1: Reasoning phase
                print(f"Cycle {current_cycle}: Reasoning...")
                
                reasoning_prompt = f"""You are a ReAct agent that solves problems through cycles of reasoning and action.

Task: {query}

Previous interactions:
{context_history}

First, think about how to approach this problem. Then, if needed, select a tool to use:
- search: Search for information online
- calculate: Perform mathematical calculations
- weather: Get weather information for a location

Format your response as:
Thought: <your reasoning>
Action: <tool_name>
Action Input: <input for the tool>

Or if you can provide the final answer:
Thought: <your reasoning>
Final Answer: <your answer>
"""

                # Simulate LLM call
                # In a real implementation, this would be an API call to an LLM
                reasoning_response = "Thought: I need to calculate the distance between two points (3,4) and (0,0)\\nAction: calculate\\nAction Input: ((3**2 + 4**2) ** 0.5)"
                
                context_history.append(reasoning_response)
                
                # Check if the response contains a final answer
                if "Final Answer:" in reasoning_response:
                    answer_match = reasoning_response.split("Final Answer:")
                    if len(answer_match) > 1:
                        final_answer = answer_match[1].strip()
                        done = True
                        continue
                
                # Extract action and action input if present
                action_match = reasoning_response.split("Action:")
                if len(action_match) > 1:
                    action_and_input = action_match[1].strip().split("\\n")
                    tool_name = action_and_input[0].strip()
                    
                    action_input_match = reasoning_response.split("Action Input:")
                    if len(action_input_match) > 1:
                        tool_input = action_input_match[1].strip()
                        
                        # Step 2: Action phase - call the appropriate tool
                        print(f"Cycle {current_cycle}: Taking action with tool '{tool_name}'...")
                        
                        if tool_name in tools:
                            try:
                                tool_result = tools[tool_name](tool_input)
                                observation = f"Observation: {json.dumps(tool_result, indent=2)}"
                                context_history.append(observation)
                            except Exception as e:
                                observation = f"Observation: Error executing {tool_name} with input {tool_input}. Error: {str(e)}"
                                context_history.append(observation)
                        else:
                            observation = f"Observation: Tool {tool_name} not found. Available tools: {', '.join(tools.keys())}"
                            context_history.append(observation)
            
            # Return the final result
            return {
                'status': 'success' if done else 'max_cycles_reached',
                'cycles': current_cycle,
                'answer': final_answer if final_answer else "No final answer reached.",
                'history': context_history
            }
            
        except Exception as e:
            return {'status': 'error', 'message': str(e)}`,

  'codeact': `# CodeAct Agent implementation
import openai
import re
import json
from typing import Dict, List, Any, Optional, Union

class CodeActAgent:
    def __init__(self, client, model: str = "gpt-4"):
        self.client = client
        self.model = model
        
    async def execute(self, query: str, max_cycles: int = 5) -> Dict[str, Any]:
        """Execute the CodeAct agent to solve problems by writing and executing Python code."""
        try:
            current_cycle = 0
            done = False
            context_history = []
            final_result = ''
            
            # Simulate Python code execution environment
            def execute_code(code):
                print("Executing Python code (simulated):")
                print(code)
                
                # This is a simulation - in a real implementation, this would execute Python code
                # and return the results. For this example, we'll return a simulated result.
                
                if 'import' in code:
                    if 'numpy' in code or 'pandas' in code:
                        return "Library imported successfully."
                
                if 'print(' in code:
                    print_match = re.search(r'print\\(([^)]+)\\)', code)
                    if print_match:
                        return f"Output: {print_match.group(1)}"
                
                if 'def ' in code:
                    return "Function defined successfully."
                
                # Default simulated response
                return "Code executed. Result: [simulated output based on the provided code]"
            
            # Add the initial query to context
            context_history.append(f"User query: {query}")
            
            while not done and current_cycle < max_cycles:
                current_cycle += 1
                
                # Generate agent response
                agent_prompt = """You are a CodeAct agent that solves problems by writing and executing Python code.

Task: """ + query + """

Previous interactions:
""" + "\\n\\n".join(context_history) + """

Based on the current state, either:

1. Write Python code to make progress, formatted as:
   Thought: <your reasoning>
   Code:
   \`\`\`
   # Your Python code here
   \`\`\`

2. Or provide the final answer if you've solved the problem:
   Thought: <your reasoning>
   Final Answer: <your answer>
"""
                
                # Simulate LLM call
                # In a real implementation, this would be an API call to an LLM
                agent_response = """Thought: I'll write code to calculate factorial of a number.
Code:
\`\`\`
def factorial(n):
    if n == 0 or n == 1:
        return 1
    else:
        return n * factorial(n-1)

# Test with n=5
result = factorial(5)
print(result)
\`\`\`"""
                context_history.append(f"Agent: {agent_response}")
                
                # Check if the response contains a final answer
                if 'Final Answer:' in agent_response:
                    answer_match = re.search(r'Final Answer:(.*?)$', agent_response, re.DOTALL)
                    if answer_match:
                        final_result = answer_match.group(1).strip()
                        done = True
                    
                # Check if the response contains code
                elif '\`\`\`' in agent_response:
                    # Extract code block
                    code_match = re.search(r'\`\`\`\\s*([\\s\\S]*?)\\s*\`\`\`', agent_response)
                    if code_match:
                        code = code_match.group(1).strip()
                        
                        # Execute the code (simulated)
                        execution_result = execute_code(code)
                        
                        # Add the observation to the history
                        context_history.append(f"Observation: {execution_result}")
            
            return {
                'status': 'success' if done else 'max_cycles_reached',
                'cycles': current_cycle,
                'result': final_result if final_result else 'No final result reached.',
                'history': context_history
            }
            
        except Exception as e:
            return {'status': 'failed', 'reason': str(e)}`,

  'self-reflection': `# Self-Reflection implementation
import openai
import re
import json
from typing import Dict, List, Any, Optional, Union

class SelfReflectionAgent:
    def __init__(self, client, model: str = "gpt-4"):
        self.client = client
        self.model = model
        
    async def execute(self, query: str, max_revisions: int = 3) -> Dict[str, Any]:
        """Execute the Self-Reflection agent to improve responses through iterative critique."""
        try:
            revisions = 0
            reflections = []
            current_response = ""
            
            # Initial response generation
            initial_prompt = f"""You are an AI assistant tasked with answering the following query:
Query: {query}

Provide your best response to the query.
"""
            # Simulate LLM call for initial response
            current_response = "The factorial of a number n is the product of all positive integers less than or equal to n. It's often denoted as n!. So 5! = 5 × 4 × 3 × 2 × 1 = 120."
            
            reflections.append({
                "iteration": revisions,
                "response": current_response,
                "reflection": None
            })
            
            while revisions < max_revisions:
                revisions += 1
                
                # Self-reflection phase
                reflection_prompt = f"""You are a critical evaluator examining the following response to the query:

Query: {query}

Response:
{current_response}

Critique this response by considering:
1. Accuracy - Is all information factually correct?
2. Completeness - Does it fully address the query?
3. Clarity - Is it easy to understand?
4. Conciseness - Is it appropriately detailed without being verbose?

Provide specific suggestions for improvement.
"""
                # Simulate LLM call for reflection
                if revisions == 1:
                    reflection = "The response is accurate but could be more complete. It defines factorial and gives an example for 5!, but doesn't explain how to calculate factorials for edge cases like 0! or mention practical applications or algorithmic implementations."
                elif revisions == 2:
                    reflection = "The response now covers edge cases and implementation details but could be more concise and better structured. Consider organizing with subheadings for Definition, Examples, Edge Cases, and Implementation."
                else:
                    reflection = "The response is now well-structured, accurate, complete, and clear. No further improvements needed."
                
                # Improvement phase
                improvement_prompt = f"""You are an AI assistant tasked with answering the following query:
Query: {query}

Your previous response was:
{current_response}

A critical evaluation identified these issues:
{reflection}

Provide an improved response addressing these critiques.
"""
                # Simulate LLM call for improved response
                if revisions == 1:
                    current_response = "The factorial of a number n is the product of all positive integers less than or equal to n, denoted as n!.\\n\\nExamples:\\n- 5! = 5 × 4 × 3 × 2 × 1 = 120\\n- 3! = 3 × 2 × 1 = 6\\n\\nEdge cases:\\n- 0! is defined as 1\\n- 1! = 1\\n\\nFactorials can be calculated recursively or iteratively. A recursive implementation in Python would be:\\n\`\`\`python\\ndef factorial(n):\\n    if n == 0 or n == 1:\\n        return 1\\n    else:\\n        return n * factorial(n-1)\\n\`\`\`"
                elif revisions == 2:
                    current_response = """# Factorial Calculation

## Definition
The factorial of a number n (denoted as n!) is the product of all positive integers less than or equal to n.

## Examples
- 5! = 5 × 4 × 3 × 2 × 1 = 120
- 3! = 3 × 2 × 1 = 6

## Edge Cases
- 0! is defined as 1
- 1! = 1

## Implementation
Python recursive implementation:
\`\`\`python
def factorial(n):
    if n == 0 or n == 1:
        return 1
    else:
        return n * factorial(n-1)
\`\`\`

Factorials grow very quickly and are used in combinatorics, probability, and mathematical analysis."""
                
                reflections.append({
                    "iteration": revisions,
                    "response": current_response,
                    "reflection": reflection
                })
                
                # Check if further improvement is needed
                if "no further improvements needed" in reflection.lower():
                    break
            
            return {
                "status": "success",
                "iterations": revisions,
                "final_response": current_response,
                "reflections": reflections
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}`,

  'agentic-rag': `# Agentic RAG implementation
import openai
import json
import re
from typing import Dict, List, Any, Optional, Union

class AgenticRAGAgent:
    def __init__(self, client, model: str = "gpt-4", 
                 vector_store=None, document_processor=None):
        self.client = client
        self.model = model
        self.vector_store = vector_store  # In a real implementation, this would be a vector DB
        self.document_processor = document_processor  # For processing and chunking documents
        
    async def execute(self, query: str) -> Dict[str, Any]:
        """Execute the Agentic RAG agent to retrieve and synthesize information."""
        try:
            # Simulated document store for demonstration
            documents = [
                {"id": "doc1", "content": "Azure AI Agents are systems that can understand goals and complete tasks."},
                {"id": "doc2", "content": "Agent patterns include ReAct, Reflexion, and Plan-and-Execute methodologies."},
                {"id": "doc3", "content": "The Agent Communication Protocol (ACP) enables interoperability between AI agents."},
                {"id": "doc4", "content": "Model Context Protocol (MCP) provides standardized interactions with AI models."},
                {"id": "doc5", "content": "Azure OpenAI Service provides secure, enterprise-ready AI capabilities."}
            ]
            
            retrieval_steps = []
            
            # Step 1: Query Decomposition
            decomp_prompt = f"""Analyze the following query and break it down into search terms that would help retrieve relevant information:

Query: {query}

Output a JSON object with:
1. "search_terms": Array of specific search terms to look for
2. "required_info": Key information needed to answer the query
3. "query_type": Classification of query (factual, comparison, explanation, etc.)
"""
            # Simulate LLM call
            decomposition_result = {
                "search_terms": ["agent patterns", "AI agents", "Azure AI", "communication protocols"],
                "required_info": ["Types of agent patterns", "How agents communicate", "Azure AI integration"],
                "query_type": "explanation"
            }
            
            retrieval_steps.append({
                "step": "Query Decomposition",
                "output": decomposition_result
            })
            
            # Step 2: Intelligent Retrieval
            retrieved_docs = []
            for term in decomposition_result["search_terms"]:
                # In a real implementation, this would use semantic search
                matching_docs = [doc for doc in documents if term.lower() in doc["content"].lower()]
                retrieved_docs.extend(matching_docs)
            
            # Remove duplicates
            unique_docs = []
            for doc in retrieved_docs:
                if doc not in unique_docs:
                    unique_docs.append(doc)
            
            retrieval_steps.append({
                "step": "Document Retrieval",
                "output": unique_docs
            })
            
            # Step 3: Relevance Assessment
            assessment_prompt = f"""Assess the relevance of each document to the query:

Query: {query}

Documents:
{json.dumps(unique_docs, indent=2)}

For each document, rate its relevance from 0-10 and explain why.
"""
            # Simulate LLM call
            relevance_assessment = [
                {"doc_id": "doc2", "relevance": 9, "reason": "Directly addresses agent patterns"},
                {"doc_id": "doc3", "relevance": 8, "reason": "Discusses agent communication"},
                {"doc_id": "doc1", "relevance": 7, "reason": "Provides general context on AI agents"},
                {"doc_id": "doc4", "relevance": 6, "reason": "Related to model interaction"},
                {"doc_id": "doc5", "relevance": 5, "reason": "Mentions Azure services but less specific to patterns"}
            ]
            
            # Sort by relevance
            relevance_assessment.sort(key=lambda x: x["relevance"], reverse=True)
            
            retrieval_steps.append({
                "step": "Relevance Assessment",
                "output": relevance_assessment
            })
            
            # Step 4: Information Synthesis
            content_for_synthesis = "\\n\\n".join([
                doc["content"] for doc in unique_docs if 
                any(assessment["doc_id"] == doc["id"] and assessment["relevance"] >= 6
                    for assessment in relevance_assessment)
            ])
            
            synthesis_prompt = f"""Synthesize an answer to the query using the following relevant information:

Query: {query}

Relevant Information:
{content_for_synthesis}

Provide a comprehensive answer that addresses all aspects of the query.
"""
            # Simulate LLM call
            synthesis_result = "Agent patterns are methodologies for designing AI agents with specific capabilities. Key patterns include ReAct (Reasoning and Acting), Reflexion (self-improvement through reflection), and Plan-and-Execute. These agents communicate through protocols like the Agent Communication Protocol (ACP), which enables interoperability between different AI systems. The Model Context Protocol (MCP) standardizes interactions with AI models, creating a consistent interface for agent-model communication."
            
            retrieval_steps.append({
                "step": "Information Synthesis",
                "output": synthesis_result
            })
            
            return {
                "status": "success",
                "answer": synthesis_result,
                "process": retrieval_steps,
                "sources": [doc["id"] for doc in unique_docs if 
                          any(assessment["doc_id"] == doc["id"] and assessment["relevance"] >= 6
                              for assessment in relevance_assessment)]
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}`,

  'routing': `# Routing Agent pattern implementation
import openai
import json
from typing import Dict, List, Any, Optional, Union

class RoutingAgent:
    def __init__(self, client, model: str = "gpt-4"):
        self.client = client
        self.model = model
        
    async def execute(self, query: str) -> Dict[str, Any]:
        """Route a query to the most appropriate specialized agent."""
        try:
            # Define specialized agents
            specialized_agents = {
                "math": {
                    "description": "Handles mathematical calculations and problems",
                    "capabilities": ["algebra", "calculus", "statistics", "probability"]
                },
                "code": {
                    "description": "Writes, reviews, and debugs code",
                    "capabilities": ["python", "javascript", "algorithms", "debugging"]
                },
                "research": {
                    "description": "Finds and synthesizes information on topics",
                    "capabilities": ["search", "summarization", "fact-checking"]
                },
                "creative": {
                    "description": "Generates creative content like stories or ideas",
                    "capabilities": ["writing", "ideation", "storytelling"]
                }
            }
            
            # Step 1: Analyze the query to determine the best agent
            routing_prompt = f"""Analyze the following query and determine which specialized agent should handle it:

Query: {query}

Available agents:
{json.dumps(specialized_agents, indent=2)}

Return a JSON object with:
1. "selected_agent": The name of the best agent to handle this query
2. "confidence": Your confidence score (0-1) in this selection
3. "reasoning": Your reasoning for this selection
4. "fallback_agent": Second-best agent if the first is unavailable
"""
            # Simulate LLM call for routing decision
            routing_decision = {
                "selected_agent": "code",
                "confidence": 0.92,
                "reasoning": "The query is asking about implementing a specific algorithm in code, which falls directly under the code agent's capabilities.",
                "fallback_agent": "math"
            }
            
            # Step 2: If confidence is too low, request clarification
            if routing_decision["confidence"] < 0.7:
                clarification_prompt = f"""I'm not entirely sure what you're asking about. To better assist you, could you please clarify:

Query: {query}

I'm trying to determine if you need help with:
1. {specialized_agents[routing_decision['selected_agent']]['description']}
2. {specialized_agents[routing_decision['fallback_agent']]['description']}
3. Something else entirely?

Please provide more details about what you're looking for.
"""
                # Simulate clarification request and response
                clarification_response = "I need help implementing a sorting algorithm in Python"
                
                # Re-analyze with clarification
                routing_prompt_with_clarification = f"""Reanalyze with this clarification:

Original Query: {query}

Clarification: {clarification_response}

Available agents:
{json.dumps(specialized_agents, indent=2)}

Return a JSON object with the same fields as before.
"""
                # Simulate updated routing decision
                routing_decision = {
                    "selected_agent": "code",
                    "confidence": 0.98,
                    "reasoning": "The clarification confirms this is a coding question about implementing a sorting algorithm in Python.",
                    "fallback_agent": "math"
                }
            
            # Step 3: Route to the selected agent
            selected_agent = routing_decision["selected_agent"]
            
            # Step 4: Execute the appropriate agent
            # In a real implementation, this would call the actual agent
            # Here we'll simulate the selected agent's response
            
            agent_responses = {
                "math": "The mathematical solution to your problem involves using the quadratic formula...",
                "code": """Here's a Python implementation of a merge sort algorithm:

\`\`\`python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
        
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)
    
def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result
\`\`\`

This implementation has O(n log n) time complexity and is stable but not in-place.""",
                "research": "Based on my research, here are the key facts about your topic...",
                "creative": "Here's a creative story based on your prompt..."
            }
            
            agent_response = agent_responses[selected_agent]
            
            return {
                "status": "success",
                "routing": routing_decision,
                "response": agent_response,
                "agent": selected_agent
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}`,

  'evaluator-optimizer': `# Evaluator-Optimizer pattern implementation
import openai
import json
from typing import Dict, List, Any, Optional, Union

class EvaluatorOptimizerAgent:
    def __init__(self, client, model: str = "gpt-4"):
        self.client = client
        self.model = model
        
    async def execute(self, query: str, initial_response: str) -> Dict[str, Any]:
        """Evaluate and optimize an initial response through multiple passes."""
        try:
            evaluations = []
            responses = [initial_response]
            iterations = 0
            max_iterations = 3
            quality_threshold = 0.85
            overall_score = 0
            
            evaluation_criteria = {
                "accuracy": "Is the information factually correct and reliable?",
                "completeness": "Does the response fully address all aspects of the query?",
                "clarity": "Is the response easy to understand and well-structured?",
                "helpfulness": "Does the response provide practical, actionable information?",
                "conciseness": "Is the response appropriately detailed without unnecessary content?"
            }
            
            while iterations < max_iterations:
                iterations += 1
                current_response = responses[-1]
                
                # Step 1: Evaluate the current response
                evaluation_prompt = f"""Evaluate the following response to the query based on these criteria:

Query: {query}

Response to evaluate:
{current_response}

Criteria:
{json.dumps(evaluation_criteria, indent=2)}

For each criterion, provide:
1. A score from 0-10
2. Specific feedback explaining the score
3. Suggestions for improvement

Finally, calculate an overall quality score as an average of all criteria (0-1 scale).
"""
                # Simulate LLM evaluation
                if iterations == 1:
                    evaluation_result = {
                        "criteria": {
                            "accuracy": {"score": 8, "feedback": "Generally accurate but missing some key details about edge cases."},
                            "completeness": {"score": 6, "feedback": "Addresses main points but lacks depth on important aspects."},
                            "clarity": {"score": 7, "feedback": "Well-written but structure could be improved with headers."},
                            "helpfulness": {"score": 7, "feedback": "Provides useful information but lacks actionable examples."},
                            "conciseness": {"score": 8, "feedback": "Appropriately detailed with minimal fluff."}
                        },
                        "overall_score": 0.72,
                        "primary_improvements_needed": [
                            "Add discussion of edge cases",
                            "Include practical examples",
                            "Improve structure with headers"
                        ]
                    }
                elif iterations == 2:
                    evaluation_result = {
                        "criteria": {
                            "accuracy": {"score": 9, "feedback": "Excellent accuracy with edge cases now addressed."},
                            "completeness": {"score": 8, "feedback": "Much more comprehensive with good depth."},
                            "clarity": {"score": 9, "feedback": "Clear structure with helpful headers."},
                            "helpfulness": {"score": 8, "feedback": "Good examples but could include more code samples."},
                            "conciseness": {"score": 8, "feedback": "Well-balanced detail level."}
                        },
                        "overall_score": 0.84,
                        "primary_improvements_needed": [
                            "Add more code examples",
                            "Stronger conclusion with next steps"
                        ]
                    }
                else:
                    evaluation_result = {
                        "criteria": {
                            "accuracy": {"score": 9, "feedback": "Excellent accuracy with comprehensive coverage."},
                            "completeness": {"score": 9, "feedback": "Thoroughly addresses all aspects of the query."},
                            "clarity": {"score": 9, "feedback": "Very clear structure and presentation."},
                            "helpfulness": {"score": 10, "feedback": "Extremely helpful with excellent examples and code samples."},
                            "conciseness": {"score": 9, "feedback": "Perfect balance of detail and brevity."}
                        },
                        "overall_score": 0.92,
                        "primary_improvements_needed": []
                    }
                
                evaluations.append(evaluation_result)
                overall_score = evaluation_result["overall_score"]
                
                # If quality is sufficient, break the loop
                if overall_score > 0.85:
                    console_msg = f"Quality threshold met after {iterations} iterations"
                    print(console_msg)
                    break
                
                # Step 2: Optimize the response based on evaluation
                optimization_prompt = f"""Improve the following response based on this evaluation:

Query: {query}

Current response:
{current_response}

Evaluation:
{json.dumps(evaluation_result, indent=2)}

Create an improved response that addresses the identified issues while maintaining the strengths.
"""
                # Simulate LLM optimization
                if iterations == 1:
                    optimized_response = """# Understanding Agent Patterns in Azure AI

## Definition
Agent patterns are reusable architectural approaches for building AI agents with specific capabilities and behaviors. In Azure AI, these patterns help developers create more effective and specialized agents.

## Key Patterns
1. **ReAct Pattern**: Combines reasoning and acting in alternating steps
   - Example: An agent that analyzes a problem, takes an action, observes results, and iterates
   - Edge cases: Handles situations where actions don't produce expected outcomes

2. **Reflexion Pattern**: Enables self-critique to improve responses
   - Process: Generate response → Evaluate → Refine → Repeat
   - Edge cases: Includes mechanisms to break infinite improvement loops

3. **Plan-Execute Pattern**: Creates a plan before executing actions
   - Useful for: Complex multi-step tasks requiring coordination

## Implementation in Azure AI
Azure provides several services to implement these patterns:
- Azure OpenAI Service
- Azure AI SDK
- Azure Cognitive Services

## Practical Examples
When building a research agent in Azure, you might use the ReAct pattern to:
1. Parse a research question
2. Search for relevant papers (action)
3. Analyze results (reasoning)
4. Refine the search (action)
5. Synthesize findings (reasoning)"""
                else:
                    optimized_response = """# Understanding Agent Patterns in Azure AI

## Definition
Agent patterns are reusable architectural approaches for building AI agents with specific capabilities and behaviors. In Azure AI, these patterns help developers create more effective and specialized agents.

## Key Patterns
1. **ReAct Pattern**: Combines reasoning and acting in alternating steps
   - Example: An agent that analyzes a problem, takes an action, observes results, and iterates
   - Edge cases: Handles situations where actions don't produce expected outcomes
   \`\`\`python
   async def react_pattern(query):
       context = []
       for step in range(max_steps):
           # Reason about the current state
           reasoning = await llm.complete(f"Reason about: {query}, context: {context}")
           # Determine action
           action = determine_next_action(reasoning)
           # Execute action and observe
           observation = await execute_action(action)
           context.append(observation)
   \`\`\`

2. **Reflexion Pattern**: Enables self-critique to improve responses
   - Process: Generate response → Evaluate → Refine → Repeat
   - Edge cases: Includes mechanisms to break infinite improvement loops
   \`\`\`python
   async def reflexion_pattern(query):
       response = await llm.complete(query)
       for iteration in range(max_iterations):
           evaluation = await llm.complete(f"Evaluate: {response}")
           if evaluation.score > threshold:
               break
           response = await llm.complete(f"Improve based on: {evaluation}")
   \`\`\`

3. **Plan-Execute Pattern**: Creates a plan before executing actions
   - Useful for: Complex multi-step tasks requiring coordination
   \`\`\`python
   async def plan_execute_pattern(query):
       plan = await llm.complete(f"Create a plan for: {query}")
       steps = parse_steps(plan)
       results = []
       for step in steps:
           result = await execute_step(step)
           results.append(result)
   \`\`\`

## Implementation in Azure AI
Azure provides several services to implement these patterns:
- Azure OpenAI Service: Provides the foundation models
- Azure AI SDK: Offers tools for agent development
- Azure Cognitive Services: Extends agent capabilities

## Practical Examples
When building a research agent in Azure, you might use the ReAct pattern to:
1. Parse a research question
2. Search for relevant papers (action)
3. Analyze results (reasoning)
4. Refine the search (action)
5. Synthesize findings (reasoning)

## Next Steps
To implement these patterns in your project:
1. Identify which pattern best suits your use case
2. Set up the appropriate Azure services
3. Use the Azure AI SDK to implement the pattern
4. Test with various inputs to ensure robust performance

For more advanced scenarios, consider combining multiple patterns or creating hybrid approaches tailored to your specific requirements."""
                
                responses.append(optimized_response)
            
            return {
                "status": "success",
                "iterations": iterations,
                "evaluations": evaluations,
                "responses": responses,
                "final_response": responses[-1],
                "final_score": overall_score
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}`,

  'plan-execute': `# Plan Execute pattern implementation
import openai
import json
from typing import Dict, List, Any, Optional, Union

class PlanExecuteAgent:
    def __init__(self, client, model: str = "gpt-4"):
        self.client = client
        self.model = model
        
    async def execute(self, query: str) -> Dict[str, Any]:
        """Execute the Plan-Execute agent pattern to solve complex problems."""
        try:
            # Available tools
            tools = {
                "search": lambda query: {
                    "results": f"Search results for '{query}'",
                    "sources": ["https://example.com/1", "https://example.com/2"]
                },
                "calculator": lambda expr: {"result": eval(expr)},
                "weather": lambda location: {
                    "temperature": 72,
                    "condition": "sunny",
                    "location": location
                },
                "translator": lambda text_and_lang: {
                    "translation": f"Translated '{text_and_lang['text']}' to {text_and_lang['target_lang']}"
                }
            }
            
            # Step 1: Planning phase - create detailed plan
            planning_prompt = f"""You are a planning agent. Create a detailed step-by-step plan to solve this problem:

Problem: {query}

Available tools:
- search: Search for information online
- calculator: Perform mathematical calculations
- weather: Get weather information for a location
- translator: Translate text to another language

Your plan should include:
1. A breakdown of the problem into sequential steps
2. Which tools to use for each step
3. What information to pass between steps
4. Success criteria for each step

Format your response as a JSON object with steps as an array.
"""
            # Simulate LLM call for planning
            plan = {
                "goal": "Create a budget-friendly one-week travel itinerary for Paris",
                "steps": [
                    {
                        "step_id": 1,
                        "description": "Search for budget accommodation options in Paris",
                        "tool": "search",
                        "input": "budget hostels hotels Paris city center",
                        "success_criteria": "At least 3 accommodation options with prices"
                    },
                    {
                        "step_id": 2,
                        "description": "Check weather forecast for Paris next week",
                        "tool": "weather",
                        "input": "Paris, France",
                        "success_criteria": "Get temperature and conditions"
                    },
                    {
                        "step_id": 3,
                        "description": "Search for free or low-cost attractions in Paris",
                        "tool": "search",
                        "input": "free attractions museums Paris",
                        "success_criteria": "List of at least 5 attractions with details"
                    },
                    {
                        "step_id": 4,
                        "description": "Calculate daily budget for food and transportation",
                        "tool": "calculator",
                        "input": "(50*7) + (20*7)",
                        "success_criteria": "Total budget for food and transport"
                    },
                    {
                        "step_id": 5,
                        "description": "Learn basic French phrases for travelers",
                        "tool": "translator",
                        "input": {"text": "Hello, thank you, please, where is the museum?", "target_lang": "French"},
                        "success_criteria": "Basic conversational phrases in French"
                    }
                ]
            }
            
            # Step 2: Execution phase - execute each step
            results = []
            
            for step in plan["steps"]:
                # Get the appropriate tool
                tool_name = step["tool"]
                tool_input = step["input"]
                
                if tool_name in tools:
                    try:
                        # Execute the tool
                        result = tools[tool_name](tool_input)
                        
                        step_result = {
                            "step_id": step["step_id"],
                            "description": step["description"],
                            "status": "success",
                            "result": result
                        }
                    except Exception as e:
                        step_result = {
                            "step_id": step["step_id"],
                            "description": step["description"],
                            "status": "failed",
                            "error": str(e)
                        }
                else:
                    step_result = {
                        "step_id": step["step_id"],
                        "description": step["description"],
                        "status": "failed",
                        "error": f"Tool '{tool_name}' not found"
                    }
                
                results.append(step_result)
            
            # Step 3: Synthesis phase - combine results into final response
            synthesis_prompt = f"""Synthesize the results of the executed plan into a coherent response:

Original query: {query}

Plan: {json.dumps(plan, indent=2)}

Results: {json.dumps(results, indent=2)}

Create a comprehensive response that addresses the original query using these results.
"""
            # Simulate LLM call for synthesis
            synthesis = """# Budget-Friendly Paris Itinerary

## Accommodation
Based on our search, here are three budget-friendly options:
- Le Village Hostel: €25/night in Montmartre
- Generator Paris: €30/night near Canal St-Martin
- Ibis Budget Paris La Villette: €55/night

## Weather Forecast
Paris will be mostly sunny with temperatures around 72°F (22°C), perfect for sightseeing!

## Free/Low-Cost Attractions
1. **Notre-Dame Cathedral** (exterior only due to renovation)
2. **Sacré-Cœur Basilica** - Free entry with panoramic city views
3. **Luxembourg Gardens** - Beautiful public park
4. **Père Lachaise Cemetery** - Historic resting place of famous figures
5. **Centre Pompidou** - Free on first Sunday of month
6. **Free museums on first Sunday of each month**

## Budget Calculation
Weekly budget for essentials:
- Food: €50 × 7 days = €350
- Transport: €20 × 7 days = €140
- Total: €490 for food and transportation

## Useful French Phrases
- "Bonjour" - Hello
- "Merci" - Thank you
- "S'il vous plaît" - Please
- "Où est le musée?" - Where is the museum?

## Daily Itinerary Suggestion
- **Day 1**: Explore Montmartre and Sacré-Cœur
- **Day 2**: Visit the Louvre (free on Friday evenings for under-26s)
- **Day 3**: Walk along Seine and visit Notre-Dame exterior
- **Day 4**: Explore the Latin Quarter and Luxembourg Gardens
- **Day 5**: Visit Centre Pompidou and Le Marais district
- **Day 6**: Day trip to Versailles gardens (grounds are free)
- **Day 7**: Explore local markets and Père Lachaise Cemetery

This itinerary gives you a mix of iconic landmarks and local experiences while keeping costs low."""
            
            return {
                "status": "success",
                "plan": plan,
                "execution_results": results,
                "final_response": synthesis
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}`,
};