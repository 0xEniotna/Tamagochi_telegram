<script lang="ts">
  import { onMount } from 'svelte';
  import happyPet from '../assets/happy_doggo.png';
  import neutralPet from '../assets/neutral_doggo.png';
  import sadPet from '../assets/sad_doggo.png';

  export let hunger: number = 100;
  export let happiness: number = 100;
  export let energy: number = 100;

  $: averageStats = (hunger + happiness + energy) / 3;

  $: petImage = averageStats > 70 ? happyPet : averageStats > 40 ? neutralPet : sadPet;

  $: petMood = averageStats > 70 ? 'happy' : averageStats > 40 ? 'neutral' : 'sad';
</script>

<div class="flex flex-col items-center justify-center p-4">
  <img
    src={petImage}
    alt="Pet {petMood}"
    class="h-48 w-48 object-contain transition-all duration-300 hover:scale-110"
  />

  <!-- Stats Bars -->
  <div class="mt-4 w-full max-w-sm space-y-2">
    <!-- Hunger Bar -->
    <div>
      <div class="mb-1 flex justify-between text-sm">
        <span>Hunger</span>
        <span>{hunger}%</span>
      </div>
      <div class="h-2.5 w-full rounded-full bg-gray-200">
        <div
          class="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
          style="width: {hunger}%"
        />
      </div>
    </div>

    <!-- Happiness Bar -->
    <div>
      <div class="mb-1 flex justify-between text-sm">
        <span>Happiness</span>
        <span>{happiness}%</span>
      </div>
      <div class="h-2.5 w-full rounded-full bg-gray-200">
        <div
          class="h-2.5 rounded-full bg-green-600 transition-all duration-300"
          style="width: {happiness}%"
        />
      </div>
    </div>

    <!-- Energy Bar -->
    <div>
      <div class="mb-1 flex justify-between text-sm">
        <span>Energy</span>
        <span>{energy}%</span>
      </div>
      <div class="h-2.5 w-full rounded-full bg-gray-200">
        <div
          class="h-2.5 rounded-full bg-yellow-600 transition-all duration-300"
          style="width: {energy}%"
        />
      </div>
    </div>
  </div>
</div>
