import OpenAI from "openai";
import { getAllNetworks } from "./networks";

// Using Replit's AI Integrations service - provides OpenAI-compatible API access
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are INFRA_V1 Copilot, an expert AI assistant for blockchain developers using the INFRA_V1 RPC infrastructure platform.

## Your Expertise:
- Blockchain RPC connections (Ethereum, Polygon, Arbitrum, Optimism, Base, BSC, Solana and their testnets)
- EVM development with ethers.js, web3.js, viem, and other libraries
- Solana development with @solana/web3.js library
- Smart contract development with Solidity (ERC-20, ERC-721, ERC-1155, DeFi, governance)
- Smart contract interactions (EVM) and program interactions (Solana)
- Gas optimization and transaction management
- WebSocket subscriptions for real-time blockchain data
- Contract deployment and verification best practices

## INFRA_V1 Platform Knowledge:
- HTTP RPC endpoints: /rpc/{network}/{apiKey}
- WebSocket endpoints: /ws/{network}/{apiKey}
- Supported networks: ${getAllNetworks().map(n => n.name).join(", ")}
- EVM networks: Ethereum, Polygon, Arbitrum, Optimism, Base, BSC (and testnets)
- Non-EVM networks: Solana (mainnet and devnet)
- Authentication: API keys (prefixed with "infra_")
- Features: Low latency, high availability, request logging

## Response Guidelines:
1. Always provide working code examples when asked
2. Use the user's selected network and API key context when available
3. Explain blockchain concepts clearly but concisely
4. Suggest best practices for production deployments
5. Be direct and technical - users are developers
6. Format code with proper syntax highlighting markers
7. When generating code, use modern JavaScript/TypeScript patterns

## Code Example Format:
When providing code, wrap in proper markdown code blocks with language identifiers:
\`\`\`javascript
// Your code here
\`\`\`

Keep responses focused and actionable. If you don't know something specific about INFRA_V1, be honest and suggest checking the documentation.`;

export interface CopilotMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface CopilotContext {
  selectedNetwork?: string;
  apiKey?: string;
  mode?: "quick" | "advanced";
}

export async function generateCopilotResponse(
  messages: CopilotMessage[],
  context?: CopilotContext
): Promise<string> {
  try {
    // Build context-aware system prompt
    let systemPrompt = SYSTEM_PROMPT;
    
    if (context?.selectedNetwork) {
      systemPrompt += `\n\n## Current User Context:\n- Selected Network: ${context.selectedNetwork}`;
    }
    if (context?.apiKey) {
      systemPrompt += `\n- API Key: ${context.apiKey}`;
      systemPrompt += `\n- HTTP Endpoint: /rpc/${context.selectedNetwork || "ethereum"}/${context.apiKey}`;
      systemPrompt += `\n- WebSocket Endpoint: /ws/${context.selectedNetwork || "ethereum"}/${context.apiKey}`;
    }
    if (context?.mode) {
      systemPrompt += `\n- Setup Mode: ${context.mode === "quick" ? "Quick Start" : "Advanced Wizard"}`;
    }

    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      max_completion_tokens: 2048,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error("Copilot error:", error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

// Quick suggestions based on context
export function getQuickSuggestions(context?: CopilotContext): string[] {
  const network = context?.selectedNetwork?.toLowerCase() || "";
  const isSolana = network.includes("solana");
  const isBsc = network.includes("bsc") || network.includes("bnb");
  
  let suggestions: string[] = [];
  
  if (isSolana) {
    suggestions = [
      "How do I connect to Solana using @solana/web3.js?",
      "Show me how to get SOL balance for a wallet",
      "How do I fetch recent transactions on Solana?",
      "What's the best way to interact with Solana programs?",
    ];
  } else if (isBsc) {
    suggestions = [
      "How do I connect to BSC using ethers.js?",
      "Show me how to interact with PancakeSwap",
      "How do I get BNB token balances?",
      "What's the best way to handle BSC transactions?",
    ];
  } else {
    suggestions = [
      "How do I connect to Ethereum using ethers.js?",
      "Show me how to subscribe to new blocks via WebSocket",
      "How do I estimate gas for a transaction?",
      "What's the best way to handle RPC errors?",
    ];
  }

  if (context?.selectedNetwork) {
    const blockLabel = isSolana ? "slot" : "block";
    suggestions.unshift(`How do I get the latest ${blockLabel} on ${context.selectedNetwork}?`);
  }

  if (context?.apiKey) {
    suggestions.unshift("Generate a complete code example for my current setup");
  }

  return suggestions.slice(0, 4);
}
