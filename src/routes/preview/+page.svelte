<script lang="ts">
  import { onMount } from 'svelte';
  import { currentProject, isReadOnly, viewMode, createDefaultProject } from '$lib/stores/project';
  import ThreeViewer from '$lib/components/viewer3d/ThreeViewer.svelte';

  let ready = $state(false);

  onMount(() => {
    // Preview mode is always read-only and 3D
    isReadOnly.set(true);
    viewMode.set('3d');

    // Check if we already have a project, otherwise wait for Kotlin
    const project = $currentProject;
    if (!project || !project.floors || project.floors.length === 0) {
      console.log('[Preview] No project found, waiting for Kotlin loadFromKotlin call.');
      // We can load a default empty project just to initialize the scene
      currentProject.set(createDefaultProject());
    }
    
    ready = true;
  });
</script>

<div class="h-screen w-screen bg-slate-950 overflow-hidden">
  {#if ready}
    <ThreeViewer previewMode={true} />
  {:else}
    <div class="h-full w-full flex items-center justify-center text-slate-500">
      <p>Initializing Preview...</p>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
</style>
