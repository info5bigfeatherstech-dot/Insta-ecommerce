import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { automationsService } from "@/services/automations.service";
import { toast } from "sonner";

export const automationKeys = {
  all: ["automations"],
  list: (params) => [...automationKeys.all, "list", params],
  detail: (id) => [...automationKeys.all, "detail", id],
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
    enabled: Boolean(id),
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
