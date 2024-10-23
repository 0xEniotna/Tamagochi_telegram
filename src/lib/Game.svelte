<script lang="ts">
  import { onMount } from 'svelte';
  import Tamagochi from './Tamagochi.svelte';
  import Buttons from './Buttons.svelte';
  import { Contract, type AccountInterface } from 'starknet';
  import type { PetStats } from './types';
  import type { SessionAccountInterface } from '@argent/tma-wallet';
  import { ArgentTMA } from '@argent/tma-wallet';
  import { TAMAGOCHI_ADDRESS } from '../constants';
  import artifact from '../utils/contracts/abi/tamago_Tamagochi.contract_class.json';

  const ABI = artifact.abi;

  export const argentTMA = ArgentTMA.init({
    environment: 'sepolia',
    appName: 'Tamagochi Test',
    appTelegramUrl: import.meta.env.VITE_TELEGRAM_APP_URL,
    sessionParams: {
      allowedMethods: [
        // List of contracts/methods allowed to be called by the session key
        {
          contract: TAMAGOCHI_ADDRESS,
          selector: 'feed',
        },
        {
          contract: TAMAGOCHI_ADDRESS,
          selector: 'play',
        },
        {
          contract: TAMAGOCHI_ADDRESS,
          selector: 'rest',
        },
      ],
      validityDays: 90, // session validity (in days) - default: 90
    },
  });

  let account: SessionAccountInterface | undefined;
  let isConnected = false;
  let isLoading = false;
  let contract: Contract;

  let stats: PetStats = {
    hunger: 10,
    happiness: 10,
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

      contract = new Contract(
        ABI,
        TAMAGOCHI_ADDRESS,
        account as unknown as AccountInterface
      );

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

  async function handleFeed() {
    if (!contract || !isConnected) return;
    try {
      const tx = await contract.feed();
      await tx.wait();
      await updateStats();
    } catch (error) {
      console.error(`Error performing feed:`, error);
    }
  }
  async function handlePlay() {
    if (!contract || !isConnected) return;
    try {
      const tx = await contract.play();
      await tx.wait();
      await updateStats();
    } catch (error) {
      console.error(`Error performing play:`, error);
    }
  }

  async function handleRest() {
    if (!contract || !isConnected) return;
    try {
      const tx = await contract.rest();
      await tx.wait();
      await updateStats();
    } catch (error) {
      console.error(`Error performing rest:`, error);
    }
  }
</script>

<div class="min-h-screen bg-gray-100 py-8 px-4">
  <div class="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
    <h1 class="text-2xl font-bold text-center mb-6">My Tamagochi</h1>

    {#if !isConnected}
      <div class="flex justify-center">
        <button
          on:click={handleConnect}
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    {:else}
      <Tamagochi {...stats} />
      <Buttons onFeed={handleFeed} onPlay={handlePlay} onRest={handleRest} />
    {/if}
  </div>
</div>
