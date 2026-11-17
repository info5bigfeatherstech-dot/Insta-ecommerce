import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reelsService } from "@/services/reels.service";
import { toast } from "sonner";

export const reelKeys = {
  all: ["reels"],
  list: (params) => [...reelKeys.all, "list", params],
  detail: (id) => [...reelKeys.all, "detail", id],
  comments: (id, params) => [...reelKeys.all, "comments", id, params],
};

export function useReels(params = {}) {
  return useQuery({
    queryKey: reelKeys.list(params),
    queryFn: () => reelsService.getReels(params).then((res) => res.data),
  });
}

export function useReel(id) {
  return useQuery({
    queryKey: reelKeys.detail(id),
    queryFn: () => reelsService.getReelById(id).then((res) => res.data),
    enabled: Boolean(id),
  });
}

export function useReelComments(reelId, params = {}) {
  return useQuery({
    queryKey: reelKeys.comments(reelId, params),
    queryFn: () => reelsService.getReelComments(reelId, params).then((res) => res.data),
    enabled: Boolean(reelId),
  });
}

export function useAssignAutomationToReel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reelId, automationId }) =>
      reelsService.assignAutomationToReel(reelId, automationId),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: reelKeys.all });
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.message || "Failed to assign automation"),
  });
}

export function useUpdateReelTrigger() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reelId, triggerData }) =>
      reelsService.updateReelTrigger(reelId, triggerData),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: reelKeys.all });
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.message || "Failed to save comment trigger"),
  });
}

export function useSimulateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reelId, username, commentText }) =>
      reelsService.simulateComment({ reelId, username, commentText }),
    onSuccess: (res) => {
      if (res.status === "match") {
        toast.success(res.message);
      } else if (res.status === "no_trigger") {
        toast(res.message, { description: "Comment recorded with 'No Trigger' status." });
      } else if (res.status === "skipped_duplicate") {
        toast.info(res.message, { description: "Send-once-per-user prevented duplicate DM dispatch." });
      } else if (res.status === "skipped_inactive") {
        toast.warning(res.message, { description: "Reel automation is currently paused." });
      }

      // Invalidate all related server caches across the dashboard
      queryClient.invalidateQueries({ queryKey: reelKeys.all });
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["dm-activity"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (err) => toast.error(err.message || "Failed to simulate comment"),
  });
}

export function useSimulateLinkClick() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dmActivityId, reelId }) =>
      reelsService.simulateLinkClick({ dmActivityId, reelId }),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: reelKeys.all });
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dm-activity"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (err) => toast.error(err.message || "Failed to simulate link click"),
  });
}
