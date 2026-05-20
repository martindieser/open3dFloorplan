<script lang="ts">
  import { currentProject, viewMode, undo, redo, panMode } from '$lib/stores/project';
  import { activeMobileTab, isBottomPanelOpen } from '$lib/stores/ui';
  import SettingsDialog from '$lib/components/toolbar/SettingsDialog.svelte';

  let mode = $derived($viewMode);
  let projectName = $derived($currentProject?.name || 'Untitled');
  let settingsOpen = $state(false);
  let menuOpen = $state(false);

  function setMode(m: '2d' | '3d') {
    viewMode.set(m);
  }

  function toggleBottomPanel() {
    isBottomPanelOpen.update(v => !v);
  }
</script>

<div class="h-14 bg-slate-800 flex items-center px-4 gap-2 shrink-0 shadow-md z-50 safe-top">
  <button 
    onclick={toggleBottomPanel}
    class="p-2 text-white/80 active:bg-white/10 rounded-lg"
    aria-label="Menu"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  </button>

  <div class="flex-1 min-w-0">
    <h1 class="text-white font-semibold text-sm truncate">{projectName}</h1>
  </div>

  <div class="flex items-center gap-1 bg-white/10 rounded-full p-1">
    <button
      onclick={() => setMode('2d')}
      class="px-4 py-1 text-xs font-bold rounded-full transition-all {mode === '2d' ? 'bg-white text-slate-800 shadow-sm' : 'text-white/60'}"
    >2D</button>
    <button
      onclick={() => setMode('3d')}
      class="px-4 py-1 text-xs font-bold rounded-full transition-all {mode === '3d' ? 'bg-white text-slate-800 shadow-sm' : 'text-white/60'}"
    >3D</button>
  </div>

  <div class="flex items-center gap-1 relative">
    <button onclick={undo} class="p-2 text-white/70 active:text-white" aria-label="Undo">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
    </button>
    
    <button onclick={() => menuOpen = !menuOpen} class="p-2 text-white/70 active:text-white" aria-label="More">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
    </button>

    {#if menuOpen}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="fixed inset-0 z-40" onclick={() => menuOpen = false}></div>
      <div class="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-48 z-50 flex flex-col">
        <button 
          onclick={() => { redo(); menuOpen = false; }}
          class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
          Redo
        </button>
        <button 
          onclick={() => { settingsOpen = true; menuOpen = false; }}
          class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </button>
        <hr class="border-gray-100 my-1" />
        <a 
          href="/"
          class="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 active:bg-red-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          Exit Editor
        </a>
      </div>
    {/if}
  </div>
</div>

<SettingsDialog bind:open={settingsOpen} />

<style>
  .safe-top {
    padding-top: env(safe-area-inset-top, 0);
    height: calc(3.5rem + env(safe-area-inset-top, 0));
  }
</style>
