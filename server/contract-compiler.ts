import solc from "solc";

export interface CompileResult {
  success: boolean;
  contracts?: {
    [contractName: string]: {
      abi: any[];
      bytecode: string;
      deployedBytecode: string;
    };
  };
  errors?: Array<{
    severity: string;
    message: string;
    formattedMessage: string;
  }>;
  warnings?: Array<{
    severity: string;
    message: string;
    formattedMessage: string;
  }>;
}

export function compileSolidity(sourceCode: string, contractFileName: string = "Contract.sol"): CompileResult {
  const input = {
    language: "Solidity",
    sources: {
      [contractFileName]: {
        content: sourceCode,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode", "evm.deployedBytecode"],
        },
      },
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  };

  try {
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    const errors: CompileResult["errors"] = [];
    const warnings: CompileResult["warnings"] = [];

    if (output.errors) {
      for (const error of output.errors) {
        if (error.severity === "error") {
          errors.push({
            severity: error.severity,
            message: error.message,
            formattedMessage: error.formattedMessage,
          });
        } else if (error.severity === "warning") {
          warnings.push({
            severity: error.severity,
            message: error.message,
            formattedMessage: error.formattedMessage,
          });
        }
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        warnings,
      };
    }

    const contracts: CompileResult["contracts"] = {};
    
    if (output.contracts && output.contracts[contractFileName]) {
      for (const [contractName, contractData] of Object.entries(output.contracts[contractFileName])) {
        const data = contractData as any;
        contracts[contractName] = {
          abi: data.abi,
          bytecode: data.evm?.bytecode?.object || "",
          deployedBytecode: data.evm?.deployedBytecode?.object || "",
        };
      }
    }

    return {
      success: true,
      contracts,
      warnings,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [
        {
          severity: "error",
          message: error.message,
          formattedMessage: `Compilation failed: ${error.message}`,
        },
      ],
    };
  }
}

export function getVerificationUrl(network: string, contractAddress: string): string | null {
  const explorerUrls: { [key: string]: string } = {
    "eth-mainnet": `https://etherscan.io/address/${contractAddress}#code`,
    "eth-sepolia": `https://sepolia.etherscan.io/address/${contractAddress}#code`,
    "polygon-mainnet": `https://polygonscan.com/address/${contractAddress}#code`,
    "arb-mainnet": `https://arbiscan.io/address/${contractAddress}#code`,
    "opt-mainnet": `https://optimistic.etherscan.io/address/${contractAddress}#code`,
    "base-mainnet": `https://basescan.org/address/${contractAddress}#code`,
    "bsc-mainnet": `https://bscscan.com/address/${contractAddress}#code`,
    "bsc-testnet": `https://testnet.bscscan.com/address/${contractAddress}#code`,
  };

  return explorerUrls[network] || null;
}

export function getExplorerTxUrl(network: string, txHash: string): string | null {
  const explorerUrls: { [key: string]: string } = {
    "eth-mainnet": `https://etherscan.io/tx/${txHash}`,
    "eth-sepolia": `https://sepolia.etherscan.io/tx/${txHash}`,
    "polygon-mainnet": `https://polygonscan.com/tx/${txHash}`,
    "arb-mainnet": `https://arbiscan.io/tx/${txHash}`,
    "opt-mainnet": `https://optimistic.etherscan.io/tx/${txHash}`,
    "base-mainnet": `https://basescan.org/tx/${txHash}`,
    "bsc-mainnet": `https://bscscan.com/tx/${txHash}`,
    "bsc-testnet": `https://testnet.bscscan.com/tx/${txHash}`,
  };

  return explorerUrls[network] || null;
}
