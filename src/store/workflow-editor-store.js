import { create } from "zustand";

export const useWorkflowEditorStore = create((set, get) => ({
  // Active top-level tab: 'editor' | 'executions'
  activeTab: "editor",
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Dirty state tracking (unsaved changes)
  isDirty: false,
  setIsDirty: (dirty) => set({ isDirty: dirty }),

  // Selection state
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  // Node settings modal (3-column configuration dialog)
  settingsNodeId: null,
  isSettingsOpen: false,
  openSettings: (nodeId) => set({ settingsNodeId: nodeId, isSettingsOpen: true }),
  closeSettings: () => set({ settingsNodeId: null, isSettingsOpen: false }),

  // Right-side Add Node panel
  isNodePanelOpen: false,
  nodePanelSourceInfo: null, // { sourceNodeId, sourceHandle, position }
  openNodePanel: (sourceInfo = null) => set({ isNodePanelOpen: true, nodePanelSourceInfo: sourceInfo }),
  closeNodePanel: () => set({ isNodePanelOpen: false, nodePanelSourceInfo: null }),

  // Simulation / Execution state
  isSimulating: false,
  setIsSimulating: (sim) => set({ isSimulating: sim }),
  activeSimulationNodeId: null,
  setActiveSimulationNodeId: (id) => set({ activeSimulationNodeId: id }),
  executionResults: {}, // { [nodeId]: { status, inputItems, outputItems, duration, error } }
  setExecutionResults: (results) => set({ executionResults: results }),
  clearExecutionResults: () => set({ executionResults: {}, activeSimulationNodeId: null }),

  // Historical execution inspection mode
  inspectingExecution: null, // null or Execution object
  setInspectingExecution: (exec) => {
    if (exec) {
      set({
        inspectingExecution: exec,
        activeTab: "editor",
        executionResults: exec.perNodeResults || {},
      });
    } else {
      set({
        inspectingExecution: null,
        executionResults: {},
      });
    }
  },

  // Reset editor store
  resetEditorStore: () =>
    set({
      activeTab: "editor",
      isDirty: false,
      selectedNodeId: null,
      settingsNodeId: null,
      isSettingsOpen: false,
      isNodePanelOpen: false,
      nodePanelSourceInfo: null,
      isSimulating: false,
      activeSimulationNodeId: null,
      executionResults: {},
      inspectingExecution: null,
    }),
}));
