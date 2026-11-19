"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { useQueryClient } from "@tanstack/react-query";
import { TopBar } from "./top-bar";
import { WorkflowCanvas } from "./workflow-canvas";
import { ExecutionsTab } from "./executions-tab";
import { UnsavedChangesDialog } from "./unsaved-changes-dialog";
import { useSmartBack } from "@/hooks/use-smart-back";
import {
  runWorkflow,
  migrateAutomationToWorkflow,
  generateSeedExecutions,
  DEFAULT_TRIGGER_PAYLOAD,
} from "@/lib/workflow-engine";
import { useWorkflowEditorStore } from "@/store/workflow-editor-store";
import {
  useUpdateAutomation,
  useToggleAutomation,
  useDuplicateAutomation,
  useDeleteAutomation,
} from "@/hooks/use-automations";
import { toast } from "sonner";

function WorkflowEditorInner({
  initialAutomation,
  isCreate = false,
  onSaveNew,
  fallbackHref,
  backLabel,
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getNodes, getEdges } = useReactFlow();

  const effectiveFallback = fallbackHref || (isCreate ? "/automations/create" : "/automations");
  const effectiveBackLabel = backLabel || (isCreate ? "Back to templates" : "Back to Automations");
  const { smartBack } = useSmartBack(effectiveFallback);

  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const {
    activeTab,
    setActiveTab,
    isDirty,
    setIsDirty,
    setIsSimulating,
    setActiveSimulationNodeId,
    setExecutionResults,
    setInspectingExecution,
    resetEditorStore,
  } = useWorkflowEditorStore();

  const [automation, setAutomation] = useState(initialAutomation || {});
  const [workflowName, setWorkflowName] = useState(initialAutomation?.name || "New Automation");

  // Reset dirty flag on initial mount of a fresh automation
  useEffect(() => {
    setIsDirty(false);
    return () => {
      setIsDirty(false);
    };
  }, [setIsDirty]);

  // Request back navigation with unsaved changes guard
  const handleRequestBack = useCallback(() => {
    if (useWorkflowEditorStore.getState().isDirty) {
      setShowUnsavedDialog(true);
    } else {
      smartBack();
    }
  }, [smartBack]);

  // Dialog actions
  const handleStay = useCallback(() => {
    setShowUnsavedDialog(false);
  }, []);

  const handleDiscard = useCallback(() => {
    setIsDirty(false);
    setShowUnsavedDialog(false);
    setTimeout(() => {
      smartBack();
    }, 40);
  }, [setIsDirty, smartBack]);

  // Intercept browser back button when canvas is dirty
  useEffect(() => {
    if (!isDirty || typeof window === "undefined") return;

    // Push barrier entry preserving Next.js internal router state and current URL
    window.history.pushState(window.history.state, "", window.location.href);

    const handlePopState = () => {
      if (useWorkflowEditorStore.getState().isDirty) {
        window.history.pushState(window.history.state, "", window.location.href);
        setShowUnsavedDialog(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty]);

  // Mutations
  const updateMutation = useUpdateAutomation();
  const toggleMutation = useToggleAutomation();
  const duplicateMutation = useDuplicateAutomation();
  const deleteMutation = useDeleteAutomation();

  // Executions history list
  const [executions, setExecutions] = useState(() => {
    if (initialAutomation?.executionsList && initialAutomation.executionsList.length > 0) {
      return initialAutomation.executionsList;
    }
    return generateSeedExecutions(initialAutomation?.id || "auto_new", 16);
  });

  // Warn on leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Initial nodes & edges (migrating legacy if needed)
  const initialGraph = React.useMemo(() => {
    return migrateAutomationToWorkflow(initialAutomation || {});
  }, [initialAutomation]);

  // Handle Save
  const handleSave = async () => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    const payload = {
      name: workflowName,
      status: automation?.status || "active",
      workflow: {
        nodes: currentNodes,
        edges: currentEdges,
      },
      lastUpdated: new Date().toISOString(),
    };

    if (isCreate) {
      if (onSaveNew) {
        await onSaveNew(payload);
      }
      setIsDirty(false);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: automation.id,
        data: payload,
      });

      setAutomation((prev) => ({ ...prev, ...payload }));
      setIsDirty(false);
      toast.success(`Workflow "${workflowName}" saved successfully`);

      // Invalidate relevant queries to keep all views consistent
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      toast.error(err.message || "Failed to save workflow");
    }
  };

  // Handle Toggle Active
  const handleToggleActive = async () => {
    if (isCreate) {
      const nextStatus = automation.status === "active" ? "inactive" : "active";
      setAutomation((prev) => ({ ...prev, status: nextStatus }));
      toast.success(`Automation status set to ${nextStatus}`);
      return;
    }

    try {
      await toggleMutation.mutateAsync(automation.id);
      const nextStatus = automation.status === "active" ? "inactive" : "active";
      setAutomation((prev) => ({ ...prev, status: nextStatus }));
      toast.success(`Automation is now ${nextStatus}`);
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    } catch (err) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  // Handle Duplicate
  const handleDuplicate = async () => {
    if (isCreate) return;
    try {
      const res = await duplicateMutation.mutateAsync(automation.id);
      toast.success("Workflow duplicated");
      if (res?.data?.id) {
        router.push(`/automations/${res.data.id}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to duplicate");
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (isCreate) {
      router.push("/automations");
      return;
    }
    if (confirm(`Are you sure you want to delete "${workflowName}"?`)) {
      try {
        await deleteMutation.mutateAsync(automation.id);
        toast.success("Automation deleted");
        router.push("/automations");
      } catch (err) {
        toast.error(err.message || "Failed to delete");
      }
    }
  };

  // Execute Simulated Workflow Run with animated sequential node lighting
  const handleExecuteSimulation = async () => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    setIsSimulating(true);
    toast.info("Starting simulated execution with sample trigger payload...");

    // Dynamically match simulation payload to trigger configuration
    const triggerNode = currentNodes.find(
      (n) => n.data?.category === "trigger" || n.type?.startsWith("trigger_")
    );
    const triggerConfig = triggerNode?.data?.config || {};
    const firstKeyword = Array.isArray(triggerConfig.keywords)
      ? triggerConfig.keywords[0]
      : typeof triggerConfig.keywords === "string"
      ? triggerConfig.keywords.split(",")[0]?.trim()
      : null;

    const simulationPayload = {
      ...DEFAULT_TRIGGER_PAYLOAD,
      commentText: firstKeyword || "BUY",
      reelId: triggerConfig.reelId || DEFAULT_TRIGGER_PAYLOAD.reelId,
      productId: triggerConfig.productId || DEFAULT_TRIGGER_PAYLOAD.productId,
    };

    // Execute engine
    const execution = runWorkflow(
      { nodes: currentNodes, edges: currentEdges },
      simulationPayload,
      {
        executeSideEffects: true,
        automationId: automation.id,
      }
    );

    const executedNodeIds = Object.keys(execution.perNodeResults);
    const cumulativeResults = {};

    // Animate nodes in sequence
    for (let i = 0; i < executedNodeIds.length; i++) {
      const nodeId = executedNodeIds[i];
      setActiveSimulationNodeId(nodeId);

      // Brief animation pause per step
      await new Promise((resolve) => setTimeout(resolve, 450));

      cumulativeResults[nodeId] = execution.perNodeResults[nodeId];
      setExecutionResults({ ...cumulativeResults });
    }

    setActiveSimulationNodeId(null);
    setIsSimulating(false);

    // Record in historical executions list
    setExecutions((prev) => [execution, ...prev]);

    if (execution.success) {
      toast.success(
        `Simulation finished successfully in ${execution.duration}ms. Check Inbox and Customer profile for updates!`
      );
    } else {
      toast.error(`Simulation encountered an error: ${execution.error}`);
    }

    // Invalidate mock cache queries
    queryClient.invalidateQueries({ queryKey: ["automations"] });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    queryClient.invalidateQueries({ queryKey: ["dmActivity"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  // When user chooses "Save and leave" from the unsaved dialog
  const handleSaveAndLeave = useCallback(async () => {
    try {
      await handleSave();
      setShowUnsavedDialog(false);
      setTimeout(() => {
        smartBack();
      }, 40);
    } catch (err) {
      // If save fails, toast already alerted; stay on page
    }
  }, [handleSave, smartBack]);

  // Inspect execution run on canvas
  const handleSelectExecution = (exec) => {
    setInspectingExecution(exec);
    setActiveTab("editor");
  };

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden">
      {/* Top Bar Navigation & Actions */}
      <TopBar
        automation={automation}
        workflowName={workflowName}
        setWorkflowName={(name) => {
          setWorkflowName(name);
          setIsDirty(true);
        }}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
        onExecuteSimulation={handleExecuteSimulation}
        onToggleActive={handleToggleActive}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onBack={handleRequestBack}
        backLabel={effectiveBackLabel}
      />

      {/* Main Area: Canvas or Executions Tab */}
      <div className="flex-1 flex overflow-hidden relative">
        {activeTab === "editor" ? (
          <WorkflowCanvas
            initialNodes={initialGraph.nodes}
            initialEdges={initialGraph.edges}
            onSaveWorkflow={handleSave}
          />
        ) : (
          <ExecutionsTab
            executions={executions}
            onSelectExecution={handleSelectExecution}
          />
        )}
      </div>

      {/* Unsaved Changes Guard Dialog */}
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onStay={handleStay}
        onDiscard={handleDiscard}
        onSaveAndLeave={handleSaveAndLeave}
        isSaving={updateMutation.isPending}
      />
    </div>
  );
}

export function WorkflowEditor(props) {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner {...props} />
    </ReactFlowProvider>
  );
}
