import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reelsService } from "@/services/reels.service";
import { toast } from "sonner";

export const reelKeys = {
  all: ["reels"],
  list: (params) => [...reelKeys.all, "list", params],
  detail: (id) => [...reelKeys.all, "detail", id],
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

export function useAssignAutomationToReel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reelId, automationId }) => reelsService.assignAutomationToReel(reelId, automationId),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: reelKeys.all });
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.message || "Failed to assign automation"),
  });
}
