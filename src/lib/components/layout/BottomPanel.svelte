<script lang="ts">
  import { isBottomPanelOpen, activeMobileTab } from '$lib/stores/ui';
  import { selectedElementId, selectedRoomId } from '$lib/stores/project';
  import BuildPanel from '$lib/components/sidebar/BuildPanel.svelte';
  import PropertiesPanel from '$lib/components/sidebar/PropertiesPanel.svelte';
  import { fly } from 'svelte/transition';

  let isOpen = $derived($isBottomPanelOpen);
  let activeTab = $derived($activeMobileTab);
  let hasSelection = $derived($selectedElementId !== null || $selectedRoomId !== null);

  const tabs = [
    { id: 'build', label: 'Build', icon: '⚒️' },
    { id: 'rooms', label: 'Rooms', icon: '⬜' },
    { id: 'objects', label: 'Objects', icon: '🪑' },
    { id: 'properties', label: 'Edit', icon: '⚙️' },
  ] as const;

  function closePanel() {
    isBottomPanelOpen.set(false);
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="fixed inset-0 bg-black/20 z-40 lg:hidden"
    onclick={closePanel}
    transition:fly={{ duration: 200 }}
  ></div>

  <div 
    class="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 rounded-t-2xl flex flex-col max-h-[80vh] lg:hidden"
    transition:fly={{ y: 300, duration: 300 }}
  >
    <!-- Handle -->
    <div class="h-1.5 w-12 bg-gray-300 rounded-full mx-auto my-3 shrink-0"></div>

    <div class="flex-1 overflow-y-auto px-4 pb-20">
      {#if activeTab === 'properties'}
        <PropertiesPanel />
      {:else}
        <BuildPanel />
      {/if}
    </div>
  </div>
{/if}

<!-- Bottom Navigation Bar -->
<div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around z-50 lg:hidden safe-bottom">
  {#each tabs as tab}
    <button
      onclick={() => {
        activeMobileTab.set(tab.id);
        isBottomPanelOpen.set(true);
      }}
      class="flex flex-col items-center justify-center gap-1 w-full h-full transition-colors {activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}"
    >
      <span class="text-xl">{tab.icon}</span>
      <span class="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
    </button>
  {/each}
</div>

<style>
  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0);
    height: calc(4rem + env(safe-area-inset-bottom, 0));
  }
</style>
