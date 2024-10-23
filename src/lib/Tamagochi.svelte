<script lang="ts">
  import { onMount } from 'svelte';
  import happyPet from '../assets/happy_doggo.png';
  import neutralPet from '../assets/neutral_doggo.png';
  import sadPet from '../assets/sad_doggo.png';

  export let hunger: number = 100;
  export let happiness: number = 100;
  export let energy: number = 100;

  $: averageStats = (hunger + happiness + energy) / 3;

  $: petImage =
    averageStats > 70 ? happyPet : averageStats > 40 ? neutralPet : sadPet;

  $: petMood =
    averageStats > 70 ? 'happy' : averageStats > 40 ? 'neutral' : 'sad';
</script>

<div class="flex flex-col items-center justify-center p-4">
  <img
    src={petImage}
    alt="Pet {petMood}"
    class="w-48 h-48 object-contain transition-all duration-300 hover:scale-110"
  />

  <!-- Stats Bars -->
  <div class="w-full max-w-sm space-y-2 mt-4">
    <!-- Hunger Bar -->
    <div>
      <div class="flex justify-between text-sm mb-1">
        <span>Hunger</span>
        <span>{hunger}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div
          class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style="width: {hunger}%"
        />
      </div>
    </div>

    <!-- Happiness Bar -->
    <div>
      <div class="flex justify-between text-sm mb-1">
        <span>Happiness</span>
        <span>{happiness}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div
          class="bg-green-600 h-2.5 rounded-full transition-all duration-300"
          style="width: {happiness}%"
        />
      </div>
    </div>

    <!-- Energy Bar -->
    <div>
      <div class="flex justify-between text-sm mb-1">
        <span>Energy</span>
        <span>{energy}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div
          class="bg-yellow-600 h-2.5 rounded-full transition-all duration-300"
          style="width: {energy}%"
        />
      </div>
    </div>
  </div>
</div>
