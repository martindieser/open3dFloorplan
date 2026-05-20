<script lang="ts">
  import { isMobile } from '$lib/stores/ui';
  import { viewMode } from '$lib/stores/project';
  import TopBar from '$lib/components/toolbar/TopBar.svelte';
  import MobileToolbar from '$lib/components/layout/MobileToolbar.svelte';
  import BuildPanel from '$lib/components/sidebar/BuildPanel.svelte';
  import PropertiesPanel from '$lib/components/sidebar/PropertiesPanel.svelte';
  import BottomPanel from '$lib/components/layout/BottomPanel.svelte';
  import ResponsiveSidebar from '$lib/components/layout/ResponsiveSidebar.svelte';
  import AdaptiveCanvas from '$lib/components/layout/AdaptiveCanvas.svelte';

  let { children } = $props();
</script>

<div class="h-screen flex flex-col overflow-hidden bg-slate-50">
  {#if $isMobile}
    <MobileToolbar />
  {:else}
    <TopBar />
  {/if}

  <div class="flex flex-1 overflow-hidden relative">
    {#if !$isMobile}
      <ResponsiveSidebar>
        <BuildPanel />
      </ResponsiveSidebar>
    {/if}

    <AdaptiveCanvas>
      {@render children?.()}
    </AdaptiveCanvas>

    {#if !$isMobile}
      <PropertiesPanel is3D={$viewMode === '3d'} />
    {/if}

    {#if $isMobile}
      <BottomPanel />
    {/if}
  </div>
</div>

<style>
  :global(body) {
    overscroll-behavior-y: none;
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
  }
</style>
