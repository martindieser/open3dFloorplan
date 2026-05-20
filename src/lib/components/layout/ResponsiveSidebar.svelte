<script lang="ts">
  import { isSidebarOpen } from '$lib/stores/ui';

  let { children } = $props();
</script>

<aside 
  class="hidden lg:flex flex-col border-r border-gray-200 bg-white transition-all duration-300 overflow-hidden"
  style="width: {$isSidebarOpen ? '280px' : '0'}"
>
  <div class="min-w-[280px] h-full">
    {@render children?.()}
  </div>
</aside>
