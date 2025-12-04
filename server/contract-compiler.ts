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
    "ethereum": `https://etherscan.io/address/${contractAddress}#code`,
    "ethereum-sepolia": `https://sepolia.etherscan.io/address/${contractAddress}#code`,
    "ethereum-goerli": `https://goerli.etherscan.io/address/${contractAddress}#code`,
    "polygon": `https://polygonscan.com/address/${contractAddress}#code`,
    "polygon-mumbai": `https://mumbai.polygonscan.com/address/${contractAddress}#code`,
    "arbitrum": `https://arbiscan.io/address/${contractAddress}#code`,
    "arbitrum-sepolia": `https://sepolia.arbiscan.io/address/${contractAddress}#code`,
    "optimism": `https://optimistic.etherscan.io/address/${contractAddress}#code`,
    "optimism-sepolia": `https://sepolia-optimism.etherscan.io/address/${contractAddress}#code`,
    "base": `https://basescan.org/address/${contractAddress}#code`,
    "base-sepolia": `https://sepolia.basescan.org/address/${contractAddress}#code`,
    "bsc": `https://bscscan.com/address/${contractAddress}#code`,
    "bsc-testnet": `https://testnet.bscscan.com/address/${contractAddress}#code`,
  };

  return explorerUrls[network] || null;
}

export function getExplorerTxUrl(network: string, txHash: string): string | null {
  const explorerUrls: { [key: string]: string } = {
    "ethereum": `https://etherscan.io/tx/${txHash}`,
    "ethereum-sepolia": `https://sepolia.etherscan.io/tx/${txHash}`,
    "ethereum-goerli": `https://goerli.etherscan.io/tx/${txHash}`,
    "polygon": `https://polygonscan.com/tx/${txHash}`,
    "polygon-mumbai": `https://mumbai.polygonscan.com/tx/${txHash}`,
    "arbitrum": `https://arbiscan.io/tx/${txHash}`,
    "arbitrum-sepolia": `https://sepolia.arbiscan.io/tx/${txHash}`,
    "optimism": `https://optimistic.etherscan.io/tx/${txHash}`,
    "optimism-sepolia": `https://sepolia-optimism.etherscan.io/tx/${txHash}`,
    "base": `https://basescan.org/tx/${txHash}`,
    "base-sepolia": `https://sepolia.basescan.org/tx/${txHash}`,
    "bsc": `https://bscscan.com/tx/${txHash}`,
    "bsc-testnet": `https://testnet.bscscan.com/tx/${txHash}`,
  };

  return explorerUrls[network] || null;
}

export function getExplorerAddressUrl(network: string, address: string): string | null {
  const explorerUrls: { [key: string]: string } = {
    "ethereum": `https://etherscan.io/address/${address}`,
    "ethereum-sepolia": `https://sepolia.etherscan.io/address/${address}`,
    "ethereum-goerli": `https://goerli.etherscan.io/address/${address}`,
    "polygon": `https://polygonscan.com/address/${address}`,
    "polygon-mumbai": `https://mumbai.polygonscan.com/address/${address}`,
    "arbitrum": `https://arbiscan.io/address/${address}`,
    "arbitrum-sepolia": `https://sepolia.arbiscan.io/address/${address}`,
    "optimism": `https://optimistic.etherscan.io/address/${address}`,
    "optimism-sepolia": `https://sepolia-optimism.etherscan.io/address/${address}`,
    "base": `https://basescan.org/address/${address}`,
    "base-sepolia": `https://sepolia.basescan.org/address/${address}`,
    "bsc": `https://bscscan.com/address/${address}`,
    "bsc-testnet": `https://testnet.bscscan.com/address/${address}`,
  };

  return explorerUrls[network] || null;
}
