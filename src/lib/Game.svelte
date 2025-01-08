<script lang="ts">
  import { onMount } from 'svelte';
  import Tamagochi from './Tamagochi.svelte';
  import Buttons from './Buttons.svelte';
  import TMAButton from './TMAButton.svelte';
  import { mainButton } from '@telegram-apps/sdk';
  import { Account, Contract, type AccountInterface, type Call, type DeployAccountContractPayload } from 'starknet';
  import type { SessionAccountInterface } from '@argent/tma-wallet';
  import artifact from '../utils/abi/tamago_Tamagochi.contract_class.json';
  import { executeContractAction, initWallet, SESSION_PARAMS } from './contracts';

  const ABI = artifact.abi;
  const TAMAGOTCHI_ADDRESS = import.meta.env.VITE_TAMAGOTCHI_CONTRACT_ADDRESS;

  const argentTMA = initWallet(TAMAGOTCHI_ADDRESS);

  let account: SessionAccountInterface | undefined;
  let isConnected = false;

  let isLoading = false;
  let contract: Contract | undefined;

  let stats = {
    hunger: 100,
    happiness: 100,
    energy: 100,
  };

  onMount(async () => {
    try {
      const res = await argentTMA.connect();
      if (!res) {
        isConnected = false;
        return;
      }
      account = res.account;
      
      if (account.getSessionStatus() !== 'VALID') {
        isConnected = false;
        return;
      }

      
      contract = new Contract(ABI, TAMAGOTCHI_ADDRESS, account as unknown as AccountInterface);

      isConnected = true;

      await updateStats();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  });

  async function handleConnect() {
    try {
      console.log('before');
      await argentTMA.requestConnection({
        callbackData: 'tamagochi_test',
        approvalRequests: [
          {
            tokenAddress: '0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7',
            amount: BigInt(10000000000000000).toString(),
            spender: '0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a',
          }
        ],
      });
    } catch (error) {
      console.error('Connection failed:', error);
    }
  }

  async function handleDisconnect() {
    try {
      await argentTMA.clearSession();
      // Reset all states
      account = undefined;
      isConnected = false;
      contract = undefined;
      stats = {
        hunger: 100,
        happiness: 100,
        energy: 100,
      };
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }

  async function updateStats() {
    if (!contract) return;

    const [hunger, happiness, energy] = await Promise.all([
      contract.get_hunger(),
      contract.get_happiness(),
      contract.get_energy(),
    ]);

    stats = {
      hunger: Number(hunger),
      happiness: Number(happiness),
      energy: Number(energy),
    };
  }

  async function handleAction(action: string) {
    console.log('handleAction called', {
      action,
      contract: !!contract,
      isConnected,
      account: !!account,
    });

    if (!contract || !isConnected || !account) {
      console.log('Action blocked due to:', {
        noContract: !contract,
        notConnected: !isConnected,
        noAccount: !account,
      });
      return;
    }
    isLoading = true;

    try {
      const messages = {
        feed: { success: 'Pet has been fed! 🍖', error: 'Failed to feed pet 😕' },
        play: { success: 'You played with your Pet! 🎮', error: 'Failed to play with pet 😕' },
        rest: { success: 'Pet is sleeping! 🛌', error: 'Pet is not sleeping 😕' },
        test_set_stats_to_half: {
          success: 'Stats have been reset! 🔄',
          error: 'Failed to reset stats 😕',
        },
      };

      const result = await executeContractAction(
        contract,
        account,
        argentTMA,
        action,
        messages[action as keyof typeof messages].success,
        messages[action as keyof typeof messages].error
      );

      if (result) await updateStats();
    } catch (error) {
      console.error('Error in handleAction:', error);
    } finally {
      isLoading = false;
    }
  }

  async function handleApproval() {
    try {
      argentTMA.sessionAccount?.getDeploymentPayload()
      const res = await argentTMA.requestApprovals(
        [
          {  
            tokenAddress: '0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7',
            amount: BigInt(10000000000000000).toString(),
            spender: '0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a',
          },
        ],
      );
    } catch (error) {
      console.error('Approval failed:', error);
    }
  }
  
  async function handleEFO(
  ) {
    try {
      if (!contract || !isConnected || !account) {
      console.log('Action blocked due to:', {
        noContract: !contract,
        notConnected: !isConnected,
        noAccount: !account,
      });
      return;
    }
      const call : Call = contract.populate('feed', []);
      console.log(argentTMA.sessionAccount)
      const efo =  await argentTMA.sessionAccount?.getOutsideExecutionPayload({calls: [call]});
      console.log('nonce', efo)
    } catch (error) {
      console.error('Connection failed:', error);
    }
  }
  
</script>

<div class="min-h-screen bg-gray-100 px-4 py-8">
  <div class="mx-auto max-w-md rounded-xl bg-white p-6 shadow-lg">
    <h1 class="mb-6 text-center text-2xl font-bold text-black">My Tamagotchii</h1>
    {#if !isConnected}
      <div class="flex justify-center">
        <button on:click={handleConnect}>Connect Wallet</button>
        <TMAButton text="Connect Wallet" onClick={handleConnect} color="#1A94FF" />
      </div>
    {:else}
      <TMAButton
        text={`Disconnect ${account?.address.slice(0, 6)}...${account?.address.slice(-4)}`}
        onClick={handleDisconnect}
        color="#E53935"
      />
      <Tamagochi {...stats} />

      <Buttons
        onFeed={() => handleAction('feed')}
        onPlay={() => handleAction('play')}
        onRest={() => handleAction('rest')}
        onResetStats={() => handleAction('test_set_stats_to_half')}
        {isLoading}
      />

      <button on:click={() => handleEFO()}>EFO</button>
       
    {/if}
  </div>
</div>
