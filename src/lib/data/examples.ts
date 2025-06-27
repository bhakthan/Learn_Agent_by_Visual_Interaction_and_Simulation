export interface Example {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  code: string;
  explanation: string;
}

export const examples: Example[] = [
  {
    id: "chat-completion-basic",
    title: "Basic Chat Completion",
    description: "Create a simple chat completion using the OpenAI API",
    categoryId: "prompt-engineering",
    difficulty: "beginner",
    tags: ["chat", "gpt-4", "basic"],
    code: `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function createChatCompletion() {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello! Can you explain what an LLM is?' }
    ],
  });

  console.log(completion.choices[0].message.content);
}

createChatCompletion();`,
    explanation: "This example demonstrates the most basic usage of the OpenAI API to generate a chat completion. It initializes the OpenAI client with your API key, then sends a request to the chat completions endpoint with a system message defining the assistant's behavior and a user message containing the query. The response is then logged to the console."
  },
  {
    id: "function-calling-weather",
    title: "Function Calling for Weather Data",
    description: "Use function calling to retrieve weather information",
    categoryId: "function-calling",
    difficulty: "intermediate",
    tags: ["function-calling", "tools", "api-integration"],
    code: `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Mock weather API for the example
async function getWeather(location) {
  // In a real application, you would call a weather API here
  const weatherData = {
    'New York': { temp: 72, condition: 'Sunny' },
    'London': { temp: 65, condition: 'Cloudy' },
    'Tokyo': { temp: 80, condition: 'Clear' }
  };
  
  return weatherData[location] || { temp: 70, condition: 'Unknown' };
}

async function runConversation() {
  const messages = [
    { role: 'user', content: "What's the weather like in New York?" }
  ];
  
  const tools = [
    {
      type: "function",
      function: {
        name: "getWeather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
          },
          required: ["location"],
        },
      }
    }
  ];

  // Step 1: Send the conversation and available functions to the model
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages,
    tools: tools,
    tool_choice: "auto",
  });
  
  const responseMessage = response.choices[0].message;
  
  // Step 2: Check if the model wants to call a function
  if (responseMessage.tool_calls) {
    // Step 3: Call the function
    const toolCalls = responseMessage.tool_calls;
    
    // Append the assistant's response to the messages
    messages.push(responseMessage);
    
    // Process each tool call
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      
      let functionResponse;
      
      // Call the function based on the name
      if (functionName === 'getWeather') {
        functionResponse = await getWeather(functionArgs.location);
      }
      
      // Append the function response to the messages
      messages.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: functionName,
        content: JSON.stringify(functionResponse),
      });
    }
    
    // Step 4: Get a new response from the model with the function response
    const secondResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
    });
    
    return secondResponse.choices[0].message.content;
  }
  
  return responseMessage.content;
}

// Run the conversation
runConversation().then(console.log)
  .catch(console.error);`,
    explanation: "This example shows how to use OpenAI's function calling feature to retrieve weather information. The model analyzes the user's request, determines that it needs weather data, and calls the appropriate function with the location parameter. The function results are then sent back to the model to generate a final human-friendly response. In a real application, you would replace the mock weather function with an actual API call."
  },
  {
    id: "rag-basic",
    title: "Basic RAG Implementation",
    description: "Implement a simple retrieval-augmented generation system",
    categoryId: "rag",
    difficulty: "intermediate",
    tags: ["rag", "embeddings", "vector-search"],
    code: `import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function queryDocuments(query) {
  // Step 1: Generate an embedding for the query
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  
  const embedding = embeddingResponse.data[0].embedding;
  
  // Step 2: Query Supabase for similar documents
  const { data: documents } = await supabase
    .rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.75,
      match_count: 3
    });
  
  return documents;
}

async function answerWithRAG(query) {
  // Retrieve relevant documents
  const docs = await queryDocuments(query);
  
  // Compile the context from retrieved documents
  const context = docs.map(doc => doc.content).join('\\n\\n');
  
  // Generate a response using the retrieved context
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant. Answer the question based on the provided context. If the answer is not in the context, say you don't know."
      },
      {
        role: "user",
        content: \`Context: \${context}\n\nQuestion: \${query}\`
      }
    ]
  });
  
  return {
    answer: response.choices[0].message.content,
    sources: docs.map(doc => doc.title)
  };
}

// Example usage
answerWithRAG("What are the key features of OpenAI's GPT-4?")
  .then(result => {
    console.log("Answer:", result.answer);
    console.log("Sources:", result.sources);
  })
  .catch(console.error);`,
    explanation: "This example demonstrates a basic RAG (Retrieval Augmented Generation) implementation. It first converts a user query into a vector embedding, then uses this embedding to find similar documents in a Supabase vector store. The retrieved documents are provided as context to the language model, allowing it to generate more accurate and grounded responses. This approach helps reduce hallucinations and enables the model to access specific information that may not be in its training data."
  },
  {
    id: "assistant-api-basic",
    title: "Creating and Using an Assistant",
    description: "Build a basic assistant with the OpenAI Assistants API",
    categoryId: "assistants",
    difficulty: "beginner",
    tags: ["assistants", "threads", "messages"],
    code: `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function createResearchAssistant() {
  // Step 1: Create an assistant
  const assistant = await openai.beta.assistants.create({
    name: "Research Assistant",
    instructions: "You are a research assistant that helps users find information on various topics. Provide concise, factual responses with relevant details.",
    model: "gpt-4o",
  });
  console.log(\`Created assistant: \${assistant.id}\`);
  
  // Step 2: Create a thread
  const thread = await openai.beta.threads.create();
  console.log(\`Created thread: \${thread.id}\`);
  
  // Step 3: Add a message to the thread
  await openai.beta.threads.messages.create(
    thread.id,
    {
      role: "user",
      content: "Can you provide a summary of recent developments in quantum computing?"
    }
  );
  
  // Step 4: Run the assistant
  const run = await openai.beta.threads.runs.create(
    thread.id,
    {
      assistant_id: assistant.id
    }
  );
  
  // Step 5: Wait for the run to complete
  let runStatus = await openai.beta.threads.runs.retrieve(
    thread.id,
    run.id
  );
  
  while (runStatus.status !== "completed") {
    await new Promise(resolve => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(
      thread.id,
      run.id
    );
    console.log(\`Run status: \${runStatus.status}\`);
  }
  
  // Step 6: Retrieve the messages
  const messages = await openai.beta.threads.messages.list(
    thread.id
  );
  
  // Return the assistant's response
  return messages.data
    .filter(message => message.role === "assistant")
    .map(message => message.content)
    .flat();
}

createResearchAssistant()
  .then(response => {
    console.log("Assistant response:", response);
  })
  .catch(console.error);`,
    explanation: "This example demonstrates how to create and use an assistant with the OpenAI Assistants API. It creates a research assistant, starts a thread, adds a user message, runs the assistant, and retrieves the response. In a real application, you would typically save the assistant and thread IDs for reuse rather than creating new ones each time. The Assistants API is ideal for building stateful applications where conversation history and context need to be maintained."
  },
  {
    id: "embeddings-semantic-search",
    title: "Semantic Search with Embeddings",
    description: "Implement semantic search using text embeddings",
    categoryId: "embeddings",
    difficulty: "intermediate",
    tags: ["embeddings", "vector-search", "semantic-search"],
    code: `import OpenAI from 'openai';
import { similarity } from 'ml-distance';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Sample document collection
const documents = [
  { id: 1, title: "Introduction to Machine Learning", content: "Machine learning is a branch of AI focused on building systems that learn from data" },
  { id: 2, title: "Deep Learning Fundamentals", content: "Deep learning uses neural networks with many layers to model complex patterns" },
  { id: 3, title: "Natural Language Processing", content: "NLP enables computers to understand and generate human language" },
  { id: 4, title: "Computer Vision", content: "Computer vision allows machines to interpret and make decisions based on visual data" },
  { id: 5, title: "Reinforcement Learning", content: "Reinforcement learning trains agents to make decisions by rewarding desired behaviors" }
];

async function createEmbeddings(texts) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts
  });
  
  return response.data.map(item => item.embedding);
}

async function semanticSearch(query, topK = 2) {
  // Get embeddings for all documents
  const documentTexts = documents.map(doc => doc.content);
  const documentEmbeddings = await createEmbeddings(documentTexts);
  
  // Get embedding for the query
  const queryEmbeddingResponse = await createEmbeddings([query]);
  const queryEmbedding = queryEmbeddingResponse[0];
  
  // Calculate similarity between query and each document
  const similarities = documentEmbeddings.map(docEmbedding => 
    similarity.cosine(queryEmbedding, docEmbedding)
  );
  
  // Create document-similarity pairs
  const docSimilarities = documents.map((doc, i) => ({
    document: doc,
    score: similarities[i]
  }));
  
  // Sort by similarity (highest first) and take top K results
  return docSimilarities
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// Example usage
semanticSearch("How do computers understand language?")
  .then(results => {
    console.log("Search results:");
    results.forEach(result => {
      console.log(\`[\${result.score.toFixed(3)}] \${result.document.title}: \${result.document.content}\`);
    });
  })
  .catch(console.error);`,
    explanation: "This example demonstrates how to implement semantic search using OpenAI's text embeddings. The code converts both documents and the search query into vector embeddings, then uses cosine similarity to find the most semantically related documents. Unlike keyword-based search, semantic search can find relevant results even when the exact keywords aren't present, focusing on conceptual similarity rather than lexical matching."
  }
];

export function getExamplesByCategory(categoryId: string): Example[] {
  return examples.filter(example => example.categoryId === categoryId);
}

export function getExampleById(id: string): Example | undefined {
  return examples.find(example => example.id === id);
}

export function getAllExamples(): Example[] {
  return examples;
}