import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { automationsService } from "@/services/automations.service";
import { toast } from "sonner";

export const automationKeys = {
  all: ["automations"],
  list: (params) => [...automationKeys.all, "list", params],
  detail: (id) => [...automationKeys.all, "detail", id],
  executions: (id, params) => [...automationKeys.all, "executions", id, params],
  execution: (id, execId) => [...automationKeys.all, "execution", id, execId],
};

export function useAutomations(params = {}) {
  return useQuery({
    queryKey: automationKeys.list(params),
    queryFn: () => automationsService.getAutomations(params).then((res) => res.data),
  });
}

export function useAutomation(id) {
  return useQuery({
    queryKey: automationKeys.detail(id),
    queryFn: () => automationsService.getAutomationById(id).then((res) => res.data),
    enabled: Boolean(id && id !== "new"),
  });
}

export function useCreateAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => automationsService.createAutomation(data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: automationKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    },
    onError: (err) => toast.error(err.message || "Failed to create automation"),
  });
}

export function useUpdateAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => automationsService.updateAutomation(id, data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: automationKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    },
    onError: (err) => toast.error(err.message || "Failed to update automation"),
  });
}

export function useToggleAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => automationsService.toggleAutomationStatus(id),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: automationKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    },
    onError: (err) => toast.error(err.message || "Failed to toggle automation"),
  });
}

export function useDuplicateAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => automationsService.duplicateAutomation(id),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: automationKeys.all });
    },
    onError: (err) => toast.error(err.message || "Failed to duplicate automation"),
  });
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => automationsService.deleteAutomation(id),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: automationKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    },
    onError: (err) => toast.error(err.message || "Failed to delete automation"),
  });
}

export function useSaveWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, workflow }) => automationsService.saveWorkflow(id, workflow),
    onSuccess: (res, vars) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: automationKeys.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: automationKeys.all });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    },
    onError: (err) => toast.error(err.message || "Failed to save workflow"),
  });
}

export function useRunWorkflowSimulation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, triggerPayload }) =>
      automationsService.runWorkflowSimulation(id, triggerPayload),
    onSuccess: (res, vars) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: automationKeys.executions(vars.id) });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["dmActivity"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    },
    onError: (err) => toast.error(err.message || "Simulation failed"),
  });
}

export function useExecutions(automationId, params = {}) {
  return useQuery({
    queryKey: automationKeys.executions(automationId, params),
    queryFn: () => automationsService.getExecutions(automationId, params).then((res) => res.data),
    enabled: Boolean(automationId),
  });
}

export function useExecution(automationId, execId) {
  return useQuery({
    queryKey: automationKeys.execution(automationId, execId),
    queryFn: () => automationsService.getExecutionById(automationId, execId).then((res) => res.data),
    enabled: Boolean(automationId && execId),
  });
}
