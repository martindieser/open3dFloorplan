import { writable } from 'svelte/store';

export type MobileTab = 'build' | 'rooms' | 'objects' | 'properties';

export const isMobile = writable(false);
export const activeMobileTab = writable<MobileTab>('build');
export const isSidebarOpen = writable(true);
export const isBottomPanelOpen = writable(false);
export const draggingFromLibrary = writable<{ type: 'furniture' | 'room' | 'room-template' | 'stair' | 'column'; id: string } | null>(null);

// Initialize screen size detection
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(max-width: 1024px)');
  isMobile.set(mediaQuery.matches);
  
  mediaQuery.addEventListener('change', (e) => {
    isMobile.set(e.matches);
  });
}
