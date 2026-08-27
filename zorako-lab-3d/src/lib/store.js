import { create } from 'zustand';

export const useLabStore = create((set) => ({
  // Active Inspection & Selection State
  selectedComponentId: null,
  isXRayActive: false,
  globalOpacity: 0.4,
  clippingPlaneDistance: 0.0,
  isClippingActive: false,

  // Assembly Component Hierarchy
  components: {
    'outer-casing': { id: 'outer-casing', name: 'Aluminium Outer Shell', opacity: 0.35, visible: true },
    'cathode-layer': { id: 'cathode-layer', name: 'NMC Cathode Matrix', opacity: 1.0, visible: true },
    'anode-layer': { id: 'anode-layer', name: 'Graphite/Silicon Anode', opacity: 1.0, visible: true },
    'separator-membrane': { id: 'separator-membrane', name: 'Solid-State Electrolyte Membrane', opacity: 0.8, visible: true },
  },

  // State Updaters
  setSelectedComponent: (id) => set({ selectedComponentId: id }),
  setXRayMode: (active) => set({ isXRayActive: active }),
  setGlobalOpacity: (val) => set({ globalOpacity: val }),
  setClippingDistance: (dist) => set({ clippingPlaneDistance: dist }),
  toggleClipping: () => set((state) => ({ isClippingActive: !state.isClippingActive })),

  setComponentOpacity: (id, opacity) =>
    set((state) => ({
      components: {
        ...state.components,
        [id]: { ...state.components[id], opacity },
      },
    })),

  toggleComponentVisibility: (id) =>
    set((state) => ({
      components: {
        ...state.components,
        [id]: { ...state.components[id], visible: !state.components[id].visible },
      },
    })),
}));
