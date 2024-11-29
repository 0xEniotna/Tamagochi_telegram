<script lang="ts">
  import { onMount } from 'svelte';
  import Tamagochi from './Tamagochi.svelte';
  import Buttons from './Buttons.svelte';
  import { Contract, type AccountInterface, type Call } from 'starknet';
  import type { SessionAccountInterface } from '@argent/tma-wallet';
  import artifact from '../utils/abi/tamago_Tamagochi.contract_class.json';
  import { executeContractAction, initWallet } from './contracts';

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
      await argentTMA.requestConnection('tamagochi_connection');
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
    if (!contract || !isConnected || !account) return;
    isLoading = true;

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
    isLoading = false;
  }
</script>

<div class="min-h-screen bg-gray-100 px-4 py-8">
  <div class="mx-auto max-w-md rounded-xl bg-white p-6 shadow-lg">
    <h1 class="mb-6 text-center text-2xl font-bold text-black">My Tamagotchi</h1>

    {#if !isConnected}
      <div class="flex justify-center">
        <button
          on:click={handleConnect}
          class="rounded-lg bg-red-500 px-6 py-3 text-white transition-colors
                 hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      </div>
    {:else}
      <button on:click={handleDisconnect} class="w-full text-left">
        Account address: <code>{account?.address.slice(0, 6)}...{account?.address.slice(-4)}</code>
      </button>
      <Tamagochi {...stats} />

      <Buttons
        onFeed={() => handleAction('feed')}
        onPlay={() => handleAction('play')}
        onRest={() => handleAction('rest')}
        onResetStats={() => handleAction('test_set_stats_to_half')}
        {isLoading}
      />
    {/if}
  </div>
</div>
