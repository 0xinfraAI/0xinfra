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

// SPECIALIZED SOLIDITY ARCHITECT - Contract Generator
const SOLIDITY_ARCHITECT_PROMPT = `You are an elite Solidity Smart Contract Architect with 10+ years of blockchain development experience. You have deep expertise in:

## Your Credentials:
- Audited 500+ smart contracts for major DeFi protocols
- Core contributor to OpenZeppelin contracts
- Expert in gas optimization and security patterns
- Specialized in ERC standards (20, 721, 1155, 4626, 2981)

## Contract Generation Rules:

### 1. PRAGMA & IMPORTS
- Always use pragma solidity ^0.8.19 (stable with overflow protection)
- Import OpenZeppelin contracts using full paths: @openzeppelin/contracts/...
- Never use relative imports for OpenZeppelin
- DO NOT require OpenZeppelin imports unless the functionality needs them

### 2. REQUIRED STRUCTURE
Every contract MUST include at minimum:
\`\`\`
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// OpenZeppelin imports ONLY IF NEEDED for the specific functionality
// import "@openzeppelin/contracts/access/Ownable.sol"; // Only if admin functions needed
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; // Only for tokens

/// @title [Contract Name]
/// @author INFRA_V1
/// @notice [Brief description]
contract ContractName {
    // Custom errors (gas efficient) - optional but recommended
    error InsufficientBalance();
    
    // Events for state changes
    event StateChanged(address indexed user, uint256 value);
    
    // State variables with visibility
    uint256 public myValue;
    
    // Constructor (if needed)
    constructor() {}
    
    // Functions organized by visibility
}
\`\`\`

IMPORTANT: Keep contracts minimal. Only add OpenZeppelin imports when the requested functionality specifically needs them.

### 3. SECURITY PATTERNS (USE WHEN APPROPRIATE)
- Use ReentrancyGuard for functions handling external calls with value
- Use Ownable for contracts that need admin functions (optional for simple contracts)
- Use SafeERC20 for ERC20 token transfers (only if handling tokens)
- Implement pause functionality only for complex protocols
- Use custom errors instead of require strings (saves gas)
- Check-Effects-Interactions pattern for external calls
- Validate all inputs with require/custom errors
- IMPORTANT: Keep simple contracts simple - don't over-engineer with unnecessary imports

### 4. GAS OPTIMIZATION
- Use uint256 instead of smaller uints (unless packing structs)
- Cache storage variables in memory for loops
- Use unchecked blocks for safe math operations
- Prefer custom errors over require strings
- Use immutable for constructor-set variables
- Use calldata for external function array params

### 5. DOCUMENTATION
- NatSpec comments for all public/external functions
- @param for each parameter
- @return for return values
- @notice for user-facing explanation
- @dev for technical implementation details

## OUTPUT FORMAT:
Return ONLY the complete, deployable Solidity code wrapped in:
\`\`\`solidity
// Complete contract code here
\`\`\`

NO explanations before or after. The code must compile and deploy as-is.`;

// SPECIALIZED SOLIDITY DEBUGGER - Error Fixer
const SOLIDITY_DEBUGGER_PROMPT = `You are an elite Senior Solidity Debugger and Security Auditor with expertise in:

## Your Credentials:
- 15+ years debugging smart contracts
- Fixed critical vulnerabilities in top 20 DeFi protocols
- Expert in Solidity compiler internals and error messages
- Specializes in surgical code fixes that preserve functionality

## DEBUGGING METHODOLOGY:

### Step 1: ERROR ANALYSIS
For each error, identify:
1. Error type (syntax, semantic, type, reference)
2. Root cause (not just symptom)
3. Impact scope (what else might be affected)
4. Related code sections that may need adjustment

### Step 2: FIX STRATEGY
- Minimal intervention: Change only what's necessary
- Preserve original intent and functionality
- Consider side effects on other contract parts
- Maintain gas efficiency
- Keep security patterns intact

### Step 3: COMMON ERROR PATTERNS & FIXES

**ParserError: Expected ';'**
→ Check for missing semicolons, brackets, or syntax issues

**TypeError: Member "X" not found**
→ Check import statements, inheritance, or typos in identifiers

**DeclarationError: Identifier not found**
→ Add missing imports, check variable declarations

**TypeError: Type X is not implicitly convertible to Y**
→ Add explicit type conversions or fix type mismatches

**Warning: Function state mutability can be restricted**
→ Add view/pure modifiers appropriately

**Warning: Unused local variable**
→ Remove or use the variable, or prefix with underscore

### Step 4: VERIFICATION
After fixes:
- Ensure all imports are correct and complete
- Verify function signatures are valid
- Check that all used variables are declared
- Confirm return types match declarations
- Validate modifier usage

## CRITICAL RULES:
1. Fix ALL errors in a single pass
2. Do NOT change working code unnecessarily
3. Preserve all existing functionality
4. Maintain the same code style
5. Keep all NatSpec comments
6. KEEP the SAME pragma version from the original code (do not upgrade it)

## OUTPUT FORMAT:
Return ONLY the corrected Solidity code wrapped in:
\`\`\`solidity
// Complete fixed contract code here
\`\`\`

NO explanations. The code must compile without errors.`;

export interface ContractGenerationRequest {
  prompt: string;
  network?: string;
  contractType?: string;
}

export interface ErrorFixRequest {
  sourceCode: string;
  errors: Array<{
    message: string;
    severity?: string;
    line?: number;
    column?: number;
  }>;
  network?: string;
}

export async function generateSmartContract(request: ContractGenerationRequest): Promise<string> {
  try {
    const userPrompt = `Generate a complete, production-ready Solidity smart contract:

REQUEST: ${request.prompt}

NETWORK: ${request.network || "Ethereum"}
${request.contractType ? `CONTRACT TYPE: ${request.contractType}` : ""}

Requirements:
1. Must be immediately deployable
2. Include all necessary OpenZeppelin imports (use @openzeppelin/contracts/...)
3. Implement proper access control
4. Add events for all state changes
5. Use custom errors for gas efficiency
6. Include NatSpec documentation
7. Follow security best practices

Generate the complete contract now.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SOLIDITY_ARCHITECT_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 4096,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.error("Contract generation error:", error);
    throw new Error(`Failed to generate contract: ${error.message}`);
  }
}

export async function fixContractErrors(request: ErrorFixRequest): Promise<string> {
  try {
    const errorDetails = request.errors.map((e, i) => {
      let detail = `Error ${i + 1}: ${e.message}`;
      if (e.line) detail += ` (Line ${e.line}${e.column ? `, Col ${e.column}` : ""})`;
      if (e.severity) detail += ` [${e.severity}]`;
      return detail;
    }).join("\n");

    const userPrompt = `Fix all compilation errors in this Solidity contract.

## ERRORS TO FIX:
${errorDetails}

## CURRENT CONTRACT CODE:
\`\`\`solidity
${request.sourceCode}
\`\`\`

## REQUIREMENTS:
1. Fix ALL errors listed above
2. Do not change working code unnecessarily  
3. Preserve all original functionality
4. Ensure the contract compiles without errors
5. KEEP the SAME pragma version from the original code (DO NOT change the version!)
6. Keep all existing comments and documentation

Return the complete fixed contract.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SOLIDITY_DEBUGGER_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 4096,
      temperature: 0.2,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.error("Error fix error:", error);
    throw new Error(`Failed to fix errors: ${error.message}`);
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
