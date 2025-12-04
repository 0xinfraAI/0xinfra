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
const SOLIDITY_ARCHITECT_PROMPT = `You are an elite Solidity Smart Contract Architect with 10+ years of blockchain development experience.

## CRITICAL RULE - NO EXTERNAL IMPORTS:
**NEVER use any import statements.** The browser compiler cannot resolve external dependencies.
- NO OpenZeppelin imports
- NO external library imports
- ALL code must be self-contained in a single file

## Contract Generation Rules:

### 1. PRAGMA & SELF-CONTAINED CODE
- Always use pragma solidity ^0.8.19
- Include ALL necessary interfaces inline (e.g., IERC20)
- Implement patterns manually instead of importing

### 2. INLINE INTERFACES
When you need ERC20 interaction, include this interface inline:
\`\`\`solidity
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
\`\`\`

### 3. MANUAL OWNERSHIP (instead of Ownable import)
\`\`\`solidity
address public owner;
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}
constructor() {
    owner = msg.sender;
}
\`\`\`

### 4. MANUAL REENTRANCY GUARD (instead of ReentrancyGuard import)
\`\`\`solidity
bool private locked;
modifier nonReentrant() {
    require(!locked, "Reentrant call");
    locked = true;
    _;
    locked = false;
}
\`\`\`

### 5. CONTRACT STRUCTURE
\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Inline interfaces here (NO imports!)

/// @title [Contract Name]
/// @author INFRA_V1
/// @notice [Brief description]
contract ContractName {
    // Custom errors
    error InsufficientBalance();
    
    // Events
    event Deposited(address indexed user, uint256 amount);
    
    // State variables
    address public owner;
    
    // Modifiers (inline, not imported)
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Functions
}
\`\`\`

### 6. SECURITY PATTERNS (IMPLEMENT INLINE)
- Implement reentrancy guards manually (see pattern above)
- Implement ownership manually (see pattern above)
- Use Check-Effects-Interactions pattern
- Use custom errors for gas efficiency
- Validate all inputs

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
const SOLIDITY_DEBUGGER_PROMPT = `You are an elite Senior Solidity Debugger specializing in browser-based compilation.

## CRITICAL CONSTRAINT:
**The browser compiler CANNOT resolve external imports.** You MUST replace ALL import statements with inline code.

## IMPORT ERROR FIXES:

### When you see "Source not found" or "File import callback not supported":
1. REMOVE the import statement entirely
2. ADD the interface/code inline at the top of the file

### Common Replacements:

**@openzeppelin/contracts/token/ERC20/IERC20.sol** → Add inline:
\`\`\`solidity
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
\`\`\`

**@openzeppelin/contracts/access/Ownable.sol** → Add inline:
\`\`\`solidity
// Add as state variable:
address public owner;

// Add modifier:
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}

// In constructor add:
owner = msg.sender;
\`\`\`

**@openzeppelin/contracts/security/ReentrancyGuard.sol** → Add inline:
\`\`\`solidity
// Add as state variable:
bool private _locked;

// Add modifier:
modifier nonReentrant() {
    require(!_locked, "Reentrant call");
    _locked = true;
    _;
    _locked = false;
}
\`\`\`

## OTHER ERROR PATTERNS:

**ParserError: Expected ';'**
→ Fix missing semicolons, brackets, or syntax

**TypeError: Member not found**
→ Check for typos, add missing interfaces

**DeclarationError: Identifier not found**
→ Add inline interface or fix declaration

## CRITICAL RULES:
1. REMOVE ALL import statements
2. ADD equivalent inline interfaces/code
3. Preserve original functionality
4. Keep the SAME pragma version
5. Maintain code style

## OUTPUT FORMAT:
Return ONLY the corrected Solidity code wrapped in:
\`\`\`solidity
// Complete fixed contract code here - NO IMPORTS!
\`\`\`

NO explanations. Code must compile in browser.`;

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
1. Must be immediately deployable in browser compiler
2. NO IMPORT STATEMENTS - inline all interfaces and utilities
3. Implement proper access control using inline modifiers
4. Add events for all state changes
5. Use custom errors for gas efficiency
6. Include NatSpec documentation
7. Follow security best practices with inline implementations

Generate the complete self-contained contract now.`;

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
2. REMOVE ALL import statements and replace with inline code
3. If error is "Source not found" or "File import callback not supported", add inline interfaces
4. Preserve all original functionality
5. KEEP the SAME pragma version (DO NOT change it!)
6. Keep all existing comments and documentation

Return the complete fixed contract with NO IMPORT STATEMENTS.`;

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
