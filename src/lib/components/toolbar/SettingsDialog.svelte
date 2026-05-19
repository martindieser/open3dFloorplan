<script lang="ts">
  import { projectSettings } from '$lib/stores/settings';
  import type { ProjectSettings } from '$lib/stores/settings';

  let { open = $bindable(false) }: { open: boolean } = $props();

  let settings = $state<ProjectSettings>({
    units: 'metric',
    showDimensions: true,
    showExternalDimensions: true,
    showInternalDimensions: false,
    showExtensionLines: true,
    showObjectDistance: true,
    dimensionLineColor: '#1e293b',
    snapToGrid: true,
    gridSize: 25,
  });

  projectSettings.subscribe((s) => { settings = { ...s }; });

  function updateSetting<K extends keyof ProjectSettings>(key: K, value: ProjectSettings[K]) {
    settings[key] = value;
    projectSettings.set({ ...settings });
  }

  function close() {
    open = false;
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onclick={close} onkeydown={(e) => { if (e.key === 'Escape') close(); }} role="dialog" tabindex="-1" aria-label="Settings">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[420px] max-h-[80vh] flex flex-col" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="document">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 pt-4 pb-2">
        <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100">Settings</h2>
        <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none" onclick={close} aria-label="Close settings">✕</button>
      </div>

      <!-- Content -->
      <div class="p-5 overflow-y-auto">
        <!-- Metrics Unit Toggle -->
        <div class="flex items-center justify-between mb-5">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Metrics unit</span>
          <div class="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              class="px-3 py-1.5 text-sm font-medium transition-colors {settings.units === 'metric' ? 'bg-slate-700 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}"
              onclick={() => updateSetting('units', 'metric')}
            >m, cm</button>
            <button
              class="px-3 py-1.5 text-sm font-medium transition-colors {settings.units === 'imperial' ? 'bg-slate-700 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}"
              onclick={() => updateSetting('units', 'imperial')}
            >ft, inch</button>
          </div>
        </div>

        <!-- Toggle options -->
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl divide-y divide-gray-200 dark:divide-gray-600">
          <label class="flex items-center justify-between px-4 py-3.5 cursor-pointer">
            <span class="text-sm text-gray-700">Dimensions</span>
            <input
              type="checkbox"
              checked={settings.showDimensions}
              onchange={(e) => updateSetting('showDimensions', (e.target as HTMLInputElement).checked)}
              class="w-10 h-5 rounded-full appearance-none cursor-pointer bg-gray-300 checked:bg-slate-700 relative transition-colors
                before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5"
            />
          </label>
          <label class="flex items-center justify-between px-4 py-3.5 cursor-pointer">
            <span class="text-sm text-gray-700">External Dimensions</span>
            <input
              type="checkbox"
              checked={settings.showExternalDimensions}
              onchange={(e) => updateSetting('showExternalDimensions', (e.target as HTMLInputElement).checked)}
              class="w-10 h-5 rounded-full appearance-none cursor-pointer bg-gray-300 checked:bg-slate-700 relative transition-colors
                before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5"
            />
          </label>
          <label class="flex items-center justify-between px-4 py-3.5 cursor-pointer">
            <span class="text-sm text-gray-700">Internal Dimensions</span>
            <input
              type="checkbox"
              checked={settings.showInternalDimensions}
              onchange={(e) => updateSetting('showInternalDimensions', (e.target as HTMLInputElement).checked)}
              class="w-10 h-5 rounded-full appearance-none cursor-pointer bg-gray-300 checked:bg-slate-700 relative transition-colors
                before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5"
            />
          </label>
          <label class="flex items-center justify-between px-4 py-3.5 cursor-pointer">
            <span class="text-sm text-gray-700">Extension Lines</span>
            <input
              type="checkbox"
              checked={settings.showExtensionLines}
              onchange={(e) => updateSetting('showExtensionLines', (e.target as HTMLInputElement).checked)}
              class="w-10 h-5 rounded-full appearance-none cursor-pointer bg-gray-300 checked:bg-slate-700 relative transition-colors
                before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5"
            />
          </label>
          <label class="flex items-center justify-between px-4 py-3.5 cursor-pointer">
            <span class="text-sm text-gray-700">Object Distance</span>
            <input
              type="checkbox"
              checked={settings.showObjectDistance}
              onchange={(e) => updateSetting('showObjectDistance', (e.target as HTMLInputElement).checked)}
              class="w-10 h-5 rounded-full appearance-none cursor-pointer bg-gray-300 checked:bg-slate-700 relative transition-colors
                before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5"
            />
          </label>
          <div class="flex items-center justify-between px-4 py-3.5">
            <span class="text-sm text-gray-700">Line Color</span>
            <div class="flex items-center gap-2">
              <button
                class="w-8 h-8 rounded border-2 transition-colors {settings.dimensionLineColor === '#ffffff' ? 'border-slate-600' : 'border-gray-200'}"
                style="background-color: #ffffff"
                onclick={() => updateSetting('dimensionLineColor', '#ffffff')}
                aria-label="White line color"
              ></button>
              <span class="text-gray-300">|</span>
              <button
                class="w-8 h-8 rounded border-2 transition-colors {settings.dimensionLineColor === '#1e293b' ? 'border-slate-600' : 'border-gray-200'}"
                style="background-color: #1e293b"
                onclick={() => updateSetting('dimensionLineColor', '#1e293b')}
                aria-label="Dark line color"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
