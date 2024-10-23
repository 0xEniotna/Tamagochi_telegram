import type { ArgentTMA } from '@argent/tma-wallet';
import { type Contract, type AccountInterface, constants, RPC, num } from 'starknet';

export async function executeTransaction(
  method: string,
  params: any[],
  contract: Contract,
  account: AccountInterface,
  argentTMA: ArgentTMA
) {
  try {
    console.log('Executing transaction:', { method, params });

    const call = contract.populate(method, params);
    const maxQtyGasAuthorized = 1800n;
    const maxPriceAuthorizeForOneGas = 12n * 10n ** 9n;

    console.log('Call populated:', call);

    const { transaction_hash } = await account.execute(call, {
      version: constants.TRANSACTION_VERSION.V3,
      maxFee: 10n ** 15n,
      feeDataAvailabilityMode: RPC.EDataAvailabilityMode.L1,
      tip: 10n ** 13n,
      paymasterData: [],
      resourceBounds: {
        l1_gas: {
          max_amount: num.toHex(maxQtyGasAuthorized),
          max_price_per_unit: num.toHex(maxPriceAuthorizeForOneGas),
        },
        l2_gas: {
          max_amount: num.toHex(0n),
          max_price_per_unit: num.toHex(0n),
        },
      },
    });

    console.log('Transaction hash:', transaction_hash);

    const receipt = await argentTMA.provider.waitForTransaction(transaction_hash);
    console.log('Transaction receipt:', receipt);

    return receipt;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}
