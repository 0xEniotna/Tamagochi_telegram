<script lang="ts">
  import { onMount } from 'svelte';
  import Tamagochi from './Tamagochi.svelte';
  import Buttons from './Buttons.svelte';
  import { Contract, type AccountInterface } from 'starknet';
  import type { PetStats } from './types';
  import type { SessionAccountInterface } from '@argent/tma-wallet';
  import { ArgentTMA } from '@argent/tma-wallet';
  import artifact from '../utils/contracts/abi/tamago_Tamagochi.contract_class.json';
  import toast from 'svelte-french-toast';
  import { executeTransaction } from '../utils/contracts/contracts';
  
  const ABI = artifact.abi;
  const TAMAGOCHI_ADDRESS = import.meta.env.VITE_TAMAGOCHI_CONTRACT_ADDRESS;
  
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
        {
          contract: TAMAGOCHI_ADDRESS,
          selector: 'test_set_stats_to_half',
        },
      ],
      validityDays: 90, // session validity (in days) - default: 90
    },
  });

  let account: SessionAccountInterface | undefined;
  let isConnected = false;
  let isLoading = false;
  let contract: Contract | undefined;

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

      contract = new Contract(ABI, TAMAGOCHI_ADDRESS, account as unknown as AccountInterface);
      contract.connect(account as unknown as AccountInterface);
      
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
        hunger: 10,
        happiness: 10,
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

  async function handleFeed() {
    if (!contract || !isConnected) return;
    try {
      isLoading = true;
      const transactionPromise = executeTransaction('feed', [], contract, account as unknown as AccountInterface, argentTMA);
    
      toast.promise(transactionPromise, {
        loading: 'Feeding pet...',
        success: 'Pet has been fed! 🍖',
        error: 'Failed to feed pet 😕',
      }
    );

    const receipt = await transactionPromise;
    if (receipt?.isSuccess()) {
      await updateStats();
    }
    } catch (error) {
      console.error(`Error performing feed:`, error);
      toast.error('Failed to feed pet 😕');
    } finally {
      isLoading = false;
    }
  }

  async function handlePlay() {
    if (!contract || !isConnected) return;
    try {
      isLoading = true;
      const transactionPromise = executeTransaction('play', [], contract, account as unknown as AccountInterface, argentTMA);
        
      toast.promise(transactionPromise, {
        loading: 'Playing with pet...',
        success: 'Pet has been played with! 🎮',
        error: 'Failed to play with pet 😕',
      });

      const receipt = await transactionPromise;
      if (receipt?.isSuccess()) {
        await updateStats();
      }
    } catch (error) {
      console.error(`Error performing play:`, error);
      toast.error('Failed to play with pet 😕');
    } finally {
      isLoading = false;
    }
  }

  async function handleRest() {
    if (!contract || !isConnected) return;
    try {
      isLoading = true;
      const transactionPromise = executeTransaction('rest', [], contract, account as unknown as AccountInterface, argentTMA);
        
      toast.promise(transactionPromise, {
        loading: 'Resting pet...',
        success: 'Pet has been rested! 💤',
        error: 'Failed to rest pet 😕',
      });

      const receipt = await transactionPromise;
      if (receipt?.isSuccess()) {
        await updateStats();
      }
    } catch (error) {
      console.error(`Error performing rest:`, error);
      toast.error('Failed to rest pet 😕');
    } finally {
      isLoading = false;
    }
  }

  async function handleResetStats() {
    if (!contract || !isConnected) return;
    try {
      isLoading = true;
      const transactionPromise = executeTransaction('test_set_stats_to_half', [], contract, account as unknown as AccountInterface, argentTMA);
        
      toast.promise(transactionPromise, {
        loading: 'Resetting stats...',
        success: 'Stats have been reset! 🔄',
        error: 'Failed to reset stats 😕',
      });

      const receipt = await transactionPromise;
      if (receipt?.isSuccess()) {
        await updateStats();
      }
    } catch (error) {
      console.error(`Error performing reset stats:`, error);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-100 px-4 py-8">
  <div class="mx-auto max-w-md rounded-xl bg-white p-6 shadow-lg">
    <h1 class="mb-6 text-center text-2xl font-bold text-black">My Tamagochi</h1>

    {#if !isConnected}
      <div class="flex justify-center">
        <button
          on:click={handleConnect}
          class="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors
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
      <Buttons onFeed={handleFeed} onPlay={handlePlay} onRest={handleRest} onResetStats={handleResetStats} isLoading={isLoading} />
    {/if}
  </div>
</div>
