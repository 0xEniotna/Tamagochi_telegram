<script lang="ts">
  import Game from './lib/Game.svelte';
  import toast, { Toaster } from 'svelte-french-toast';
</script>

<main>
  <Toaster
    position="top-right"
    gutter={8}
    toastOptions={{
      duration: 4000,
      style: 'background: #333; color: white;',
    }}
  />
  <Game />
</main>
