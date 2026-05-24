<script>
  import '../app.css';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { themePreference } from '$lib/stores/theme';
  import { kotlinBridge } from '$lib/services/kotlinBridge';

  onMount(() => { 
    kotlinBridge.init();
  });
  let { children } = $props();
</script>

{@render children()}
