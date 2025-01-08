<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { mainButton, themeParams } from '@telegram-apps/sdk';
  
  export let onClick: () => void;
  export let text: string;
  export let disabled = false;
  export let color = '#2481cc';

  onMount(async () => {
    console.log('TMAButton mounting...');
    console.log('MainButton available?', mainButton.mount.isAvailable());
    console.log('ThemeParams available?', themeParams.mount.isAvailable());

    // First mount theme params as it's required for main button
    if (themeParams.mount.isAvailable()) {
      console.log('Mounting theme params...');
      themeParams.mount();
    }

    // Then try to mount main button
    if (mainButton.mount.isAvailable()) {
      console.log('Mounting main button...');
      mainButton.mount();
      
      console.log('Setting button params...');
      try {
        mainButton.setParams({
          text,
          isEnabled: !disabled,
          isVisible: true,
          backgroundColor: '#2481cc',
          textColor: '#ffffff',
          hasShineEffect: true
        });

        console.log('Adding click listener...');
        mainButton.onClick(onClick);
      } catch (error) {
        console.error('Error configuring main button:', error);
      }
    } else {
      console.warn('Main button not available. SDK state:', {
        mainButton,
        themeParams
      });
    }
  });

  onDestroy(() => {
    console.log('TMAButton destroying...');
    if (mainButton.mount.isAvailable()) {
      try {
        mainButton.offClick(onClick);
        mainButton.unmount();
      } catch (error) {
        console.error('Error cleaning up main button:', error);
      }
    }
    
    // Cleanup theme params if needed
    if (themeParams.mount.isAvailable()) {
      themeParams.unmount();
    }
  });

  // Watch for prop changes
  $: if (mainButton.mount.isAvailable() && mainButton.isMounted()) {
    console.log('Updating button params:', { text, disabled });
    mainButton.setParams({
      text,
      isEnabled: !disabled
    });
  }
</script>