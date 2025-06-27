export const pythonPatterns = {
  'react-agent': `
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
            final_answer = ""
            
            # Add initial query to context
            context_history.append(f"User query: {query}")
            
            # Available tools
            tools = {
                "search": self._search_tool,
                "calculate": self._calculate_tool,
                "lookup": self._lookup_tool
            }
            
            while not done and current_cycle < max_cycles:
                current_cycle += 1
                
                # Step 1: Reasoning phase
                print(f"Cycle {current_cycle}: Reasoning...")
                
                reasoning_prompt = """
                You are a ReAct agent that solves problems through cycles of reasoning and action.
                
                Task: """ + query + """
                
                Previous steps:
                """ + "\\n".join(context_history) + """
                
                Think step by step about the problem. Either:
                1. Use a tool to gather more information by responding with:
                   Thought: <your reasoning>
                   Action: <tool_name>
                   Action Input: <tool input>
                   
                2. Or provide the final answer if you have enough information:
                   Thought: <your reasoning>
                   Final Answer: <your answer>
                """
                
                reasoning_response = await self._llm_call(reasoning_prompt)
                context_history.append(reasoning_response)
                
                # Parse the reasoning response
                if "Final Answer:" in reasoning_response:
                    # Extract the final answer
                    answer_parts = reasoning_response.split("Final Answer:")
                    if len(answer_parts) > 1:
                        final_answer = answer_parts[1].strip()
                        done = True
                else:
                    # Extract tool call
                    action_match = None
                    action_input_match = None
                    
                    for line in reasoning_response.split('\\n'):
                        if line.startswith("Action:"):
                            action_match = line.replace("Action:", "").strip()
                        elif line.startswith("Action Input:"):
                            action_input_match = line.replace("Action Input:", "").strip()
                    
                    if action_match and action_input_match:
                        tool_name = action_match
                        tool_input = action_input_match
                        
                        # Step 2: Action phase - call the appropriate tool
                        print(f'Cycle {current_cycle}: Taking action with tool "{tool_name}"...')
                        
                        if tool_name in tools:
                            tool_result = await tools[tool_name](tool_input)
                            context_history.append(f"Observation: {tool_result}")
                        else:
                            context_history.append(f'Observation: Error - Tool "{tool_name}" not found.')
            
            return {
                "status": "success" if done else "max_cycles_reached",
                "cycles": current_cycle,
                "result": final_answer if final_answer else "No final answer reached.",
                "history": context_history
            }
            
        except Exception as error:
            return {"status": "failed", "reason": str(error)}
    
    async def _llm_call(self, prompt: str) -> str:
        """Call the LLM with the given prompt."""
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    
    async def _search_tool(self, query: str) -> str:
        """Simulate web search results."""
        return f'Search results for "{query}": [simulated search results]'
    
    async def _calculate_tool(self, expression: str) -> str:
        """Calculate mathematical expressions."""
        try:
            result = eval(expression)
            return "Calculation result: " + str(result)
        except Exception as error:
            return "Error in calculation: " + str(error)
    
    async def _lookup_tool(self, entity: str) -> str:
        """Look up information about an entity."""
        return f"Information about {entity}: [simulated encyclopedia entry]"

# Example usage
async def main():
    client = openai.AsyncOpenAI()  # Initialize with your API key
    agent = ReActAgent(client)
    result = await agent.execute("What is the capital of France and what is its population?")
    print(json.dumps(result, indent=2))
`,

  'codeact-agent': `
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
            final_result = ""
            
            # Add the initial query to context
            context_history.append(f"User query: {query}")
            
            while not done and current_cycle < max_cycles:
                current_cycle += 1
                
                # Generate agent response
                agent_prompt = """
                You are a CodeAct agent that solves problems by writing and executing Python code.
                
                Task: """ + query + """
                
                Previous interactions:
                """ + "\\n\\n".join(context_history) + """
                
                Based on the current state, either:
                
                1. Write Python code to make progress, formatted as:
                   Thought: <your reasoning>
                   Code:
                   ``
                   # Your Python code here
                   ``
                
                2. Or provide the final answer if you've solved the problem:
                   Thought: <your reasoning>
                   Final Answer: <your answer>
                """
                
                agent_response = await self._llm_call(agent_prompt)
                context_history.append(f"Agent: {agent_response}")
                
                # Check if the response contains a final answer
                if "Final Answer:" in agent_response:
                    match = re.search(r"Final Answer:(.*?)$", agent_response, re.DOTALL)
                    if match:
                        final_result = match.group(1).strip()
                        done = True
                
                # Check if the response contains code
                elif "``" in agent_response:
                    # Extract code block
                    match = re.search(r"``(?:python)?\\s*([\\s\\S]*?)\\s*``", agent_response)
                    if match:
                        code = match.group(1).strip()
                        
                        # Execute the code (simulated in this example)
                        execution_result = await self._execute_code(code)
                        
                        # Add the observation to the history
                        context_history.append(f"Observation: {execution_result}")
            
            return {
                "status": "success" if done else "max_cycles_reached",
                "cycles": current_cycle,
                "result": final_result or "No final result reached.",
                "history": context_history
            }
            
        except Exception as error:
            return {"status": "failed", "reason": str(error)}
    
    async def _llm_call(self, prompt: str) -> str:
        """Call the LLM with the given prompt."""
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    
    async def _execute_code(self, code: str) -> str:
        """Simulate Python code execution."""
        print("Executing Python code (simulated):")
        print(code)
        
        # This is a simulation - in a real implementation, this would execute Python code
        # and return the results. For this example, we'll return a simulated result.
        
        if 'import' in code:
            if 'numpy' in code or 'pandas' in code:
                return "Library imported successfully."
        
        if 'print(' in code:
            match = re.search(r"print\(([^)]+)\)", code)
            if match:
                return f"Output: {match.group(1)}"
        
        if 'def ' in code:
            return "Function defined successfully."
        
        # Default simulated response
        return "Code executed. Result: [simulated output based on the provided code]"

# Example usage
async def main():
    client = openai.AsyncOpenAI()  # Initialize with your API key
    agent = CodeActAgent(client)
    result = await agent.execute("Calculate the factorial of 5")
    print(json.dumps(result, indent=2))
`,
};