import { ArgentTMA, type SessionAccountInterface } from '@argent/tma-wallet';
import { num, RPC, type Call, type Contract } from 'starknet';
import toast from 'svelte-french-toast';

export const initWallet = (contractAddress: string) =>
  ArgentTMA.init({
    environment: 'sepolia',
    appName: import.meta.env.VITE_TELEGRAM_APP_NAME,
    appTelegramUrl: import.meta.env.VITE_TELEGRAM_APP_URL,
    sessionParams: {
      allowedMethods: [
        { contract: contractAddress, selector: 'feed' },
        { contract: contractAddress, selector: 'play' },
        { contract: contractAddress, selector: 'rest' },
        { contract: contractAddress, selector: 'test_set_stats_to_half' },
      ],
      validityDays: 90,
    },
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

    const maxQtyGasAuthorized = 1800n; // max quantity of gas authorized
    const maxPriceAuthorizeForOneGas = 10n * 10n ** 14n; // max FRI authorized to pay 1 gas (1 FRI=10**-18 STRK)
    const { transaction_hash } = await account.execute(myCall, {
      version: 3,
      maxFee: 10 ** 15,
      feeDataAvailabilityMode: RPC.EDataAvailabilityMode.L1,
      resourceBounds: {
        l1_gas: {
          max_amount: num.toHex(maxQtyGasAuthorized),
          max_price_per_unit: num.toHex(maxPriceAuthorizeForOneGas),
        },
        l2_gas: {
          max_amount: num.toHex(0),
          max_price_per_unit: num.toHex(0),
        },
      },
    });
    await argentTMA.provider.waitForTransaction(transaction_hash);
    toast.success(successMessage);
    return true;
  } catch (error) {
    console.error(`Error performing ${action}:`, error);
    toast.error(errorMessage);
    return false;
  }
}
