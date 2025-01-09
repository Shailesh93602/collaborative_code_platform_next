import { toast } from '@/hooks/useToast';

export enum BlockchainErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  CONTRACT_INTERACTION_ERROR = 'CONTRACT_INTERACTION_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  USER_REJECTED = 'USER_REJECTED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface BlockchainError {
  type: BlockchainErrorType;
  message: string;
  details?: any;
}

export function handleBlockchainError(error: BlockchainError): void {
  console.error('Blockchain error:', error);

  let title: string;
  let description: string;

  switch (error.type) {
    case BlockchainErrorType.CONNECTION_ERROR:
      title = 'Connection Error';
      description =
        'Failed to connect to the blockchain network. Please check your internet connection and try again.';
      break;
    case BlockchainErrorType.TRANSACTION_FAILED:
      title = 'Transaction Failed';
      description =
        'The blockchain transaction failed to complete. Please try again or contact support if the issue persists.';
      break;
    case BlockchainErrorType.CONTRACT_INTERACTION_ERROR:
      title = 'Contract Interaction Error';
      description =
        'An error occurred while interacting with the smart contract. Please try again or contact support.';
      break;
    case BlockchainErrorType.INSUFFICIENT_FUNDS:
      title = 'Insufficient Funds';
      description =
        'You do not have enough funds to complete this transaction. Please add funds to your wallet and try again.';
      break;
    case BlockchainErrorType.USER_REJECTED:
      title = 'Transaction Rejected';
      description =
        'You have rejected the transaction. If this was unintentional, please try again.';
      break;
    case BlockchainErrorType.UNKNOWN_ERROR:
    default:
      title = 'Unknown Error';
      description =
        'An unexpected error occurred. Please try again or contact support if the issue persists.';
  }

  toast({
    title,
    description,
    variant: 'destructive',
  });
}

export function wrapBlockchainOperation<T>(
  operation: () => Promise<T>,
  errorType: BlockchainErrorType
): Promise<T> {
  return operation().catch((error: any) => {
    const blockchainError: BlockchainError = {
      type: errorType,
      message: error.message || 'An error occurred during the blockchain operation',
      details: error,
    };
    handleBlockchainError(blockchainError);
    throw error;
  });
}
