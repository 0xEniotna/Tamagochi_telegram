import { ArgentTMA, type SessionAccountInterface } from '@argent/tma-wallet';
import {
  executeCalls,
  fetchExecuteTransaction,
  fetchGasTokenPrices,
  SEPOLIA_BASE_URL,
  fetchBuildTypedData,
} from '@avnu/gasless-sdk';
import { Account, AccountInterface, num, RPC, type Call, type Contract } from 'starknet';
import toast from 'svelte-french-toast';

export const SESSION_PARAMS = (contractAddress: string) => ({
  allowedMethods: [
    { contract: contractAddress, selector: 'feed' },
    { contract: contractAddress, selector: 'play' },
    { contract: contractAddress, selector: 'rest' },
    { contract: contractAddress, selector: 'test_set_stats_to_half' },
  ],
  validityDays: 90,
});

export const initWallet = (contractAddress: string) =>
  ArgentTMA.init({
    environment: 'sepolia',
    appName: import.meta.env.VITE_TELEGRAM_APP_NAME,
    appTelegramUrl: import.meta.env.VITE_TELEGRAM_APP_URL,
    sessionParams: SESSION_PARAMS(contractAddress),
  });

export async function executeContractAction(
  contract: Contract,
  account: SessionAccountInterface,
  argentTMA: ArgentTMA,
  action: string,
  successMessage: string,
  errorMessage: string
) {
  try {
    const myCall = contract.populate(action, []);

    const estimatedFee1 = await account.estimateInvokeFee([myCall], {
      version: 3,
    });
    const resourceBounds = {
      ...estimatedFee1.resourceBounds,
      l1_gas: {
        ...estimatedFee1.resourceBounds.l1_gas,
        max_amount: num.toHex(
          BigInt(parseInt(estimatedFee1.resourceBounds.l1_gas.max_amount, 16) * 2) // Double the estimated amount
        ),
      },
    };
    const { transaction_hash } = await account.execute(myCall, {
      version: 3,
      maxFee: estimatedFee1.suggestedMaxFee,
      feeDataAvailabilityMode: RPC.EDataAvailabilityMode.L1,
      resourceBounds: resourceBounds,
    });

    console.log('transaction_hash', transaction_hash);
    let receipt = await argentTMA.provider.waitForTransaction(transaction_hash);
    console.log('receipt', receipt);
    toast.success(successMessage);
    return true;
  } catch (error) {
    console.error(`Error performing ${action}:`, error);
    toast.error(errorMessage);
    return false;
  }
}
