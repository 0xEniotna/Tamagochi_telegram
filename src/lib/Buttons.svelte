<script lang="ts">
  export let onFeed: () => void;
  export let onPlay: () => void;
  export let onRest: () => void;
  export let onResetStats: () => void;
  export let isLoading: boolean = false;
</script>

<div class="mt-4 flex flex-col gap-4">
  <div class="flex justify-center gap-4">
    <button
      on:click={onFeed}
      disabled={isLoading}
      class="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors
               hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      🍖 Feed
    </button>

    <button
      on:click={onPlay}
      disabled={isLoading}
      class="rounded-lg bg-green-600 px-6 py-3 text-white transition-colors
               hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      🎮 Play
    </button>

    <button
      on:click={onRest}
      disabled={isLoading}
      class="rounded-lg bg-yellow-600 px-6 py-3 text-white transition-colors
               hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      💤 Rest
    </button>
  </div>
  <div class="flex justify-center">
    <button
      on:click={onResetStats}
      disabled={isLoading}
      class="rounded-lg bg-red-600 px-6 py-2 text-sm text-white transition-colors
               hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      🔄 Reset Stats 
    </button>
  </div>
</div>
