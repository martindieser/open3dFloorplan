<script lang="ts">
  import { onMount } from 'svelte';
  import { currentProject, viewMode, undo, redo, setActiveFloor, updateProjectName, createDefaultProject, panMode, showFurnitureStore, layerVisibility, isReadOnly } from '$lib/stores/project';
  import SettingsDialog from './SettingsDialog.svelte';
  import { kotlinBridge } from '$lib/services/kotlinBridge';

  let settingsOpen = $state(false);
  let hasAndroidInterface = $state(false);

  let projectName = $state('');
  let mode = $state<'2d' | '3d'>('2d');
  let floors: any[] = $state([]);
  let activeFloorId = $state('');

  currentProject.subscribe((p) => {
    if (p) {
      projectName = p.name;
      floors = p.floors;
      activeFloorId = p.activeFloorId;
    }
  });
  viewMode.subscribe((m) => { mode = m; });

  function setMode(m: '2d' | '3d') {
    viewMode.set(m);
  }

  onMount(() => {
    hasAndroidInterface = !!(window as any).AndroidInterface;
  });
</script>

<div class="h-12 bg-gradient-to-r from-slate-800 to-slate-700 flex items-center px-4 gap-3 shrink-0 shadow-sm">
  <div class="font-semibold text-white text-sm py-0.5 rounded transition-colors select-none">
    {projectName}
  </div>

  <div class="flex-1"></div>

  {#if hasAndroidInterface}
    <button 
      onclick={() => kotlinBridge.notifyNextStep()}
      class="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-full transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
    >
      <span>Siguiente</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    </button>
    <div class="h-5 w-px bg-white/20 mx-1"></div>
  {/if}

  {#if !$isReadOnly}
    <button onclick={undo} class="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors" title="Undo (Ctrl+Z)" aria-label="Undo">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
    </button>
    <button onclick={redo} class="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors" title="Redo (Ctrl+Y)" aria-label="Redo">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>
    </button>

    <div class="h-5 w-px bg-white/20"></div>
  {/if}

  <!-- 2D/3D pill toggle -->
  <div class="flex bg-white/15 rounded-full p-0.5">
    <button
      onclick={() => setMode('2d')}
      class="px-3 py-1 text-xs font-semibold rounded-full transition-colors {mode === '2d' ? 'bg-white text-slate-800' : 'text-white/80 hover:text-white'}"
    >2D</button>
    <button
      onclick={() => setMode('3d')}
      class="px-3 py-1 text-xs font-semibold rounded-full transition-colors {mode === '3d' ? 'bg-white text-slate-800' : 'text-white/80 hover:text-white'}"
    >3D</button>
  </div>

  {#if !$isReadOnly}
    <!-- Settings button -->
    <button
      onclick={() => settingsOpen = true}
      class="px-2 py-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
      title="Settings"
      aria-label="Settings"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    </button>
  {/if}
</div>

<SettingsDialog bind:open={settingsOpen} />
