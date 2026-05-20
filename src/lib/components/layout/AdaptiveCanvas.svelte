<script lang="ts">
  import { isMobile } from '$lib/stores/ui';

  let { children } = $props();
</script>

<main class="flex-1 relative min-w-0 bg-slate-100 overflow-hidden touch-none">
  {@render children?.()}

  {#if $isMobile}
    <!-- Mobile Floating Controls -->
    <div class="absolute right-4 top-4 flex flex-col gap-3">
      <!-- Add any mobile-specific floating buttons here if needed -->
    </div>
  {/if}
</main>
