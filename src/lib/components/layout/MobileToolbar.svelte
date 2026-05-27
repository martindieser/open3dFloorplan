<script lang="ts">
  import { currentProject, viewMode, undo, redo, isReadOnly } from '$lib/stores/project';
  import SettingsDialog from '$lib/components/toolbar/SettingsDialog.svelte';
  import { kotlinBridge } from '$lib/services/kotlinBridge';
  import { onMount } from 'svelte';

  let mode = $derived($viewMode);
  let projectName = $derived($currentProject?.name || 'Untitled');
  let settingsOpen = $state(false);
  let hasAndroidInterface = $state(false);

  onMount(() => {
    hasAndroidInterface = !!(window as any).AndroidInterface;
  });

  function setMode(m: '2d' | '3d') {
    viewMode.set(m);
  }
</script>

<div class="h-12 bg-slate-900 flex items-center px-2 gap-1 shrink-0 z-50 safe-top border-b border-white/5">
  {#if hasAndroidInterface}
    <button 
      onclick={() => kotlinBridge.notifyNextStep()}
      class="ml-1 p-2 text-blue-400 hover:text-blue-300 hover:bg-white/5 active:bg-white/10 rounded-lg transition-all active:scale-95 flex items-center gap-1"
      aria-label="Siguiente"
    >
      <span class="text-[10px] font-bold uppercase tracking-wider">Siguiente</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    </button>
    <div class="h-4 w-px bg-white/10 mx-1"></div>
  {/if}

  <div class="flex-1 min-w-0 px-1">
    <h1 class="text-white font-medium text-xs truncate opacity-80">{projectName}</h1>
  </div>

  {#if !$isReadOnly}
    <!-- Undo/Redo -->
    <div class="flex items-center">
      <button onclick={undo} class="p-2 text-white/60 active:text-white" aria-label="Undo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
      </button>
      <button onclick={redo} class="p-2 text-white/60 active:text-white" aria-label="Redo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
      </button>
    </div>
  {/if}

  <!-- 2D/3D toggle flattens -->
  <div class="flex bg-white/10 rounded overflow-hidden mx-1">
    <button
      onclick={() => setMode('2d')}
      class="px-3 py-1.5 text-[10px] font-bold transition-colors {mode === '2d' ? 'bg-blue-600 text-white' : 'text-white/50'}"
    >2D</button>
    <button
      onclick={() => setMode('3d')}
      class="px-3 py-1.5 text-[10px] font-bold transition-colors {mode === '3d' ? 'bg-blue-600 text-white' : 'text-white/50'}"
    >3D</button>
  </div>

  {#if !$isReadOnly}
    <!-- Settings -->
    <button
      onclick={() => settingsOpen = true}
      class="p-2 text-white/60 active:text-white"
      aria-label="Settings"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    </button>
  {/if}
</div>

<SettingsDialog bind:open={settingsOpen} />

<style>
  .safe-top {
    padding-top: env(safe-area-inset-top, 0);
    height: calc(3rem + env(safe-area-inset-top, 0));
  }
</style>

