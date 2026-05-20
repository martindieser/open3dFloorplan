<script lang="ts">
  import { onMount } from 'svelte';
  import { currentProject, viewMode, selectedElementId, selectedRoomId, createDefaultProject } from '$lib/stores/project';
  import { localStore } from '$lib/services/datastore';
  import ResponsiveLayout from '$lib/components/layout/ResponsiveLayout.svelte';
  import FloorPlanCanvas from '$lib/components/editor/FloorPlanCanvas.svelte';

  // Lazy-load ThreeViewer to avoid loading Three.js (~1.4MB) until 3D mode is activated
  let ThreeViewer: any = $state(null);
  $effect(() => {
    if (mode === '3d' && !ThreeViewer) {
      import('$lib/components/viewer3d/ThreeViewer.svelte').then(m => { ThreeViewer = m.default; });
    }
  });

  let mode = $state<'2d' | '3d'>('2d');
  let ready = $state(false);

  viewMode.subscribe((m) => {
    mode = m;
    if (m === '3d') {
      // Clear selection when entering 3D — start in view-only mode
      selectedElementId.set(null);
      selectedRoomId.set(null);
    }
  });

  onMount(() => {
    (async () => {
      const url = new URL(window.location.href);
      const id = url.searchParams.get('id');
      if (id) {
        const project = await localStore.load(id);
        if (project) {
          currentProject.set(project);
        } else {
          const p = createDefaultProject();
          currentProject.set(p);
          await localStore.save(p);
          history.replaceState(null, '', `/editor?id=${p.id}`);
        }
      } else {
        const p = createDefaultProject();
        currentProject.set(p);
        await localStore.save(p);
        history.replaceState(null, '', `/editor?id=${p.id}`);
      }
      ready = true;
    })();

    // Auto-save on every project change (debounced)
    let saveTimeout: ReturnType<typeof setTimeout>;
    const unsub = currentProject.subscribe((p) => {
      if (!p) return;
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => localStore.save(p), 500);
    });
    return () => { unsub(); clearTimeout(saveTimeout); };
  });
</script>

<svelte:window on:keydown={(e) => { 
  // Base shortcuts could still be useful, but keeping it minimal for now
}} />

{#if ready}
  <ResponsiveLayout>
    {#if mode === '2d'}
      <FloorPlanCanvas />
    {:else}
      {#if ThreeViewer}
        <ThreeViewer />
      {:else}
        <div class="flex items-center justify-center h-full text-slate-400">Loading 3D viewer…</div>
      {/if}
    {/if}
  </ResponsiveLayout>
{:else}
  <div class="h-screen flex items-center justify-center">
    <p class="text-gray-400">Loading...</p>
  </div>
{/if}
