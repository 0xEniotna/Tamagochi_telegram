<script lang="ts">
  export let onFeed: () => void;
  export let onPlay: () => void;
  export let onRest: () => void;
  export let isLoading: boolean = false;
</script>

<div class="flex gap-4 justify-center mt-4">
  <button
    on:click={onFeed}
    disabled={isLoading}
    class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700
             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    🍖 Feed
  </button>

  <button
    on:click={onPlay}
    disabled={isLoading}
    class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700
             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    🎮 Play
  </button>

  <button
    on:click={onRest}
    disabled={isLoading}
    class="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700
             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    💤 Rest
  </button>
</div>
